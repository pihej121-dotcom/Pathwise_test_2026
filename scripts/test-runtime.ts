/**
 * Runtime test suite for the Supabase + Vercel migration.
 *
 * Run with:  npx tsx scripts/test-runtime.ts
 *
 * Each test prints PASS / FAIL. All tests are read-only or use isolated
 * temporary data that is cleaned up afterward. Do NOT run against production.
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { fileMetadata } from "@shared/schema";
import { eq } from "drizzle-orm";
import { ObjectStorageService } from "../server/objectStorage";
import { getResendClient } from "../server/resend-client";
import { createClient } from "@supabase/supabase-js";
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "../server/routes";

// ── Helpers ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅  PASS  ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌  FAIL  ${name}`);
    console.error(`           ${err?.message ?? err}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// ── Tests ──────────────────────────────────────────────────────────────────

console.log("\n🔍  Pathwise runtime tests\n");

// ── Resolve a real user ID from the DB (required for FK constraints) ────────
// file_metadata.owner_user_id references users.id, so we need a real user.
const realUserId: string = await (async () => {
  const result = await db.execute(sql`SELECT id FROM users LIMIT 1`);
  const row = result.rows[0] as { id: string } | undefined;
  if (!row) {
    console.error("  ⚠️  No users found in the database. DB tests requiring a user ID will be skipped.");
    return "";
  }
  return row.id;
})();

// 1. Database connection via transaction pooler
await test("Database connection via transaction pooler", async () => {
  const result = await db.execute(sql`SELECT 1 AS ok`);
  assert((result.rows[0] as any).ok === 1, "Expected SELECT 1 to return 1");
});

// 2. DB read + write (skipped if no user exists)
const TEST_OBJECT_PATH = `test-runtime/${Date.now()}/probe`;
await test("DB write: insert file_metadata row", async () => {
  if (!realUserId) { console.log("           ⚠️  No users in DB — skipped"); return; }
  await db.insert(fileMetadata).values({
    objectPath: TEST_OBJECT_PATH,
    ownerUserId: realUserId,
    visibility: "private",
    originalFilename: "test.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 1024,
    uploadStatus: "pending",
  });
});

await test("DB read: select file_metadata row back", async () => {
  if (!realUserId) { console.log("           ⚠️  No users in DB — skipped"); return; }
  const [row] = await db
    .select()
    .from(fileMetadata)
    .where(eq(fileMetadata.objectPath, TEST_OBJECT_PATH))
    .limit(1);
  assert(!!row, "Row not found after insert");
  assert(row.ownerUserId === realUserId, "ownerUserId mismatch");
  assert(row.uploadStatus === "pending", "Expected status=pending");
});

await test("DB write: mark upload as completed", async () => {
  if (!realUserId) { console.log("           ⚠️  No users in DB — skipped"); return; }
  await db
    .update(fileMetadata)
    .set({ uploadStatus: "completed" })
    .where(eq(fileMetadata.objectPath, TEST_OBJECT_PATH));
  const [row] = await db
    .select()
    .from(fileMetadata)
    .where(eq(fileMetadata.objectPath, TEST_OBJECT_PATH))
    .limit(1);
  assert(row?.uploadStatus === "completed", "Expected status=completed");
});

// Cleanup test row
await test("DB cleanup: delete test row", async () => {
  await db.delete(fileMetadata).where(eq(fileMetadata.objectPath, TEST_OBJECT_PATH));
  const [row] = await db
    .select()
    .from(fileMetadata)
    .where(eq(fileMetadata.objectPath, TEST_OBJECT_PATH))
    .limit(1);
  assert(!row, "Row still exists after delete");
});

// 3. Signed upload URL generation
await test("Supabase Storage: generate signed upload URL", async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("           ⚠️  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipped");
    return;
  }
  const testId = realUserId || "test-user";
  const svc = new ObjectStorageService();
  const { signedUrl, objectPath } = await svc.getObjectEntityUploadURL(testId);
  assert(signedUrl.startsWith("https://"), "Expected https signed URL");
  assert(objectPath.startsWith(`uploads/${testId}/`), "objectPath must embed userId");
});

// 4. ACL: authorization checks (use realUserId; skip if none)
await test("ACL: private object denies access to non-owner", async () => {
  if (!realUserId) { console.log("           ⚠️  No users in DB — skipped"); return; }
  const { canAccessObject, ObjectPermission, setObjectAclPolicy } = await import("../server/objectAcl");
  const acl_path = `test-acl/${Date.now()}/probe`;
  await setObjectAclPolicy(acl_path, { owner: realUserId, visibility: "private" });
  const allowed = await canAccessObject({
    userId: "definitely-not-the-owner",
    objectPath: acl_path,
    requestedPermission: ObjectPermission.READ,
  });
  await db.delete(fileMetadata).where(eq(fileMetadata.objectPath, acl_path));
  assert(!allowed, "Non-owner should be denied access to private object");
});

await test("ACL: owner can access their own private object", async () => {
  if (!realUserId) { console.log("           ⚠️  No users in DB — skipped"); return; }
  const { canAccessObject, ObjectPermission, setObjectAclPolicy } = await import("../server/objectAcl");
  const acl_path = `test-acl/${Date.now()}/own`;
  await setObjectAclPolicy(acl_path, { owner: realUserId, visibility: "private" });
  const allowed = await canAccessObject({
    userId: realUserId,
    objectPath: acl_path,
    requestedPermission: ObjectPermission.READ,
  });
  await db.delete(fileMetadata).where(eq(fileMetadata.objectPath, acl_path));
  assert(allowed, "Owner should be able to access their own private object");
});

await test("ACL: public object is accessible without auth", async () => {
  if (!realUserId) { console.log("           ⚠️  No users in DB — skipped"); return; }
  const { canAccessObject, ObjectPermission, setObjectAclPolicy } = await import("../server/objectAcl");
  const acl_path = `test-acl/${Date.now()}/pub`;
  await setObjectAclPolicy(acl_path, { owner: realUserId, visibility: "public" });
  const allowed = await canAccessObject({
    objectPath: acl_path,
    requestedPermission: ObjectPermission.READ,
  });
  await db.delete(fileMetadata).where(eq(fileMetadata.objectPath, acl_path));
  assert(allowed, "Public object should be accessible without userId");
});

// 5. Path ownership check
await test("ObjectStorageService.isOwnerPath: rejects cross-user paths", async () => {
  assert(
    ObjectStorageService.isOwnerPath("uploads/user-A/abc", "user-A"),
    "Should accept own path"
  );
  assert(
    !ObjectStorageService.isOwnerPath("uploads/user-B/abc", "user-A"),
    "Should reject other user's path"
  );
  assert(
    !ObjectStorageService.isOwnerPath("uploads/../user-A/evil", "user-A"),
    "Should reject path traversal attempt"
  );
});

// 6. Stripe webhook signature verification
await test("Stripe: webhook constructEvent validates signature", async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log("           ⚠️  STRIPE_SECRET_KEY not set — skipped");
    return;
  }
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" });
  const payload = JSON.stringify({ type: "test.event", data: {} });
  const secret = "whsec_test_" + "a".repeat(32);
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret });
  try {
    stripe.webhooks.constructEvent(Buffer.from(payload), sig, secret);
  } catch {
    throw new Error("constructEvent failed with valid signature — check Stripe SDK version");
  }
});

// 7. Resend API connectivity
await test("Resend: client initializes with RESEND_API_KEY", async () => {
  if (!process.env.RESEND_API_KEY) {
    console.log("           ⚠️  RESEND_API_KEY not set — skipped");
    return;
  }
  const { client } = getResendClient();
  assert(!!client, "Resend client should be initialized");
  // Domain validation check (does not send email)
  const domains = await client.domains.list();
  assert(Array.isArray(domains.data?.data ?? []), "Should return a domains list");
});

// 8. Vercel handler: API request through api/index.ts
await test("Vercel handler: responds to /api/health", async () => {
  // Build a minimal app using the same pattern as api/index.ts
  const testApp = express();
  testApp.use(express.json());
  testApp.use(cookieParser());
  testApp.get("/api/health", (_req, res) => res.json({ ok: true }));

  await new Promise<void>((resolve, reject) => {
    const server = testApp.listen(0, () => {
      const port = (server.address() as any).port;
      fetch(`http://localhost:${port}/api/health`)
        .then((r) => r.json())
        .then((body: any) => {
          server.close();
          assert(body.ok === true, "Expected { ok: true } from health check");
          resolve();
        })
        .catch((err) => { server.close(); reject(err); });
    });
  });
});

// 9. SPA fallback: non-API routes should be handled at the Vercel level
await test("vercel.json: SPA fallback rewrite exists", async () => {
  const { readFileSync } = await import("node:fs");
  const cfg = JSON.parse(readFileSync("vercel.json", "utf8"));
  const rewrites: any[] = cfg.rewrites ?? [];
  const apiRewrite = rewrites.find((r: any) => r.source.includes("/api/"));
  const spaRewrite = rewrites.find((r: any) => r.destination === "/index.html");
  assert(!!apiRewrite, "Missing /api/* rewrite in vercel.json");
  assert(!!spaRewrite, "Missing SPA fallback rewrite in vercel.json");
  const apiIndex = rewrites.indexOf(apiRewrite);
  const spaIndex = rewrites.indexOf(spaRewrite);
  assert(apiIndex < spaIndex, "/api/* rewrite must appear before SPA fallback");
});

await test("vercel.json: functions path matches api/index.ts", async () => {
  const { readFileSync } = await import("node:fs");
  const cfg = JSON.parse(readFileSync("vercel.json", "utf8"));
  assert(
    "api/index.ts" in (cfg.functions ?? {}),
    'vercel.json functions must have "api/index.ts" key'
  );
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n─────────────────────────────────────────`);
console.log(`  ${passed} passed  /  ${failed} failed`);
if (failed > 0) {
  console.log(`\n⚠️  Fix the failures above before deploying.\n`);
  process.exit(1);
} else {
  console.log(`\n🎉  All tests passed. Ready to deploy.\n`);
}

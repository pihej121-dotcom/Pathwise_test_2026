import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  category: z.enum(["Support issue", "Feature suggestion", "Other"], {
    required_error: "Please select a category",
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
  website: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactUsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export function ContactUsDialog({ open, onOpenChange, defaultValues }: ContactUsDialogProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      email: defaultValues?.email ?? "",
      category: undefined,
      message: "",
      website: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitError(null);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers,
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTimeout(() => {
        setSubmitted(false);
        setSubmitError(null);
        form.reset({
          firstName: defaultValues?.firstName ?? "",
          lastName: defaultValues?.lastName ?? "",
          email: defaultValues?.email ?? "",
          category: undefined,
          message: "",
          website: "",
        });
      }, 300);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Contact Us</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">Thanks!</p>
              <p className="text-muted-foreground text-sm mt-1">We'll get back to you soon.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed -mt-1 mb-1">
              Need help or have an idea? Whether you're running into a support issue or have a suggestion to make your resume and career journey easier, we'd love to hear it. Fill out the form below and we'll get back to you as soon as we can.
            </p>

            {submitError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Honeypot — hidden from humans */}
                <input
                  type="text"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ display: "none" }}
                  {...form.register("website")}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane" data-testid="input-contact-first-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" data-testid="input-contact-last-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" data-testid="input-contact-email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-contact-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Support issue">Support issue</SelectItem>
                          <SelectItem value="Feature suggestion">Feature suggestion</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us what's on your mind..."
                          className="min-h-[100px] resize-none"
                          data-testid="textarea-contact-message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                  data-testid="button-contact-submit"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send message"
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

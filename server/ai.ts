import OpenAI from "openai";
import { z } from "zod";
import { randomUUID, createHash } from "crypto";
import { jobMatchAnalysisSchema, JobMatchAnalysis, getCompetitivenessBand } from '@shared/schema';
import { storage } from './storage';

// Using GPT-4o for reliable performance
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

// Generate a deterministic hash from resume content and analysis context
function generateAnalysisHash(
  resumeText: string,
  targetRole?: string,
  targetIndustry?: string,
  targetCompanies?: string
): string {
  const normalizedText = resumeText.trim().toLowerCase();
  const normalizedRole = (targetRole || '').trim().toLowerCase();
  const normalizedIndustry = (targetIndustry || '').trim().toLowerCase();
  const normalizedCompanies = (targetCompanies || '').trim().toLowerCase();
  
  const combinedInput = `${normalizedText}|${normalizedRole}|${normalizedIndustry}|${normalizedCompanies}`;
  
  return createHash('sha256').update(combinedInput).digest('hex');
}

interface ResumeAnalysis {
  rmsScore: number;
  skillsScore: number;
  experienceScore: number;
  keywordsScore: number;
  educationScore: number;
  certificationsScore: number;
  overallInsights: {
    scoreExplanation: string;
    strengthsOverview: string;
    weaknessesOverview: string;
    keyRecommendations: string[];
    careerFitAssessment?: string;
    competitivePositioning?: string;
    salaryRange?: string;
    timeToReady?: string;
  };
  sectionAnalysis: {
    skills: {
      score: number;
      strengths: string[];
      gaps: string[];
      explanation: string;
      improvements: string[];
      resources?: Array<{ title: string; provider: string; url: string; cost?: string }>;
    };
    experience: {
      score: number;
      strengths: string[];
      gaps: string[];
      explanation: string;
      improvements: string[];
      resources?: Array<{ title: string; provider: string; url: string; cost?: string }>;
    };
    keywords: {
      score: number;
      strengths: string[];
      gaps: string[];
      explanation: string;
      improvements: string[];
      missingKeywords?: string[];
      presentKeywords?: string[];
      resources?: Array<{ title: string; provider: string; url: string; cost?: string }>;
    };
    education: {
      score: number;
      strengths: string[];
      gaps: string[];
      explanation: string;
      improvements: string[];
      resources?: Array<{ title: string; provider: string; url: string; cost?: string }>;
    };
    certifications: {
      score: number;
      strengths: string[];
      gaps: string[];
      explanation: string;
      improvements: string[];
      resources?: Array<{ title: string; provider: string; url: string; cost?: string }>;
    };
  };
  gaps: Array<{
    category: string;
    priority: "high" | "medium" | "low";
    impact: number;
    rationale: string;
    resources: Array<{
      title: string;
      provider: string;
      url: string;
      cost?: string;
    }>;
  }>;
}


interface RoadmapAction {
  id: string;
  title: string;
  description: string;
  rationale: string;
  icon: string;
  completed: boolean;
  dueDate?: string;
}

interface TailoredResumeResult {
  tailoredContent: string;
  jobSpecificScore: number;
  keywordsCovered: string[];
  remainingGaps: Array<{
    skill: string;
    importance: string;
    resources: Array<{
      title: string;
      provider: string;
      url: string;
      cost?: string;
    }>;
  }>;
  diffJson: Array<{
    type: "add" | "remove" | "modify";
    section: string;
    original?: string;
    new?: string;
    reason: string;
  }>;
}

export class AIService {
  
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides clear and concise responses."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_completion_tokens: 1000,
        temperature: 0.7
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('AI text generation failed:', error);
      throw error;
    }
  }

  // Two-pass atomization: refines tasks to ensure they're truly bite-sized
  private async atomizeTasks(subsections: any[]): Promise<any[]> {
    try {
      const atomizePrompt = `You are a task atomizer. Your job is to ensure every task is truly atomic and bite-sized.

REVIEW these subsections and split ANY task that:
- Has multiple sentences
- Contains "and", "then", "also", "additionally"  
- Takes longer than 60 minutes
- Has multiple deliverables
- Is vague or complex

ATOMIZATION RULES:
1. Each task = ONE verb + ONE object
2. Completable in 20-60 minutes
3. Single clear outcome
4. Title max 60 chars, description max 140 chars
5. Keep same JSON structure

INPUT SUBSECTIONS:
${JSON.stringify(subsections, null, 2)}

Return JSON in this format: { "subsections": [...] }

ID REQUIREMENTS: 
- Preserve existing task IDs when possible
- Generate new RFC-4122 UUID v4 for new tasks created by splitting
- Maintain dependencies and copy them to all resulting tasks from a split`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o for reliable performance
        messages: [
          {
            role: "system", 
            content: "You are a precision task atomizer. Split complex tasks into atomic, trackable actions. Return JSON only."
          },
          {
            role: "user",
            content: atomizePrompt
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 3000
      });

      const atomizedResult = JSON.parse(response.choices[0].message.content || "{}");
      
      // Validate the atomized result
      const { insertRoadmapSubsectionSchema } = await import("@shared/schema");
      const validatedSubsections = z.array(insertRoadmapSubsectionSchema).parse(atomizedResult.subsections || []);
      
      return validatedSubsections;
      
    } catch (error) {
      console.error("Task atomization failed:", error);
      return subsections; // Return original if atomization fails
    }
  }

  private sanitizeJSON(rawJSON: string): string {
    try {
      let sanitized = rawJSON.trim();
      
      if (sanitized.startsWith('```json')) {
        sanitized = sanitized.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      } else if (sanitized.startsWith('```')) {
        sanitized = sanitized.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      sanitized = sanitized.replace(/,(\s*[}\]])/g, '$1');
      sanitized = sanitized.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
      sanitized = sanitized.replace(/:\s*'([^']*)'/g, ': "$1"');
      
      return sanitized.trim();
    } catch (error) {
      console.error('JSON sanitization error:', error);
      return rawJSON;
    }
  }

  async analyzeJobMatch(resumeText: string, jobData: any): Promise<JobMatchAnalysis> {
    try {
      const prompt = `You are an expert career counselor and hiring manager analyzing how well a candidate's resume matches a specific job posting. Provide comprehensive, data-driven insights that quantify why the candidate is or isn't competitive for this role.

CANDIDATE RESUME:
${resumeText}

JOB POSTING:
Title: ${jobData.title}
Company: ${jobData.company?.display_name || 'Not specified'}
Description: ${jobData.description || 'No description provided'}
Location: ${jobData.location?.display_name || 'Not specified'}
Employment Type: ${jobData.contract_type || 'Not specified'}

ANALYSIS REQUIREMENTS:
- Be highly specific and reference exact details from both resume and job posting
- Quantify competitiveness with detailed reasoning
- Provide actionable, prioritized recommendations
- Focus on what matters most to hiring managers for this specific role

Respond with a comprehensive JSON object:
{
  "overallMatch": <number 1-100 representing overall competitiveness>,
  "strengths": [
    "<specific strength 1 with quantified impact>",
    "<specific strength 2 with evidence from resume>",
    "<specific strength 3 tied directly to job requirements>"
  ],
  "concerns": [
    "<critical gap 1 with impact assessment>",
    "<moderate concern 2 with context>",
    "<minor issue 3 if applicable>"
  ],
  "skillsAnalysis": {
    "strongMatches": [<exact skills from resume that directly match job requirements>],
    "partialMatches": [<transferable skills with explanation of relevance>],
    "missingSkills": [<critical skills from job posting absent in resume>],
    "explanation": "<200+ word detailed analysis of skills alignment, including: skill match percentage, most important gaps, transferability assessment, and competitive positioning relative to typical candidates>"
  },
  "experienceAnalysis": {
    "relevantExperience": [<specific roles/projects from resume most relevant to this job>],
    "experienceGaps": [<experience requirements from job that candidate lacks>],
    "explanation": "<200+ word detailed analysis including: years of relevant experience vs. requirements, industry alignment, responsibility level match, achievement relevance, and experience quality assessment>"
  },
  "recommendations": [
    "<high-impact recommendation 1 for immediate application improvement>",
    "<medium-impact recommendation 2 for cover letter/interview prep>",
    "<strategic recommendation 3 for long-term positioning>"
  ],
  "nextSteps": [
    "<immediate action 1 (within 24 hours)>",
    "<short-term action 2 (within 1 week)>",
    "<medium-term action 3 (within 1 month)>"
  ]
}

SCORING CRITERIA for overallMatch:
90-100: Exceptional fit - top 10% of candidates, likely to get interviews
80-89: Strong fit - competitive candidate with good interview chances  
70-79: Good fit - meets most requirements, moderate competition
60-69: Fair fit - meets basic requirements, needs strengthening
50-59: Weak fit - significant gaps, requires major improvements
Below 50: Poor fit - not competitive for this specific role

Focus on being brutally honest about competitiveness while providing constructive, actionable guidance.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert hiring manager. Respond with valid JSON exactly matching the required schema. No additional prose or markdown." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.3,
        top_p: 0.9
      });

      const rawContent = response.choices[0].message.content || '{}';
      let rawAnalysis;
      
      try {
        const sanitizedContent = this.sanitizeJSON(rawContent);
        rawAnalysis = JSON.parse(sanitizedContent);
      } catch (parseError) {
        console.error('❌ JSON parsing failed for job match analysis');
        console.error('Parse error:', parseError);
        console.error('Raw content (first 500 chars):', rawContent.substring(0, 500));
        console.error('Falling back to default analysis due to malformed JSON from AI');
        return this.getFallbackAnalysis();
      }
      
      try {
        const analysisWithBand = {
          ...rawAnalysis,
          competitivenessBand: getCompetitivenessBand(rawAnalysis.overallMatch || 75)
        };
        
        const validatedAnalysis = jobMatchAnalysisSchema.parse(analysisWithBand);
        return validatedAnalysis;
      } catch (validationError) {
        console.error('❌ AI analysis validation failed:', validationError);
        console.error('Raw analysis structure:', JSON.stringify(rawAnalysis, null, 2).substring(0, 500));
        return this.getFallbackAnalysis();
      }
    } catch (error) {
      console.error('❌ AI job match analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  private getFallbackAnalysis(): JobMatchAnalysis {
    const fallbackScore = 75;
    return {
      overallMatch: fallbackScore,
      competitivenessBand: getCompetitivenessBand(fallbackScore),
      strengths: [
        "Professional background shows relevant experience for the role",
        "Educational qualifications align with industry standards", 
        "Demonstrated ability to learn and adapt to new environments"
      ],
      concerns: [
        "Some specific technical skills mentioned in the job posting may need validation",
        "Industry-specific experience depth requires assessment",
        "Certain advanced qualifications may need development"
      ],
      skillsAnalysis: {
        strongMatches: ["Core competencies from your professional background"],
        partialMatches: ["Transferable skills that can be applied to this role"],
        missingSkills: ["Role-specific technical skills that may require development"],
        explanation: "AI analysis is temporarily unavailable, but based on general patterns, your background likely includes transferable skills relevant to this position. A detailed review of specific technical requirements would provide more precise matching insights. Consider highlighting your most relevant experiences and any recent training or certifications that align with the job requirements."
      },
      experienceAnalysis: {
        relevantExperience: ["Professional roles and projects from your background"],
        experienceGaps: ["Specialized experience areas that may need strengthening"],
        explanation: "While detailed AI analysis is unavailable, your professional history likely contains valuable experience relevant to this role. Focus on quantifying your achievements and demonstrating measurable impact in previous positions. Consider how your experience directly addresses the core responsibilities mentioned in the job posting."
      },
      recommendations: [
        "Thoroughly review the job description and tailor your application to highlight the most relevant experiences",
        "Research the company and role to understand their specific needs and priorities",
        "Prepare specific examples that demonstrate your impact and problem-solving abilities"
      ],
      nextSteps: [
        "Within 24 hours: Customize your resume to emphasize the most relevant skills and experiences",
        "Within 1 week: Research the company culture and recent developments to personalize your cover letter",
        "Within 1 month: Consider additional training or certification in key areas identified in the job posting"
      ]
    };
  }

  async analyzeResume(
    userId: string,
    resumeText: string,
    targetRole?: string,
    targetIndustry?: string,
    targetCompanies?: string
  ): Promise<ResumeAnalysis & { analysisHash: string }> {
    try {
      // Generate hash for caching
      const analysisHash = generateAnalysisHash(resumeText, targetRole, targetIndustry, targetCompanies);
      
      // Check if we have a cached analysis with the same hash
      const cachedResume = await storage.getResumeByHash(userId, analysisHash);
      
      if (cachedResume && cachedResume.rmsScore !== null && cachedResume.overallInsights && cachedResume.sectionAnalysis) {
        console.log('✅ Returning cached resume analysis');
        return {
          rmsScore: cachedResume.rmsScore,
          skillsScore: cachedResume.skillsScore || 0,
          experienceScore: cachedResume.experienceScore || 0,
          keywordsScore: cachedResume.keywordsScore || 0,
          educationScore: cachedResume.educationScore || 0,
          certificationsScore: cachedResume.certificationsScore || 0,
          overallInsights: cachedResume.overallInsights as ResumeAnalysis['overallInsights'],
          sectionAnalysis: cachedResume.sectionAnalysis as ResumeAnalysis['sectionAnalysis'],
          gaps: (cachedResume.gaps || []) as ResumeAnalysis['gaps'],
          analysisHash
        };
      }
      
      console.log('🔄 Generating new resume analysis (no cache found)');
      
      const prompt = `You are a senior career coach and hiring expert. Perform a DEEP, THOROUGH, COMPREHENSIVE resume analysis. Be brutally honest, highly specific, and provide actionable resources for every gap found.

ANALYSIS REQUIREMENTS:
1. Base ALL analysis on the TARGET ROLE specified. Be role-specific — no generic advice.
2. MINIMUM 6 SPECIFIC STRENGTHS and MINIMUM 6 SPECIFIC GAPS per section.
3. Every gap MUST include 1-2 resource links to close it.
4. BE EXTREMELY SPECIFIC — reference exact tools, years of experience, technologies, certifications, job titles, metrics.
5. Write a comprehensive career fit assessment (3-4 sentences) comparing the candidate to an ideal candidate for this role.
6. Estimate how long until the candidate would be competitive if they act on all recommendations.
7. KEYWORD SECTION: List specific keywords present in the resume AND specific keywords that are missing but critical for ATS/hiring.

Resume Text:
${resumeText}

Target Role: ${targetRole || 'General Career Development'}
Target Industry: ${targetIndustry || 'Not specified'}
Target Companies: ${targetCompanies || 'Not specified'}

Return this exact JSON structure (no markdown, no extra text):
{
  "rmsScore": <integer 1-100>,
  "skillsScore": <integer 1-100>,
  "experienceScore": <integer 1-100>,
  "keywordsScore": <integer 1-100>,
  "educationScore": <integer 1-100>,
  "certificationsScore": <integer 1-100>,
  "overallInsights": {
    "scoreExplanation": "<3-4 sentences explaining the score holistically — what it means, why, and the biggest factors>",
    "strengthsOverview": "<2-3 sentences summarizing top competitive advantages this candidate has for the target role>",
    "weaknessesOverview": "<2-3 sentences summarizing the most critical gaps preventing success in the target role>",
    "careerFitAssessment": "<3-4 sentences comparing this candidate to an ideal candidate for the role — be specific about alignment and misalignment>",
    "competitivePositioning": "<2 sentences on where this candidate stands vs. typical applicants for this role>",
    "timeToReady": "<Estimated time to become competitive if all gaps are addressed, e.g., '3-6 months with focused effort'>",
    "keyRecommendations": [
      "<Top priority recommendation #1 — specific and actionable>",
      "<Top priority recommendation #2>",
      "<Top priority recommendation #3>",
      "<Top priority recommendation #4>"
    ]
  },
  "sectionAnalysis": {
    "skills": {
      "score": <integer 1-100>,
      "explanation": "<3-4 sentence detailed analysis of how the candidate's skills stack up against what the target role actually requires. Be specific about skill level, gaps, and relevance.>",
      "strengths": [
        "<Specific strength 1 — name exact technology/skill and evidence from resume>",
        "<Specific strength 2>",
        "<Specific strength 3>",
        "<Specific strength 4>",
        "<Specific strength 5>",
        "<Specific strength 6>"
      ],
      "gaps": [
        "<Specific gap 1 — name exactly what's missing and why it matters for the target role>",
        "<Specific gap 2>",
        "<Specific gap 3>",
        "<Specific gap 4>",
        "<Specific gap 5>",
        "<Specific gap 6>"
      ],
      "improvements": [
        "<Specific, actionable improvement step 1>",
        "<Specific improvement step 2>",
        "<Specific improvement step 3>"
      ],
      "resources": [
        { "title": "<Course/resource to close the biggest skills gap>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid/Subscription>" },
        { "title": "<Second resource for a different skills gap>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid/Subscription>" }
      ]
    },
    "experience": {
      "score": <integer 1-100>,
      "explanation": "<3-4 sentence detailed analysis of how the candidate's work history, depth, and relevance compares to requirements for the target role.>",
      "strengths": [
        "<Specific experience strength 1 — reference actual role/company/achievement from resume>",
        "<Specific experience strength 2>",
        "<Specific experience strength 3>",
        "<Specific experience strength 4>",
        "<Specific experience strength 5>",
        "<Specific experience strength 6>"
      ],
      "gaps": [
        "<Specific experience gap 1 — what type of experience is missing and why it matters>",
        "<Specific experience gap 2>",
        "<Specific experience gap 3>",
        "<Specific experience gap 4>",
        "<Specific experience gap 5>",
        "<Specific experience gap 6>"
      ],
      "improvements": [
        "<How to gain/demonstrate this experience>",
        "<How to reframe or quantify existing experience better>",
        "<Specific project or portfolio idea to bridge the gap>"
      ],
      "resources": [
        { "title": "<Resource to build relevant experience or showcase it>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" },
        { "title": "<Portfolio/project resource>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free>" }
      ]
    },
    "keywords": {
      "score": <integer 1-100>,
      "explanation": "<3-4 sentence analysis of ATS keyword optimization — how well the resume uses industry-relevant language, keyword density, and section-specific terminology.>",
      "presentKeywords": ["<keyword found in resume 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>", "<keyword 6>", "<keyword 7>", "<keyword 8>"],
      "missingKeywords": ["<critical missing keyword 1>", "<missing keyword 2>", "<missing keyword 3>", "<missing keyword 4>", "<missing keyword 5>", "<missing keyword 6>", "<missing keyword 7>", "<missing keyword 8>"],
      "strengths": [
        "<Keyword strength 1 — which keywords are used effectively and where>",
        "<Keyword strength 2>",
        "<Keyword strength 3>",
        "<Keyword strength 4>",
        "<Keyword strength 5>",
        "<Keyword strength 6>"
      ],
      "gaps": [
        "<Missing keyword gap 1 — which keywords are absent and how that hurts ATS/reader>",
        "<Gap 2>",
        "<Gap 3>",
        "<Gap 4>",
        "<Gap 5>",
        "<Gap 6>"
      ],
      "improvements": [
        "<Where to add which keyword>",
        "<How to rephrase a bullet to include missing terms>",
        "<ATS optimization tip specific to the target role>"
      ],
      "resources": [
        { "title": "Jobscan - ATS Keyword Optimizer", "provider": "Jobscan", "url": "https://www.jobscan.co/", "cost": "Free trial" },
        { "title": "LinkedIn Learning - Resume Writing", "provider": "LinkedIn", "url": "https://www.linkedin.com/learning/", "cost": "Subscription" }
      ]
    },
    "education": {
      "score": <integer 1-100>,
      "explanation": "<3-4 sentence analysis of how the candidate's educational background aligns with typical requirements and expectations for the target role and industry.>",
      "strengths": [
        "<Education strength 1 — specific degree, institution, or relevant coursework>",
        "<Strength 2>",
        "<Strength 3>",
        "<Strength 4>",
        "<Strength 5>",
        "<Strength 6>"
      ],
      "gaps": [
        "<Education gap 1 — what degree, certification, or coursework is typically expected but missing>",
        "<Gap 2>",
        "<Gap 3>",
        "<Gap 4>",
        "<Gap 5>",
        "<Gap 6>"
      ],
      "improvements": [
        "<Specific course or certification to pursue>",
        "<Online program that would strengthen this section>",
        "<How to frame existing education better>"
      ],
      "resources": [
        { "title": "<Most relevant online course or degree program for this role>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" },
        { "title": "<Second recommended educational resource>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" }
      ]
    },
    "certifications": {
      "score": <integer 1-100>,
      "explanation": "<2-3 sentence analysis of certifications held vs. certifications typically expected or valued for the target role.>",
      "strengths": [
        "<Certification strength 1 — specific cert and its relevance>",
        "<Strength 2>",
        "<Strength 3>"
      ],
      "gaps": [
        "<Missing certification 1 — name the cert and why it matters for the role>",
        "<Gap 2>",
        "<Gap 3>",
        "<Gap 4>"
      ],
      "improvements": [
        "<Specific certification to pursue with timeline>",
        "<How to prepare for the cert exam>"
      ],
      "resources": [
        { "title": "<Most important certification to get for this role>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Exam cost>" },
        { "title": "<Prep course for that certification>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" }
      ]
    }
  },
  "gaps": [
    {
      "category": "<Specific gap category name — e.g., 'Cloud Infrastructure Experience', 'Data Visualization Skills'>",
      "priority": "high",
      "impact": <integer 5-20>,
      "rationale": "<2-3 sentences explaining exactly why this gap exists, why it matters for the target role, and what a competitive candidate would have instead.>",
      "resources": [
        { "title": "<Primary resource to close this gap>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" },
        { "title": "<Secondary resource or alternative path>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" }
      ]
    }
  ]
}

NOTES ON SCORING:
- 85-100: Exceptional — top-tier candidate, highly competitive
- 70-84: Strong — solid candidate with minor gaps
- 55-69: Moderate — meets some requirements, meaningful gaps
- 40-54: Weak — significant gaps requiring focused effort
- Below 40: Major gap — career transition or significant upskilling needed
- Be honest and realistic — inflated scores don't help the user.

VERIFIED RESOURCE URLS (use ONLY these or general platform homepages):
- Coursera Python: https://www.coursera.org/specializations/python
- Coursera Data Analytics: https://www.coursera.org/professional-certificates/google-data-analytics
- Coursera Machine Learning: https://www.coursera.org/learn/machine-learning
- Coursera Project Management: https://www.coursera.org/professional-certificates/google-project-management
- Coursera Browse: https://www.coursera.org/browse
- Udemy Python: https://www.udemy.com/course/complete-python-bootcamp/
- Udemy JavaScript: https://www.udemy.com/course/the-complete-javascript-course/
- Udemy General: https://www.udemy.com/
- freeCodeCamp: https://www.freecodecamp.org/
- Kaggle Learn: https://www.kaggle.com/learn
- AWS Training: https://aws.amazon.com/training/digital/
- Azure Training: https://learn.microsoft.com/en-us/training/
- Google Cloud: https://cloud.google.com/training
- LinkedIn Learning: https://www.linkedin.com/learning/
- edX: https://www.edx.org/
- Khan Academy: https://www.khanacademy.org/
- PMI Training: https://www.pmi.org/learning/training-development
- Codecademy: https://www.codecademy.com/
- Jobscan ATS: https://www.jobscan.co/
- LeetCode: https://leetcode.com/
- HackerRank: https://www.hackerrank.com/
- Glassdoor Interview Prep: https://www.glassdoor.com/Interview/index.htm
- Udacity: https://www.udacity.com/
- Pluralsight: https://www.pluralsight.com/
- MIT OpenCourseWare: https://ocw.mit.edu/
- Google Digital Garage: https://learndigital.withgoogle.com/digitalgarage
- HubSpot Academy: https://academy.hubspot.com/
- Salesforce Trailhead: https://trailhead.salesforce.com/
- DataCamp: https://www.datacamp.com/

NEVER invent URLs. If unsure, use https://www.coursera.org/browse or https://www.linkedin.com/learning/

Provide 5-7 items in the "gaps" array, covering the most impactful deficiencies.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert career counselor specializing in gap analysis. Your job is to identify specific gaps between a candidate's current resume and their target role requirements. Be honest about missing skills and experience. Provide actionable recommendations with real resources."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      return { ...analysis, analysisHash };
    } catch (error) {
      console.error("Resume analysis error:", error);
      throw new Error("Failed to analyze resume");
    }
  }

  async generateCareerRoadmap(
  phase: "30_days" | "3_months" | "6_months",
  userProfile: any,
  resumeAnalysis?: ResumeAnalysis
): Promise<{ title: string; description: string; actions: RoadmapAction[]; subsections: any[] }> {
  console.log(`Generating AI-powered career roadmap for phase: ${phase}`);

  try {
    // Extract detailed gap information
    const topSkillGaps = resumeAnalysis?.gaps?.slice(0, 3).map(g => g.category).join(', ') || 'None identified';
    const specificStrengths = resumeAnalysis?.sectionAnalysis?.skills?.strengths?.slice(0, 3).join('; ') || 'Professional skills';
    
    // Phase-specific guidance with progressive difficulty
    const phaseInstructions: Record<string, string> = {
      "30_days": `
DIFFICULTY LEVEL: EASY - Quick Wins & Immediate Actions
Create 4-6 HIGHLY SPECIFIC, ACTIONABLE tasks that can be completed in 1-2 hours each. NO generic advice.

REQUIRED ACTION TYPES (choose from these):
✅ Resume Optimization:
   - "Update resume to highlight [SPECIFIC SKILL from their resume] for [TARGET COMPANY] [TARGET ROLE] positions"
   - "Add quantified metrics to [SPECIFIC EXPERIENCE] section (e.g., 'increased efficiency by X%')"
   
✅ LinkedIn Quick Wins:
   - "Update LinkedIn headline to '[TARGET ROLE] specializing in [THEIR TOP SKILL]'"
   - "Write a LinkedIn post about [SPECIFIC PROJECT/EXPERIENCE from resume] with #[INDUSTRY] hashtags"

✅ Local/School Networking (if location/school provided):
   - "Reach out to 3 [SCHOOL] alumni working at [TARGET COMPANY] via LinkedIn"
   - "Attend [LOCATION]-based [INDUSTRY] meetup this week (search Eventbrite/Meetup.com)"

✅ Immediate Job Applications:
   - "Apply to 5 [TARGET ROLE] positions at [TARGET COMPANIES] this week"
   - "Set up job alerts for '[TARGET ROLE]' in [LOCATION] on LinkedIn, Indeed, Glassdoor"

✅ Fast Skill Development:
   - "Complete [SPECIFIC SKILL GAP] tutorial on YouTube/FreeCodeCamp (2-3 hours max)"
   - "Practice [SKILL] for 30 minutes daily using [FREE RESOURCE]"

PERSONALIZATION RULES:
- Reference their ACTUAL location for networking events
- Name SPECIFIC companies from their target list
- Address their TOP 1-2 skill gaps only (not all gaps)
- Leverage their school alumni network if school is provided
- Use their existing strengths to get quick wins
`,
      "3_months": `
DIFFICULTY LEVEL: MEDIUM - Skill Building & Consistent Systems
Create 4-6 MEDIUM-EFFORT tasks requiring weekly commitment. Build on 1-month foundation.

REQUIRED ACTION TYPES (choose from these):
✅ Structured Skill Development:
   - "Complete [SPECIFIC CERTIFICATION] for [SKILL GAP] on Coursera/Udemy (8-12 weeks, 3-5 hours/week)"
   - "Build a [SPECIFIC PROJECT] using [TECHNOLOGY] to demonstrate [SKILL GAP] mastery"

✅ Portfolio Development:
   - "Create a GitHub portfolio showcasing [SKILL] project solving [INDUSTRY]-specific problem"
   - "Write 2 technical blog posts about [THEIR STRENGTH] on Medium/Dev.to"

✅ Strategic Networking:
   - "Conduct 2 informational interviews per week with [TARGET ROLE] professionals at [TARGET COMPANIES]"
   - "Join [INDUSTRY] Slack/Discord community and actively contribute 3x/week"
   - "Attend [LOCATION] [INDUSTRY] conferences or workshops (if available)"

✅ Application System:
   - "Apply to 10 jobs per week, tracking applications in spreadsheet with follow-up dates"
   - "Customize cover letter template specifically for [TOP 3 TARGET COMPANIES]"

✅ Interview Preparation:
   - "Practice [TARGET ROLE] interview questions using Pramp/Interviewing.io (2x/week)"
   - "Record and review 3 mock interviews focusing on [SKILL GAP] questions"

PERSONALIZATION RULES:
- Address 2-3 of their key skill gaps with specific certifications/courses
- Reference location-based events, meetups, or conferences
- Suggest projects relevant to their target industry
- Build on strengths identified in resume analysis
- Name specific tools/technologies needed for target role
`,
      "6_months": `
DIFFICULTY LEVEL: ADVANCED - High-Impact Career Positioning
Create 4-6 AMBITIOUS, CAREER-DEFINING goals. These should be transformative, not incremental.

REQUIRED ACTION TYPES (choose from these):
✅ Advanced Credentials:
   - "Complete [ADVANCED BOOTCAMP/CERTIFICATION] in [MAJOR SKILL GAP] (3-6 months intensive)"
   - "Earn [INDUSTRY-SPECIFIC CERTIFICATION] required by [TARGET COMPANIES]"

✅ Leadership & Thought Leadership:
   - "Lead an open-source project in [TECHNOLOGY] with 50+ GitHub stars"
   - "Speak at [LOCATION] tech meetup or [INDUSTRY] conference about [EXPERTISE AREA]"
   - "Publish comprehensive guide/tutorial on [SKILL] reaching 1000+ readers"

✅ Major Portfolio Achievement:
   - "Build and launch a full-scale [PROJECT TYPE] solving [INDUSTRY PROBLEM]"
   - "Contribute to 3+ major open-source projects in [TECHNOLOGY ECOSYSTEM]"

✅ Strategic Career Positioning:
   - "Build mentorship relationship with senior [TARGET ROLE] at [TARGET COMPANY]"
   - "Develop specialized expertise in [EMERGING SKILL] to differentiate from competitors"
   - "Create a personal brand as [TARGET ROLE] expert in [NICHE AREA]"

✅ Target Company Strategy:
   - "Establish contact with hiring managers at top 3 target companies: [LIST COMPANIES]"
   - "Attend [TARGET COMPANY] recruiting events, open houses, or tech talks"
   - "Build relationships with 5+ employees at [TOP TARGET COMPANY] through informational interviews"

PERSONALIZATION RULES:
- Focus on closing their TOP 3 skill gaps completely
- Suggest industry-recognized certifications for their target role
- Reference specific technologies/tools used at target companies
- Leverage their location for major conferences/events
- Build thought leadership in their specific niche
- Create differentiation based on their unique strengths
`
    };

    // Build highly personalized prompt
    const prompt = `You are an expert career coach creating a HIGHLY PERSONALIZED ${phase.replace('_', ' ')} career roadmap.

USER PROFILE:
- Target Role: ${userProfile?.targetRole || 'Career advancement'}
- Target Industries: ${userProfile?.industries?.join(', ') || 'General'}
- Location: ${userProfile?.location || 'Not specified'}
- Education: ${userProfile?.major || 'Not specified'} at ${userProfile?.school || 'Not specified'}
- Graduation Year: ${userProfile?.gradYear || 'Not specified'}
- Target Companies: ${userProfile?.targetCompanies?.join(', ') || 'Various'}

${resumeAnalysis ? `RESUME ANALYSIS:
- Overall Resume Score: ${resumeAnalysis.rmsScore}/100
- Top 3 Skill Gaps to Address: ${topSkillGaps}
- Key Strengths to Leverage: ${specificStrengths}
- Skills Analysis: ${resumeAnalysis.sectionAnalysis?.skills?.explanation || 'Not available'}
- Experience Level: ${resumeAnalysis.sectionAnalysis?.experience?.explanation || 'Not available'}
` : ''}

${phase.replace('_', ' ').toUpperCase()} PHASE REQUIREMENTS:
${phaseInstructions[phase]}

CRITICAL PERSONALIZATION REQUIREMENTS:
1. **Location-Specific**: If location is provided, include local networking events, meetups, or job opportunities
2. **School-Specific**: If school is provided, mention alumni networks, career services, or campus recruiting
3. **Company-Specific**: Reference their ACTUAL target companies by name in action items
4. **Skill-Specific**: Address their TOP skill gaps identified in resume analysis
5. **Role-Specific**: Every action must clearly advance them toward their specific target role
6. **Progressive Difficulty**: Ensure actions match the difficulty level for this phase
7. **Measurable Outcomes**: Include specific metrics, timelines, or deliverables

AVOID GENERIC ACTIONS LIKE:
❌ "Update your resume" → ✅ "Update resume to highlight Python automation projects for Google SWE roles"
❌ "Network with people" → ✅ "Connect with 5 Microsoft alumni from Stanford on LinkedIn this week"
❌ "Learn a new skill" → ✅ "Complete AWS Solutions Architect certification to close cloud infrastructure gap"

Return JSON in this structure:
{
  "title": "Specific, personalized title mentioning their target role or key goal",
  "description": "Brief description explaining what this plan will accomplish for THEIR specific situation",
  "actions": [
    {
      "title": "Ultra-specific action with company/skill/location names",
      "description": "Step-by-step instructions with concrete details, timelines, and resources",
      "rationale": "Why THIS specific action matters for THEIR career goals and gap closure",
      "icon": "📄",
      "completed": false
    }
  ]
}

Generate 4-6 actions. Each action MUST be unique to this user and this phase.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach who creates personalized, actionable career development plans. Always respond with valid JSON."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000,
      temperature: 0.6
    });

    const rawContent = response.choices[0].message.content;
    if (!rawContent || rawContent.trim() === '') {
      throw new Error("Empty response from OpenAI");
    }

    const aiRoadmap = JSON.parse(rawContent);

    // --- Phase validation rules ---
    const validateActions = (actions: any[], phase: string) => {
      return actions.filter(action => {
        const text = (action.title + " " + action.description).toLowerCase();

        if (phase === "30_days") {
          // No long-term items
          if (text.includes("certification") || text.includes("bootcamp") || text.includes("long-term")) {
            return false;
          }
        }

        if (phase === "3_months") {
          // Allow small certs but not "multi-year" commitments
          if (text.includes("multi-year") || text.includes("advanced bootcamp")) {
            return false;
          }
        }

        if (phase === "6_months") {
          // Avoid only "resume update" or other one-day tasks
          if (text.includes("resume") || text.includes("linkedin")) {
            return false;
          }
        }

        return true;
      });
    };

    // Apply validation
    const validatedActions = validateActions(aiRoadmap.actions || [], phase);

    // Add IDs
    const actionsWithIds = validatedActions.map((action: any) => ({
      ...action,
      id: randomUUID(),
      completed: false
    }));

    return {
      title: aiRoadmap.title || `${phase.replace('_', ' ')} Career Plan`,
      description: aiRoadmap.description || `Personalized career development plan`,
      actions: actionsWithIds,
      subsections: []
    };

  } catch (error) {
    console.error("AI roadmap generation failed, using fallback:", error);

    const phaseName = phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const targetRole = userProfile?.targetRole || 'your target role';

    return {
      title: `${phaseName} Plan for ${targetRole}`,
      description: `A structured career plan tailored for advancing toward ${targetRole}`,
      actions: [
        {
          id: randomUUID(),
          title: `Update Resume for ${targetRole} Positions`,
          description: "Tailor your resume to highlight relevant experience and skills for your target role",
          rationale: "A targeted resume significantly increases interview opportunities",
          icon: "📄",
          completed: false
        },
        {
          id: randomUUID(),
          title: "Optimize LinkedIn Profile",
          description: "Update headline, summary, and skills to attract recruiters in your target industry",
          rationale: "LinkedIn optimization increases visibility by 40%",
          icon: "💼",
          completed: false
        },
        {
          id: randomUUID(),
          title: `Research ${userProfile?.industries?.[0] || 'Target'} Companies`,
          description: "Identify and research 15-20 companies that align with your career goals",
          rationale: "Targeted applications have 3x higher success rates",
          icon: "🔍",
          completed: false
        }
      ],
      subsections: []
    };
  }
}


  async tailorResume(baseResumeText: string, jobDescription: string, targetKeywords: string[], userProfile: any): Promise<TailoredResumeResult> {
    try {
      const prompt = `CRITICAL ANTI-FABRICATION RULES - NEVER VIOLATE:
1. DO NOT fabricate, invent, or add ANY information not present in the original resume
2. DO NOT add skills, experiences, projects, or achievements the candidate doesn't have
3. DO NOT remove any existing information from the resume
4. ONLY rephrase, reword, and reorganize EXISTING content to better match the job description
5. You may highlight relevant experiences more prominently, but cannot create new ones
6. Keyword optimization means using the EXISTING content with job-relevant terminology, not inventing qualifications

Your ONLY job is to reword and reorganize the candidate's REAL experiences to be more relevant to this specific job posting.

FORMATTING REQUIREMENTS:
- Use proper line breaks between sections (use \\n)
- Put section headers in ALL CAPS (e.g., PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS)
- Each section header should be on its own line
- Add a blank line before each section header
- Format contact information clearly at the top
- Use bullet points or clear line breaks for list items

Resume: ${baseResumeText}
Job: ${jobDescription}
Keywords: ${targetKeywords.join(", ")}

Provide JSON:
{
  "tailoredContent": "Updated resume text with ONLY reworded existing content. Use \\n for line breaks. Format with clear sections like:\\n\\nName\\nContact Info\\n\\nPROFESSIONAL SUMMARY\\nYour summary here\\n\\nEXPERIENCE\\nJob 1\\nDetails\\n\\nJob 2\\nDetails\\n\\nEDUCATION\\nDegree details\\n\\nSKILLS\\nSkill list",
  "jobSpecificScore": 85,
  "keywordsCovered": ["keyword1", "keyword2"],
  "remainingGaps": [{"skill": "Python", "importance": "high", "resources": [{"title": "Course Name", "provider": "Provider Name", "url": "", "cost": "Free"}]}],
  "diffJson": [{"type": "modify", "section": "skills", "original": "old", "new": "new", "reason": "keyword optimization"}]
}

CRITICAL REQUIREMENT: For any resources in remainingGaps, use ONLY these REAL, VERIFIED URLs:
- Python: https://www.coursera.org/specializations/python
- JavaScript: https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/
- Data Science: https://www.coursera.org/professional-certificates/google-data-analytics
- AWS: https://aws.amazon.com/training/digital/
- Project Management: https://www.coursera.org/professional-certificates/google-project-management
- General Skills: https://www.linkedin.com/learning/
- Free Resources: https://www.khanacademy.org/
If no specific match, use https://www.coursera.org/browse or https://www.edx.org/`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a professional resume writer." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Resume tailoring error:", error);
      throw new Error("Failed to tailor resume");
    }
  }

  async generateCoverLetter(resumeText: string, jobDescription: string, company: string, role: string): Promise<string> {
    try {
      const prompt = `Write a professional cover letter for this application:
      
Resume: ${resumeText}
Job: ${jobDescription}
Company: ${company}
Role: ${role}

Create a compelling 3-4 paragraph cover letter.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a professional career coach who writes compelling cover letters." },
          { role: "user", content: prompt }
        ]
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Cover letter generation error:", error);
      throw new Error("Failed to generate cover letter");
    }
  }

  async optimizeLinkedInProfile(currentProfile: string, targetRole: string, targetIndustries: string[]) {
    try {
      const prompt = `Optimize this LinkedIn profile for ${targetRole} in ${targetIndustries.join(", ")}:
      
Current: ${currentProfile}

Provide JSON:
{
  "headline": "Optimized headline",
  "about": "Optimized about section",
  "skills": ["skill1", "skill2"],
  "improvements": ["suggestion1", "suggestion2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a LinkedIn optimization expert." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("LinkedIn optimization error:", error);
      throw new Error("Failed to optimize LinkedIn profile");
    }
  }

  async generateCareerInsights({ resumeText, targetRole, experience }: { resumeText: string; targetRole?: string; experience?: string; }) {
    try {
      const prompt = `Provide career insights for this professional:
      
Resume: ${resumeText}
Target Role: ${targetRole}
Experience: ${experience}

Provide JSON with career recommendations and insights.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert career coach." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Career insights error:", error);
      throw new Error("Failed to generate career insights");
    }
  }

  async generateSalaryNegotiationStrategy({ currentSalary, targetSalary, jobRole, location, yearsExperience, resumeText }: { currentSalary: number; targetSalary: number; jobRole: string; location: string; yearsExperience: number; resumeText?: string; }) {
    try {
      const prompt = `Analyze this person's resume and create personalized salary negotiation advice:

RESUME: ${resumeText || 'Resume not provided'}

SALARY DETAILS:
- Current: ${currentSalary ? `$${currentSalary.toLocaleString()}` : 'Not disclosed'}
- Target: $${targetSalary.toLocaleString()}  
- Role: ${jobRole}
- Location: ${location}
- Experience: ${yearsExperience} years

Create a personalized salary negotiation strategy based on their specific skills, achievements, and experience shown in their resume. Begin with: "Based on your experience as a ${jobRole}, here's my personalized advice for negotiating your salary increase to $${targetSalary.toLocaleString()}..."

Write as natural conversation. Reference specific skills or achievements from their resume. Include market research for their role in ${location}. Give concrete talking points based on their actual background.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are a friendly career coach having a conversation. Write your entire response as natural flowing text, like you're talking to someone face-to-face. Use "you" and "your" throughout. Write in complete sentences and paragraphs only. Never use JSON, never use structured data, never use brackets or quotes. Start every response with "Based on your experience as a ${jobRole}, here's my advice for negotiating your salary increase..." and continue with natural conversational advice.`
          },
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9
      });

      let content = response.choices[0].message.content || "Unable to generate negotiation strategy at this time.";
      
      // NUCLEAR OPTION: Force convert ANY structured data to natural language
      if (content.includes('{') || content.includes('[') || content.includes('"') || content.includes('":')) {
        console.log("AI returned structured data, converting to natural language");
        
        // AGGRESSIVE text extraction and conversion
        let naturalContent = content;
        
        // If it's JSON, extract all values
        if (content.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(content);
            const values: string[] = [];
            
            const extractAllValues = (obj: any) => {
              if (typeof obj === 'string' && obj.length > 5) {
                values.push(obj);
              } else if (Array.isArray(obj)) {
                obj.forEach(extractAllValues);
              } else if (typeof obj === 'object' && obj !== null) {
                Object.values(obj).forEach(extractAllValues);
              }
            };
            
            extractAllValues(parsed);
            naturalContent = values.join(' ');
          } catch (e) {
            // Fallback: strip all JSON formatting
            naturalContent = content
              .replace(/[{}"\[\],]/g, ' ')
              .replace(/[a-z_]+:/gi, ' ')
              .replace(/\s+/g, ' ');
          }
        }
        
        // Clean up and make it conversational
        naturalContent = naturalContent
          .replace(/\s+/g, ' ')
          .replace(/\.\s*/g, '. ')
          .replace(/([.!?])\s*/g, '$1 ')
          .trim();
          
        // Force conversational tone
        if (!naturalContent.toLowerCase().includes('based on your experience')) {
          naturalContent = `Based on your experience as a ${jobRole}, here's my advice for negotiating your salary increase. ${naturalContent}`;
        }
        
        content = naturalContent;
      }
      
      // Final cleanup to ensure natural language
      content = content
        .replace(/^[^a-zA-Z]*/, '') // Remove leading non-letters
        .replace(/\s+/g, ' ')
        .trim();
      
      return content;
    } catch (error) {
      console.error("Salary negotiation error:", error);
      throw new Error("Failed to generate salary negotiation strategy");
    }
  }

  async updateResumeFromRoadmap({ resumeText, completedTasks }: { resumeText: string; completedTasks: any[]; }) {
    try {
      const prompt = `Update this resume based on completed roadmap tasks:
      
Resume: ${resumeText}
Completed Tasks: ${JSON.stringify(completedTasks)}

Provide JSON:
{
  "updatedResumeText": "Updated resume text",
  "changesApplied": ["List of changes"],
  "newSkillsAdded": ["skill1", "skill2"],
  "enhancedSections": ["section1", "section2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a professional resume writer." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from OpenAI");
      
      return JSON.parse(content);
    } catch (error) {
      console.error("Resume update error:", error);
      throw new Error("Failed to update resume from roadmap");
    }
  }

  async generateInterviewQuestions(jobTitle: string, company: string, category: string, count: number = 10) {
    try {
      const prompt = `Generate ${count} ${category} interview questions for a ${jobTitle} position at ${company}.

For each question, provide:
1. The question itself
2. Category: ${category}
3. Difficulty level (beginner/intermediate/advanced)
4. 3-4 answer tips to help the candidate prepare

Categories:
- behavioral: Questions about past experiences, teamwork, leadership, problem-solving
- technical: Role-specific technical questions and coding challenges
- situational: Hypothetical scenarios and problem-solving questions
- company: Company-specific questions about culture, values, and industry knowledge

Format as JSON array:
{
  "questions": [
    {
      "question": "Tell me about a time you had to work with a difficult team member.",
      "category": "${category}",
      "difficulty": "intermediate",
      "tips": [
        "Focus on your actions and problem-solving approach",
        "Show emotional intelligence and professionalism",
        "Highlight the positive outcome or learning",
        "Avoid speaking negatively about others"
      ]
    }
  ]
}

Make questions specific to ${jobTitle} role and ${company} when possible.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert interview coach and hiring manager." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
      // Add unique IDs to questions
      const questions = (result.questions || []).map((q: any, index: number) => ({
        ...q,
        id: `q-${Date.now()}-${index}`
      }));
      return questions;
    } catch (error) {
      console.error("Interview questions generation error:", error);
      throw new Error("Failed to generate interview questions");
    }
  }

   async generatePrepResources(jobTitle: string, company: string, skills: string[] = []) {
    try {
      const prompt = `Generate relevant preparation resources for a ${jobTitle} interview at ${company}.

Focus on skills: ${skills.join(', ') || 'general interview skills'}

CRITICAL REQUIREMENT:
- Only use the verified resource URLs listed below.
- If no exact match exists, link to the platform's main catalog.
- NEVER invent or hallucinate URLs.

VERIFIED RESOURCE URLS:
- Coursera: https://www.coursera.org/
- Udemy: https://www.udemy.com/
- LinkedIn Learning: https://www.linkedin.com/learning/
- YouTube: https://www.youtube.com/
- LeetCode: https://leetcode.com/
- HackerRank: https://www.hackerrank.com/
- Khan Academy: https://www.khanacademy.org/
- Educative: https://www.educative.io/
- AWS Training: https://aws.amazon.com/training/digital/
- Azure Learning: https://learn.microsoft.com/en-us/training/
- Google Cloud Training: https://cloud.google.com/training

Provide 8–12 diverse, high-quality resources in this JSON structure:
{
  "resources": [
    {
      "title": "System Design Interview Prep",
      "type": "course",
      "url": "https://www.educative.io/courses/grokking-the-system-design-interview",
      "description": "Comprehensive system design patterns and interview questions",
      "duration": "8 hours",
      "provider": "Educative",
      "rating": 4.5
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a career coach who curates the best learning resources. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"resources": []}');

      // Post-process: enforce whitelist of allowed domains
      const allowedDomains = [
        "coursera.org",
        "udemy.com",
        "linkedin.com",
        "youtube.com",
        "leetcode.com",
        "hackerrank.com",
        "khanacademy.org",
        "educative.io",
        "aws.amazon.com",
        "cloud.google.com",
        "microsoft.com"
      ];

      const safeResources = (result.resources || []).map((r: any, index: number) => {
        const isAllowed = allowedDomains.some(domain => r.url && r.url.includes(domain));
        return {
          ...r,
          id: `r-${Date.now()}-${index}`,
          url: isAllowed ? r.url : "https://www.coursera.org/" // fallback safe URL
        };
      });

      return safeResources;
    } catch (error) {
      console.error("Prep resources generation error:", error);
      throw new Error("Failed to generate preparation resources");
    }
  }
} 

export const aiService = new AIService();

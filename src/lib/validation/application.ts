import { z } from "zod";

const urlSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^https?:\/\//.test(val),
    { message: "URL must start with http:// or https://" }
  );

export const contactSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  linkedinUrl: urlSchema,
});

export const interviewPrepSchema = z.object({
  id: z.string(),
  stage: z.string().min(1, "Stage is required"),
  date: z.string().optional(),
  notes: z.string().optional().default(""),
  outcome: z.enum(["pending", "passed", "failed"]).optional(),
});

export const applicationSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  source: z.string().default("manual"),
  location: z.string().default(""),
  jobUrl: urlSchema,
  status: z.enum([
    "wishlist",
    "applied",
    "phone_screen",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
  ]),
  appliedDate: z.string().optional(),
  lastActivityDate: z.string(),
  nextActionDate: z.string().optional(),
  nextActionNote: z.string().optional(),
  salaryRange: z.string().optional(),
  notes: z.string().default(""),
  contacts: z.array(contactSchema).default([]),
  interviewPrep: z.array(interviewPrepSchema).default([]),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  archived: z.boolean().default(false),
});

export const applicationInputSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  source: z.string().default("manual"),
  location: z.string().default(""),
  jobUrl: urlSchema,
  status: z.enum([
    "wishlist",
    "applied",
    "phone_screen",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
  ]),
  appliedDate: z.string().optional(),
  nextActionDate: z.string().optional(),
  nextActionNote: z.string().optional(),
  salaryRange: z.string().optional(),
  notes: z.string().default(""),
  contacts: z.array(contactSchema).default([]),
  interviewPrep: z.array(interviewPrepSchema).default([]),
  tags: z.array(z.string()).default([]),
  archived: z.boolean().default(false),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;

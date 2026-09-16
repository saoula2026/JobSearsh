export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  company: string;
  role: string;
  source: string;
  location: string;
  jobUrl?: string;
  status: ApplicationStatus;
  appliedDate?: string;
  lastActivityDate: string;
  nextActionDate?: string;
  nextActionNote?: string;
  salaryRange?: string;
  notes: string;
  contacts: Contact[];
  interviewPrep: InterviewPrepEntry[];
  tags: string[];
  createdAt: string;
  archived: boolean;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  linkedinUrl?: string;
}

export interface InterviewPrepEntry {
  id: string;
  stage: string;
  date?: string;
  notes: string;
  outcome?: "pending" | "passed" | "failed";
}

export interface UserSettings {
  id: number;
  pipelineStages: ApplicationStatus[];
  defaultFollowUpDays: number;
  theme: "light" | "dark" | "system";
}

export type JobSource =
  | "remotive"
  | "arbeitnow"
  | "remoteok"
  | "jobicy";

export interface ExternalJobListing {
  id: string;
  source: JobSource;
  company: string;
  role: string;
  location: string;
  url: string;
  postedDate?: string;
  salaryText?: string;
  tags: string[];
  descriptionSnippet: string;
  fetchedAt: string;
}

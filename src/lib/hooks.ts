import { useLiveQuery } from "dexie-react-hooks";
import { applications, userSettings } from "@/lib/db";
import type { Application, ApplicationStatus } from "@/lib/types";
import { applicationInputSchema } from "@/lib/validation/application";
import type { ApplicationInput } from "@/lib/validation/application";

export function useApplications() {
  const data = useLiveQuery(() => applications.toArray());
  return { applications: data ?? [], isLoading: data === undefined };
}

export function useApplication(id: string | undefined) {
  const data = useLiveQuery(() => (id ? applications.get(id) : undefined), [id]);
  return { application: data, isLoading: data === undefined };
}

export function useArchivedApplications() {
  const data = useLiveQuery(() =>
    applications.where("archived").equals(1).toArray()
  );
  return { applications: data ?? [], isLoading: data === undefined };
}

export function useApplicationsByStatus(status: ApplicationStatus) {
  const data = useLiveQuery(
    () =>
      applications.where("status").equals(status).and((app) => !app.archived).toArray(),
    [status]
  );
  return { applications: data ?? [], isLoading: data === undefined };
}

export async function createApplication(
  input: Omit<ApplicationInput, "contacts" | "interviewPrep"> & {
    contacts?: Application["contacts"];
    interviewPrep?: Application["interviewPrep"];
  }
): Promise<string> {
  const now = new Date().toISOString();
  const application: Application = {
    id: input.id,
    company: input.company,
    role: input.role,
    source: input.source || "manual",
    location: input.location || "",
    jobUrl: input.jobUrl,
    status: input.status,
    appliedDate: input.appliedDate,
    lastActivityDate: now,
    nextActionDate: input.nextActionDate,
    nextActionNote: input.nextActionNote,
    salaryRange: input.salaryRange,
    notes: input.notes || "",
    contacts: input.contacts || [],
    interviewPrep: input.interviewPrep || [],
    tags: input.tags || [],
    createdAt: now,
    archived: input.archived || false,
  };
  await applications.add(application);
  return application.id;
}

export async function updateApplication(
  id: string,
  updates: Partial<ApplicationInput>
): Promise<void> {
  const existing = await applications.get(id);
  if (!existing) throw new Error("Application not found");

  await applications.update(id, {
    ...updates,
    lastActivityDate: new Date().toISOString(),
  });
}

export async function deleteApplication(id: string): Promise<void> {
  await applications.delete(id);
}

export async function archiveApplication(id: string): Promise<void> {
  await applications.update(id, {
    archived: true,
    lastActivityDate: new Date().toISOString(),
  });
}

export async function unarchiveApplication(id: string): Promise<void> {
  await applications.update(id, {
    archived: false,
    lastActivityDate: new Date().toISOString(),
  });
}

export async function changeStatus(
  id: string,
  status: ApplicationStatus
): Promise<void> {
  await applications.update(id, {
    status,
    lastActivityDate: new Date().toISOString(),
  });
}

export async function findByCompanyRole(
  company: string,
  role: string
): Promise<Application | undefined> {
  return applications
    .where("company")
    .equals(company)
    .and((app) => app.role === role && !app.archived)
    .first();
}


import Dexie, { type Table } from "dexie";
import type { Application, UserSettings } from "./types";

export const db = new Dexie("JobSearchCommandCenter");

db.version(1).stores({
  applications:
    "id, company, role, status, location, source, appliedDate, lastActivityDate, nextActionDate, archived, createdAt",
  userSettings: "id",
});

export interface DB {
  applications: Table<Application, string>;
  userSettings: Table<UserSettings, number>;
}

export const applications = db.table<Application, string>("applications");
export const userSettings = db.table<UserSettings, number>("userSettings");

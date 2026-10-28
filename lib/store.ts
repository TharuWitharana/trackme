import { promises as fs } from "fs";
import path from "path";
import type { DayEntry, EntryMap } from "./types";

// Entries are kept in a JSON file on the server: data/entries.json
const FILE = path.join(process.cwd(), "data", "entries.json");

let writeQueue: Promise<unknown> = Promise.resolve();

export async function readEntries(): Promise<EntryMap> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as EntryMap;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw err;
  }
}

// Writes run one at a time so two quick saves can't overwrite each other.
function update(change: (entries: EntryMap) => void): Promise<void> {
  const run = writeQueue.then(async () => {
    const entries = await readEntries();
    change(entries);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(entries, null, 2));
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

export function saveEntry(entry: DayEntry) {
  return update((entries) => {
    entries[entry.date] = entry;
  });
}

export function deleteEntry(date: string) {
  return update((entries) => {
    delete entries[date];
  });
}

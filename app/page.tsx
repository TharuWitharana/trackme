import { Suspense } from "react";
import { connection } from "next/server";
import Tracker from "@/components/Tracker";
import { readEntries } from "@/lib/store";

export default function Home() {
  return (
    <Suspense fallback={<div className="loading">Loading your progress…</div>}>
      <TrackerWithData />
    </Suspense>
  );
}

async function TrackerWithData() {
  // Read fresh data on every request instead of at build time.
  await connection();
  const entries = await readEntries();
  return <Tracker initialEntries={entries} />;
}

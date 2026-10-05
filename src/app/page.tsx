"use client";
import { Button } from "@cloudflare/kumo";

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="font-heading text-5xl font-semibold">GymFlow</h1>
      <p className="mt-2 text-neutral-400">Setup check</p>
      <div className="mt-6">
        <Button>Try the demo</Button>
      </div>
    </main>
  );
}
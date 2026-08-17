"use client";

import { useState } from "react";
import SetupKeys from "@/components/SetupKeys";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [keys, setKeys] = useState<{ youtube: string; gemini: string } | null>(null);

  if (!keys) {
    return <SetupKeys onReady={setKeys} />;
  }

  return <Dashboard keys={keys} />;
}

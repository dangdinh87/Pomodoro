"use client";

import { useEffect } from "react";
import Loader from "./loader";
import { useSystemStore } from "@/stores/system-store";

export default function GlobalLoader() {
  const { isLoading, loadingMessage, loadingSubtitle } = useSystemStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader 
        title={loadingMessage || "Loading..."}
        subtitle={loadingSubtitle || "Please wait"}
        size="lg"
      />
    </div>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh({ detik = 5 }: { detik?: number }) {
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => router.refresh(), detik * 1000);
    return () => clearInterval(t);
  }, [router, detik]);

  return null;
}
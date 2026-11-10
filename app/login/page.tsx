"use client";

import { useActionState } from "react";
import Image from "next/image";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      <Image
        src="/gedung-unpam.jpeg"
        alt="Gedung UNPAM"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-blue-950/60" />

      <div className="relative w-full max-w-md rounded-2xl border-t-4 border-yellow-400 bg-white/95 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full">
            <Image
              src="/logo-unpam.jpeg"
              alt="Logo UNPAM"
              fill
              className="scale-[1.2] object-cover"
            />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-blue-900">SIMRS</h1>
          <p className="text-sm font-semibold text-blue-800">
            Klinik Pratama UNPAM
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Sistem Informasi Manajemen Rumah Sakit
          </p>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              name="username"
              required
              autoFocus
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              placeholder="Masukkan password"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-blue-700 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {pending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Copyright © 2026 SIMRS Klinik Pratama UNPAM
        </p>
      </div>
    </main>
  );
}
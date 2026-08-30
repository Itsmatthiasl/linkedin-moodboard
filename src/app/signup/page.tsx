"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { AuthCard } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";

export default function SignupPage() {
  const [state, action] = useActionState(signup, undefined);

  if (state?.success) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="Confirm your address to finish signing up."
      >
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          We sent a confirmation link to your inbox. Click it, then come back
          and log in.
        </p>
        <p className="mt-4 text-center text-sm text-neutral-500">
          <Link href="/login" className="text-neutral-900 underline dark:text-white">
            Back to log in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Just an email and password.">
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
          <p className="text-xs text-neutral-500">At least 8 characters.</p>
        </div>
        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <SubmitButton pendingText="Creating account…">Sign up</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-neutral-900 underline dark:text-white">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

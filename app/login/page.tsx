"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold">주간 플래너</h1>
        <p className="text-sm text-neutral-500">비밀번호를 입력해주세요.</p>
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "확인 중..." : "들어가기"}
        </button>
      </form>
    </main>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { logoutAction } from "../login/actions";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="font-semibold">주간 플래너</Link>
            <Link href="/board" className="text-neutral-600 hover:text-neutral-900">보드</Link>
            <Link href="/issues" className="text-neutral-600 hover:text-neutral-900">이슈</Link>
            <Link href="/timeline" className="text-neutral-600 hover:text-neutral-900">회고</Link>
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900">
              로그아웃
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

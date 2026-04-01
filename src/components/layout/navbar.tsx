import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { getRoleHomePath } from "@/lib/navigation";
import { getCurrentUser } from "@/server/services/auth-service";
import { SignOutButton } from "@/components/layout/sign-out-button";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(101,214,255,0.12)] bg-[color:rgba(8,11,13,0.84)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[22px] bg-white shadow-[0_18px_40px_-24px_rgba(101,214,255,0.55)]">
              <Image
                src="/brand/resq-mark.png"
                alt="ResQ"
                width={42}
                height={43}
                className="h-9 w-9 object-contain"
              />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-white">
                ResQ
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-[rgba(101,214,255,0.72)]">
                Calm rescue UX
              </p>
            </div>
          </Link>
          {user ? (
            <Link
              href={getRoleHomePath(user.role)}
              className="rounded-full bg-white/92 px-4 py-2 text-xs font-semibold text-[var(--night-950)] ring-1 ring-white/10 md:hidden"
            >
              Bảng điều khiển
            </Link>
          ) : null}
        </div>

        <nav className="flex flex-wrap items-center gap-2 md:justify-center">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/[0.76] transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href={getRoleHomePath(user.role)} className="hidden md:block">
                <Button variant="secondary">Bảng điều khiển</Button>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/auth">
              <Button>Đăng nhập</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

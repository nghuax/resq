"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        startTransition(async () => {
          await apiFetch("/api/auth/sign-out", {
            method: "POST",
          });
          router.push("/");
          router.refresh();
        });
      }}
      disabled={isPending}
    >
      {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
    </Button>
  );
}

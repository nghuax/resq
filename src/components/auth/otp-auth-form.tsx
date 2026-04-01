"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";
import { getRoleHomePath } from "@/lib/navigation";
import { sendOtpSchema, verifyOtpSchema } from "@/schemas/auth";

type AuthFormValues = z.infer<typeof verifyOtpSchema>;

export function OtpAuthForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      phone: "",
      otp: "",
      name: "",
    },
  });

  async function handleSendOtp() {
    setErrorMessage(null);
    setStatusMessage(null);

    const phone = form.getValues("phone");
    const parsed = sendOtpSchema.safeParse({ phone });

    if (!parsed.success) {
      form.setError("phone", {
        message: parsed.error.issues[0]?.message ?? "Số điện thoại không hợp lệ.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await apiFetch<{
          phone: string;
          expiresAt: string;
          devOtpCode?: string;
        }>("/api/auth/send-otp", {
          method: "POST",
          body: JSON.stringify({ phone }),
        });

        setStep("verify");
        setStatusMessage(
          `Mã OTP đã được tạo cho ${result.phone}. Hiệu lực trong 5 phút.`,
        );
        setDevOtpCode(result.devOtpCode ?? null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể gửi OTP.",
        );
      }
    });
  }

  function fillDemoAccount(phone: string) {
    form.setValue("phone", phone, { shouldValidate: true });
    setStep("phone");
    setDevOtpCode(null);
    setStatusMessage(null);
    setErrorMessage(null);
  }

  function onSubmit(values: AuthFormValues) {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      try {
        const result = await apiFetch<{
          user: {
            role: "customer" | "fixer" | "admin";
          };
        }>("/api/auth/verify-otp", {
          method: "POST",
          body: JSON.stringify(values),
        });

        router.push(getRoleHomePath(result.user.role));
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Xác thực OTP thất bại.",
        );
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-600)]">
            OTP Phone Login
          </p>
          <h2 className="text-2xl font-semibold text-[var(--ink-950)]">
            Đăng nhập hoặc tạo tài khoản trong chưa đầy 1 phút
          </h2>
          <p className="text-sm leading-7 text-[var(--ink-600)]">
            Nhập số điện thoại Việt Nam để nhận OTP. Ở môi trường local, hệ thống
            dùng mã dev để bạn test luồng nhanh.
          </p>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            label="Số điện thoại"
            hint="Ví dụ: 0900000003"
            error={form.formState.errors.phone?.message}
          >
            <Input
              placeholder="Nhập số điện thoại"
              {...form.register("phone")}
            />
          </FormField>

          {step === "verify" ? (
            <>
              <FormField
                label="Mã OTP"
                hint="6 chữ số"
                error={form.formState.errors.otp?.message}
              >
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  {...form.register("otp")}
                />
              </FormField>

              <FormField
                label="Tên hiển thị"
                hint="Tùy chọn cho người dùng mới"
                error={form.formState.errors.name?.message}
              >
                <Input
                  placeholder="Ví dụ: Trần Minh Anh"
                  {...form.register("name")}
                />
              </FormField>
            </>
          ) : null}

          {statusMessage ? (
            <div className="rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-700">
              {statusMessage}
            </div>
          ) : null}

          {devOtpCode ? (
            <div className="rounded-2xl border border-dashed border-[var(--brand-300)] bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-700)]">
              Mã OTP dev hiện tại:{" "}
              <span className="font-semibold text-[var(--brand-700)]">
                {devOtpCode}
              </span>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="sm:flex-1"
              onClick={handleSendOtp}
              disabled={isPending}
            >
              {isPending && step === "phone" ? "Đang gửi..." : "Gửi OTP"}
            </Button>
            <Button
              type="submit"
              className="sm:flex-1"
              disabled={isPending || step !== "verify"}
            >
              {isPending && step === "verify" ? "Đang xác thực..." : "Xác thực"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-5 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,245,0.98))]">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-[var(--ink-950)]">
            Tài khoản mẫu đã seed
          </h3>
          <p className="text-sm leading-7 text-[var(--ink-600)]">
            Bấm vào một tài khoản để điền nhanh số điện thoại. Sau đó gửi OTP và
            dùng mã dev hiển thị ở bên trái.
          </p>
        </div>

        <div className="space-y-3">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.phone}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-black/6 bg-white px-4 py-4 text-left transition hover:border-[var(--brand-300)] hover:bg-[var(--sand-50)]"
              onClick={() => fillDemoAccount(account.phone)}
            >
              <div>
                <p className="font-medium text-[var(--ink-900)]">{account.name}</p>
                <p className="text-sm text-[var(--ink-500)]">{account.role}</p>
              </div>
              <span className="text-sm font-semibold text-[var(--brand-600)]">
                {account.phone}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

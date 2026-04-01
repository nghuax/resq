import { redirect } from "next/navigation";

import { OtpAuthForm } from "@/components/auth/otp-auth-form";
import { PageHeader } from "@/components/common/page-header";
import { getRoleHomePath } from "@/lib/navigation";
import { getCurrentUser } from "@/server/services/auth-service";

export default async function AuthPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getRoleHomePath(user.role));
  }

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Đăng nhập / Đăng ký"
        title="OTP phone login cho ResQ"
        description="Luồng OTP được scaffold cho sản phẩm thực tế và có fallback dev rõ ràng để kiểm thử local."
      />
      <OtpAuthForm />
    </div>
  );
}

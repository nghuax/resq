import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[60vh] items-center justify-center py-10">
      <Card className="max-w-xl space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-600)]">
          404
        </p>
        <h1 className="text-3xl font-semibold text-[var(--ink-950)]">
          Trang bạn tìm không tồn tại hoặc không còn khả dụng
        </h1>
        <p className="text-sm leading-7 text-[var(--ink-600)]">
          Bạn có thể quay về trang chủ, đăng nhập lại, hoặc mở dashboard để tiếp tục
          dùng ResQ.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button>Về trang chủ</Button>
          </Link>
          <Link href="/auth">
            <Button variant="secondary">Đăng nhập</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

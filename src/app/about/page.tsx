import { ABOUT_POINTS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

export default function AboutPage() {
  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="About ResQ"
        title="Một nền tảng cứu hộ được thiết kế cho bối cảnh giao thông Việt Nam"
        description="ResQ ưu tiên thao tác nhanh trên di động, trạng thái rõ ràng và cấu trúc đủ sạch để mở rộng thành sản phẩm thực tế."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {ABOUT_POINTS.map((point) => (
          <Card key={point} className="space-y-3">
            <p className="text-lg font-semibold text-[var(--ink-950)]">ResQ</p>
            <p className="text-sm leading-7 text-[var(--ink-600)]">{point}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

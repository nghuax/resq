import Link from "next/link";
import { ArrowRight, Clock3, LifeBuoy, MapPinned, Wrench } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { HomeHero } from "@/components/marketing/home-hero";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DASHBOARD_ACTIONS, FAQ_ITEMS, SERVICE_CATALOG } from "@/lib/constants";
import { formatCurrencyVnd } from "@/lib/format";
import { getRoleHomePath } from "@/lib/navigation";
import { getCurrentUser } from "@/server/services/auth-service";

export default async function Home() {
  const user = await getCurrentUser();
  const primaryHref = user ? getRoleHomePath(user.role) : "/auth";
  const primaryLabel = user ? "Mở bảng điều khiển" : "Đăng nhập để gọi cứu hộ";

  return (
    <div className="container-shell space-y-12 py-10 md:space-y-14 md:py-14">
      <HomeHero primaryHref={primaryHref} primaryLabel={primaryLabel} />

      <section className="space-y-6">
        <PageHeader
          eyebrow="Dịch vụ"
          title="Những gì ResQ xử lý trong MVP"
          description="Mỗi nhóm dịch vụ đều được seed giá cơ bản, API và giao diện gọi hỗ trợ."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SERVICE_CATALOG.slice(0, 8).map((service) => (
            <Card
              key={service.key}
              className="group space-y-4 border-white/70 bg-[rgba(255,255,255,0.86)] p-6 transition hover:-translate-y-1 hover:border-[rgba(8,67,238,0.18)] hover:shadow-[0_32px_70px_-38px_rgba(4,38,153,0.44)]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-[20px] bg-[rgba(8,67,238,0.08)] p-3 text-[var(--brand-700)] transition group-hover:bg-[var(--brand-600)] group-hover:text-white">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--ink-900)]">{service.nameVi}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--ink-500)]">
                    {service.nameEn}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-7 text-[var(--ink-600)]">
                {service.descriptionVi}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--brand-700)]">
                  Từ {formatCurrencyVnd(service.basePriceVnd)}
                </p>
                {service.isFuelService ? <Badge tone="sky">Fuel flow</Badge> : null}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="city-night-gradient topographic-lines-dark space-y-5 border-[rgba(101,214,255,0.14)] p-6 text-white md:p-8">
          <PageHeader
            eyebrow="Quy trình"
            title="Cách ResQ hoạt động"
            description="MVP tập trung tối ưu thao tác một tay trên điện thoại."
            invert
          />
          <div className="space-y-4">
            {[
              "Chọn xe đã lưu hoặc thêm nhanh ngay trong luồng yêu cầu.",
              "Chọn dịch vụ, vị trí và mô tả sự cố bằng tiếng Việt.",
              "Theo dõi trạng thái, thanh toán mô phỏng và gửi đánh giá sau khi hoàn tất.",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-4 rounded-[24px] border border-white/8 bg-white/5 px-4 py-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-400)] text-sm font-semibold text-[var(--night-950)]">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-white/[0.76]">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5 p-6 md:p-8">
          <PageHeader
            eyebrow="Dashboard"
            title="Các tác vụ chính của khách hàng"
            description="Các lối tắt này cũng xuất hiện trong dashboard sau khi đăng nhập."
          />
          <div className="space-y-3">
            {DASHBOARD_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center justify-between rounded-[24px] border border-[rgba(8,11,13,0.06)] bg-[var(--sand-50)] px-4 py-4 transition hover:border-[rgba(8,67,238,0.18)] hover:bg-white">
                  <div>
                    <p className="font-medium text-[var(--ink-900)]">{action.title}</p>
                    <p className="text-sm text-[var(--ink-500)]">{action.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--brand-700)]" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <PageHeader
          eyebrow="Tại sao ResQ"
          title="Những điểm chạm cần thiết để người dùng yên tâm"
          description="Từ hỗ trợ hiện trường đến hậu kiểm dịch vụ, mọi màn hình quan trọng đều đã có mặt trong MVP."
        />
        <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="blue-tech-gradient p-6 text-white md:p-8">
            <div className="space-y-5">
              <Badge className="bg-white/12 text-white">Customer support</Badge>
              <h3 className="font-display text-3xl font-semibold tracking-[-0.06em]">
                Một luồng đủ gọn để xử lý khẩn cấp, đủ rõ để tạo niềm tin.
              </h3>
              <p className="text-sm leading-7 text-white/[0.78]">
                ResQ ưu tiên thao tác trực tiếp trên mobile: chọn xe, định vị, mô tả sự cố,
                theo dõi fixer, kiểm tra hóa đơn và gửi đánh giá mà không phải chuyển qua
                nhiều hệ thống khác nhau.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Theo dõi fixer", icon: Clock3 },
                  { title: "Đặt vị trí bằng bản đồ", icon: MapPinned },
                  { title: "Dịch vụ kỹ thuật", icon: Wrench },
                  { title: "Kênh hỗ trợ rõ ràng", icon: LifeBuoy },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4"
                    >
                      <Icon className="h-5 w-5 text-[var(--accent-400)]" />
                      <p className="mt-3 text-sm font-medium text-white">{item.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {FAQ_ITEMS.slice(0, 4).map((item) => (
              <Card key={item.question} className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-[var(--ink-950)]">{item.question}</h3>
                <p className="text-sm leading-7 text-[var(--ink-600)]">{item.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

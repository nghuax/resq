import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, MapPinned, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SERVICE_CATALOG } from "@/lib/constants";

const heroMetrics: Array<{
  value: string;
  suffix?: string;
  label: string;
  title: string;
  className: string;
}> = [
  {
    value: "12-30",
    suffix: "phút",
    label: "ETA minh bạch",
    title: "Phản hồi nhanh",
    className: "bg-[var(--brand-600)] text-white",
  },
  {
    value: "24/7",
    label: "Khung hỗ trợ",
    title: "Điều phối liên tục",
    className: "bg-[var(--night-950)] text-white",
  },
  {
    value: `${SERVICE_CATALOG.length}`,
    label: "dịch vụ seed sẵn",
    title: "Luồng test-ready",
    className:
      "bg-[linear-gradient(135deg,_rgba(101,214,255,0.98),_rgba(17,106,248,0.85))] text-[var(--night-950)]",
  },
];

const signalCards = [
  {
    title: "GPS + Leaflet",
    description: "Chạm bản đồ, kéo marker hoặc dùng GPS để xác nhận vị trí chính xác.",
    icon: MapPinned,
  },
  {
    title: "Timeline rõ ràng",
    description: "Từng mốc từ gửi yêu cầu đến hoàn tất đều được lưu thành trạng thái có thể theo dõi.",
    icon: Clock3,
  },
  {
    title: "Vận hành an toàn",
    description: "MVP đã có admin, fixer, seed data, hóa đơn và luồng phản hồi để kiểm thử thực tế.",
    icon: ShieldCheck,
  },
] as const;

type HomeHeroProps = {
  primaryHref: string;
  primaryLabel: string;
};

export function HomeHero({ primaryHref, primaryLabel }: HomeHeroProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)] xl:items-stretch">
      <Card className="blue-tech-gradient metric-glow relative overflow-hidden border-white/10 p-6 text-white sm:p-8 xl:min-h-[760px]">
        <div className="absolute -right-16 top-12 h-48 w-48 rounded-full bg-[rgba(101,214,255,0.16)] blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-[linear-gradient(180deg,_transparent,_rgba(1,10,44,0.28))]" />
        <div className="relative z-10 flex h-full flex-col">
          <div className="w-fit rounded-[32px] bg-white p-4 shadow-[0_24px_60px_-30px_rgba(8,11,13,0.48)]">
            <Image
              src="/brand/resq-mark.png"
              alt="Biểu tượng ResQ"
              width={160}
              height={164}
              className="h-auto w-[136px] object-contain sm:w-[160px]"
              priority
            />
          </div>

          <div className="mt-8 space-y-5">
            <Badge className="bg-white/12 text-white">Vietnamese-first rescue UX</Badge>
            <div className="space-y-4">
              <h1 className="font-display text-[2.85rem] font-semibold leading-[0.95] tracking-[-0.08em] sm:text-[4rem]">
                Cứu hộ có tổ chức cho những khoảnh khắc cần bình tĩnh nhất.
              </h1>
              <p className="max-w-md text-sm leading-7 text-white/[0.82] sm:text-base">
                ResQ gom gọi cứu hộ, tiếp nhiên liệu, lưu phương tiện, định vị hiện trường
                và theo dõi fixer vào một giao diện ưu tiên tiếng Việt, rõ ràng ngay trên
                điện thoại.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:max-w-sm">
            <Link href={primaryHref}>
              <Button
                size="lg"
                className="w-full bg-white text-[var(--brand-700)] hover:bg-[rgba(255,255,255,0.92)]"
              >
                {primaryLabel}
              </Button>
            </Link>
            <Link href="/request-help">
              <Button
                size="lg"
                className="w-full border border-white/14 bg-[rgba(8,11,13,0.18)] text-white hover:bg-[rgba(8,11,13,0.32)]"
                variant="ghost"
              >
                Xem luồng yêu cầu
              </Button>
            </Link>
          </div>

          <div className="mt-auto flex flex-wrap gap-3 pt-10">
            <div className="rounded-full bg-white px-4 py-3 font-mono text-[11px] font-semibold tracking-[0.14em] text-[var(--night-950)]">
              60 / 30 / 10
            </div>
            <div className="rounded-full border border-white/12 bg-[rgba(8,11,13,0.28)] px-4 py-3 font-mono text-[11px] font-semibold tracking-[0.14em] text-white">
              Vietnamese-first
            </div>
            <div className="rounded-full border border-white/12 bg-[rgba(8,11,13,0.28)] px-4 py-3 font-mono text-[11px] font-semibold tracking-[0.14em] text-white">
              Mobile conversion
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5">
        <Card className="topographic-lines-light relative overflow-hidden border-white/80 bg-[rgba(244,245,247,0.98)] p-6 sm:p-8">
          <p className="section-kicker">Tín hiệu vận hành / MVP</p>
          <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_1fr_0.82fr]">
            {heroMetrics.map((metric) => (
              <div key={metric.title} className="space-y-2">
                <div className="flex items-end gap-2">
                  <span className="font-display text-[3.3rem] font-semibold leading-none tracking-[-0.08em] text-[var(--brand-600)] sm:text-[4.6rem]">
                    {metric.value}
                  </span>
                  {metric.suffix ? (
                    <span className="pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-700)]">
                      {metric.suffix}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-[var(--ink-700)]">{metric.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-[1px] overflow-hidden rounded-[28px] bg-[rgba(8,11,13,0.06)] md:grid-cols-[1.2fr_1fr_0.82fr]">
            {heroMetrics.map((metric) => (
              <div key={`${metric.title}-panel`} className={`${metric.className} px-5 py-6`}>
                <p className="font-display text-2xl font-semibold tracking-[-0.05em]">
                  {metric.title}
                </p>
                <p className="mt-2 max-w-[18ch] text-sm leading-6 opacity-[0.84]">
                  {metric.title === "Phản hồi nhanh"
                    ? "Tối ưu cho thao tác một tay, tạo yêu cầu trong vài bước."
                    : metric.title === "Điều phối liên tục"
                      ? "Từ gửi yêu cầu đến ghép fixer, timeline luôn có trạng thái rõ ràng."
                      : "Seed data, tài khoản demo và API đã sẵn sàng để bạn kiểm thử toàn bộ."}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="city-night-gradient topographic-lines-dark relative overflow-hidden border-[rgba(101,214,255,0.16)] p-6 text-white sm:p-8">
          <p className="section-kicker section-kicker-cyan">Định hướng / ResQ</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div className="space-y-4">
              <h2 className="font-display text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.08em] sm:text-[3.4rem]">
                Điều phối bình tĩnh, bản đồ rõ ràng, và trải nghiệm cứu hộ tối ưu chuyển đổi.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/[0.78] sm:text-base">
                ResQ kết hợp đăng nhập OTP, lưu xe và địa chỉ, gọi cứu hộ theo bước,
                định vị GPS, theo dõi fixer, hóa đơn, thanh toán mô phỏng và phản hồi sau
                dịch vụ trong một giao diện thống nhất.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="rounded-full bg-white px-4 py-3 font-mono text-[11px] font-semibold tracking-[0.14em] text-[var(--night-950)]">
                  Premium but legible
                </span>
                <span className="rounded-full bg-[var(--accent-400)] px-4 py-3 font-mono text-[11px] font-semibold tracking-[0.14em] text-[var(--night-950)]">
                  Topographic atmosphere
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {signalCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-white/8 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[var(--accent-400)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-white/[0.68]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-[24px] border border-white/8 bg-white/6 px-5 py-4">
            <div>
              <p className="font-medium text-white">Sẵn sàng thử ngay với dữ liệu mẫu</p>
              <p className="mt-1 text-sm text-white/[0.64]">
                Admin, fixer và khách hàng đã được seed để bạn đi qua toàn bộ luồng MVP.
              </p>
            </div>
            <ArrowRight className="hidden h-5 w-5 text-[var(--accent-400)] sm:block" />
          </div>
        </Card>
      </div>
    </section>
  );
}

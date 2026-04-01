import { Fuel, Wrench } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { SERVICE_CATALOG } from "@/lib/constants";
import { formatCurrencyVnd } from "@/lib/format";

export default function ServicesPage() {
  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Services"
        title="Danh mục dịch vụ cứu hộ của ResQ"
        description="MVP hiện hỗ trợ các trường hợp phổ biến nhất cho xe máy, ô tô, xe tải và xe van."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SERVICE_CATALOG.map((service) => (
          <Card key={service.key} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--sand-50)] p-3 text-[var(--brand-700)]">
                {service.isFuelService ? (
                  <Fuel className="h-5 w-5" />
                ) : (
                  <Wrench className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--ink-950)]">
                  {service.nameVi}
                </h2>
                <p className="text-sm text-[var(--ink-500)]">{service.nameEn}</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-[var(--ink-600)]">
              {service.descriptionVi}
            </p>
            <p className="font-semibold text-[var(--brand-700)]">
              Giá cơ bản từ {formatCurrencyVnd(service.basePriceVnd)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

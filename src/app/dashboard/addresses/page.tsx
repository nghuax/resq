import { MapPin } from "lucide-react";

import { AddressForm } from "@/components/addresses/address-form";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/server/services/page-auth";
import { listAddressesForUser } from "@/server/services/address-service";

export default async function AddressesPage() {
  const user = await requirePageRole(["customer"]);
  const addresses = await listAddressesForUser(user.id);

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Addresses"
        title="Địa chỉ đã lưu"
        description="Lưu nhà riêng, văn phòng hoặc địa điểm quen thuộc để rút ngắn thời gian gọi cứu hộ."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          {addresses.length ? (
            addresses.map((address) => (
              <Card key={address.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[var(--ink-950)]">
                      {address.label}
                    </p>
                    <p className="text-sm text-[var(--ink-500)]">
                      {address.addressLine}
                    </p>
                  </div>
                  {address.isDefault ? <Badge tone="emerald">Mặc định</Badge> : null}
                </div>
                <p className="text-sm text-[var(--ink-600)]">
                  {address.ward}, {address.district}, {address.cityProvince}
                </p>
                {address.landmark ? (
                  <p className="text-sm text-[var(--ink-500)]">
                    Mốc gần đó: {address.landmark}
                  </p>
                ) : null}
                <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-600)]">
                  {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              title="Chưa có địa chỉ nào"
              description="Bạn có thể lưu địa chỉ thường dùng để gọi cứu hộ nhanh hơn."
            />
          )}
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(239,246,245,0.94))]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[var(--ink-900)]">Lưu địa chỉ mới</p>
                <p className="text-sm text-[var(--ink-500)]">
                  Có thể lưu thủ công hoặc lưu ngay từ bước chọn vị trí trong luồng yêu cầu.
                </p>
              </div>
            </div>
          </Card>
          <AddressForm />
        </div>
      </div>
    </div>
  );
}

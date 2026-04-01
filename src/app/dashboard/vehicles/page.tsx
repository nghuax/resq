import { Car, Fuel } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatFuelType, formatVehicleType } from "@/lib/format";
import { requirePageRole } from "@/server/services/page-auth";
import { listVehiclesForUser } from "@/server/services/vehicle-service";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export default async function VehiclesPage() {
  const user = await requirePageRole(["customer"]);
  const vehicles = await listVehiclesForUser(user.id);

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Vehicles"
        title="Quản lý phương tiện"
        description="Lưu biển số, loại nhiên liệu và thông tin đăng ký ô tô để gọi cứu hộ nhanh hơn."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          {vehicles.length ? (
            vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[var(--ink-950)]">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-[var(--ink-500)]">
                      {vehicle.licensePlate}
                    </p>
                  </div>
                  {vehicle.isDefault ? <Badge tone="emerald">Mặc định</Badge> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{formatVehicleType(vehicle.vehicleType)}</Badge>
                  <Badge tone="sky">{formatFuelType(vehicle.fuelType)}</Badge>
                </div>
                {vehicle.notes ? (
                  <p className="text-sm text-[var(--ink-600)]">{vehicle.notes}</p>
                ) : null}
                {vehicle.carRegistration ? (
                  <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-600)]">
                    <p className="font-medium text-[var(--ink-900)]">
                      Đăng ký ô tô
                    </p>
                    <p>Số đăng ký: {vehicle.carRegistration.registrationNumber || "Chưa có"}</p>
                    <p>Chủ sở hữu: {vehicle.carRegistration.ownerName || "Chưa có"}</p>
                  </div>
                ) : null}
              </Card>
            ))
          ) : (
            <EmptyState
              title="Chưa có phương tiện nào"
              description="Thêm phương tiện đầu tiên để dùng trong luồng yêu cầu cứu hộ."
            />
          )}
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(239,246,245,0.94))]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[var(--ink-900)]">Thêm phương tiện mới</p>
                <p className="text-sm text-[var(--ink-500)]">
                  Hỗ trợ xe máy, ô tô, xe tải và xe van.
                </p>
              </div>
            </div>
          </Card>
          <VehicleForm />
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                <Fuel className="h-5 w-5" />
              </div>
              <p className="font-medium text-[var(--ink-900)]">Mẹo cho MVP</p>
            </div>
            <p className="text-sm leading-7 text-[var(--ink-600)]">
              Nếu xe là ô tô, bạn có thể nhập thêm thông tin đăng ký để hỗ trợ xác minh nhanh
              khi cần kéo xe hoặc kiểm tra hồ sơ cơ bản.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

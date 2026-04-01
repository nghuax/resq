import Link from "next/link";
import { notFound } from "next/navigation";

import { CancelRequestButton } from "@/components/requests/cancel-request-button";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Card } from "@/components/ui/card";
import { formatCurrencyVnd, formatDateTimeVi, formatFuelType } from "@/lib/format";
import { getFixerJobDetail } from "@/server/services/fixer-service";
import { requirePageUser } from "@/server/services/page-auth";
import {
  canCustomerCancel,
  findRequestById,
  getLatestEtaMinutes,
} from "@/server/services/request-shared";
import { getRequestForUser } from "@/server/services/request-service";

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser();
  const { id } = await params;

  let request;

  try {
    if (user.role === "customer") {
      request = await getRequestForUser(user.id, id);
    } else if (user.role === "fixer") {
      request = await getFixerJobDetail(user.id, id);
    } else {
      request = await findRequestById(id);
    }
  } catch {
    notFound();
  }

  const etaMinutes = getLatestEtaMinutes(request);

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Tracking"
        title={`Theo dõi ${request.requestCode}`}
        description="Xem trạng thái mới nhất, ETA, fixer được gán và timeline xử lý tại hiện trường."
        actions={
          user.role === "customer" && canCustomerCancel(request.status) ? (
            <CancelRequestButton requestId={request.id} />
          ) : undefined
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--ink-500)]">Trạng thái hiện tại</p>
                <p className="text-2xl font-semibold text-[var(--ink-950)]">
                  {request.serviceType.nameVi}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
                <p className="font-medium text-[var(--ink-900)]">ETA</p>
                <p>{etaMinutes ? `${etaMinutes} phút` : "Đang cập nhật"}</p>
              </div>
              <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
                <p className="font-medium text-[var(--ink-900)]">Ước tính giá</p>
                <p>
                  {formatCurrencyVnd(request.invoice?.totalVnd ?? request.priceEstimateVnd)}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
                <p className="font-medium text-[var(--ink-900)]">Fixer</p>
                <p>
                  {request.assignedFixer?.fixerProfile?.displayName ||
                    request.assignedFixer?.name ||
                    "Chưa được gán"}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
                <p className="font-medium text-[var(--ink-900)]">Liên hệ</p>
                <p>{request.contactPhone}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--ink-950)]">
              Timeline trạng thái
            </h2>
            <div className="space-y-3">
              {request.statusLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-black/6 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[var(--ink-900)]">{log.titleVi}</p>
                    <p className="text-xs text-[var(--ink-500)]">
                      {formatDateTimeVi(log.createdAt)}
                    </p>
                  </div>
                  {log.descriptionVi ? (
                    <p className="mt-2 text-sm text-[var(--ink-500)]">
                      {log.descriptionVi}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--ink-950)]">Thông tin xe</h2>
            <p className="text-sm text-[var(--ink-600)]">
              {request.vehicle.brand} {request.vehicle.model} · {request.vehicle.licensePlate}
            </p>
            <p className="text-sm text-[var(--ink-500)]">
              {request.vehicle.vehicleType} · {formatFuelType(request.vehicle.fuelType)}
            </p>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--ink-950)]">Vị trí yêu cầu</h2>
            <p className="text-sm text-[var(--ink-600)]">{request.locationLabel}</p>
            <p className="text-sm text-[var(--ink-500)]">
              {request.addressLine}, {request.district}, {request.cityProvince}
            </p>
            <p className="text-sm text-[var(--ink-500)]">
              {request.latitude.toFixed(5)}, {request.longitude.toFixed(5)}
            </p>
          </Card>

          {request.fuelDetails ? (
            <Card className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--ink-950)]">Chi tiết nhiên liệu</h2>
              <p className="text-sm text-[var(--ink-600)]">
                {request.fuelDetails.litersRequested} lít ·{" "}
                {formatFuelType(request.fuelDetails.fuelType)}
              </p>
              {request.fuelDetails.preferredGrade ? (
                <p className="text-sm text-[var(--ink-500)]">
                  Mức ưu tiên: {request.fuelDetails.preferredGrade}
                </p>
              ) : null}
            </Card>
          ) : null}

          {user.role === "customer" ? (
            <Card className="space-y-3">
              <Link
                href={`/requests/${request.id}/payment`}
                className="text-sm font-medium text-[var(--brand-700)]"
              >
                Mở trang thanh toán
              </Link>
              <Link
                href={`/requests/${request.id}/invoice`}
                className="text-sm font-medium text-[var(--brand-700)]"
              >
                Xem hóa đơn
              </Link>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

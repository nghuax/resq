import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Card } from "@/components/ui/card";
import { formatCurrencyVnd, formatDateTimeVi } from "@/lib/format";
import { requirePageRole } from "@/server/services/page-auth";
import { listRequestsForUser } from "@/server/services/request-service";

export default async function HistoryPage() {
  const user = await requirePageRole(["customer"]);
  const requests = await listRequestsForUser(user.id);

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="History"
        title="Lịch sử yêu cầu"
        description="Theo dõi những lần cứu hộ trước đó, mở hóa đơn hoặc gửi đánh giá sau khi hoàn tất."
      />

      {requests.length ? (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[var(--ink-950)]">
                    {request.requestCode}
                  </p>
                  <p className="text-sm text-[var(--ink-500)]">
                    {request.serviceType.nameVi} · {formatDateTimeVi(request.createdAt)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-600)]">
                  <p className="font-medium text-[var(--ink-900)]">Phương tiện</p>
                  <p>
                    {request.vehicle.brand} {request.vehicle.model} · {request.vehicle.licensePlate}
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-600)]">
                  <p className="font-medium text-[var(--ink-900)]">Vị trí</p>
                  <p>
                    {request.locationLabel} · {request.district}, {request.cityProvince}
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-600)]">
                  <p className="font-medium text-[var(--ink-900)]">Tổng tiền</p>
                  <p>
                    {formatCurrencyVnd(
                      request.invoice?.totalVnd ?? request.finalPriceVnd ?? request.priceEstimateVnd,
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/requests/${request.id}/tracking`} className="text-sm font-medium text-[var(--brand-700)]">
                  Xem tracking
                </Link>
                <Link href={`/requests/${request.id}/payment`} className="text-sm font-medium text-[var(--brand-700)]">
                  Thanh toán
                </Link>
                <Link href={`/requests/${request.id}/invoice`} className="text-sm font-medium text-[var(--brand-700)]">
                  Hóa đơn
                </Link>
                {request.status === "completed" ? (
                  <Link
                    href={`/requests/${request.id}/feedback`}
                    className="text-sm font-medium text-[var(--brand-700)]"
                  >
                    Đánh giá
                  </Link>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Bạn chưa có lịch sử yêu cầu"
          description="Hãy tạo yêu cầu đầu tiên để bắt đầu theo dõi toàn bộ hành trình cứu hộ."
          actionHref="/request-help"
          actionLabel="Tạo yêu cầu"
        />
      )}
    </div>
  );
}

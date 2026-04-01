import Link from "next/link";
import { LifeBuoy, MapPinned, ReceiptText, Wrench } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Card } from "@/components/ui/card";
import { DASHBOARD_ACTIONS } from "@/lib/constants";
import { formatDateTimeVi } from "@/lib/format";
import { getCustomerDashboardData } from "@/server/services/dashboard-service";
import { requirePageRole } from "@/server/services/page-auth";

const icons = [Wrench, MapPinned, ReceiptText, LifeBuoy, Wrench];

export default async function DashboardPage() {
  const user = await requirePageRole(["customer"]);
  const data = await getCustomerDashboardData(user.id);

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Customer Dashboard"
        title={`Xin chào ${user.name}`}
        description="Từ đây bạn có thể gọi cứu hộ mới, xem trạng thái hiện tại, quản lý xe và địa chỉ đã lưu."
      />

      {data.activeRequest ? (
        <Card className="space-y-3 bg-[linear-gradient(135deg,_rgba(15,118,110,0.12),_rgba(255,255,255,0.95))]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--ink-500)]">Yêu cầu đang hoạt động</p>
              <p className="text-2xl font-semibold text-[var(--ink-950)]">
                {data.activeRequest.requestCode}
              </p>
              <p className="text-sm text-[var(--ink-500)]">
                Cập nhật gần nhất {formatDateTimeVi(data.activeRequest.updatedAt)}
              </p>
            </div>
            <StatusBadge status={data.activeRequest.status} />
          </div>
          <Link
            href={`/requests/${data.activeRequest.id}/tracking`}
            className="inline-flex rounded-full bg-[var(--brand-600)] px-5 py-3 text-sm font-medium text-white"
          >
            Xem theo dõi trực tiếp
          </Link>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {DASHBOARD_ACTIONS.map((action, index) => {
          const Icon = icons[index] ?? Wrench;

          return (
            <Link key={action.href} href={action.href}>
              <Card className="h-full space-y-4 transition hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sand-50)] text-[var(--brand-700)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-[var(--ink-950)]">
                    {action.title}
                  </h2>
                  <p className="text-sm leading-7 text-[var(--ink-600)]">
                    {action.description}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {data.requests.length ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--ink-950)]">
            Các yêu cầu gần đây
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.requests.map((request) => (
              <Link key={request.id} href={`/requests/${request.id}/tracking`}>
                <Card className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--ink-900)]">
                        {request.requestCode}
                      </p>
                      <p className="text-sm text-[var(--ink-500)]">
                        {request.serviceType.nameVi}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-sm text-[var(--ink-500)]">
                    {request.locationLabel} · {request.district}, {request.cityProvince}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="Chưa có yêu cầu nào"
          description="Bạn có thể bắt đầu bằng cách tạo một yêu cầu cứu hộ mới."
          actionHref="/request-help"
          actionLabel="Tạo yêu cầu đầu tiên"
        />
      )}
    </div>
  );
}

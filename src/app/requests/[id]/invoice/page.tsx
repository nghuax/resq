import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Card } from "@/components/ui/card";
import { formatCurrencyVnd, formatDateTimeVi } from "@/lib/format";
import { requirePageRole } from "@/server/services/page-auth";
import { getInvoiceForUser } from "@/server/services/request-service";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageRole(["customer"]);
  const { id } = await params;
  const request = await getInvoiceForUser(user.id, id).catch(() => notFound());

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Invoice"
        title={`Hóa đơn ${request.requestCode}`}
        description="Bản tóm tắt phí dịch vụ, nhiên liệu và trạng thái thanh toán cho yêu cầu này."
      />

      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--ink-500)]">Trạng thái yêu cầu</p>
            <p className="text-2xl font-semibold text-[var(--ink-950)]">
              {request.serviceType.nameVi}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
            <p className="font-medium text-[var(--ink-900)]">Ngày phát hành</p>
            <p>{formatDateTimeVi(request.invoice?.issuedAt)}</p>
          </div>
          <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
            <p className="font-medium text-[var(--ink-900)]">Thanh toán</p>
            <p>{request.invoice?.paymentStatus ?? "pending"}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-[var(--ink-600)]">
          <div className="flex items-center justify-between rounded-2xl bg-[var(--sand-50)] px-4 py-3">
            <span>Phí dịch vụ</span>
            <span>{formatCurrencyVnd(request.invoice?.serviceFeeVnd ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-[var(--sand-50)] px-4 py-3">
            <span>Chi phí nhiên liệu</span>
            <span>{formatCurrencyVnd(request.invoice?.fuelCostVnd ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-[var(--sand-50)] px-4 py-3">
            <span>Phụ phí</span>
            <span>{formatCurrencyVnd(request.invoice?.extraChargesVnd ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-teal-50 px-4 py-3 font-semibold text-[var(--brand-700)]">
            <span>Tổng cộng</span>
            <span>{formatCurrencyVnd(request.invoice?.totalVnd ?? 0)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

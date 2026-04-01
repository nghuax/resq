import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import { PaymentForm } from "@/components/payments/payment-form";
import { Card } from "@/components/ui/card";
import { formatCurrencyVnd } from "@/lib/format";
import { requirePageRole } from "@/server/services/page-auth";
import { getPaymentSummaryForUser } from "@/server/services/request-service";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageRole(["customer"]);
  const { id } = await params;
  const data = await getPaymentSummaryForUser(user.id, id).catch(() => notFound());

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Payment"
        title={`Thanh toán ${data.request.requestCode}`}
        description="MVP dùng mock payment processing nhưng vẫn lưu payment summary và trạng thái hóa đơn."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--ink-950)]">
            Tóm tắt hóa đơn
          </h2>
          <div className="space-y-3 text-sm text-[var(--ink-600)]">
            <div className="flex items-center justify-between rounded-2xl bg-[var(--sand-50)] px-4 py-3">
              <span>Phí dịch vụ</span>
              <span>{formatCurrencyVnd(data.invoice.serviceFeeVnd)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[var(--sand-50)] px-4 py-3">
              <span>Chi phí nhiên liệu</span>
              <span>{formatCurrencyVnd(data.invoice.fuelCostVnd)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[var(--sand-50)] px-4 py-3">
              <span>Phụ phí</span>
              <span>{formatCurrencyVnd(data.invoice.extraChargesVnd)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-teal-50 px-4 py-3 font-semibold text-[var(--brand-700)]">
              <span>Tổng cộng</span>
              <span>{formatCurrencyVnd(data.invoice.totalVnd)}</span>
            </div>
          </div>
        </Card>

        <PaymentForm
          requestId={data.request.id}
          totalLabel={formatCurrencyVnd(data.invoice.totalVnd)}
        />
      </div>
    </div>
  );
}

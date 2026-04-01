import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { FixerJobActions } from "@/components/fixer/fixer-job-actions";
import { Card } from "@/components/ui/card";
import { formatCurrencyVnd, formatDateTimeVi } from "@/lib/format";
import { requirePageRole } from "@/server/services/page-auth";
import { getFixerJobDetail } from "@/server/services/fixer-service";

export default async function FixerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageRole(["fixer"]);
  const { id } = await params;

  let job;

  try {
    job = await getFixerJobDetail(user.id, id);
  } catch {
    notFound();
  }

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Fixer Job Detail"
        title={job.requestCode}
        description="Trang chi tiết dành cho fixer để xem đầy đủ timeline và cập nhật trạng thái nhanh."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--ink-500)]">Khách hàng</p>
              <p className="text-2xl font-semibold text-[var(--ink-950)]">
                {job.user.name}
              </p>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
              <p className="font-medium text-[var(--ink-900)]">Phương tiện</p>
              <p>
                {job.vehicle.brand} {job.vehicle.model} · {job.vehicle.licensePlate}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
              <p className="font-medium text-[var(--ink-900)]">Dịch vụ</p>
              <p>{job.serviceType.nameVi}</p>
            </div>
            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
              <p className="font-medium text-[var(--ink-900)]">Vị trí</p>
              <p>
                {job.addressLine}, {job.district}, {job.cityProvince}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4 text-sm text-[var(--ink-600)]">
              <p className="font-medium text-[var(--ink-900)]">Ước tính giá</p>
              <p>{formatCurrencyVnd(job.invoice?.totalVnd ?? job.priceEstimateVnd)}</p>
            </div>
          </div>
          <FixerJobActions requestId={job.id} />
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--ink-950)]">
            Timeline
          </h2>
          <div className="space-y-3">
            {job.statusLogs.map((log) => (
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
    </div>
  );
}

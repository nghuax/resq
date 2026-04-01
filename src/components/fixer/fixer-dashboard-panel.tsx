"use client";

import type {
  CarRegistrationDetails,
  FixerProfile,
  Invoice,
  Request,
  RequestFuelDetails,
  RequestStatusLog,
  ServiceType,
  User,
  Vehicle,
} from "@prisma/client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/common/status-badge";
import { FixerJobActions } from "@/components/fixer/fixer-job-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrencyVnd, formatDateTimeVi } from "@/lib/format";

type FixerJob = Request & {
  user: User;
  vehicle: Vehicle & { carRegistration: CarRegistrationDetails | null };
  serviceType: ServiceType;
  invoice: Invoice | null;
  fuelDetails: RequestFuelDetails | null;
  statusLogs: RequestStatusLog[];
};

export function FixerDashboardPanel({
  jobs,
  profile,
}: {
  jobs: FixerJob[];
  profile: FixerProfile | null;
}) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?.id ?? null);

  const selectedJob =
    jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null;

  const stats = useMemo(
    () => ({
      active: jobs.filter((job) => !["completed", "cancelled"].includes(job.status)).length,
      completed: jobs.filter((job) => job.status === "completed").length,
    }),
    [jobs],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        <Card className="space-y-4 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,245,0.98))]">
          <div>
            <h3 className="text-2xl font-semibold text-[var(--ink-950)]">
              {profile?.displayName || "Fixer dashboard"}
            </h3>
            <p className="text-sm text-[var(--ink-500)]">
              {profile?.cityProvince} · {profile?.districts.join(", ")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4">
              <p className="text-sm text-[var(--ink-500)]">Việc đang hoạt động</p>
              <p className="mt-2 font-display text-3xl font-semibold text-[var(--brand-700)]">
                {stats.active}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-4">
              <p className="text-sm text-[var(--ink-500)]">Hoàn thành</p>
              <p className="mt-2 font-display text-3xl font-semibold text-[var(--brand-700)]">
                {stats.completed}
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="font-medium text-[var(--ink-900)]">Công việc được giao</p>
          <div className="space-y-3">
            {jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                  selectedJob?.id === job.id
                    ? "border-[var(--brand-400)] bg-teal-50"
                    : "border-black/6 bg-white hover:border-[var(--brand-300)]"
                }`}
                onClick={() => setSelectedJobId(job.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--ink-900)]">{job.requestCode}</p>
                    <p className="text-sm text-[var(--ink-500)]">
                      {job.serviceType.nameVi} · {job.user.name}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {selectedJob ? (
        <Card className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-[var(--ink-950)]">
                {selectedJob.requestCode}
              </h3>
              <p className="text-sm text-[var(--ink-500)]">
                {selectedJob.locationLabel} · {selectedJob.district}, {selectedJob.cityProvince}
              </p>
            </div>
            <StatusBadge status={selectedJob.status} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[var(--sand-50)] p-4">
              <p className="text-sm font-medium text-[var(--ink-500)]">Khách hàng</p>
              <p className="mt-2 font-semibold text-[var(--ink-900)]">
                {selectedJob.user.name}
              </p>
              <p className="text-sm text-[var(--ink-500)]">{selectedJob.user.phone}</p>
            </div>
            <div className="rounded-2xl bg-[var(--sand-50)] p-4">
              <p className="text-sm font-medium text-[var(--ink-500)]">Phương tiện</p>
              <p className="mt-2 font-semibold text-[var(--ink-900)]">
                {selectedJob.vehicle.brand} {selectedJob.vehicle.model}
              </p>
              <p className="text-sm text-[var(--ink-500)]">
                {selectedJob.vehicle.licensePlate}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--sand-50)] p-4">
              <p className="text-sm font-medium text-[var(--ink-500)]">Dịch vụ</p>
              <p className="mt-2 font-semibold text-[var(--ink-900)]">
                {selectedJob.serviceType.nameVi}
              </p>
              <p className="text-sm text-[var(--ink-500)]">
                {selectedJob.note || "Không có mô tả thêm."}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--sand-50)] p-4">
              <p className="text-sm font-medium text-[var(--ink-500)]">Chi phí dự kiến</p>
              <p className="mt-2 font-semibold text-[var(--brand-700)]">
                {formatCurrencyVnd(
                  selectedJob.invoice?.totalVnd ?? selectedJob.priceEstimateVnd,
                )}
              </p>
            </div>
          </div>

          <FixerJobActions requestId={selectedJob.id} />

          <div className="space-y-3">
            <p className="font-medium text-[var(--ink-900)]">Timeline công việc</p>
            <div className="space-y-3">
              {selectedJob.statusLogs.map((log) => (
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
          </div>

          <Link href={`/fixer/jobs/${selectedJob.id}`}>
            <Button variant="secondary" className="w-full">
              Mở trang chi tiết công việc
            </Button>
          </Link>
        </Card>
      ) : null}
    </div>
  );
}

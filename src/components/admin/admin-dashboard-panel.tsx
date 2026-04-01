"use client";

import type {
  CarRegistrationDetails,
  FixerProfile,
  Invoice,
  PricingRule,
  Request,
  RequestFuelDetails,
  RequestStatusLog,
  ServiceAreaRule,
  ServiceType,
  User,
  Vehicle,
} from "@prisma/client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-client";
import { formatCurrencyVnd, formatDateTimeVi } from "@/lib/format";

type AdminRequest = Request & {
  user: User;
  vehicle: Vehicle & { carRegistration: CarRegistrationDetails | null };
  serviceType: ServiceType;
  invoice: Invoice | null;
  fuelDetails: RequestFuelDetails | null;
  statusLogs: RequestStatusLog[];
  assignedFixer: (User & { fixerProfile: FixerProfile | null }) | null;
};

type FixerCandidate = User & { fixerProfile: FixerProfile | null };
type PricingRuleWithService = PricingRule & { serviceType: ServiceType };

const requestStatuses = [
  "",
  "submitted",
  "processing",
  "fixer_matched",
  "fixer_on_the_way",
  "arrived",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export function AdminDashboardPanel({
  requests,
  fixers,
  pricingRules,
  serviceAreaRules,
}: {
  requests: AdminRequest[];
  fixers: FixerCandidate[];
  pricingRules: PricingRuleWithService[];
  serviceAreaRules: ServiceAreaRule[];
}) {
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    requests[0]?.id ?? null,
  );
  const [filter, setFilter] = useState<string>("");
  const [assignFixerId, setAssignFixerId] = useState<string>(fixers[0]?.id ?? "");
  const [nextStatus, setNextStatus] = useState<string>("processing");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredRequests = useMemo(
    () => (filter ? requests.filter((request) => request.status === filter) : requests),
    [filter, requests],
  );

  const selectedRequest =
    filteredRequests.find((request) => request.id === selectedRequestId) ??
    requests.find((request) => request.id === selectedRequestId) ??
    filteredRequests[0] ??
    null;

  function assignFixer() {
    if (!selectedRequest || !assignFixerId) {
      return;
    }

    startTransition(async () => {
      try {
        setErrorMessage(null);
        setMessage(null);
        await apiFetch(`/api/admin/requests/${selectedRequest.id}/assign-fixer`, {
          method: "PATCH",
          body: JSON.stringify({ fixerUserId: assignFixerId }),
        });
        setMessage("Đã gán fixer cho yêu cầu.");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể gán fixer.",
        );
      }
    });
  }

  function updateStatus() {
    if (!selectedRequest || !nextStatus) {
      return;
    }

    const note = window.prompt("Ghi chú cập nhật trạng thái (không bắt buộc):") ?? "";

    startTransition(async () => {
      try {
        setErrorMessage(null);
        setMessage(null);
        await apiFetch(`/api/admin/requests/${selectedRequest.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus, note }),
        });
        setMessage("Đã cập nhật trạng thái yêu cầu.");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể cập nhật trạng thái.",
        );
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-[var(--ink-950)]">
                Danh sách yêu cầu
              </h3>
              <p className="text-sm text-[var(--ink-500)]">
                Lọc nhanh theo trạng thái để điều phối hiệu quả hơn.
              </p>
            </div>
            <div className="w-full max-w-[220px]">
              <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="">Tất cả trạng thái</option>
                {requestStatuses
                  .filter(Boolean)
                  .map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <button
                key={request.id}
                type="button"
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                  selectedRequest?.id === request.id
                    ? "border-[var(--brand-400)] bg-teal-50"
                    : "border-black/6 bg-white hover:border-[var(--brand-300)]"
                }`}
                onClick={() => setSelectedRequestId(request.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--ink-900)]">
                      {request.requestCode}
                    </p>
                    <p className="text-sm text-[var(--ink-500)]">
                      {request.user.name} · {request.serviceType.nameVi}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <p className="mt-2 text-sm text-[var(--ink-500)]">
                  {request.locationLabel} · {request.district}, {request.cityProvince}
                </p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {selectedRequest ? (
          <Card className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--ink-950)]">
                  {selectedRequest.requestCode}
                </h3>
                <p className="text-sm text-[var(--ink-500)]">
                  Tạo lúc {formatDateTimeVi(selectedRequest.createdAt)}
                </p>
              </div>
              <StatusBadge status={selectedRequest.status} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[var(--sand-50)] p-4">
                <p className="text-sm font-medium text-[var(--ink-500)]">Khách hàng</p>
                <p className="mt-2 font-semibold text-[var(--ink-900)]">
                  {selectedRequest.user.name}
                </p>
                <p className="text-sm text-[var(--ink-500)]">{selectedRequest.user.phone}</p>
              </div>
              <div className="rounded-2xl bg-[var(--sand-50)] p-4">
                <p className="text-sm font-medium text-[var(--ink-500)]">Phương tiện</p>
                <p className="mt-2 font-semibold text-[var(--ink-900)]">
                  {selectedRequest.vehicle.brand} {selectedRequest.vehicle.model}
                </p>
                <p className="text-sm text-[var(--ink-500)]">
                  {selectedRequest.vehicle.licensePlate}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--sand-50)] p-4">
                <p className="text-sm font-medium text-[var(--ink-500)]">Dịch vụ</p>
                <p className="mt-2 font-semibold text-[var(--ink-900)]">
                  {selectedRequest.serviceType.nameVi}
                </p>
                <p className="text-sm text-[var(--ink-500)]">
                  {selectedRequest.note || "Không có ghi chú thêm."}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--sand-50)] p-4">
                <p className="text-sm font-medium text-[var(--ink-500)]">Ước tính giá</p>
                <p className="mt-2 font-semibold text-[var(--brand-700)]">
                  {formatCurrencyVnd(
                    selectedRequest.invoice?.totalVnd ?? selectedRequest.priceEstimateVnd,
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-[24px] bg-[var(--sand-50)] p-4">
              <p className="font-medium text-[var(--ink-900)]">Gán fixer</p>
              <div className="flex flex-col gap-3 md:flex-row">
                <Select
                  value={assignFixerId}
                  onChange={(event) => setAssignFixerId(event.target.value)}
                >
                  {fixers.map((fixer) => (
                    <option key={fixer.id} value={fixer.id}>
                      {fixer.fixerProfile?.displayName || fixer.name}
                    </option>
                  ))}
                </Select>
                <Button onClick={assignFixer} disabled={isPending || !assignFixerId}>
                  Gán fixer
                </Button>
              </div>
              {selectedRequest.assignedFixer ? (
                <p className="text-sm text-[var(--ink-500)]">
                  Fixer hiện tại:{" "}
                  {selectedRequest.assignedFixer.fixerProfile?.displayName ||
                    selectedRequest.assignedFixer.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-3 rounded-[24px] bg-[var(--sand-50)] p-4">
              <p className="font-medium text-[var(--ink-900)]">Cập nhật trạng thái</p>
              <div className="flex flex-col gap-3 md:flex-row">
                <Select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
                  {requestStatuses
                    .filter(Boolean)
                    .map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                </Select>
                <Button variant="secondary" onClick={updateStatus} disabled={isPending}>
                  Lưu trạng thái
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-[var(--ink-900)]">Timeline trạng thái</p>
              <div className="space-y-3">
                {selectedRequest.statusLogs.map((log) => (
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

            {message ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}
            {errorMessage ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}
          </Card>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            <p className="font-medium text-[var(--ink-900)]">
              Pricing placeholder
            </p>
            {pricingRules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-600)]"
              >
                <p className="font-medium text-[var(--ink-900)]">
                  {rule.serviceType.nameVi}
                </p>
                <p>
                  Giá cơ bản {formatCurrencyVnd(rule.basePriceVnd)} · phụ phí đêm{" "}
                  {formatCurrencyVnd(rule.nightSurchargeVnd)}
                </p>
              </div>
            ))}
          </Card>

          <Card className="space-y-3">
            <p className="font-medium text-[var(--ink-900)]">
              Service area placeholder
            </p>
            {serviceAreaRules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-600)]"
              >
                <p className="font-medium text-[var(--ink-900)]">
                  {rule.cityProvince}
                  {rule.district ? ` · ${rule.district}` : ""}
                </p>
                <p>Phản hồi mục tiêu: {rule.responseWindowMinutes} phút</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

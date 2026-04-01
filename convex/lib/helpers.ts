// @ts-nocheck
const STATUS_TITLES: Record<string, string> = {
  submitted: "Yêu cầu đã được gửi",
  processing: "Đang xử lý yêu cầu",
  fixer_matched: "Đã ghép kỹ thuật viên",
  fixer_on_the_way: "Kỹ thuật viên đang đến",
  arrived: "Kỹ thuật viên đã đến",
  in_progress: "Đang xử lý tại hiện trường",
  completed: "Yêu cầu đã hoàn thành",
  cancelled: "Yêu cầu đã bị hủy",
};

export function nowTs() {
  return Date.now();
}

export function cleanString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function generateRequestCode(date = new Date()) {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(100 + Math.random() * 900));

  return `RSQ-${y}${m}${d}-${rand}`;
}

export function calculateRequestAmounts(options: {
  serviceFeeVnd: number;
  litersRequested?: number | null;
  fuelPricePerLiterVnd?: number;
  extraChargesVnd?: number;
}) {
  const fuelCostVnd = Math.round(
    (options.litersRequested ?? 0) * (options.fuelPricePerLiterVnd ?? 24000),
  );
  const extraChargesVnd = options.extraChargesVnd ?? 0;
  const totalVnd = options.serviceFeeVnd + fuelCostVnd + extraChargesVnd;

  return {
    serviceFeeVnd: options.serviceFeeVnd,
    fuelCostVnd,
    extraChargesVnd,
    totalVnd,
  };
}

export function normalizeDoc(document: Record<string, unknown> | null | undefined) {
  if (!document) {
    return null;
  }

  const { _id, ...rest } = document;
  delete (rest as { _creationTime?: unknown })._creationTime;
  return {
    id: _id,
    ...rest,
  };
}

export function sortCreatedAsc<T extends { createdAt: number }>(items: T[]) {
  return [...items].sort((left, right) => left.createdAt - right.createdAt);
}

export function sortCreatedDesc<T extends { createdAt: number }>(items: T[]) {
  return [...items].sort((left, right) => right.createdAt - left.createdAt);
}

export function canCustomerCancel(status: string) {
  return ["submitted", "processing", "fixer_matched"].includes(status);
}

export function getLatestEtaMinutes(request: {
  statusLogs?: Array<{ etaMinutes?: number | null }>;
}) {
  const latestWithEta = [...(request.statusLogs ?? [])]
    .reverse()
    .find((log) => typeof log.etaMinutes === "number");

  return latestWithEta?.etaMinutes ?? null;
}

export async function getFirstByIndex(query: {
  collect: () => Promise<Array<Record<string, unknown>>>;
}) {
  const items = await query.collect();
  return items[0] ?? null;
}

export async function getUserByPhone(ctx: any, phone: string) {
  return getFirstByIndex(
    ctx.db.query("users").withIndex("by_phone", (q: any) => q.eq("phone", phone)),
  );
}

export async function getServiceTypeByKey(ctx: any, key: string) {
  return getFirstByIndex(
    ctx.db.query("serviceTypes").withIndex("by_key", (q: any) => q.eq("key", key)),
  );
}

export async function getCarRegistrationByVehicleId(ctx: any, vehicleId: string) {
  return getFirstByIndex(
    ctx.db
      .query("carRegistrationDetails")
      .withIndex("by_vehicleId", (q: any) => q.eq("vehicleId", vehicleId)),
  );
}

export async function getFixerProfileByUserId(ctx: any, userId: string) {
  return getFirstByIndex(
    ctx.db
      .query("fixerProfiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId)),
  );
}

export async function getInvoiceByRequestId(ctx: any, requestId: string) {
  return getFirstByIndex(
    ctx.db.query("invoices").withIndex("by_requestId", (q: any) => q.eq("requestId", requestId)),
  );
}

export async function getReviewByRequestId(ctx: any, requestId: string) {
  return getFirstByIndex(
    ctx.db.query("reviews").withIndex("by_requestId", (q: any) => q.eq("requestId", requestId)),
  );
}

export async function getFuelDetailsByRequestId(ctx: any, requestId: string) {
  return getFirstByIndex(
    ctx.db
      .query("requestFuelDetails")
      .withIndex("by_requestId", (q: any) => q.eq("requestId", requestId)),
  );
}

export async function generateUniqueRequestCode(ctx: any) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateRequestCode();
    const existing = await getFirstByIndex(
      ctx.db
        .query("requests")
        .withIndex("by_requestCode", (q: any) => q.eq("requestCode", candidate)),
    );

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Không thể tạo mã yêu cầu duy nhất.");
}

export async function appendStatusLog(
  ctx: any,
  input: {
    requestId: string;
    status: string;
    actorUserId?: string | null;
    descriptionVi?: string | null;
    etaMinutes?: number | null;
    createdAt?: number;
  },
) {
  return ctx.db.insert("requestStatusLogs", {
    requestId: input.requestId,
    status: input.status,
    titleVi: STATUS_TITLES[input.status] ?? input.status,
    descriptionVi: cleanString(input.descriptionVi),
    actorUserId: input.actorUserId ?? undefined,
    etaMinutes: input.etaMinutes ?? undefined,
    createdAt: input.createdAt ?? nowTs(),
  });
}

export async function hydrateVehicle(ctx: any, vehicleDoc: any) {
  if (!vehicleDoc) {
    return null;
  }

  const carRegistration = await getCarRegistrationByVehicleId(ctx, vehicleDoc._id);

  return {
    ...normalizeDoc(vehicleDoc),
    carRegistration: normalizeDoc(carRegistration),
  };
}

export async function hydrateFixer(ctx: any, userDoc: any) {
  if (!userDoc) {
    return null;
  }

  const fixerProfile = await getFixerProfileByUserId(ctx, userDoc._id);

  return {
    ...normalizeDoc(userDoc),
    fixerProfile: normalizeDoc(fixerProfile),
  };
}

export async function hydrateRequest(ctx: any, requestDoc: any) {
  if (!requestDoc) {
    return null;
  }

  const [
    user,
    vehicle,
    savedAddress,
    serviceType,
    assignedFixerUser,
    fuelDetails,
    photos,
    statusLogs,
    invoice,
    payments,
    review,
  ] = await Promise.all([
    ctx.db.get(requestDoc.userId),
    ctx.db.get(requestDoc.vehicleId),
    requestDoc.savedAddressId ? ctx.db.get(requestDoc.savedAddressId) : null,
    ctx.db.get(requestDoc.serviceTypeId),
    requestDoc.assignedFixerId ? ctx.db.get(requestDoc.assignedFixerId) : null,
    getFuelDetailsByRequestId(ctx, requestDoc._id),
    ctx.db
      .query("requestPhotos")
      .withIndex("by_requestId", (q: any) => q.eq("requestId", requestDoc._id))
      .collect(),
    ctx.db
      .query("requestStatusLogs")
      .withIndex("by_requestId", (q: any) => q.eq("requestId", requestDoc._id))
      .collect(),
    getInvoiceByRequestId(ctx, requestDoc._id),
    ctx.db
      .query("payments")
      .withIndex("by_requestId", (q: any) => q.eq("requestId", requestDoc._id))
      .collect(),
    getReviewByRequestId(ctx, requestDoc._id),
  ]);

  return {
    ...normalizeDoc(requestDoc),
    user: normalizeDoc(user),
    vehicle: await hydrateVehicle(ctx, vehicle),
    savedAddress: normalizeDoc(savedAddress),
    serviceType: normalizeDoc(serviceType),
    assignedFixer: await hydrateFixer(ctx, assignedFixerUser),
    fuelDetails: normalizeDoc(fuelDetails),
    photos: sortCreatedAsc(photos).map((item) => normalizeDoc(item)),
    statusLogs: sortCreatedAsc(statusLogs).map((item) => normalizeDoc(item)),
    invoice: normalizeDoc(invoice),
    payments: sortCreatedDesc(payments).map((item) => normalizeDoc(item)),
    review: normalizeDoc(review),
  };
}

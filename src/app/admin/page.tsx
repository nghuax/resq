import { PageHeader } from "@/components/common/page-header";
import { AdminDashboardPanel } from "@/components/admin/admin-dashboard-panel";
import { requirePageRole } from "@/server/services/page-auth";
import { listAdminRequests, listFixerCandidates } from "@/server/services/admin-service";
import { getDb } from "@/server/db/prisma";

export default async function AdminPage() {
  await requirePageRole(["admin"]);
  const db = await getDb();

  const [requests, fixers, pricingRules, serviceAreaRules] = await Promise.all([
    listAdminRequests(),
    listFixerCandidates(),
    db.pricingRule.findMany({
      include: {
        serviceType: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.serviceAreaRule.findMany({
      orderBy: {
        cityProvince: "asc",
      },
    }),
  ]);

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Điều phối yêu cầu và vùng phục vụ"
        description="Lọc yêu cầu, gán fixer, cập nhật trạng thái và xem snapshot pricing/service area hiện có."
      />
      <AdminDashboardPanel
        requests={requests}
        fixers={fixers}
        pricingRules={pricingRules}
        serviceAreaRules={serviceAreaRules}
      />
    </div>
  );
}

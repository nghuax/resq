import { PageHeader } from "@/components/common/page-header";
import { FixerDashboardPanel } from "@/components/fixer/fixer-dashboard-panel";
import { requirePageRole } from "@/server/services/page-auth";
import { getFixerProfileForUser, listFixerJobs } from "@/server/services/fixer-service";

export default async function FixerPage() {
  const user = await requirePageRole(["fixer"]);

  const [jobs, profile] = await Promise.all([
    listFixerJobs(user.id),
    getFixerProfileForUser(user.id),
  ]);

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Fixer Dashboard"
        title="Công việc được giao"
        description="Cập nhật tiến độ xử lý, mở chi tiết từng job và hoàn thành công việc ngay trong dashboard."
      />
      <FixerDashboardPanel jobs={jobs} profile={profile} />
    </div>
  );
}

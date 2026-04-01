import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import { ReviewForm } from "@/components/reviews/review-form";
import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/server/services/page-auth";
import { getRequestForUser } from "@/server/services/request-service";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageRole(["customer"]);
  const { id } = await params;

  let request;

  try {
    request = await getRequestForUser(user.id, id);
  } catch {
    notFound();
  }

  if (request.status !== "completed") {
    return (
      <div className="container-shell space-y-8 py-10 md:py-14">
        <PageHeader
          eyebrow="Feedback"
          title="Chưa thể đánh giá yêu cầu này"
          description="Bạn chỉ có thể đánh giá một yêu cầu sau khi fixer hoàn tất công việc."
        />
        <Card>
          <Link href={`/requests/${request.id}/tracking`} className="text-sm font-medium text-[var(--brand-700)]">
            Quay lại trang tracking
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Feedback"
        title={`Đánh giá ${request.requestCode}`}
        description="Mỗi yêu cầu hoàn thành có thể được đánh giá một lần để cải thiện chất lượng fixer và vận hành."
      />

      {request.review ? (
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--ink-950)]">
            Bạn đã gửi đánh giá cho yêu cầu này
          </h2>
          <p className="text-sm text-[var(--ink-600)]">
            Điểm tổng thể: {request.review.overallRating}/5
          </p>
          {request.review.comment ? (
            <p className="text-sm leading-7 text-[var(--ink-500)]">
              {request.review.comment}
            </p>
          ) : null}
        </Card>
      ) : (
        <ReviewForm requestId={request.id} />
      )}
    </div>
  );
}

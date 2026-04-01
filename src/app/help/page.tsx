import { FAQ_ITEMS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

export default function HelpPage() {
  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="FAQ"
        title="Trợ giúp và câu hỏi thường gặp"
        description="Nếu bạn đang thử MVP với seed data, đây là nơi tốt nhất để hiểu các luồng sẵn có."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {FAQ_ITEMS.map((item) => (
          <Card key={item.question} className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--ink-950)]">
              {item.question}
            </h2>
            <p className="text-sm leading-7 text-[var(--ink-600)]">{item.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

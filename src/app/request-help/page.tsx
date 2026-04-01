import { PageHeader } from "@/components/common/page-header";
import { RequestHelpWizard } from "@/components/requests/request-help-wizard";
import { listAddressesForUser } from "@/server/services/address-service";
import { requirePageRole } from "@/server/services/page-auth";
import { listServiceTypes } from "@/server/services/service-type-service";
import { listVehiclesForUser } from "@/server/services/vehicle-service";

export default async function RequestHelpPage() {
  const user = await requirePageRole(["customer"]);
  const [vehicles, addresses, services] = await Promise.all([
    listVehiclesForUser(user.id),
    listAddressesForUser(user.id),
    listServiceTypes(),
  ]);

  return (
    <div className="container-shell space-y-8 py-10 md:py-14">
      <PageHeader
        eyebrow="Request Help"
        title="Tạo yêu cầu cứu hộ từng bước"
        description="Luồng này hỗ trợ chọn xe, dịch vụ, vị trí GPS/Leaflet, mô tả sự cố, và gửi yêu cầu ngay trong một form di động."
      />
      <RequestHelpWizard
        initialVehicles={vehicles}
        addresses={addresses}
        services={services}
        contactPhone={user.phone}
      />
    </div>
  );
}

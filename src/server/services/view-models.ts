import type {
  CarRegistrationDetails,
  FixerProfile,
  Invoice,
  Payment,
  Request,
  RequestFuelDetails,
  RequestPhoto,
  RequestStatusLog,
  Review,
  SavedAddress,
  ServiceType,
  User,
  Vehicle,
} from "@prisma/client";

export type VehicleView = Vehicle & {
  carRegistration: CarRegistrationDetails | null;
};

export type CarRegistrationView = CarRegistrationDetails;

export type AddressView = SavedAddress;

export type ServiceTypeView = ServiceType;

export type FixerProfileView = FixerProfile;

export type UserView = User & {
  fixerProfile: FixerProfile | null;
};

export type FuelDetailsView = RequestFuelDetails;

export type RequestPhotoView = RequestPhoto;

export type RequestStatusLogView = RequestStatusLog;

export type InvoiceView = Invoice;

export type PaymentView = Payment;

export type ReviewView = Review;

export type RequestView = Request & {
  user: UserView;
  vehicle: VehicleView;
  savedAddress: SavedAddress | null;
  serviceType: ServiceType;
  assignedFixer: UserView | null;
  fuelDetails: RequestFuelDetails | null;
  photos: RequestPhoto[];
  statusLogs: RequestStatusLog[];
  invoice: Invoice | null;
  payments: Payment[];
  review: Review | null;
};

export type RequestWithInvoiceView = RequestView & {
  invoice: Invoice;
};

export type PaymentSummaryView = {
  request: RequestWithInvoiceView;
  invoice: Invoice;
  latestPayment: Payment | null;
};

export type CustomerDashboardView = {
  vehicleCount: number;
  addressCount: number;
  requests: RequestView[];
  activeRequest: RequestView | null;
};

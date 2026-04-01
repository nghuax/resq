export const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/services", label: "Dịch vụ" },
  { href: "/help", label: "Trợ giúp" },
  { href: "/about", label: "Về chúng tôi" },
] as const;

export const VEHICLE_TYPE_OPTIONS = [
  { value: "motorbike", label: "Xe máy" },
  { value: "car", label: "Ô tô" },
  { value: "truck", label: "Xe tải" },
  { value: "van", label: "Xe van" },
] as const;

export const FUEL_TYPE_OPTIONS = [
  { value: "gasoline", label: "Xăng" },
  { value: "diesel", label: "Dầu diesel" },
  { value: "electric", label: "Điện" },
  { value: "hybrid", label: "Hybrid" },
  { value: "unknown", label: "Chưa rõ" },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "ewallet", label: "Ví điện tử" },
  { value: "card", label: "Thẻ" },
  { value: "bank_transfer", label: "Chuyển khoản" },
] as const;

export const SERVICE_CATALOG = [
  {
    key: "flat_tire",
    nameVi: "Vá lốp khẩn cấp",
    nameEn: "Flat tire repair",
    descriptionVi: "Hỗ trợ vá hoặc thay lốp tại chỗ cho xe máy và ô tô.",
    basePriceVnd: 120000,
    isFuelService: false,
  },
  {
    key: "battery_jump_start",
    nameVi: "Kích bình",
    nameEn: "Battery jump start",
    descriptionVi: "Khởi động lại xe khi ắc quy yếu hoặc hết điện.",
    basePriceVnd: 150000,
    isFuelService: false,
  },
  {
    key: "battery_replacement",
    nameVi: "Thay ắc quy",
    nameEn: "Battery replacement",
    descriptionVi: "Thay ắc quy tận nơi với báo giá minh bạch.",
    basePriceVnd: 350000,
    isFuelService: false,
  },
  {
    key: "refill_gasoline",
    nameVi: "Tiếp xăng",
    nameEn: "Refill gasoline",
    descriptionVi: "Tiếp xăng tận nơi với số lít linh hoạt.",
    basePriceVnd: 90000,
    isFuelService: true,
  },
  {
    key: "refill_diesel",
    nameVi: "Tiếp dầu diesel",
    nameEn: "Refill diesel",
    descriptionVi: "Tiếp dầu diesel cho xe tải, van và xe cá nhân.",
    basePriceVnd: 100000,
    isFuelService: true,
  },
  {
    key: "engine_issue",
    nameVi: "Sự cố động cơ",
    nameEn: "Engine issue",
    descriptionVi: "Kiểm tra sơ bộ, hỗ trợ xử lý lỗi động cơ ngay tại điểm dừng.",
    basePriceVnd: 220000,
    isFuelService: false,
  },
  {
    key: "brake_issue",
    nameVi: "Sự cố phanh",
    nameEn: "Brake issue",
    descriptionVi: "Đánh giá nhanh, hỗ trợ phanh bó, thiếu dầu hoặc mất lực phanh.",
    basePriceVnd: 230000,
    isFuelService: false,
  },
  {
    key: "oil_change",
    nameVi: "Thay nhớt",
    nameEn: "Oil change",
    descriptionVi: "Thay nhớt lưu động cho xe máy, ô tô và xe tải nhẹ.",
    basePriceVnd: 180000,
    isFuelService: false,
  },
  {
    key: "electrical_issue",
    nameVi: "Lỗi điện",
    nameEn: "Electrical issue",
    descriptionVi: "Xử lý các lỗi điện cơ bản, chập chờn, cầu chì hoặc dây nguồn.",
    basePriceVnd: 200000,
    isFuelService: false,
  },
  {
    key: "tow_request",
    nameVi: "Kéo xe",
    nameEn: "Tow request",
    descriptionVi: "Điều phối kéo xe về garage hoặc điểm an toàn gần nhất.",
    basePriceVnd: 500000,
    isFuelService: false,
  },
  {
    key: "roadside_help",
    nameVi: "Cứu hộ tổng quát",
    nameEn: "Roadside help",
    descriptionVi: "Dành cho các tình huống chưa xác định rõ lỗi hoặc cần hỗ trợ khẩn cấp.",
    basePriceVnd: 160000,
    isFuelService: false,
  },
] as const;

export const REQUEST_STATUS_META = {
  submitted: { label: "Đã gửi", color: "slate" },
  processing: { label: "Đang xử lý", color: "amber" },
  fixer_matched: { label: "Đã ghép kỹ thuật viên", color: "sky" },
  fixer_on_the_way: { label: "Kỹ thuật viên đang đến", color: "blue" },
  arrived: { label: "Đã đến nơi", color: "teal" },
  in_progress: { label: "Đang xử lý", color: "orange" },
  completed: { label: "Hoàn thành", color: "emerald" },
  cancelled: { label: "Đã hủy", color: "rose" },
} as const;

export const DASHBOARD_ACTIONS = [
  {
    title: "Yêu cầu cứu hộ",
    description: "Tạo yêu cầu mới trong vài bước với định vị và báo giá sơ bộ.",
    href: "/request-help",
  },
  {
    title: "Chọn phương tiện",
    description: "Quản lý xe mặc định, biển số và thông tin đăng ký ô tô.",
    href: "/dashboard/vehicles",
  },
  {
    title: "Lịch sử yêu cầu",
    description: "Xem tiến độ, hóa đơn và đánh giá các lần hỗ trợ trước đó.",
    href: "/dashboard/history",
  },
  {
    title: "Địa chỉ đã lưu",
    description: "Lưu nơi ở, văn phòng hoặc tuyến đường thường đi để gọi nhanh hơn.",
    href: "/dashboard/addresses",
  },
  {
    title: "Hỗ trợ",
    description: "Đọc FAQ hoặc liên hệ đội ngũ ResQ nếu bạn cần tư vấn thêm.",
    href: "/help",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "ResQ hỗ trợ những dịch vụ nào?",
    answer:
      "ResQ hỗ trợ vá lốp, kích bình, thay ắc quy, tiếp xăng hoặc dầu, thay nhớt, kéo xe và cứu hộ tổng quát.",
  },
  {
    question: "Tôi có thể đặt lịch trước không?",
    answer:
      "Có. Ở bước mô tả sự cố, bạn có thể thêm thời gian hẹn trước để kỹ thuật viên sắp xếp phù hợp.",
  },
  {
    question: "Thanh toán bằng cách nào?",
    answer:
      "MVP hiện hỗ trợ giao diện chọn tiền mặt, ví điện tử, thẻ và chuyển khoản. Thanh toán được mô phỏng để kiểm thử luồng.",
  },
  {
    question: "Nếu tôi không biết chính xác lỗi xe thì sao?",
    answer:
      "Bạn chỉ cần chọn mục cứu hộ tổng quát hoặc mô tả sơ bộ sự cố. ResQ sẽ điều phối kỹ thuật viên phù hợp.",
  },
] as const;

export const ABOUT_POINTS = [
  "Vietnam-first, tối ưu cho người dùng di chuyển bằng xe máy, ô tô cá nhân và xe tải nhẹ.",
  "Tập trung vào thao tác di động, định vị hiện trường nhanh và trạng thái minh bạch theo thời gian thực.",
  "Thiết kế để dễ mở rộng sang điều phối đội fixer, vùng phục vụ và quy tắc giá động.",
] as const;

export const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    phone: "0900000001",
    name: "Quản trị ResQ",
  },
  {
    role: "Fixer",
    phone: "0900000002",
    name: "Nguyễn Minh Khoa",
  },
  {
    role: "Customer",
    phone: "0900000003",
    name: "Trần Anh Duy",
  },
  {
    role: "Customer",
    phone: "0900000004",
    name: "Lê Thu Hà",
  },
] as const;

export const FIXER_ALLOWED_STATUS_UPDATES = [
  "fixer_on_the_way",
  "arrived",
  "in_progress",
  "completed",
] as const;

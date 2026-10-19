export type ActivityLog = {
  id: number;
  username?: string | null;
  user?: { username?: string | null } | null;
  action: string;
  detail?: string | null;
  createdAt: string;
};

const actionPhrases: Record<string, string> = {
  "Thêm sự cố sửa chữa": "đã ghi nhận sự cố hư hỏng",
  "Cập nhật sửa chữa": "đã cập nhật hồ sơ sửa chữa",
  "Xóa sửa chữa": "đã xóa hồ sơ sửa chữa",
  "Thêm vũ khí mới": "đã thêm vũ khí mới",
  "Cập nhật vũ khí": "đã cập nhật thông tin vũ khí",
  "Xóa vũ khí": "đã xóa vũ khí",
  "Tạo phiếu xuất kho": "đã tạo phiếu xuất kho",
  "Nhập kho": "đã nhập khí tài vào kho",
  "Import kho": "đã nhập dữ liệu kho",
  "Cập nhật kho": "đã cập nhật thông tin kho",
  "Xóa kho": "đã xóa kho",
  "Thêm danh mục": "đã thêm danh mục",
  "Cập nhật danh mục": "đã cập nhật danh mục",
  "Xóa danh mục": "đã xóa danh mục",
  "Thêm quân nhân": "đã thêm quân nhân",
  "Cập nhật quân nhân": "đã cập nhật thông tin quân nhân",
  "Xóa quân nhân": "đã xóa quân nhân",
  "Import quân nhân": "đã nhập danh sách quân nhân",
  "Thêm đăng ký": "đã tạo hồ sơ biên chế",
  "Cập nhật đăng ký": "đã cập nhật hồ sơ biên chế",
  "Xóa đăng ký": "đã xóa hồ sơ biên chế",
};

const detailLabels: Record<string, string> = {
  cause: "Nguyên nhân",
  repairunit: "Đơn vị sửa chữa",
  productname: "Khí tài",
  name: "Tên",
  ten: "Tên",
  hoten: "Họ tên",
  tenkho: "Tên kho",
  unit: "Đơn vị tính",
  serialnumbers: "Số hiệu",
  serial: "Số hiệu",
  warehouse: "Kho",
  count: "Số lượng",
  value: "Thông tin mới",
};

function parseLogDetails(detail?: string | null) {
  if (!detail) return {};

  return Object.fromEntries(
    detail.split(/\s+\|\s+/).flatMap((part) => {
      const separator = part.indexOf(":");
      if (separator < 0) return [];

      return [[part.slice(0, separator).trim(), part.slice(separator + 1).trim()]];
    }),
  );
}

export function formatLogMessage(log: ActivityLog) {
  const details = parseLogDetails(log.detail);
  const normalizedDetails = Object.fromEntries(
    Object.entries(details).map(([key, value]) => [
      key.replace(/[\s_-]/g, "").toLocaleLowerCase("vi"),
      value,
    ]),
  );
  const productName =
    normalizedDetails.productname || normalizedDetails.name || "";

  if (
    log.action === "Cập nhật sửa chữa" ||
    log.action === "Thêm sự cố sửa chữa"
  ) {
    const action = actionPhrases[log.action];
    const context = productName ? ` cho ${productName}` : "";
    const facts = [
      normalizedDetails.cause && `Nguyên nhân: ${normalizedDetails.cause}`,
      normalizedDetails.repairunit &&
        `Đơn vị sửa chữa: ${normalizedDetails.repairunit}`,
    ].filter(Boolean);

    return `${action}${context}${facts.length ? `. ${facts.join(". ")}` : ""}.`;
  }

  const action =
    actionPhrases[log.action] ||
    log.action.toLocaleLowerCase("vi") ||
    "đã thực hiện thao tác";
  const facts = Object.entries(details).flatMap(([key, value]) => {
    const normalizedKey = key.replace(/[\s_-]/g, "").toLocaleLowerCase("vi");
    if (/^(id|.*id|ownerid)$/.test(normalizedKey)) return [];

    const label = detailLabels[normalizedKey];
    if (!label) return [];
    return [`${label}: ${value}`];
  });

  return `${action}${facts.length ? `: ${facts.join(", ")}` : ""}.`;
}
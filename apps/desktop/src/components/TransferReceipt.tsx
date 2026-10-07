type TransferReceiptProps = {
  transfer: any;
  onClose: () => void;
};

function toVietnameseNumberText(value: number): string {
  const units = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;

  const convertUnderHundred = (n: number): string => {
    if (n < 10) return units[n];
    if (n < 20) {
      const teen = ["mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín"];
      return teen[n - 10];
    }
    const tensText = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
    const onesText = ones === 0 ? "" : ` ${units[ones]}`;
    return `${tensText[tens]}${onesText}`.trim();
  };

  if (value === 0) return "không";

  const hundredText = hundreds > 0 ? `${units[hundreds]} trăm` : "";
  const remainder = value % 100;
  const remainderText = remainder > 0 ? ` ${convertUnderHundred(remainder)}` : "";

  return `${hundredText}${remainderText}`.trim();
}

export default function TransferReceipt({ transfer, onClose }: TransferReceiptProps) {
  const createdAt = transfer.createdAt
    ? new Date(transfer.createdAt).toLocaleString("vi-VN")
    : "-";
  const status = transfer.status === "PENDING" ? "CHỜ PHÊ DUYỆT" : transfer.status;
  const quantity = Number(transfer.quantity || 1);
  const productName = transfer.product?.name || "-";
  const unit = transfer.ammunition?.unit || transfer.product?.unit || "-";
  const classification =
    transfer.product?.category?.name ||
    transfer.product?.classification ||
    transfer.category?.name ||
    transfer.classification ||
    "-";
  const fromUnit = transfer.fromUsername || transfer.fromTenantName || "-";
  const toUnit = transfer.toUsername || transfer.toTenantName || "-";

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[88vh] w-full max-w-[180mm] overflow-hidden rounded-lg bg-white px-5 py-5 text-slate-900 shadow-2xl print:shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-red-500 print:hidden"
          aria-label="Đóng phiếu xuất kho"
        >
          ✕
        </button>

        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
          <p className="mt-1 text-[9px]">Độc lập - Tự do - Hạnh phúc</p>
          <div className="mx-auto mt-2 h-px w-20 bg-slate-800" />
          <h1 className="mt-4 text-xl font-bold uppercase">Phiếu xuất kho</h1>
          <p className="mt-1 text-[10px]">Số phiếu: PX-{transfer.id ?? "-"}</p>
          <p className="mt-1 text-[10px]">Ngày lập: {createdAt}</p>
        </div>

        <div className="mt-4 space-y-1 text-[10px] leading-4">
          <p><strong>Trạng thái:</strong> <span className="font-bold text-amber-600">{status}</span></p>
          <p><strong>Người lập:</strong> {transfer.fromUsername || "-"}</p>
        </div>

        <table className="mt-4 w-full border-collapse border border-slate-800 text-[9px]">
          <thead>
            <tr>
              <th className="border border-slate-800 px-1 py-2 text-left">Tên trang bị</th>
              <th className="border border-slate-800 px-1 py-2 text-left">ĐVT</th>
              <th className="border border-slate-800 px-1 py-2 text-left">Phân cấp</th>
              <th className="border border-slate-800 px-1 py-2 text-left">Từ đơn vị</th>
              <th className="border border-slate-800 px-1 py-2 text-left">Đến đơn vị</th>
              <th className="border border-slate-800 px-1 py-2 text-center">SL</th>
              <th className="border border-slate-800 px-1 py-2 text-left">Bằng chữ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-800 px-1 py-3 align-top">{productName}</td>
              <td className="border border-slate-800 px-1 py-3 align-top">{unit}</td>
              <td className="border border-slate-800 px-1 py-3 align-top">{classification}</td>
              <td className="border border-slate-800 px-1 py-3 align-top">{fromUnit}</td>
              <td className="border border-slate-800 px-1 py-3 align-top">{toUnit}</td>
              <td className="border border-slate-800 px-1 py-3 text-center align-top">{quantity}</td>
              <td className="border border-slate-800 px-1 py-3 align-top">{toVietnameseNumberText(quantity)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 space-y-1 text-[10px]">
          <p><strong>Kho xuất:</strong> {transfer.fromWarehouseName || "-"}</p>
          <p><strong>Kho nhập:</strong> {transfer.toWarehouseName || "-"}</p>
          <p><strong>Phê duyệt:</strong> {transfer.approvalUsername || "-"}</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div>
            <p className="font-bold">Người lập</p>
            <p className="mt-7">{transfer.fromUsername || ""}</p>
          </div>
          <div>
            <p className="font-bold">Phê duyệt</p>
            <p className="mt-7">{transfer.approvalUsername || ""}</p>
          </div>
          <div>
            <p className="font-bold">Người nhận</p>
            <p className="mt-7">{transfer.toUsername || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

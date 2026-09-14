type TransferReceiptProps = {
  transfer: any;
  onClose: () => void;
};

export default function TransferReceipt({ transfer, onClose }: TransferReceiptProps) {
  const createdAt = transfer.createdAt
    ? new Date(transfer.createdAt).toLocaleString("vi-VN")
    : "-";
  const status = transfer.status === "PENDING" ? "CHỜ PHÊ DUYỆT" : transfer.status;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex min-h-[297mm] w-full max-w-[210mm] flex-col bg-white px-12 py-10 text-slate-900 shadow-2xl print:shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-red-500 print:hidden"
          aria-label="Đóng phiếu xuất kho"
        >
          ✕
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
          <p className="mt-1 text-xs">Độc lập - Tự do - Hạnh phúc</p>
          <div className="mx-auto mt-3 h-px w-24 bg-slate-800" />
          <h1 className="mt-8 text-2xl font-bold uppercase">Phiếu xuất kho</h1>
          <p className="mt-2 text-sm">Số phiếu: PX-{transfer.id ?? "-"}</p>
          <p className="mt-1 text-sm">Ngày lập: {createdAt}</p>
        </div>

        <div className="mt-10 space-y-3 text-sm">
          <p><strong>Đơn vị xuất:</strong> {transfer.fromUsername || "-"}</p>
          <p><strong>Đơn vị/tài khoản nhận:</strong> {transfer.toUsername || transfer.toTenantName || "-"}</p>
          <p><strong>Kho xuất:</strong> {transfer.fromWarehouseName || "-"}</p>
          <p><strong>Kho nhập:</strong> {transfer.toWarehouseName || "-"}</p>
          <p><strong>Cấp phê duyệt:</strong> {transfer.approvalUsername || "-"}</p>
          <p><strong>Trạng thái:</strong> <span className="font-bold text-amber-600">{status}</span></p>
        </div>

        <table className="mt-8 w-full border-collapse border border-slate-800 text-sm">
          <thead>
            <tr>
              <th className="w-14 border border-slate-800 px-3 py-3">STT</th>
              <th className="border border-slate-800 px-3 py-3 text-left">Tên vũ khí - khí tài</th>
              <th className="border border-slate-800 px-3 py-3 text-left">{transfer.ammunition ? "Lô" : "Số hiệu"}</th>
              <th className="w-24 border border-slate-800 px-3 py-3">ĐVT</th>
              <th className="w-20 border border-slate-800 px-3 py-3">SL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-800 px-3 py-8 text-center">1</td>
              <td className="border border-slate-800 px-3 py-8">{transfer.product?.name || "-"}</td>
              <td className="border border-slate-800 px-3 py-8">{transfer.ammunition?.batch || transfer.productDetail?.serialNumber || "-"}</td>
              <td className="border border-slate-800 px-3 py-8 text-center">{transfer.ammunition?.unit || transfer.product?.unit || "-"}</td>
              <td className="border border-slate-800 px-3 py-8 text-center">{transfer.quantity || 1}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-auto grid grid-cols-3 gap-6 pt-16 text-center text-sm">
          <div><p className="font-bold">Người lập phiếu</p><p className="mt-16">{transfer.fromUsername || ""}</p></div>
          <div><p className="font-bold">Người phê duyệt</p><p className="mt-16">{transfer.approvalUsername || ""}</p></div>
          <div><p className="font-bold">Người nhận</p><p className="mt-16">{transfer.toUsername || ""}</p></div>
        </div>
      </div>
    </div>
  );
}

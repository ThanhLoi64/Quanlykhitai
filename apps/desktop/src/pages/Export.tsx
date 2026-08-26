import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Delete, Edit } from "@mui/icons-material";
import { toast } from "sonner";
import api from "../api/api";
import TransferReceipt from "../components/TransferReceipt";

type Recipient = {
  userId: number;
  tenantId: number;
  username: string;
  fullName: string;
  warehouses: { id: number; name: string }[];
};

type Approver = {
  id: number;
  username: string;
  fullName: string;
  role: string;
};

function statusLabel(status: string) {
  if (status === "PENDING") return "Chờ phê duyệt";
  if (status === "ACCEPTED") return "Đã phê duyệt";
  if (status === "REJECTED") return "Từ chối";
  if (status === "IN_STOCK") return "Trong kho";
  if (status === "REPAIR") return "Sửa chữa";
  return "Đã biên chế";
}

export default function Export() {
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [recipientUserId, setRecipientUserId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [approvalUserId, setApprovalUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [receiptTransfer, setReceiptTransfer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"export" | "history">("export");

  async function load() {
    try {
      const [productsRes, inventoryRes, outgoingRes, optionsRes] = await Promise.all([
        api.get("/products"),
        api.get("/inventory"),
        api.get("/inventory/transfer/outgoing"),
        api.get("/inventory/transfer/options"),
      ]);
      setProducts(productsRes.data);
      setItems(inventoryRes.data);
      setOutgoing(outgoingRes.data);
      setRecipients(optionsRes.data.recipients);
      setApprovers(optionsRes.data.approvers);
    } catch {
      toast.error("Không tải được dữ liệu xuất kho");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pendingByDetailId = useMemo(
    () => new Map(outgoing.filter((transfer) => transfer.status === "PENDING").map((transfer) => [transfer.productDetailId, transfer])),
    [outgoing],
  );

  const categories = [
    ...new Map(products.map((product) => [product.category?.id ?? product.categoryId, product.category])).values(),
  ].filter(Boolean);

  const filteredItems = items.filter((item) => {
    const categoryMatches = selectedCategory === "all"
      || item.product?.categoryId === Number(selectedCategory)
      || item.product?.category?.id === Number(selectedCategory);
    return categoryMatches && (item.status === "IN_STOCK" || pendingByDetailId.has(item.id));
  });

  const rows = filteredItems.map((item, index) => {
    const pending = pendingByDetailId.get(item.id);
    return {
      id: item.id,
      stt: index + 1,
      product: item.product?.name || "-",
      serialNumber: item.serialNumber || "-",
      importOrder: item.importOrder || "-",
      warehouse: item.warehouse?.name || "-",
      status: pending ? "PENDING" : item.status,
      transfer: pending,
      raw: item,
    };
  });

  const columns: GridColDef[] = [
    { field: "stt", headerName: "STT", width: 80 },
    { field: "product", headerName: "Loại khí tài", flex: 1 },
    { field: "serialNumber", headerName: "Số hiệu", flex: 1 },
    { field: "importOrder", headerName: "Lệnh nhập kho", flex: 1 },
    { field: "warehouse", headerName: "Đầu mối", flex: 1 },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 170,
      renderCell: (params) => (
        <Chip
          size="small"
          color={params.value === "PENDING" ? "warning" : "success"}
          label={statusLabel(params.value)}
        />
      ),
    },
    {
      field: "action",
      headerName: "Thao tác",
      width: 250,
      sortable: false,
      filterable: false,
      renderCell: (params) => params.row.status === "PENDING" ? (
        <div className="flex items-center gap-2">
          <Chip size="small" color="warning" label="Đang chờ duyệt" />
          <Button size="small" variant="outlined" onClick={() => setReceiptTransfer(params.row.transfer)}>
            Xem phiếu
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => openModal(params.row.raw)}
          size="small"
          variant="contained"
          color="warning"
          startIcon={<Edit />}
        >
          Xuất kho
        </Button>
      ),
    },
  ];

  const historyColumns: GridColDef[] = [
    { field: "stt", headerName: "STT", width: 80 },
    { field: "product", headerName: "Loại khí tài", flex: 1 },
    { field: "serialNumber", headerName: "Số hiệu", flex: 1 },
    { field: "toUsername", headerName: "Tài khoản nhận", flex: 1 },
    { field: "approvalUsername", headerName: "Tài khoản phê duyệt", flex: 1 },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 160,
      renderCell: (params) => (
        <Chip
          size="small"
          color={params.value === "ACCEPTED" ? "success" : params.value === "REJECTED" ? "error" : "warning"}
          label={statusLabel(params.value)}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Ngày lập",
      width: 160,
      valueGetter: (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "-",
    },
    {
      field: "receipt",
      headerName: "Phiếu",
      width: 240,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Button size="small" variant="outlined" onClick={() => setReceiptTransfer(params.row.transfer)}>
            Xem phiếu
          </Button>
          {params.row.status !== "ACCEPTED" && (
            <Button size="small" color="error" variant="outlined" onClick={() => deleteTransfer(params.row.transfer)} startIcon={<Delete />}>
              Xóa
            </Button>
          )}
        </div>
      ),
    },
  ];

  const historyRows = outgoing.map((transfer, index) => ({
    id: transfer.id,
    stt: index + 1,
    product: transfer.product?.name || "-",
    serialNumber: transfer.productDetail?.serialNumber || "-",
    toUsername: transfer.toUsername || "-",
    approvalUsername: transfer.approvalUsername || "-",
    status: transfer.status,
    createdAt: transfer.createdAt,
    transfer,
  }));

  function openModal(item: any) {
    setSelectedItem(item);
    setRecipientUserId("");
    setWarehouseId("");
    setApprovalUserId("");
  }

  async function createExport() {
    if (!selectedItem || !recipientUserId || !warehouseId || !approvalUserId) {
      toast.error("Vui lòng chọn tài khoản nhận, kho nhận và cấp phê duyệt");
      return;
    }

    setLoading(true);
    try {
      await api.post("/inventory/transfer", {
        productDetailId: selectedItem.id,
        toUserId: Number(recipientUserId),
        toWarehouseId: Number(warehouseId),
        approvalUserId: Number(approvalUserId),
      });
      toast.success("Đã tạo phiếu xuất kho, chờ phê duyệt");
      setSelectedItem(null);
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo phiếu xuất kho");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTransfer(transfer: any) {
    if (transfer.status === "ACCEPTED") return;
    if (!window.confirm("Bạn có chắc muốn xóa phiếu xuất kho này không?")) return;

    try {
      await api.delete(`/inventory/transfer/${transfer.id}`);
      toast.success("Đã xóa phiếu xuất kho");
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa phiếu xuất kho");
    }
  }

  const selectedRecipient = recipients.find((recipient) => recipient.userId === Number(recipientUserId));

  return (
    <div className="space-y-6 p-5">
      <div>
        <h1 className="text-2xl font-bold">XUẤT KHO VŨ KHÍ - KHÍ TÀI</h1>
        <p className="mt-2 text-sm text-slate-500">Theo dõi các phiếu xuất kho và trạng thái phê duyệt.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button onClick={() => setActiveTab("export")} className={`border-b-2 px-5 py-3 font-semibold ${activeTab === "export" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>
          Xuất kho
        </button>
        <button onClick={() => setActiveTab("history")} className={`border-b-2 px-5 py-3 font-semibold ${activeTab === "history" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>
          Lịch sử xuất kho <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs">{historyRows.length}</span>
        </button>
      </div>

      {activeTab === "export" ? <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="border-b px-4 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button onClick={() => setSelectedCategory("all")} className={`whitespace-nowrap border-b-2 px-5 py-3 font-semibold ${selectedCategory === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>
              Tất cả <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs">{rows.length}</span>
            </button>
            {categories.map((category: any) => (
              <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`whitespace-nowrap border-b-2 px-5 py-3 font-semibold ${selectedCategory === category.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        <Box sx={{ height: 450, bgcolor: "white" }}>
          <DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 20, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick />
        </Box>
      </div>
      : <div className="overflow-hidden rounded-xl bg-white shadow">
        <Box sx={{ height: 450, bgcolor: "white" }}>
          <DataGrid rows={historyRows} columns={historyColumns} pageSizeOptions={[10, 20, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick />
        </Box>
      </div>}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <button onClick={() => setSelectedItem(null)} className="absolute right-4 top-4 text-xl text-slate-500 hover:text-red-500">✕</button>
            <h2 className="mb-2 text-xl font-bold">Tạo phiếu xuất kho</h2>
            <p className="mb-6 text-sm text-slate-500">{selectedItem.product?.name} - Số hiệu: {selectedItem.serialNumber || "-"}</p>
            <div className="space-y-4">
              <label className="block text-sm font-medium">Tài khoản nhận
                <select className="mt-1 w-full rounded border p-2" value={recipientUserId} onChange={(event) => { setRecipientUserId(event.target.value); setWarehouseId(""); }}>
                  <option value="">Chọn tài khoản nhận</option>
                  {recipients.map((recipient) => <option key={recipient.userId} value={recipient.userId}>{recipient.username} - {recipient.fullName}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Kho nhận
                <select className="mt-1 w-full rounded border p-2" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} disabled={!selectedRecipient}>
                  <option value="">Chọn kho nhận</option>
                  {selectedRecipient?.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Cấp phê duyệt
                <select className="mt-1 w-full rounded border p-2" value={approvalUserId} onChange={(event) => setApprovalUserId(event.target.value)}>
                  <option value="">Chọn tài khoản cấp trên phê duyệt</option>
                  {approvers.map((approver) => <option key={approver.id} value={approver.id}>{approver.username} - {approver.fullName} ({approver.role})</option>)}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelectedItem(null)} className="rounded-lg border px-5 py-2">Hủy</button>
              <button disabled={loading} onClick={createExport} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-60">{loading ? "Đang gửi..." : "Gửi phê duyệt"}</button>
            </div>
          </div>
        </div>
      )}
      {receiptTransfer && <TransferReceipt transfer={receiptTransfer} onClose={() => setReceiptTransfer(null)} />}
    </div>
  );
}

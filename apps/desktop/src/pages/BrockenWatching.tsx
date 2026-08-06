import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { toast } from "sonner";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
} from "@mui/material";

const severityOptions = ["Thấp", "Trung bình", "Cao", "Cực cao"];

export default function BrokenWatching() {
  const [products, setProducts] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);

  const [productId, setProductId] = useState("");
  const [productDetailId, setProductDetailId] = useState("");
  const [damageStatus, setDamageStatus] = useState("");
  const [cause, setCause] = useState("");
  const [repairStartDate, setRepairStartDate] = useState("");
  const [severity, setSeverity] = useState("");
  const [repairUnit, setRepairUnit] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [note, setNote] = useState("");
  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value?: React.ReactNode;
  }) => (
    <div className="border rounded-lg p-3 bg-gray-50">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value || "-"}</p>
    </div>
  );

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === productId),
    [products, productId],
  );

  const availableDetails = useMemo(
    () =>
      inventories.filter(
        (item) =>
          String(item.productId) === productId && item.status !== "REPAIR",
      ),
    [inventories, productId],
  );

  const today = new Date().toISOString().slice(0, 10);

  async function loadData() {
    try {
      const [productRes, inventoryRes, repairRes] = await Promise.all([
        api.get("/products"),
        api.get("/inventory"),
        api.get("/repairs"),
      ]);

      setProducts(productRes.data);
      setInventories(inventoryRes.data);
      setRepairs(repairRes.data);
    } catch {
      toast.error("Không tải được dữ liệu, vui lòng thử lại.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditId(null);
    setProductId("");
    setProductDetailId("");
    setDamageStatus("");
    setCause("");
    setRepairStartDate(today);
    setSeverity("");
    setRepairUnit("");
    setReceivedDate("");
    setNote("");
  }

  function openCreateModal() {
    resetForm();
    setOpen(true);
  }

  function openEditModal(record: any) {
    setEditId(record.id);
    setProductId(String(record.productDetail?.productId || ""));
    setProductDetailId(String(record.productDetailId || ""));
    setDamageStatus(record.damageStatus || "");
    setCause(record.cause || "");
    setRepairStartDate(
      record.repairStartDate ? record.repairStartDate.slice(0, 10) : today,
    );
    setSeverity(record.severity || "");
    setRepairUnit(record.repairUnit || "");
    setReceivedDate(
      record.receivedDate ? record.receivedDate.slice(0, 10) : "",
    );
    setNote(record.note || "");
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function openDetailDialog(record: any) {
    setDetailRecord(record);
    setDetailOpen(true);
  }

  function closeDetailDialog() {
    setDetailOpen(false);
    setDetailRecord(null);
  }

  async function submit() {
    if (!productId || !productDetailId) {
      toast.error("Vui lòng chọn tên và số hiệu");
      return;
    }

    try {
      const payload = {
        productDetailId: Number(productDetailId),
        damageStatus,
        cause,
        repairStartDate: repairStartDate || null,
        severity,
        repairUnit,
        receivedDate: receivedDate || null,
        note,
      };

      if (editId) {
        await api.patch(`/repairs/${editId}`, payload);
        toast.success("Cập nhật thông tin sữa chữa thành công");
      } else {
        await api.post("/repairs", payload);
        toast.success("Thêm hồ sơ sửa chữa thành công");
      }

      closeModal();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lưu dữ liệu thất bại");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Bạn có chắc muốn xóa hồ sơ này?")) return;

    try {
      await api.delete(`/repairs/${id}`);
      toast.success("Xóa hồ sơ sửa chữa thành công");
      loadData();
    } catch {
      toast.error("Xóa thất bại");
    }
  }

  const rows = repairs.map((item: any, index: number) => ({
    id: item.id,
    stt: index + 1,
    createdAt: new Date(item.createdAt).toLocaleDateString("vi-VN"),
    productName: item.productDetail?.product?.name || "-",
    serialNumber: item.productDetail?.serialNumber || "-",
    unit: item.productDetail?.product?.unit || "-",
    remainingStatus: item.productDetail?.status || "-",
    raw: item,
  }));

  const columns: GridColDef[] = [
    { field: "stt", headerName: "STT", width: 70 },
    { field: "createdAt", headerName: "Ngày ghi nhận", width: 140 },
    { field: "productName", headerName: "Tên", flex: 1, minWidth: 180 },
    { field: "serialNumber", headerName: "Số hiệu", flex: 1, minWidth: 160 },
    { field: "unit", headerName: "Đơn vị tính", width: 130 },
    {
      field: "remainingStatus",
      headerName: "Tình trạng còn lại",
      width: 170,
      renderCell: (params) => (
        <Chip
          size="small"
          label={
            params.value === "REPAIR"
              ? "Sửa chữa"
              : params.value === "IN_STOCK"
                ? "Trong kho"
                : params.value === "AVAILABLE"
                  ? "Sẵn sàng"
                  : String(params.value)
          }
          color={
            params.value === "REPAIR"
              ? "warning"
              : params.value === "IN_STOCK"
                ? "success"
                : params.value === "AVAILABLE"
                  ? "primary"
                  : "default"
          }
        />
      ),
    },
    {
      field: "action",
      headerName: "Thao tác",
      width: 260,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            onClick={() => openDetailDialog(params.row.raw)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => openEditModal(params.row.raw)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => handleDelete(params.row.raw.id)}
          >
            Xóa
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Theo dõi hư hỏng và sửa chữa</h1>
          <p className="text-slate-500">
            Nhập và quản lý thông tin sửa chữa, tự động cập nhật trạng thái kho.
          </p>
        </div>
        <Button variant="contained" size="large" onClick={openCreateModal}>
          Thêm hồ sơ sửa chữa
        </Button>
      </div>

      <Paper className="p-4">
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Paper>

      <Dialog open={open} onClose={closeModal} fullWidth maxWidth="lg">
        <DialogTitle>
          {editId ? "Cập nhật hồ sơ sửa chữa" : "Thêm hồ sơ sửa chữa"}
        </DialogTitle>
        <DialogContent>
          <Box className="grid gap-4 mt-3 md:grid-cols-2">
            <Autocomplete
              options={products}
              value={
                products.find((item) => String(item.id) === productId) || null
              }
              onChange={(_, newValue) => {
                setProductId(newValue ? String(newValue.id) : "");
                setProductDetailId("");
              }}
              getOptionLabel={(option) => option.name || ""}
              renderInput={(params) => (
                <TextField {...params} label="Tên" size="small" />
              )}
            />
            <TextField
              label="Đơn vị tính"
              size="small"
              value={selectedProduct?.unit || ""}
              disabled
            />
            <Autocomplete
              options={availableDetails}
              value={
                availableDetails.find(
                  (item) => String(item.id) === productDetailId,
                ) || null
              }
              onChange={(_, newValue) =>
                setProductDetailId(newValue ? String(newValue.id) : "")
              }
              getOptionLabel={(option) => option.serialNumber || ""}
              renderInput={(params) => (
                <TextField {...params} label="Số hiệu" size="small" />
              )}
              disabled={!productId}
            />
            <TextField
              label="Tình trạng hư hỏng"
              size="small"
              value={damageStatus}
              onChange={(e) => setDamageStatus(e.target.value)}
              fullWidth
            />
            <TextField
              label="Nguyên nhân"
              size="small"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              fullWidth
            />
            <TextField
              label="Ngày đi sửa chữa"
              size="small"
              type="date"
              value={repairStartDate}
              onChange={(e) => setRepairStartDate(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <Autocomplete
              options={severityOptions}
              value={severity}
              onChange={(_, newValue) => setSeverity(newValue || "")}
              renderInput={(params) => (
                <TextField {...params} label="Mức độ" size="small" />
              )}
            />
            <TextField
              label="Đơn vị / người nhận sửa chữa"
              size="small"
              value={repairUnit}
              onChange={(e) => setRepairUnit(e.target.value)}
              fullWidth
            />
            <TextField
              label="Ngày nhận việc"
              size="small"
              variant="outlined"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <TextField
              label="Nhận xét tổng thể"
              size="small"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              label="Ngày tạo"
              size="small"
              type="date"
              value={today}
              disabled
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Hủy</Button>
          <Button variant="contained" onClick={submit}>
            {editId ? "Cập nhật" : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailOpen}
        onClose={closeDetailDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent className="p-0">
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {/* Header */}
            <div className="bg-slate-800 px-8 py-6 text-white">
              <h2 className="text-2xl font-bold">Chi tiết hồ sơ sửa chữa</h2>

              <p className="mt-1 text-sm text-slate-300">
                Thông tin đầy đủ của khí tài đang sửa chữa
              </p>
            </div>

            <div className="space-y-6 p-6">
              {/* ================= THÔNG TIN CƠ BẢN ================= */}

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-5 border-b pb-2 text-lg font-semibold">
                  Thông tin cơ bản
                </h3>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Ảnh */}

                  <div className="flex justify-center">
                    <div className="w-full max-w-xs overflow-hidden rounded-xl border bg-slate-50 shadow">
                      <div className="flex aspect-square items-center justify-center border-2 border-dashed">
                        <div className="text-center text-slate-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto mb-3 h-20 w-20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4-4 4 4 4-6 4 6"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 20h16V4H4v16z"
                            />
                          </svg>

                          <p>Chưa có ảnh</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin */}

                  <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Tên khí tài
                      </p>

                      <p className="mt-2 text-xl font-bold text-slate-800">
                        {detailRecord?.productDetail?.product?.name || "-"}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <DetailItem
                        label="Số hiệu"
                        value={detailRecord?.productDetail?.serialNumber}
                      />

                      <DetailItem
                        label="Đơn vị tính"
                        value={detailRecord?.productDetail?.product?.unit}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2"></div>
                  </div>
                </div>
              </div>

              {/* ================= THÔNG TIN SỬA CHỮA ================= */}

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-5 border-b pb-2 text-lg font-semibold">
                  Thông tin sửa chữa
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <DetailItem
                    label="Trạng thái"
                    value={
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          detailRecord?.productDetail?.status === "REPAIR"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {detailRecord?.productDetail?.status === "REPAIR"
                          ? "Đang sửa chữa"
                          : "Trong kho"}
                      </span>
                    }
                  />

                  <DetailItem
                    label="Ngày ghi nhận"
                    value={
                      detailRecord?.createdAt
                        ? new Date(detailRecord.createdAt).toLocaleDateString(
                            "vi-VN",
                          )
                        : "-"
                    }
                  />

                  <DetailItem
                    label="Tình trạng hư hỏng"
                    value={detailRecord?.damageStatus}
                  />

                  <DetailItem label="Mức độ" value={detailRecord?.severity} />

                  <DetailItem
                    label="Ngày đi sửa"
                    value={
                      detailRecord?.repairStartDate
                        ? new Date(
                            detailRecord.repairStartDate,
                          ).toLocaleDateString("vi-VN")
                        : "-"
                    }
                  />

                  <DetailItem
                    label="Ngày nhận việc"
                    value={
                      detailRecord?.receivedDate
                        ? new Date(
                            detailRecord.receivedDate,
                          ).toLocaleDateString("vi-VN")
                        : "-"
                    }
                  />

                  <div className="md:col-span-2">
                    <DetailItem
                      label="Đơn vị sửa chữa"
                      value={detailRecord?.repairUnit}
                    />
                  </div>
                </div>
              </div>

              {/* ================= NGUYÊN NHÂN ================= */}

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold">Nguyên nhân</h3>

                <div className="rounded-lg border bg-slate-50 p-4 min-h-[110px] whitespace-pre-wrap">
                  {detailRecord?.cause || "-"}
                </div>
              </div>

              {/* ================= GHI CHÚ ================= */}

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold">Ghi chú</h3>

                <div className="rounded-lg border bg-slate-50 p-4 min-h-[120px] whitespace-pre-wrap">
                  {detailRecord?.note || "-"}
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex items-center justify-between border-t bg-slate-100 px-8 py-4">
              <span className="text-sm text-slate-500">
                Cập nhật:{" "}
                {detailRecord?.updatedAt
                  ? new Date(detailRecord.updatedAt).toLocaleString("vi-VN")
                  : "-"}
              </span>

              <button
                onClick={closeDetailDialog}
                className="rounded-lg bg-slate-800 px-6 py-2 font-medium text-white transition hover:bg-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

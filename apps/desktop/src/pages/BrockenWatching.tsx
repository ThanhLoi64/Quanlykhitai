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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

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
    setImageFile(null);
    setImagePreview("");
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
    setImageFile(null);
    setImagePreview(record.image || "");
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
      const payload = new FormData();
      payload.append("productDetailId", productDetailId);
      payload.append("damageStatus", damageStatus);
      payload.append("cause", cause);
      payload.append("repairStartDate", repairStartDate);
      payload.append("severity", severity);
      payload.append("repairUnit", repairUnit);
      payload.append("receivedDate", receivedDate);
      payload.append("note", note);
      if (imageFile) payload.append("image", imageFile);

      let savedRepair: any;

      if (editId) {
        const response = await api.patch(`/repairs/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        savedRepair = response.data;
        toast.success("Cập nhật thông tin sữa chữa thành công");
      } else {
        const response = await api.post("/repairs", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        savedRepair = response.data;
        toast.success("Thêm hồ sơ sửa chữa thành công");
      }

      closeModal();
      await loadData();
      setRepairs((current) => [
        savedRepair,
        ...current.filter((repair) => repair.id !== savedRepair.id),
      ]);
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
    { field: "id", headerName: "ID", width: 90 },
    { field: "stt", headerName: "STT", width: 70 },
    { field: "createdAt", headerName: "Ngày ghi nhận", width: 140 },
    { field: "productName", headerName: "Tên", flex: 1, minWidth: 180 },
    { field: "serialNumber", headerName: "Số hiệu", flex: 1, minWidth: 100 },
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
            <Box className="rounded-lg border border-dashed border-slate-300 p-3 md:col-span-2">
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Ảnh hồ sơ sửa chữa"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-100 text-center text-xs text-slate-400">
                    Chưa có ảnh
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-700">Ảnh hồ sơ sửa chữa</p>
                  <p className="mb-2 text-xs text-slate-500">JPG, PNG hoặc WebP</p>
                  <Button component="label" variant="outlined" size="small">
                    Chọn ảnh
                    <input
                      hidden
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setImageFile(file);
                        if (file) setImagePreview(URL.createObjectURL(file));
                      }}
                    />
                  </Button>
                </div>
              </div>
            </Box>
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

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Ảnh */}

                  <div className="flex justify-center">
                    <div className="w-full max-w-xs overflow-hidden rounded-xl border bg-slate-50 shadow">
                      {detailRecord?.image ? (
                        <img
                          src={detailRecord.image}
                          alt="Ảnh hồ sơ sửa chữa"
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
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
                      )}
                    </div>
                  </div>

                  {/* Thông tin */}

                  <div className=" rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="mb-5 border-b pb-2 text-lg font-semibold">
                      Thông tin khí tài
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-medium text-slate-500">
                          Tên khí tài
                        </span>

                        <span className="col-span-2 text-xl font-bold text-slate-800">
                          {detailRecord?.productDetail?.product?.name || "-"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 items-center">
                        <span className="font-medium text-slate-500">
                          Số hiệu
                        </span>

                        <span className="col-span-2 text-slate-700">
                          {detailRecord?.productDetail?.serialNumber || "-"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 items-center">
                        <span className="font-medium text-slate-500">
                          Đơn vị tính
                        </span>

                        <span className="col-span-2 text-slate-700">
                          {detailRecord?.productDetail?.product?.unit || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= THÔNG TIN SỬA CHỮA ================= */}

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-5 border-b pb-2 text-lg font-semibold">
                  Thông tin sửa chữa
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center">
                    <span className="font-medium text-slate-500">
                      Trạng thái
                    </span>

                    <span className="col-span-2">
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
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center">
                    <span className="font-medium text-slate-500">
                      Ngày ghi nhận
                    </span>

                    <span className="col-span-2 text-slate-700">
                      {detailRecord?.createdAt
                        ? new Date(detailRecord.createdAt).toLocaleDateString(
                            "vi-VN",
                          )
                        : "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center">
                    <span className="font-medium text-slate-500">
                      Tình trạng hư hỏng
                    </span>

                    <span className="col-span-2 text-slate-700">
                      {detailRecord?.damageStatus || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center">
                    <span className="font-medium text-slate-500">Mức độ</span>

                    <span className="col-span-2 text-slate-700">
                      {detailRecord?.severity || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center">
                    <span className="font-medium text-slate-500">
                      Ngày đi sửa
                    </span>

                    <span className="col-span-2 text-slate-700">
                      {detailRecord?.repairStartDate
                        ? new Date(
                            detailRecord.repairStartDate,
                          ).toLocaleDateString("vi-VN")
                        : "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center">
                    <span className="font-medium text-slate-500">
                      Ngày nhận việc
                    </span>

                    <span className="col-span-2 text-slate-700">
                      {detailRecord?.receivedDate
                        ? new Date(
                            detailRecord.receivedDate,
                          ).toLocaleDateString("vi-VN")
                        : "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center">
                    <span className="font-medium text-slate-500">
                      Đơn vị sửa chữa
                    </span>

                    <span className="col-span-2 text-slate-700">
                      {detailRecord?.repairUnit || "-"}
                    </span>
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

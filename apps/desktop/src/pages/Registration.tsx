import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "sonner";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

const accessoryOptions = [
  "Cán thông nòng",
  "Ống phụ tùng",
  "Đầu thông nòng vải",
  "Đầu thông nòng lông",
  "Vặn vít và tống chốt",
  "Doa lỗ trích khí",
  "Dụng cụ lấy vỏ đạn đứt",
  "Bạc bắn đạn hơi",
  "Hộp tiếp đạn",
  "Hộp dầu",
  "Lê súng",
  "Lựu đạn",
  "Đạn",
  "Túi lựu đạn",
];
const equipmentOptions = ["Dây súng", "Bao xe"];
const militaryEquipmentOptions = [
  "Cuốc to",
  "Xẻng to",
  "Cuốc nhỏ",
  "Xẻng nhỏ",
  "Dao tông",
  "Dao găm",
  "Kìm bấm kíp",
];

export default function Registration() {
  const [owners, setOwners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);

  const [ownerId, setOwnerId] = useState("");
  const [productId, setProductId] = useState("");
  const [detailId, setDetailId] = useState("");
  const [accessory, setAccessory] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [militaryEquipment, setMilitaryEquipment] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRegistrationId, setEditingRegistrationId] = useState<
    number | null
  >(null);

  const availableInventories = inventories.filter(
    (item) =>
      item.productId === Number(productId) && item.status === "IN_STOCK",
  );

  function resetForm() {
    setOwnerId("");
    setProductId("");
    setDetailId("");
    setAccessory([]);
    setEquipment([]);
    setMilitaryEquipment([]);
  }

  function openModal() {
    resetForm();
    setIsEditMode(false);
    setEditingRegistrationId(null);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setIsEditMode(false);
    setEditingRegistrationId(null);
  }

  function parseSelectedValues(value?: string | null) {
    if (!value) return [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function openEditModal(registration: any) {
    setIsEditMode(true);
    setEditingRegistrationId(registration.id);
    setOwnerId(String(registration.ownerId || registration.owner?.id || ""));
    setProductId(
      String(
        registration.detail?.productId ||
          registration.detail?.product?.id ||
          "",
      ),
    );
    setDetailId(String(registration.detailId || ""));
    setAccessory(
      parseSelectedValues(
        registration.detail?.accessory || registration.accessory,
      ),
    );
    setEquipment(
      parseSelectedValues(
        registration.detail?.equipment || registration.equipment,
      ),
    );
    setMilitaryEquipment(
      parseSelectedValues(
        registration.detail?.militaryEquipment ||
          registration.militaryEquipment,
      ),
    );
    setOpen(true);
  }

  function openDetailModal(registration: any) {
    setSelectedRegistration(registration);
    setDetailOpen(true);
  }

  function closeDetailModal() {
    setDetailOpen(false);
    setSelectedRegistration(null);
  }
  // load data

  async function load() {
    try {
      const ownerRes = await api.get("/owners");

      const productRes = await api.get("/products");

      const inventoryRes = await api.get("/inventory");

      const registrationRes = await api.get("/registrations");

      setOwners(ownerRes.data);
      setProducts(productRes.data);
      setInventories(inventoryRes.data);
      setRegistrations(registrationRes.data);
    } catch {
      toast.error("Không tải được dữ liệu");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Bạn có chắc muốn xóa đăng ký này?")) return;

    try {
      await api.delete(`/registrations/${id}`);
      toast.success("Xóa đăng ký thành công");
      load();
    } catch {
      toast.error("Xóa đăng ký thất bại");
    }
  }

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "stt", headerName: "STT", width: 70 },
    { field: "fullName", headerName: "Họ tên", width: 200 },
    { field: "rank", headerName: "Cấp bậc", flex: 1 },
    { field: "position", headerName: "Chức vụ", flex: 1 },
    { field: "department", headerName: "Đơn vị", flex: 1 },
    { field: "productName", headerName: "Khí tài", flex: 1.2 },
    { field: "serialNumber", headerName: "Số hiệu", flex: 1 },
    { field: "registeredAt", headerName: "Ngày đăng ký", flex: 1 },
    {
      field: "action",
      headerName: "Thao tác",
      width: 260,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            size="small"
            variant="contained"
            onClick={() => openDetailModal(params.row.raw)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            color="secondary"
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
        </Box>
      ),
    },
  ];

  const rows = registrations.map((r, index) => ({
    id: r.id,
    stt: index + 1,
    fullName: r.owner?.fullName || "-",
    rank: r.owner?.rank || "-",
    position: r.owner?.position || "-",
    department: r.owner?.department || "-",
    productName: r.detail?.product?.name || "-",
    serialNumber: r.detail?.serialNumber || "-",
    registeredAt: new Date(r.registeredAt).toLocaleDateString("vi-VN"),
    raw: r,
  }));

  // đăng ký

  async function submit() {
    if (!ownerId || !detailId) {
      toast.error("Vui lòng chọn đầy đủ");
      return;
    }

    try {
      const payload = {
        ownerId: Number(ownerId),
        detailId: Number(detailId),
        accessory: accessory.join(", "),
        equipment: equipment.join(", "),
        militaryEquipment: militaryEquipment.join(", "),
      };

      if (editingRegistrationId) {
        await api.patch(`/registrations/${editingRegistrationId}`, payload);
        toast.success("Cập nhật đăng ký thành công");
      } else {
        await api.post("/registrations", payload);
        toast.success("Đăng ký thành công");
      }

      closeModal();
      load();
    } catch {
      toast.error(
        editingRegistrationId
          ? "Cập nhật đăng ký thất bại"
          : "Đăng ký thất bại",
      );
    }
  }

  function getInitials(name?: string) {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word: string) => word[0])
      .join("")
      .toUpperCase();
  }

  function formatValue(value?: string | null) {
    if (!value) return "-";
    return value;
  }

  function formatStatus(status?: string | null) {
    switch (status) {
      case "REPAIR":
        return "ĐANG SỬA CHỮA";

      case "ISSUED":
        return "ĐÃ CẤP";

      case "IN_STOCK":
        return "TRONG KHO";

      default:
        return "-";
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Đăng ký khí tài cá nhân</h1>
        <Button variant="contained" onClick={openModal}>
          Thêm đăng ký
        </Button>
      </div>

      <Dialog open={open} onClose={closeModal} fullWidth maxWidth="md">
        <DialogTitle>
          {isEditMode ? "Cập nhật đăng ký khí tài" : "Đăng ký khí tài"}
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 gap-5 mt-3">
            <div>
              <label className="text-sm">Người sử dụng</label>
              <Autocomplete
                options={owners}
                value={owners.find((o) => String(o.id) === ownerId) || null}
                onChange={(_, newValue) =>
                  setOwnerId(newValue ? String(newValue.id) : "")
                }
                getOptionLabel={(option) =>
                  option?.fullName
                    ? `${option.fullName} - ${option.position || ""}`
                    : ""
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option?.fullName
                      ? `${option.fullName} - ${option.position || ""}`
                      : ""}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Chọn người sử dụng"
                    size="small"
                  />
                )}
                fullWidth
              />
            </div>

            <div>
              <label className="text-sm">Loại vũ khí</label>
              <Autocomplete
                options={products}
                value={products.find((p) => String(p.id) === productId) || null}
                onChange={(_, newValue) => {
                  setProductId(newValue ? String(newValue.id) : "");
                  setDetailId("");
                }}
                getOptionLabel={(option) => option?.name || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option?.name || ""}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Chọn loại vũ khí"
                    size="small"
                  />
                )}
                fullWidth
              />
            </div>

            <div>
              <label className="text-sm">Số hiệu</label>
              <Autocomplete
                options={availableInventories}
                value={
                  availableInventories.find((i) => String(i.id) === detailId) ||
                  null
                }
                onChange={(_, newValue) =>
                  setDetailId(newValue ? String(newValue.id) : "")
                }
                onFocus={() => {
                  if (!productId) {
                    toast.warning("Vui lòng chọn loại vũ khí trước");
                  }
                }}
                getOptionLabel={(option) => option?.serialNumber || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option?.serialNumber || ""}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Chọn số hiệu"
                    size="small"
                  />
                )}
                fullWidth
                disabled={!productId}
              />
            </div>

            <div>
              <label className="text-sm">Phụ tùng</label>
              <Autocomplete
                multiple
                options={accessoryOptions}
                value={accessory}
                onChange={(_, newValue) => setAccessory(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Chọn phụ tùng"
                    size="small"
                  />
                )}
                fullWidth
              />
            </div>

            <div>
              <label className="text-sm">Trang bị</label>
              <Autocomplete
                multiple
                options={equipmentOptions}
                value={equipment}
                onChange={(_, newValue) => setEquipment(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Chọn trang bị"
                    size="small"
                  />
                )}
                fullWidth
              />
            </div>

            <div>
              <label className="text-sm">Quân cụ</label>
              <Autocomplete
                multiple
                options={militaryEquipmentOptions}
                value={militaryEquipment}
                onChange={(_, newValue) => setMilitaryEquipment(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Chọn quân cụ"
                    size="small"
                  />
                )}
                fullWidth
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Hủy</Button>
          <Button variant="contained" onClick={submit}>
            {isEditMode ? "Cập nhật" : "Đăng ký"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailOpen}
        onClose={closeDetailModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 0 }}>Chi tiết đăng ký</DialogTitle>
        <DialogContent>
          {selectedRegistration ? (
            <Box sx={{ display: "grid", gap: 3, py: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "flex-start", md: "center" },
                  gap: 3,
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid #dbeafe",
                  background:
                    "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
                }}
              >
                <Avatar
                  sx={{
                    width: 96,
                    height: 96,
                    bgcolor: "primary.main",
                    fontSize: 30,
                    boxShadow: 3,
                  }}
                >
                  {getInitials(selectedRegistration.owner?.fullName)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedRegistration.owner?.fullName || "-"}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}
                  >
                    <Chip
                      label={`Cấp bậc: ${selectedRegistration.owner?.rank || "-"}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`Chức vụ: ${selectedRegistration.owner?.position || "-"}`}
                      color="secondary"
                      variant="outlined"
                    />
                    <Chip
                      label={`Đơn vị: ${selectedRegistration.owner?.department || "-"}`}
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Khí tài
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {selectedRegistration.detail?.product?.name || "-"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Số hiệu
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {selectedRegistration.detail?.serialNumber || "-"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Ngày đăng ký
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {new Date(
                      selectedRegistration.registeredAt,
                    ).toLocaleDateString("vi-VN")}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Trạng thái
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color:
                        selectedRegistration.detail?.status === "REPAIR"
                          ? "warning.main"
                          : selectedRegistration.detail?.status === "ISSUED"
                            ? "success.main"
                            : "text.primary",
                    }}
                  >
                    {formatStatus(selectedRegistration.detail?.status)}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                  bgcolor: "white",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Thông tin đi kèm
                </Typography>
                <Stack spacing={2}>
                  <Box></Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Phụ tùng
                      </Typography>

                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatValue(selectedRegistration.detail?.accessory)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Trang bị
                      </Typography>

                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatValue(selectedRegistration.detail?.equipment)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Quân cụ
                      </Typography>

                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatValue(
                          selectedRegistration.detail?.militaryEquipment,
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailModal}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* TABLE */}

      <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">
        <Box sx={{ height: 600, bgcolor: "white", borderRadius: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 20, 50]}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </div>
    </div>
  );
}

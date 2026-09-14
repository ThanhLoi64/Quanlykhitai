import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api/api";
import qbz95 from "../assets/img-weapons-qbz95.webp";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";

import { Add, Edit, Delete } from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { useNavigate } from "react-router-dom";

function isAmmunition(product: any) {
  const text = `${product.name || ""} ${product.category?.name || ""}`.toLowerCase();
  return /đạn|dan duoc|ammunition/.test(text);
}

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState("Thông tin chung");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tab đang được chọn
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all"
  );

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    unit: "",
    classification: "",
    storageLocation: "",
    note: "",
    origin: "",
    usageHistory: "",
    documents: "",
    categoryId: 0,
  });

  // =========================
  // LOAD DATA
  // =========================

  async function load() {
    try {
      const [productRes, categoryRes, ammunitionRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
        api.get("/ammunition"),
      ]);

      const ammunitionTotals = ammunitionRes.data.reduce(
        (totals: Record<number, number>, item: any) => {
          totals[item.productId] = (totals[item.productId] || 0) + Number(item.quantity || 0);
          return totals;
        },
        {},
      );

      setProducts(
        productRes.data.map((product: any) =>
          isAmmunition(product)
            ? { ...product, quantity: ammunitionTotals[product.id] || 0 }
            : product,
        ),
      );
      setCategories(categoryRes.data);

      // Nếu tab hiện tại không còn tồn tại thì về Tất cả
      if (
        selectedCategory !== "all" &&
        !categoryRes.data.some(
          (category: any) => category.id === selectedCategory
        )
      ) {
        setSelectedCategory("all");
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    }
  }

  useEffect(() => {
    load();
  }, []);

  // =========================
  // FILTER PRODUCTS
  // =========================

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (product) => product.categoryId === selectedCategory
        );

  // =========================
  // CREATE
  // =========================

  function openCreate() {
    setEditId(null);
    setImageFile(null);
    setImagePreview(null);
    setModalTab("Thông tin chung");

    setForm({
      name: "",
      unit: "",
      classification: "",
      storageLocation: "",
      note: "",
      origin: "",
      usageHistory: "",
      documents: "",
      categoryId:
        selectedCategory === "all" ? 0 : Number(selectedCategory),
    });

    setOpenModal(true);
  }

  // =========================
  // EDIT
  // =========================

  function openEdit(row: any) {
    setEditId(row.id);
    setImageFile(null);
    setImagePreview(row.image || null);
    setModalTab("Thông tin chung");

    setForm({
      name: row.name,
      unit: row.unit,
      classification: row.classification || "",
      storageLocation: row.storageLocation || "",
      note: row.note || "",
      origin: row.origin || "",
      usageHistory: row.usageHistory || "",
      documents: row.documents || "",
      categoryId: row.categoryId,
    });

    setOpenModal(true);
  }

  // =========================
  // DELETE
  // =========================

  async function remove() {
    if (!deleteId || isDeleting) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Đang xóa sản phẩm...");
    try {
      await api.delete(`/products/${deleteId}`);

      toast.dismiss(loadingToast);
      toast.success("Xóa thành công");

      setDeleteId(null);

      load();
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Không thể xóa sản phẩm");
    } finally {
      setIsDeleting(false);
    }
  }

  // =========================
  // SAVE
  // =========================

  async function saveProduct() {
    if (isSaving) return;

    let loadingToast: string | number | undefined;

    try {
      if (!form.categoryId) {
        toast.error("Vui lòng chọn danh mục");
        return;
      }

      const data = new FormData();
      data.append("name", form.name);
      data.append("unit", form.unit);
      data.append("classification", form.classification);
      data.append("storageLocation", form.storageLocation);
      data.append("note", form.note);
      data.append("origin", form.origin);
      data.append("usageHistory", form.usageHistory);
      data.append("documents", form.documents);
      data.append("categoryId", String(form.categoryId));
      if (imageFile) data.append("image", imageFile);

      setIsSaving(true);
      loadingToast = toast.loading(
        editId ? "Đang cập nhật sản phẩm..." : "Đang thêm sản phẩm..."
      );

      if (editId) {
        await api.patch(`/products/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.dismiss(loadingToast);
        toast.success("Cập nhật thành công");
      } else {
        await api.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.dismiss(loadingToast);
        toast.success("Thêm thành công");
      }

      setOpenModal(false);

      load();
    } catch {
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  }

  // =========================
  // TABLE COLUMNS
  // =========================

  const columns: GridColDef[] = [
    {
      field: "thumbnail",
      headerName: "Ảnh",
      width: 112,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <img
          src={params.row.image || qbz95}
          alt={params.row.name || "Ảnh vũ khí"}
          style={{
            width: 72,
            height: 48,
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        />
      ),
    },

    {
      field: "name",
      headerName: "Tên vũ khí - khí tài",
      flex: 1,
      minWidth: 220,
    },

    {
      field: "unit",
      headerName: "Đơn vị tính",
      width: 120,
    },

    {
      field: "classification",
      headerName: "Phân cấp",
      width: 150,
    },

    {
      field: "quantity",
      headerName: "Số lượng trong kho",
      width: 160,
    },

    {
      field: "category",
      headerName: "Danh mục",
      width: 180,

      valueGetter: (_, row) => {
        return row.category?.name || "";
      },
    },

    {
      field: "action",
      headerName: "Thao tác",
      width: 280,
      sortable: false,

      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            color="info"
            onClick={() => navigate(`/products/${params.row.id}`)}
          >
            Chi tiết
          </Button>

          <Button
            size="small"
            variant="contained"
            startIcon={<Edit />}
            onClick={() => openEdit(params.row)}
          >
            Sửa
          </Button>

          <Button
            size="small"
            color="error"
            variant="contained"
            startIcon={<Delete />}
            onClick={() => setDeleteId(params.row.id)}
          >
            Xóa
          </Button>
        </Stack>
      ),
    },
  ];

  // =========================
  // RENDER
  // =========================

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          my: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
            }}
          >
            THỐNG KÊ VŨ KHÍ - KHÍ TÀI
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: "text.secondary",
            }}
          >
            ⓘ Thống kê VK, KT, ĐD theo biên chế 1875
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
        >
          Thêm vũ khí - khí tài
        </Button>
      </Box>

      {/* CATEGORY TABS */}
      <Card sx={{ mb: 2 }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs
            value={selectedCategory}
            onChange={(_, newValue) => {
              setSelectedCategory(newValue);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {/* TẤT CẢ */}
            <Tab
              label={`Tất cả (${products.length})`}
              value="all"
            />

            {/* CÁC DANH MỤC */}
            {categories.map((category) => {
              const count = products.filter(
                (product) => product.categoryId === category.id
              ).length;

              return (
                <Tab
                  key={category.id}
                  value={category.id}
                  label={`${category.name} (${count})`}
                />
              );
            })}
          </Tabs>
        </Box>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent>
          <Box
            sx={{
              height: 500,
              width: "100%",
            }}
          >
            <DataGrid
              rows={filteredProducts}
              columns={columns}
              pageSizeOptions={[5, 10, 20, 50]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                    page: 0,
                  },
                },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      {/* =========================
          CREATE / EDIT MODAL
      ========================= */}

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editId ? "Cập nhật vũ khí" : "Thêm vũ khí"}
        </DialogTitle>

        <DialogContent>
          <Tabs
            value={modalTab}
            onChange={(_, value) => setModalTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab label="Thông tin chung" value="Thông tin chung" />
            <Tab label="Lịch sử sử dụng" value="Lịch sử sử dụng" />
            <Tab label="Tài liệu" value="Tài liệu" />
          </Tabs>

          <Box
            sx={{
              mt: 2,
              display: "grid",
              gap: 2,
            }}
          >
            {modalTab === "Thông tin chung" && <>
            <input
              className="border p-2 rounded"
              placeholder="Tên vũ khí"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Đơn vị"
              value={form.unit}
              onChange={(e) =>
                setForm({
                  ...form,
                  unit: e.target.value,
                })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Phân cấp"
              value={form.classification}
              onChange={(e) =>
                setForm({
                  ...form,
                  classification: e.target.value,
                })
              }
            />

            <select
              className="border p-2 rounded"
              value={form.categoryId}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId: Number(e.target.value),
                })
              }
            >
              <option value={0}>Chọn danh mục</option>

              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <textarea
              className="border p-2 rounded"
              placeholder="Ghi chú"
              value={form.note}
              onChange={(e) =>
                setForm({
                  ...form,
                  note: e.target.value,
                })
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Xuất xứ"
              value={form.origin}
              onChange={(e) =>
                setForm({
                  ...form,
                  origin: e.target.value,
                })
              }
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Ảnh vũ khí hiện tại"
                style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 8 }}
              />
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setImageFile(file);
                setImagePreview(file ? URL.createObjectURL(file) : imagePreview);
              }}
            />
            </>}

            {modalTab === "Lịch sử sử dụng" && (
              <textarea
                className="border p-2 rounded min-h-40"
                placeholder="Nhập lịch sử sử dụng, bảo quản, sửa chữa..."
                value={form.usageHistory}
                onChange={(e) => setForm({ ...form, usageHistory: e.target.value })}
              />
            )}

            {modalTab === "Tài liệu" && (
              <textarea
                className="border p-2 rounded min-h-40"
                placeholder="Nhập tên tài liệu hoặc đường dẫn tài liệu, mỗi dòng một mục..."
                value={form.documents}
                onChange={(e) => setForm({ ...form, documents: e.target.value })}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={saveProduct}
            disabled={isSaving}
          >
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================
          DELETE MODAL
      ========================= */}

      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
      >
        <DialogTitle>Xóa sản phẩm</DialogTitle>

        <DialogContent>
          Bạn có chắc muốn xóa sản phẩm này?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>
            Hủy
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={remove}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
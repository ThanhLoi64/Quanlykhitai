import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api/api";

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

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [openModal, setOpenModal] = useState(false);

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
    categoryId: 0,
  });

  // =========================
  // LOAD DATA
  // =========================

  async function load() {
    try {
      const [productRes, categoryRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);

      setProducts(productRes.data);
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

    setForm({
      name: "",
      unit: "",
      classification: "",
      storageLocation: "",
      note: "",
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

    setForm({
      name: row.name,
      unit: row.unit,
      classification: row.classification || "",
      storageLocation: row.storageLocation || "",
      note: row.note || "",
      categoryId: row.categoryId,
    });

    setOpenModal(true);
  }

  // =========================
  // DELETE
  // =========================

  async function remove() {
    if (!deleteId) return;

    try {
      await api.delete(`/products/${deleteId}`);

      toast.success("Xóa thành công");

      setDeleteId(null);

      load();
    } catch {
      toast.error("Không thể xóa sản phẩm");
    }
  }

  // =========================
  // SAVE
  // =========================

  async function saveProduct() {
    try {
      if (!form.categoryId) {
        toast.error("Vui lòng chọn danh mục");
        return;
      }

      if (editId) {
        await api.patch(`/products/${editId}`, form);

        toast.success("Cập nhật thành công");
      } else {
        await api.post("/products", form);

        toast.success("Thêm thành công");
      }

      setOpenModal(false);

      load();
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  }

  // =========================
  // TABLE COLUMNS
  // =========================

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
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
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gap: 2,
            }}
          >
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
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={saveProduct}
          >
            Lưu
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
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
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
} from "@mui/material";

import { Add, Edit, Delete } from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";

import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    unit: "",
    classification: "",
    quantity: 0,
    storageLocation: "",
    note: "",
    categoryId: 0,
  });
  async function load() {
    const res = await api.get("/products");

    setProducts(res.data);

    const cate = await api.get("/categories");

    setCategories(cate.data);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditId(null);

    setForm({
      name: "",
      unit: "",
      classification: "",
      quantity: 0,
      storageLocation: "",
      note: "",
      categoryId: 0,
    });

    setOpenModal(true);
  }
  function openEdit(row: any) {
    setEditId(row.id);

    setForm({
      name: row.name,

      unit: row.unit,

      classification: row.classification || "",

      quantity: row.quantity,

      storageLocation: row.storageLocation || "",

      note: row.note || "",

      categoryId: row.categoryId,
    });

    setOpenModal(true);
  }
  async function remove() {
    if (!deleteId) return;

    await api.delete(`/products/${deleteId}`);

    setDeleteId(null);

    load();
  }
  async function saveProduct() {
    try {
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
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
    },
    {
      field: "name",
      headerName: " Tên vũ khí",
      flex: 1,
    },

    {
      field: "unit",
      headerName: "Đơn vị",
      width: 120,
    },

    {
      field: "classification",
      headerName: "Phân cấp",
      width: 150,
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
      field: "quantity",
      headerName: "Số lượng",
      width: 150,
    },
    {
      field: "action",
      headerName: "Thao tác",
      width: 260,
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

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          my: 3,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          THỐNG KÊ VŨ KHÍ - KHÍ TÀI
        </Typography>

        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Thêm vũ khí - khí tài
        </Button>
      </Box>
      <div className="mb-3 text-sm text-slate-400 uppercase">
        <span>ⓘ Thống kê VK, KT, ĐD theo biên chế 1875</span>
      </div>

      <Card>
        <CardContent>
          <div
            style={{
              height: 550,
              width: "100%",
            }}
          >
            <DataGrid
              rows={products}
              columns={columns}
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                    page: 0,
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editId ? "Cập nhật vũ khí" : "Thêm vũ khí"}</DialogTitle>

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
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="border p-2 rounded"
              placeholder="Đơn vị"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
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
            <input
              className="border p-2 rounded"
              placeholder="Số lượng"
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity: Number(e.target.value),
                })
              }
            />

            {/* <input
              className="border p-2 rounded"
              placeholder="Kho"
              value={form.storageLocation}
              onChange={(e) =>
                setForm({
                  ...form,
                  storageLocation: e.target.value,
                })
              }
            /> */}

            <select
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
          <Button onClick={() => setOpenModal(false)}>Hủy</Button>

          <Button variant="contained" onClick={saveProduct}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xóa sản phẩm</DialogTitle>

        <DialogContent>Bạn có chắc muốn xóa sản phẩm này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Hủy</Button>

          <Button color="error" variant="contained" onClick={remove}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

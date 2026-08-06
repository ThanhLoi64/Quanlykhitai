import { useEffect, useState } from "react";
import api from "../api/api";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { Add, Edit, Delete, Save, Close } from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editId, setEditId] = useState<number | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

  async function loadCategories() {
    const res = await api.get("/categories");
    setCategories(res.data);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function save() {
    if (!name.trim()) {
      alert("Nhập tên danh mục");
      return;
    }

    if (editId) {
      await api.patch(`/categories/${editId}`, {
        name,
        description,
      });
    } else {
      await api.post("/categories", {
        name,
        description,
      });
    }

    setOpenModal(false);

    setName("");
    setDescription("");
    setEditId(null);

    loadCategories();
  }

  // function edit(item: any) {
  //   setEditId(item.id);
  //   setName(item.name);
  //   setDescription(item.description ?? "");
  // }

  async function remove() {
    if (!deleteId) return;

    await api.delete(`/categories/${deleteId}`);

    setDeleteId(null);

    loadCategories();
  }
  function openAddModal() {
    setEditId(null);
    setName("");
    setDescription("");
    setOpenModal(true);
  }

  function openEditModal(item: any) {
    setEditId(item.id);
    setName(item.name);
    setDescription(item.description ?? "");
    setOpenModal(true);
  }
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
    },
    {
      field: "name",
      headerName: "Tên danh mục",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Mô tả",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      width: 150,
      valueGetter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: "action",
      headerName: "Thao tác",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            startIcon={<Edit />}
            onClick={() => openEditModal(params.row)}
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
      <div className="flex justify-between items-center mb-3">
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          DANH MỤC VŨ KHÍ - KHÍ TÀI
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ mb: 3 }}
          onClick={openAddModal}
        >
          Thêm danh mục
        </Button>
      </div>

      <Card>
        <CardContent>
          <div style={{ height: 500 }}>
            <DataGrid
              rows={categories}
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

      {/* ================= MODAL THÊM / SỬA ================= */}

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editId ? "Cập nhật danh mục" : "Thêm danh mục"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Tên danh mục"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button startIcon={<Close />} onClick={() => setOpenModal(false)}>
            Hủy
          </Button>

          <Button
            variant="contained"
            startIcon={editId ? <Save /> : <Add />}
            onClick={save}
          >
            {editId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL XÓA ================= */}

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xóa danh mục</DialogTitle>

        <DialogContent>Bạn có chắc chắn muốn xóa danh mục này?</DialogContent>

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

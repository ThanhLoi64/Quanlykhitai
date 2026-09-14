import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import api from "../api/api";

type FormState = {
  productId: number | "";
  batch: string;
  unit: string;
  quantity: string;
  productionYear: string;
  warehouseId: number | "";
};

const emptyForm: FormState = {
  productId: "",
  batch: "",
  unit: "viên",
  quantity: "",
  productionYear: "",
  warehouseId: "",
};

export default function Ammunition() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  async function load() {
    try {
      const [ammunitionResponse, productsResponse, warehouseResponse] = await Promise.all([
        api.get("/ammunition"),
        api.get("/products"),
        api.get("/warehouses"),
      ]);
      setItems(ammunitionResponse.data);
      setProducts(productsResponse.data);
      setWarehouses(warehouseResponse.data);
    } catch {
      toast.error("Không thể tải dữ liệu đạn dược");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: any) {
    setEditId(item.id);
    setForm({
      productId: item.productId,
      batch: item.batch || "",
      unit: item.unit || "viên",
      quantity: String(item.quantity),
      productionYear: String(item.productionYear),
      warehouseId: item.warehouseId || "",
    });
    setOpen(true);
  }

  async function save() {
    if (!form.productId || !form.batch.trim() || !form.unit.trim() || !form.quantity || !form.productionYear || !form.warehouseId) {
      toast.error("Vui lòng nhập đầy đủ thông tin đạn dược và chọn đầu mối");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading(editId ? "Đang cập nhật đạn dược..." : "Đang thêm đạn dược...");
    try {
      const payload = {
        productId: Number(form.productId),
        batch: form.batch.trim(),
        unit: form.unit.trim(),
        quantity: Number(form.quantity),
        productionYear: Number(form.productionYear),
        warehouseId: Number(form.warehouseId),
      };
      if (editId) await api.patch(`/ammunition/${editId}`, payload);
      else await api.post("/ammunition", payload);

      toast.dismiss(loadingToast);
      toast.success(editId ? "Cập nhật thành công" : "Thêm đạn dược thành công");
      setOpen(false);
      await load();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Không thể lưu đạn dược");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Bạn có chắc muốn xóa lô đạn này?")) return;
    const loadingToast = toast.loading("Đang xóa đạn dược...");
    try {
      await api.delete(`/ammunition/${id}`);
      toast.dismiss(loadingToast);
      toast.success("Đã xóa đạn dược");
      await load();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Không thể xóa đạn dược");
    }
  }

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 75 },
    { field: "productName", headerName: "Loại đạn", flex: 1.4, minWidth: 220 },
    { field: "batch", headerName: "Lô", flex: 1, minWidth: 160 },
    { field: "unit", headerName: "Đơn vị tính", width: 140 },
    { field: "quantity", headerName: "Số lượng", width: 130 },
    { field: "productionYear", headerName: "Năm sản xuất", width: 150 },
    { field: "warehouseName", headerName: "Đầu mối", flex: 1.1, minWidth: 180 },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 190,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" startIcon={<Edit />} onClick={() => openEdit(params.row.raw)}>Sửa</Button>
          <Button size="small" color="error" variant="contained" startIcon={<Delete />} onClick={() => remove(params.row.id)}>Xóa</Button>
        </Stack>
      ),
    },
  ];

  const rows = items.map((item) => ({
    id: item.id,
    productName: item.product?.name || "-",
    batch: item.batch,
    unit: item.unit || "viên",
    quantity: item.quantity,
    productionYear: item.productionYear,
    warehouseName: item.warehouse?.name || "-",
    raw: item,
  }));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 3 }}>
        <Box>
          <h1 className="text-3xl font-bold text-slate-800">NHẬP KHO ĐẠN DƯỢC</h1>
          <p className="mt-1 text-slate-500">Quản lý loại đạn, lô, số lượng và năm sản xuất.</p>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Thêm đạn dược</Button>
      </Box>

      <Box sx={{ height: 560, bgcolor: "white", borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Cập nhật đạn dược" : "Thêm đạn dược"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <select className="w-full rounded border p-2" value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value ? Number(event.target.value) : "" })}>
              <option value="">Chọn loại đạn từ danh sách thống kê vũ khí</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <input className="w-full rounded border p-2" placeholder="Lô đạn" value={form.batch} onChange={(event) => setForm({ ...form, batch: event.target.value })} />
            <input className="w-full rounded border p-2" placeholder="Đơn vị tính" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
            <input className="w-full rounded border p-2" type="number" min="0" placeholder="Số lượng" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
            <input className="w-full rounded border p-2" type="number" min="1900" max={new Date().getFullYear()} placeholder="Năm sản xuất" value={form.productionYear} onChange={(event) => setForm({ ...form, productionYear: event.target.value })} />
            <select className="w-full rounded border p-2" value={form.warehouseId} onChange={(event) => setForm({ ...form, warehouseId: event.target.value ? Number(event.target.value) : "" })}>
              <option value="">Chọn đầu mối</option>
              {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>Hủy</Button>
          <Button variant="contained" onClick={save} disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

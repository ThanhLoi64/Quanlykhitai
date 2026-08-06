import { useEffect, useRef, useState } from "react";
import api from "../api/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Box, Button } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
export default function Owner() {
  const [owners, setOwners] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openImportMenu, setOpenImportMenu] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    rank: "",
    position: "",
    department: "",
  });

  async function load() {
    const res = await api.get("/owners");

    setOwners(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "stt", headerName: "STT", width: 70 },
    { field: "fullName", headerName: "Họ tên", flex: 1.2 },
    { field: "rank", headerName: "Cấp bậc", flex: 1 },
    { field: "position", headerName: "Chức vụ", flex: 1 },
    { field: "department", headerName: "Đơn vị", flex: 1.2 },
    {
      field: "action",
      headerName: "Thao tác",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Button
            size="small"
            variant="contained"
            onClick={() => openEdit(params.row.raw)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => remove(params.row.raw.id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const rows = owners.map((o, index) => ({
    id: o.id,
    stt: index + 1,
    fullName: o.fullName || "-",
    rank: o.rank || "-",
    position: o.position || "-",
    department: o.department || "-",
    raw: o,
  }));

  function openCreate() {
    setEditId(null);

    setForm({
      fullName: "",
      rank: "",
      position: "",
      department: "",
    });

    setOpenModal(true);
  }

  function openEdit(owner: any) {
    setEditId(owner.id);

    setForm({
      fullName: owner.fullName || "",

      rank: owner.rank || "",

      position: owner.position || "",

      department: owner.department || "",
    });

    setOpenModal(true);
  }

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  }

  async function save() {
    try {
      if (editId) {
        await api.patch(`/owners/${editId}`, form);

        toast.success("Cập nhật thành công");
      } else {
        await api.post("/owners", form);

        toast.success("Thêm người sử dụng thành công");
      }

      setOpenModal(false);

      load();
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  }

  async function remove(id: number) {
    if (!confirm("Xóa người sử dụng này?")) return;

    try {
      await api.delete(`/owners/${id}`);

      toast.success("Đã xóa");

      load();
    } catch {
      toast.error("Xóa thất bại");
    }
  }
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(rows);

    try {
      await api.post("/owners/import", rows);

      toast.success("Import thành công");

      load();
    } catch {
      toast.error("Import thất bại");
    }

    e.target.value = "";
  }
  function downloadTemplate() {
    const link = document.createElement("a");
    link.href = "/danhsachquannhan.xlsx";
    link.download = "/danhsachquannhan.xlsx";
    link.click();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          DANH SÁCH QUÂN NHÂN
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setOpenImportMenu(!openImportMenu)}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700"
            >
              📥 Import Excel
              <span className="text-xs">▼</span>
            </button>

            {openImportMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-lg z-50">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setOpenImportMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  📂 Chọn file để import
                </button>

                <button
                  onClick={() => {
                    downloadTemplate();
                    setOpenImportMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 border-t"
                >
                  📄 Tải mẫu danhSachQuanNhan.xlsx
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700"
          >
            + Thêm quân nhân
          </button>
        </div>
      </div>

      <div className="mt-2 bg-white rounded-xl shadow overflow-hidden">
        <Box sx={{ height: 550, bgcolor: "white", borderRadius: 2 }}>
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

      {/* MODAL */}

      {openModal && (
        <div
          className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
"
        >
          <div
            className="
bg-white
rounded-xl
p-6
w-124
space-y-4
"
          >
            <h2 className="text-xl font-bold">
              {editId ? "Sửa người sử dụng" : "Thêm người sử dụng"}
            </h2>
            <input
              name="fullName"
              value={form.fullName}
              onChange={change}
              placeholder="Họ tên"
              className="
border
rounded
p-2
w-full
"
            />

            <input
              name="rank"
              value={form.rank}
              onChange={change}
              placeholder="Cấp bậc"
              className="
border
rounded
p-2
w-full
"
            />

            <input
              name="position"
              value={form.position}
              onChange={change}
              placeholder="Chức vụ"
              className="
border
rounded
p-2
w-full
"
            />

            <input
              name="department"
              value={form.department}
              onChange={change}
              placeholder="Đơn vị"
              className="
border
rounded
p-2
w-full
"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="
px-4
py-2
border
rounded
"
              >
                Hủy
              </button>

              <button
                onClick={save}
                className="
px-4
py-2
bg-blue-600
text-white
rounded
"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

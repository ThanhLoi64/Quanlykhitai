import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import api from "../api/api";
import { Box, Chip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

function statusLabel(status?: string) {
  if (status === "IN_STOCK") return "Trong kho";
  if (status === "ISSUED") return "Đã biên chế";
  if (status === "REPAIR") return "Đang sửa chữa";
  return status || "Chưa xác định";
}

export default function WeaponSearch() {
  const [query, setQuery] = useState("");
  const [searchField, setSearchField] = useState("product");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(value = query) {
    setLoading(true);
    try {
      const response = await api.get("/product-details/search", {
        params: { q: value.trim() || undefined, field: searchField },
      });
      setResults(response.data);
    } catch {
      toast.error("Không thể tra cứu dữ liệu khí tài");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => search(), 300);
    return () => window.clearTimeout(timer);
  }, [query, searchField]);

  const rows = results.map((item) => {
    const registration = item.registrations?.[0];
    return {
      id: item.id,
      productName: item.product?.name || "-",
      serialNumber: item.serialNumber || "-",
      warehouseName: item.warehouse?.name || "-",
      status: item.status,
      ownerName: item.owner?.fullName || registration?.owner?.fullName || "Chưa biên chế",
      department: item.owner?.department || "-",
      registeredAt: registration?.registeredAt
        ? new Date(registration.registeredAt).toLocaleDateString("vi-VN")
        : "-",
    };
  });

  const columns: GridColDef[] = [
    { field: "productName", headerName: "Khí tài", flex: 1.2, minWidth: 190 },
    { field: "serialNumber", headerName: "Số hiệu", flex: 1, minWidth: 140 },
    { field: "warehouseName", headerName: "Đầu mối", flex: 1, minWidth: 140 },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params) => (
        <Chip
          size="small"
          color={params.value === "IN_STOCK" ? "success" : params.value === "REPAIR" ? "warning" : "info"}
          label={statusLabel(params.value)}
        />
      ),
    },
    { field: "ownerName", headerName: "Người được biên chế", flex: 1.2, minWidth: 190 },
    { field: "department", headerName: "Đơn vị", flex: 1, minWidth: 140 },
    { field: "registeredAt", headerName: "Ngày đăng ký", width: 140 },
  ];

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Tra cứu tập trung</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-800">Tìm kiếm vũ khí - khí tài</h1>
        <p className="mt-2 text-slate-500">Tìm theo tên khí tài, số hiệu hoặc quân nhân đang được biên chế.</p>
      </header>

      <div className="flex max-w-4xl flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      
        <Search className="ml-2 text-slate-400" size={22} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") search();
          }}
          placeholder={searchField === "product" ? "Nhập tên khí tài..." : searchField === "serial" ? "Nhập số hiệu..." : "Nhập họ tên quân nhân..."}
          className="min-w-0 flex-1 px-2 py-2 outline-none"
        />
        {query && (
          <button title="Xóa tìm kiếm" onClick={() => setQuery("")} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        )}
          <select
          value={searchField}
          onChange={(event) => setSearchField(event.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
          aria-label="Trường tìm kiếm"
        >
          <option value="product">Tên khí tài</option>
          <option value="serial">Số hiệu</option>
          <option value="owner">Quân nhân</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-800">Kết quả tra cứu</h2>
          <span className="text-sm text-slate-500">{loading ? "Đang tìm..." : `${results.length} khí tài`}</span>
        </div>
        <Box sx={{ height: 430, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 20, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            localeText={{ noRowsLabel: "Không tìm thấy khí tài phù hợp." }}
            disableRowSelectionOnClick
          />
        </Box>
      </div>
    </div>
  );
}
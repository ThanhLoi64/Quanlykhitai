import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "sonner";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Box, Button, Chip } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useRef } from "react";
import * as XLSX from "xlsx";
import { downloadInventoryTemplate } from "../utils/excelTemplates";

function isAmmunition(product: any) {
  const text = `${product.name || ""} ${product.category?.name || ""}`.toLowerCase();
  return /đạn|dan duoc|đạn dược|ammunition/.test(text);
}

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all",
  );
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [serialInput, setSerialInput] = useState("");
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [importOrder, setImportOrder] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openImportMenu, setOpenImportMenu] = useState(false);
  const [filters] = useState({
    productId: "",
    serialNumber: "",
    accessory: "",
    equipment: "",
    militaryEquipment: "",
    status: "",
    warehouseId: "",
  });
  const columns: GridColDef[] = [
    // {
    //   field: "id",
    //   headerName: "ID",
    //   width: 90,
    // },
    {
      field: "stt",
      headerName: "STT",
      width: 80,
    },
    {
      field: "product",
      headerName: "Loại khí tài",
      flex: 1,
    },
    {
      field: "serialNumber",
      headerName: "Số hiệu",
      flex: 1,
    },
    {
      field: "importOrder",
      headerName: "Lệnh nhập kho",
      flex: 1,
    },
    {
      field: "warehouse",
      headerName: "Đầu mối",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params) => (
        <Chip
          size="small"
          color={
            params.value === "IN_STOCK"
              ? "success"
              : params.value === "REPAIR"
                ? "warning"
                : "error"
          }
          label={
            params.value === "IN_STOCK"
              ? "Trong kho"
              : params.value === "REPAIR"
                ? "Sửa chữa"
                : "Đã biên chế"
          }
        />
      ),
    },
    {
      field: "action",
      headerName: "Thao tác",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            onClick={() => openEditModal(params.row.raw)}
            size="small"
            variant="contained"
            startIcon={<Edit />}
          >
            Sửa
          </Button>
          {/* <Button 

            onClick={() => handleDelete(params.row.raw.id)}
            size="small"
            color="error"
            variant="outlined"
          >
            Xóa
          </Button> */}
        </Box>
      ),
    },
  ];

  async function load() {
    try {
      const productRes = await api.get("/products");
      const inventoryRes = await api.get("/inventory");
      const warehouseRes = await api.get("/warehouses");
      setWarehouses(warehouseRes.data);

      setProducts(productRes.data.filter((product: any) => !isAmmunition(product)));
      setItems(inventoryRes.data.filter((item: any) => !isAmmunition(item.product)));
    } catch {
      toast.error("Không tải được dữ liệu");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi kho?")) return;

    try {
      await api.delete(`/inventory/${id}`);
      toast.success("Xóa sản phẩm khỏi kho thành công");
      setOpen(false);
      setEditId(null);
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xóa sản phẩm thất bại");
    }
  }

  async function create() {
    const normalizedSerials = serialNumbers.map((serial) => serial.trim());
    if (!productId) {
      toast.error("Vui lòng chọn loại khí tài");
      return;
    }

    if (normalizedSerials.length < Number(quantity)) {
      toast.error(`Còn thiếu ${Number(quantity) - normalizedSerials.length} số hiệu`);
      return;
    }

    if (normalizedSerials.length > Number(quantity)) {
      toast.error(`Chỉ được thêm tối đa ${quantity} số hiệu`);
      return;
    }

    const duplicateInForm = new Set(normalizedSerials).size !== normalizedSerials.length;
    const duplicate = items.some(
      (item) =>
        item.productId === Number(productId) &&
        normalizedSerials.includes(item.serialNumber?.trim()),
    );

    if (duplicate || duplicateInForm) {
      toast.error("Số hiệu đã tồn tại vui lòng nhập lại");
      return;
    }

    try {
      await api.post("/inventory", {
        productId: Number(productId),
        warehouseId: Number(warehouseId),
        quantity: Number(quantity),
        serialNumber: normalizedSerials[0],
        serialNumbers: normalizedSerials,
        importOrder,
      });

      toast.success("Nhập kho thành công");

      setProductId("");
      setQuantity("1");
      setSerialInput("");
      setSerialNumbers([]);
      setImportOrder("");

      setOpen(false); // đóng modal

      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể nhập kho");
    }
  }

  function openCreateModal() {
    setEditId(null);
    setProductId("");
    setWarehouseId("");
    setQuantity("1");
    setSerialInput("");
    setSerialNumbers([]);
    setImportOrder("");
    setOpen(true);
  }

  function openEditModal(item: any) {
    setEditId(item.id);
    setProductId(String(item.productId || item.product?.id || ""));
    setWarehouseId(String(item.warehouseId || item.warehouse?.id || ""));
    setQuantity("1");
    setSerialInput(item.serialNumber || "");
    setSerialNumbers(item.serialNumber ? [item.serialNumber] : []);
    setImportOrder(item.importOrder || "");
    setOpen(true);
  }
  async function save() {
    const normalizedSerials = serialNumbers.map((serial) => serial.trim());
    if (!productId) {
      toast.error("Vui lòng chọn loại khí tài");
      return;
    }

    if (!normalizedSerials[0]) {
      toast.error("Vui lòng nhập số hiệu");
      return;
    }

    try {
      if (editId) {
        const duplicate = items.find(
          (item) =>
            item.id !== editId &&
            item.productId === Number(productId) &&
            item.serialNumber?.trim() === normalizedSerials[0],
        );

        if (duplicate) {
          toast.error("Số hiệu đã tồn tại vui lòng nhập lại");
          return;
        }

        await api.patch(`/inventory/${editId}`, {
          productId: Number(productId),
          warehouseId: Number(warehouseId),
          serialNumber: normalizedSerials[0],
          importOrder,
        });
        toast.success("Cập nhật thành công");
      } else {
        await create();
        return;
      }

      setEditId(null);
      setProductId("");
      setWarehouseId("");
      setQuantity("1");
      setSerialInput("");
      setSerialNumbers([]);
      setImportOrder("");
      setOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể lưu thay đổi");
    }
  }

  function addSerialNumber() {
    const serial = serialInput.trim();
    if (!serial) {
      toast.error("Vui lòng nhập số hiệu trước khi thêm");
      return;
    }

    if (!editId && serialNumbers.length >= Number(quantity)) {
      toast.error(`Chỉ được thêm tối đa ${quantity} số hiệu`);
      return;
    }

    if (serialNumbers.some((item) => item.trim() === serial)) {
      toast.error("Số hiệu này đã được thêm");
      return;
    }

    if (
      productId &&
      items.some(
        (item) =>
          item.productId === Number(productId) &&
          item.serialNumber?.trim() === serial,
      )
    ) {
      toast.error("Số hiệu đã tồn tại trong kho");
      return;
    }

    setSerialNumbers((current) => [...current, serial]);
    setSerialInput("");
  }
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data);

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

      // Nếu file excel dùng tiêu đề tiếng Việt
      const rows = rawRows.map((r) => ({
        productName: r["Loại khí tài"],
        serialNumber: r["Số hiệu"],
        importOrder: r["Lệnh nhập kho"],
        accessory: r["Phụ tùng"],
        equipment: r["Trang cụ"],
        militaryEquipment: r["Quân cụ"],
        warehouseName: r["Đầu mối"],
      }));

      await api.post("/inventory/import", rows);

      toast.success("Import thành công");

      load();
    } catch (err) {
      console.error(err);
      toast.error("Import thất bại");
    }

    e.target.value = "";
  }
  async function downloadTemplate() {
    try {
      await downloadInventoryTemplate({
        productNames: products.map((product) => product.name).filter(Boolean),
        warehouseNames: warehouses.map((warehouse) => warehouse.name).filter(Boolean),
      });
    } catch {
      toast.error("Không thể tạo file mẫu nhập kho");
    }
  }
  const filteredItems = items.filter((item) => {
    const matchCategory =
      selectedCategory === "all" ||
      item.product?.categoryId === Number(selectedCategory) ||
      item.product?.category?.id === Number(selectedCategory);

    return (
      matchCategory &&
      (!filters.productId || item.productId === Number(filters.productId)) &&
      (!filters.warehouseId ||
        item.warehouseId === Number(filters.warehouseId)) &&
      (!filters.serialNumber || item.serialNumber === filters.serialNumber) &&
      (!filters.accessory || item.accessory === filters.accessory) &&
      (!filters.equipment || item.equipment === filters.equipment) &&
      (!filters.militaryEquipment ||
        item.militaryEquipment === filters.militaryEquipment) &&
      (!filters.status || item.status === filters.status)
    );
  });
  const rows = filteredItems.map((i, index) => ({
    id: i.id,
    stt: index + 1,
    product: i.product?.name,
    serialNumber: i.serialNumber,
    importOrder: i.importOrder || "-",
    accessory: i.accessory || "-",
    equipment: i.equipment || "-",
    militaryEquipment: i.militaryEquipment || "-",
    warehouse: i.warehouse?.name || "-",
    status: i.status,
    raw: i,
  }));
  return (
    <div className="p-5 space-y-6">
      <div className="flex gap-2 border-b border-slate-200">
        {/* <NavLink to="/inventory" end className={({ isActive }) => `border-b-2 px-4 py-3 font-semibold ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>
          Khí tài, vũ khí
        </NavLink>
        <NavLink to="/inventory/ammunition" className={({ isActive }) => `border-b-2 px-4 py-3 font-semibold ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>
          Đạn dược
        </NavLink> */}
      </div>
      <h1 className="text-2xl font-bold">QUẢN LÝ KHO KHÍ TÀI - VŨ KHÍ</h1>

      {/* FORM */}
      <div className="flex justify-between items-center">
        <div className="mb-3 text-sm text-slate-400 uppercase">
          <span>ⓘ Theo dõi số hiệu Vũ khí, Khí tài</span>
        </div>
        <div className="flex justify-end gap-3 items-center">
          <div className="relative">
            <button
              onClick={() => setOpenImportMenu(!openImportMenu)}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
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
                  📄 Tải file mẫu danhsachkhitai.xlsx
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
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nhập kho mới
          </button>
        </div>
      </div>

      {/* TABLE */}

      {/* CATEGORY TABS */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="border-b">
          <div className="px-4 pt-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* TẤT CẢ */}
              <button
                onClick={() => setSelectedCategory("all")}
                className={`
            px-5 py-3 font-semibold whitespace-nowrap border-b-2 transition
            ${
              selectedCategory === "all"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-blue-600"
            }
          `}
              >
                Tất cả
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs">
                  {items.length}
                </span>
              </button>

              {/* CÁC DANH MỤC */}
              {[
                ...new Map(
                  products.map((p) => [
                    p.category?.id ?? p.categoryId,
                    p.category,
                  ]),
                ).values(),
              ]
                .filter(Boolean)
                .map((category: any) => {
                  const count = items.filter(
                    (item) =>
                      item.product?.categoryId === category.id ||
                      item.product?.category?.id === category.id,
                  ).length;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                  px-5 py-3 font-semibold whitespace-nowrap
                  border-b-2 transition
                  ${
                    selectedCategory === category.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-blue-600"
                  }
                `}
                    >
                      {category.name}

                      <span
                        className={`
                    ml-2 rounded-full px-2 py-1 text-xs
                    ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  `}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* TABLE */}

        <Box
          sx={{
            height: 500,
            bgcolor: "white",
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 20, 50, 100]}
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
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-6">
              {editId
                ? "CẬP NHẬT KHO VŨ KHÍ - KHÍ TÀI"
                : "NHẬP KHO VŨ KHÍ - KHÍ TÀI"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label>Loại khí tài</label>

                <select
                  className="w-full border rounded p-2 mt-1"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="">Chọn</option>

                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editId && (
                <div>
                  <label>Số lượng</label>

                  <input
                    type="number"
                    min="1"
                    className="w-full border rounded p-2 mt-1"
                    value={quantity}
                    onChange={(e) => {
                      const nextQuantity = Math.max(1, Number(e.target.value) || 1);
                      setQuantity(String(nextQuantity));
                    }}
                  />
                </div>
              )}

              <div className={!editId ? "md:col-span-2" : ""}>
                <label>Số hiệu</label>

                <div className="mt-1 flex gap-2">
                  <input
                    className="min-w-0 flex-1 border rounded p-2"
                    placeholder="Nhập số hiệu"
                    value={serialInput}
                    onChange={(e) => {
                      setSerialInput(e.target.value);
                      if (editId) setSerialNumbers([e.target.value]);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !editId) {
                        e.preventDefault();
                        addSerialNumber();
                      }
                    }}
                  />
                  {!editId && (
                    <button
                      type="button"
                      onClick={addSerialNumber}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-700 hover:bg-slate-200"
                    >
                      <Add fontSize="small" />
                      Thêm
                    </button>
                  )}
                </div>

                {!editId && serialNumbers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {serialNumbers.map((serial) => (
                      <Chip
                        key={serial}
                        label={serial}
                        onDelete={() =>
                          setSerialNumbers((current) =>
                            current.filter((item) => item !== serial),
                          )
                        }
                        variant="outlined"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label>Lệnh nhập kho</label>

                <input
                  className="w-full border rounded p-2 mt-1"
                  value={importOrder}
                  onChange={(e) => setImportOrder(e.target.value)}
                />
              </div>

              <div>
                <label>Đầu mối</label>
                <select
                  className="w-full border rounded p-2 mt-1"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                >
                  <option value="">Chọn</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {editId && (
                <button
                  onClick={() => handleDelete(editId)}
                  className="mr-auto flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2 text-white hover:bg-red-700"
                >
                  <Delete fontSize="small" />
                  Thu hồi khỏi kho
                </button>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  setEditId(null);
                }}
                className="px-5 py-2 rounded-lg border"
              >
                Hủy
              </button>

              <button
                onClick={save}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                {editId ? "Lưu thay đổi" : "Nhập kho"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

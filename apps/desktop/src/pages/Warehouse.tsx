import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "sonner";

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [open, setOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");
  const [tab] = useState<"list" | "tree">("list");
  const treeData = [
    {
      id: 1,
      name: "eBB2",
      children: [
        {
          id: 2,
          name: "dBB6",
          children: [
            {
              id: 3,
              name: "cBB9",
              children: [],
            },
            {
              id: 4,
              name: "cBB10",
              children: [],
            },
            {
              id: 5,
              name: "cBB11",
              children: [],
            },
            {
              id: 6,
              name: "cHL12",
              children: [],
            },
            {
              id: 7,
              name: "bTT",
              children: [],
            },
            {
              id: 8,
              name: "bSPG-9",
              children: [],
            },
            {
              id: 9,
              name: "b12,7mm",
              children: [],
            },
          ],
        },
      ],
    },
  ];

  async function load() {
    const res = await api.get("/warehouses");
    setWarehouses(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditId(null);
    setName("");
    setDescription("");
    setOpen(true);
  }

  function openEdit(w: any) {
    setEditId(w.id);
    setName(w.name);
    setDescription(w.description || "");
    setOpen(true);
  }

  async function save() {
    try {
      if (editId) {
        await api.patch(`/warehouses/${editId}`, {
          name,
          description,
        });

        toast.success("Cập nhật thành công");
      } else {
        await api.post("/warehouses", {
          name,
          description,
        });

        toast.success("Thêm đầu mối thành công");
      }

      setOpen(false);
      load();
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  }

  async function remove(id: number) {
    if (!confirm("Xóa đầu mối?")) return;

    await api.delete(`/warehouses/${id}`);

    toast.success("Đã xóa");

    load();
  }
  function TreeNode({ node }: any) {
    return (
      <div className="ml-6 mt-2">
        <div className="font-medium">📁 {node.name}</div>

        {node.children?.map((child: any) => (
          <TreeNode key={child.id} node={child} />
        ))}
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      {/* <div className="flex border-b mb-6">
        <button
          onClick={() => setTab("list")}
          className={`px-5 py-2 ${
            tab === "list" ? "border-b-2 border-blue-600 text-blue-600" : ""
          }`}
        >
          Danh sách
        </button>

        <button
          onClick={() => setTab("tree")}
          className={`px-5 py-2 ${
            tab === "tree" ? "border-b-2 border-blue-600 text-blue-600" : ""
          }`}
        >
          Phân cấp
        </button>
      </div> */}

      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Quản lý đầu mối</h1>

        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          + Thêm đầu mối
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {tab === "list" ? (
          <>
            {/* Table hiện tại của bạn */}
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">STT</th>

                  <th>Tên đầu mối</th>

                  <th>Mô tả</th>

                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {warehouses.map((w, index) => (
                  <tr key={w.id} className="border-t">
                    <td className="p-3">{index + 1}</td>

                    <td>{w.name}</td>

                    <td>{w.description || "-"}</td>

                    <td className="space-x-2">
                      <button
                        onClick={() => openEdit(w)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => remove(w.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            {treeData.map((item) => (
              <TreeNode key={item.id} node={item} />
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl w-[500px] p-6">
            <h2 className="text-xl font-bold mb-5">
              {editId ? "Cập nhật đầu mối" : "Thêm đầu mối"}
            </h2>

            <div className="space-y-4">
              <div>
                <label>Tên đầu mối</label>

                <input
                  className="w-full border rounded p-2 mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label>Mô tả</label>

                <textarea
                  className="w-full border rounded p-2 mt-1"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="border px-5 py-2 rounded"
              >
                Hủy
              </button>

              <button
                onClick={save}
                className="bg-blue-600 text-white px-6 py-2 rounded"
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

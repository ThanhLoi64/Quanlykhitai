import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import qbz95 from "../assets/img-weapons-qbz95.webp";
import { ScanSearch } from "lucide-react";
function InfoBox({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="font-medium text-slate-800">{value ?? "—"}</div>
    </div>
  );
}

export default function ProductDetail() {
  const [activeTab, setActiveTab] = useState("Thông tin");
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get(`/products/${id}`);

    setProduct(res.data);
  }

  if (!product) return <div>Đang tải...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div
        className="
        bg-white
        border
        rounded-xl
        shadow-sm
        p-5
      "
      >
       <div className="flex items-center justify-between mb-5">
  {/* Bên trái */}
  <button
    onClick={() => navigate(-1)}
    className="
      flex items-center
      gap-2
      px-4
      py-2
      rounded-lg
      border
      border-slate-300
      bg-white
      text-slate-700
      font-semibold
      hover:bg-blue-50
      hover:text-blue-600
      hover:border-blue-300
      transition
    "
  >
    ← Quay lại
  </button>

  {/* Tiêu đề */}
  <h1 className="flex-1 text-center text-2xl font-bold text-slate-800">
    Chi tiết khí tài trang bị
  </h1>

  {/* Placeholder để tiêu đề luôn ở giữa */}
  <div className="w-[120px]" />
</div>
        {/* SUMMARY */}

        <div
          className="
    grid
    grid-cols-1
    md:grid-cols-3
    gap-6
    items-start
  "
        >
          {/* ẢNH + TÊN */}
          <div
            className="
      md:col-span-4
      flex
      items-center
      gap-6
      bg-slate-50
      rounded-xl
      p-5
      border
    "
          >
            <div className="relative shrink-0">
              <img
                src={product.image || qbz95}
                alt={product.name}
                className="
    w-75
    h-50
    object-cover
    rounded-xl
    border
    shadow-sm
  "
              />

              <button
                type="button"
                onClick={() => setIsImageZoomed(true)}
                className="absolute bottom-2 right-2 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900"
                aria-label="Phóng to ảnh vũ khí"
                title="Phóng to ảnh vũ khí"
              >
                <ScanSearch size={16} aria-hidden="true" />
              </button>
            </div>

            <div>
              <h2
                className="
          text-2xl
          font-bold
          text-slate-900
          mb-2
        "
              >
                {product.name}
              </h2>

              <p className="text-slate-500">
                Danh mục: {product.category?.name || "-"}
              </p>
            </div>
          </div>

          {/* GHI CHÚ */}
          <div
            className="
      md:col-span-4
    "
          >
            <InfoBox label="Ghi chú" value={product.note} />
          </div>
        </div>
      </div>

      {isImageZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Ảnh vũ khí phóng to"
          onClick={() => setIsImageZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageZoomed(false)}
            className="absolute right-5 top-5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow hover:bg-slate-100"
            aria-label="Đóng ảnh phóng to"
          >
            Đóng
          </button>
          <img
            src={product.image || qbz95}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {/* TAB */}

      <div className="flex border-b overflow-x-auto">
        {["Thông tin", "Biên chế", "Lịch sử", "Tài liệu"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
    px-6
    py-4
    font-medium
    border-b-2
    transition

    ${
      activeTab === tab
        ? "text-blue-600 border-blue-600"
        : "text-slate-600 border-transparent hover:text-blue-600"
    }

  `}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {/* CHI TIẾT */}

      {/* CONTENT TAB */}

      <div
        className="
    bg-white
    border
    rounded-xl
    shadow-sm
    p-6
  "
      >
        {/* TAB THÔNG TIN */}

        {activeTab === "Thông tin" && (
          <div>
            <h2 className="text-xl font-bold mb-5">Thông tin chung</h2>

            <div
              className="
grid
grid-cols-1
md:grid-cols-3
gap-4
"
            >
              <InfoBox label="Tên sản phẩm" value={product.name} />

              <InfoBox label="Đơn vị tính" value={product.unit} />
              <InfoBox label="Danh mục" value={product.category?.name} />
              <InfoBox label="Xuất xứ" value={product.origin} />

              <InfoBox label="Phân cấp" value={product.classification} />

              <InfoBox label="Số lượng" value={product.quantity} />
            </div>
          </div>
        )}

        {/* TAB Biên chế */}

        {activeTab === "Biên chế" && (
          <div>
            <h2 className="text-xl font-bold mb-5">Danh sách Biên chế</h2>

            <div
              className="
      overflow-x-auto
      border
      rounded-xl
      "
            >
              <table
                className="
        w-full
        text-sm
        "
              >
                <thead
                  className="
          bg-slate-100
          "
                >
                  <tr>
                    <th className="p-3 text-left">STT</th>

                    <th className="p-3 text-left">Số hiệu</th>

                    <th className="p-3 text-left">Biên chế</th>

                    <th className="p-3 text-left">Chức vụ</th>
                    <th className="p-3 text-left">Đơn vị</th>

                    <th className="p-3 text-left">Trạng thái</th>

                    <th className="p-3 text-left">Ngày cấp</th>
                  </tr>
                </thead>

                <tbody>
                  {product.details
                    ?.filter((d: any) => d.owner)
                    .map((d: any, index: number) => (
                      <tr
                        key={d.id}
                        className="
              border-t
              hover:bg-slate-50
              "
                      >
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">{d.serialNumber}</td>

                        <td className="p-3">
                          {d.owner?.fullName || d.owner?.name || "-"}
                        </td>
                        <td className="p-3">{d.owner?.position || "-"}</td>
                        <td className="p-3">{d.owner?.department || "-"}</td>

                        <td className="p-3">
                          <span
                            className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs

                  ${
                    d.status === "ISSUED"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }

                  `}
                          >
                            {d.status === "ISSUED" ? "Đã biên chế" : "Trong kho"}
                          </span>
                        </td>

                        <td className="p-3">
                          {d.createdAt
                            ? new Date(d.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* TAB LỊCH SỬ */}

        {activeTab === "Lịch sử" && (
          <div>
            <h2 className="text-xl font-bold mb-5">Lịch sử sử dụng</h2>

            <p className="whitespace-pre-line text-slate-700">
              {product.usageHistory || "Chưa có dữ liệu lịch sử"}
            </p>
          </div>
        )}

        {/* TAB TÀI LIỆU */}

        {activeTab === "Tài liệu" && (
          <div>
            <h2 className="text-xl font-bold mb-5">Tài liệu</h2>

            <p className="whitespace-pre-line text-slate-700">
              {product.documents || "Chưa có tài liệu"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

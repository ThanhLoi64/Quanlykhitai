export default function Information() {
  return (
    <div className="min-h-screen py-10 px-6">

      <div className=" mx-auto bg-white rounded-2xl shadow-sm p-10">

        {/* Header */}
        <div className="border-b pb-8 mb-8">

          <h1 className="text-4xl font-bold text-slate-800">
            THÔNG TIN HỆ THỐNG
          </h1>

          <p className="mt-3 text-slate-500">
            Thông tin hệ thống quản lý khí tài, bao gồm phiên bản, chức năng và chính sách bảo mật.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Cập nhật lần cuối: 06/08/2026
          </p>

        </div>


        {/* About */}
        <Section title="1. Giới thiệu">

          <p>
            Hệ thống quản lý khí tài được xây dựng nhằm hỗ trợ
            quản lý thông tin sản phẩm, khí tài, người sử dụng
            và quá trình sửa chữa.
          </p>

          <p>
            Ứng dụng giúp đơn giản hóa việc theo dõi số lượng,
            vị trí lưu trữ, trạng thái và lịch sử sử dụng khí tài.
          </p>

        </Section>



        {/* Version */}
        <Section title="2. Thông tin phiên bản">

          <InfoRow
            label="Tên ứng dụng"
            value="Hệ thống quản lý khí tài"
          />

          <InfoRow
            label="Phiên bản"
            value="1.0.0"
          />

          {/* <InfoRow
            label="Frontend"
            value="Electron + React + TypeScript"
          />

          <InfoRow
            label="Backend"
            value="NestJS + Prisma"
          />

          <InfoRow
            label="Database"
            value="PostgreSQL"
          /> */}

        </Section>



        {/* Features */}
        <Section title="3. Chức năng hệ thống">

          <ul className="list-disc pl-6 space-y-2">

            <li>
              Quản lý danh mục thiết bị
            </li>

            <li>
              Quản lý thông tin sản phẩm
            </li>

            <li>
              Theo dõi chi tiết thiết bị
            </li>

            <li>
              Quản lý người dùng và phân quyền
            </li>

            <li>
              Xuất báo cáo Excel
            </li>

          </ul>

        </Section>



        {/* Privacy */}
        <Section title="4. Chính sách bảo mật">

          <p>
            Hệ thống sử dụng cơ chế xác thực JWT để bảo vệ
            tài khoản người dùng.
          </p>

          <p>
            Mỗi tài khoản chỉ được phép truy cập các chức năng
            theo quyền được cấp.
          </p>

          <p>
            Dữ liệu hệ thống được lưu trữ an toàn và chỉ phục vụ
            mục đích quản lý nội bộ.
          </p>

        </Section>



        {/* Permission */}
        <Section title="5. Quyền người dùng">

          <div className="space-y-4">

            <div className="border rounded-xl p-4">

              <h3 className="font-bold text-lg">
                ADMIN
              </h3>

              <p className="text-slate-600 mt-1">
                Có toàn quyền quản lý dữ liệu,
                tài khoản và cấu hình hệ thống.
              </p>

            </div>


            <div className="border rounded-xl p-4">

              <h3 className="font-bold text-lg">
                STAFF
              </h3>

              <p className="text-slate-600 mt-1">
                Có quyền xem thông tin và sử dụng
                các chức năng được cấp phép.
              </p>

            </div>

          </div>

        </Section>



        {/* Contact */}
        <Section title="6. Liên hệ">

          <p>
            Nếu gặp vấn đề trong quá trình sử dụng,
            vui lòng liên hệ bộ phận quản trị hệ thống.
          </p>

        </Section>



        {/* Footer */}
        <div className="border-t mt-10 pt-6 text-center text-sm text-slate-400">

          © 2026 Equipment Management System

        </div>


      </div>

    </div>
  );
}



function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {

  return (
    <section className="mb-10">

      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        {title}
      </h2>

      <div className="text-slate-600 leading-8 space-y-3">
        {children}
      </div>

    </section>
  );
}



function InfoRow({
  label,
  value,
}: {
  label:string;
  value:string;
}) {

  return (
    <div className="flex border-b py-3">

      <span className="w-48 text-slate-500">
        {label}
      </span>

      <span className="font-medium text-slate-800">
        {value}
      </span>

    </div>
  );
}
import ExcelJS from "exceljs";

type InventoryTemplateData = {
  productNames: string[];
  warehouseNames: string[];
};

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };
  row.alignment = { vertical: "middle", horizontal: "center" };
}

function addListValidation(
  worksheet: ExcelJS.Worksheet,
  cellRange: string,
  listSheet: ExcelJS.Worksheet,
  listColumn: string,
  values: string[],
) {
  values.forEach((value, index) => {
    listSheet.getCell(`${listColumn}${index + 2}`).value = value;
  });

  const endRow = Math.max(values.length + 1, 2);
  const [startCell, endCell] = cellRange.split(":");
  const startRow = Number(startCell.replace(/\D/g, ""));
  const endCellRow = Number(endCell.replace(/\D/g, ""));
  const column = startCell.replace(/\d/g, "");

  for (let row = startRow; row <= endCellRow; row += 1) {
    worksheet.getCell(`${column}${row}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`Lists!$${listColumn}$2:$${listColumn}$${endRow}`],
    };
  }
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadInventoryTemplate({
  productNames,
  warehouseNames,
}: InventoryTemplateData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Nhập kho");
  const lists = workbook.addWorksheet("Lists");
  lists.state = "hidden";

  worksheet.columns = [
    { header: "Loại khí tài", key: "productName", width: 28 },
    { header: "Số hiệu", key: "serialNumber", width: 24 },
    { header: "Lệnh nhập kho", key: "importOrder", width: 24 },
    { header: "Đầu mối", key: "warehouseName", width: 28 },
    { header: "Trạng thái", key: "status", width: 18 },
  ];
  styleHeader(worksheet.getRow(1));
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  addListValidation(worksheet, "A2:A501", lists, "A", productNames);
  addListValidation(worksheet, "D2:D501", lists, "B", warehouseNames);
  addListValidation(worksheet, "E2:E501", lists, "C", [
    "IN_STOCK",
    "REPAIR",
    "AVAILABLE",
  ]);

  await downloadWorkbook(workbook, "mau-nhap-kho.xlsx");
}

export async function downloadOwnerTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Quân nhân");

  worksheet.columns = [
    { header: "Họ tên", key: "fullName", width: 28 },
    { header: "Cấp bậc", key: "rank", width: 20 },
    { header: "Chức vụ", key: "position", width: 24 },
    { header: "Đơn vị", key: "department", width: 28 },
  ];
  styleHeader(worksheet.getRow(1));
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  await downloadWorkbook(workbook, "mau-quan-nhan.xlsx");
}

import { useEffect, useState } from "react";
import api from "../api/api";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Refresh } from "@mui/icons-material";

export default function Log() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadLogs() {
    try {
      setLoading(true);
      const res = await api.get("/logs");
      setLogs(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "username", headerName: "Người dùng", flex: 1, minWidth: 150 },
    { field: "action", headerName: "Hành động", flex: 1, minWidth: 180 },
    { field: "detail", headerName: "Chi tiết", flex: 1.5, minWidth: 220 },
    {
      field: "createdAt",
      headerName: "Thời gian",
      width: 180,
      valueGetter: ({ value }) =>
        value ? new Date(value).toLocaleString() : "",
    },
  ];

  const rows = logs.map((item) => ({
    id: item.id,
    username: item.username || item.userId || "",
    action: item.action,
    detail: item.detail,
    createdAt: item.createdAt,
  }));

  return (
    <Box>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
        <div>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            NHẬT KÝ HỆ THỐNG
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Danh sách hành động và sự kiện tạo bởi người dùng.
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={loadLogs}
          disabled={loading}
        >
          Làm mới
        </Button>
      </div>

      <Card>
        <CardContent>
          <div style={{ height: 540, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[10, 20, 50]}
              loading={loading}
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
    </Box>
  );
}

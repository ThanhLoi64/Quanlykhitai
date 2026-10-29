import { useEffect, useState } from "react";
import api from "../api/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import {History } from "@mui/icons-material";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatLogMessage, type ActivityLog } from "../utils/activityLog";

export default function Log() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

async function loadLogs() {
  try {
    setLoading(true);
    const res = await api.get("/logs");
    setLogs(res.data.slice(0, 3));
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadLogs();
  }, []);


  function formatTime(date: string) {
    return new Date(date).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <Box>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">HOẠT ĐỘNG GẦN ĐÂY</h2>
           <p className="mt-1 text-sm text-slate-500">
            Lịch sử thao tác của người dùng
          </p>
        </div>
        <Link
          to="/logs"
          aria-label="Mở trang theo dõi hư hỏng và sửa chữa"
          title="Xem tất cả hồ sơ"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <CircularProgress />
            </div>
          ) : logs.length === 0 ? (
            <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex gap-4">
                    <History
                      sx={{
                        color: "primary.main",
                        mt: 0.5,
                      }}
                    />

                    <div className="flex-1">
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(log.createdAt)}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{ mt: 0.5, lineHeight: 1.8 }}
                      >
                        <strong>{log.username || log.user?.username || "Không rõ"}</strong>{" "}
                        {formatLogMessage(log)}
                      </Typography>
                    </div>
                  </div>

                  {index < logs.length - 1 && <Divider sx={{ my: 2 }} />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

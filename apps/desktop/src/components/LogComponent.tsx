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

export default function Log() {
  const [logs, setLogs] = useState<any[]>([]);
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
          <h1 className="text-2xl font-bold mb-1">HOẠT ĐỘNG GẦN ĐÂY</h1>
          <Typography color="text.secondary">
            Lịch sử thao tác của người dùng
          </Typography>
        </div>
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
              {logs.map((log: any, index: number) => (
                <div key={log.id}>
                  <div className="flex gap-4">
                    <History
                      sx={{
                        color: "#1976d2",
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
                        <strong>
                           Người dùng: {log.username || log.user?.username || "Không rõ"}
                        </strong>{" "}
                        <span className="font-semibold text-blue-600">
                          {log.action?.toLowerCase()}
                        </span>{" "}
                        {log.detail}
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

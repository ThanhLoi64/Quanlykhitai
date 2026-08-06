import { useEffect, useState } from "react";
import api from "../api/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
} from "@mui/material";
import { Refresh, History, DeleteSweep } from "@mui/icons-material";
import { toast } from "sonner";

export default function Log() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  async function deleteLogs() {
    if (confirmText.trim().toLowerCase() !== "xác nhận xóa nhật ký") {
      toast.error("Vui lòng nhập đúng dòng xác nhận.");
      return;
    }

    if (!password.trim()) {
      toast.error("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setDeleting(true);
      const toastId = toast.loading("Đang xóa nhật ký...");

      await api.delete("/logs", {
        data: {
          confirmationText: confirmText.trim(),
          password,
        },
      });

      toast.dismiss(toastId);
      toast.success("Đã xóa toàn bộ nhật ký.");
      setDeleteModalOpen(false);
      setConfirmText("");
      setPassword("");
      await loadLogs();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Xóa nhật ký thất bại.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

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
          <h1 className="text-2xl font-bold mb-1">NHẬT KÝ HOẠT ĐỘNG</h1>
          <Typography color="text.secondary">
            Lịch sử thao tác của người dùng.
          </Typography>
        </div>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={loadLogs}
            disabled={loading}
          >
            Làm mới
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweep />}
            onClick={() => setDeleteModalOpen(true)}
            disabled={loading || deleting}
          >
            Xóa nhật ký
          </Button>
        </Stack>
      </div>

      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Xác nhận xóa nhật ký</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: { xs: 280, sm: 360 } }}>
            <Typography color="text.secondary">
              Nhập 
              <strong> "xác nhận xóa nhật ký" </strong>
               và mật khẩu đăng nhập để xóa toàn bộ nhật ký.
            </Typography>

            <TextField
              label="xác nhận xóa nhật ký"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              fullWidth
            />

            <TextField
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  deleteLogs();
                }
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
            Hủy
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={deleteLogs}
            disabled={deleting}
          >
            {deleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

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

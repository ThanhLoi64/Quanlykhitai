import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  InputAdornment,
} from "@mui/material";
import { LockOutlined, Person, Lock } from "@mui/icons-material";
import { toast } from "sonner";
import api from "../api/api";
import loginBg from "../assets/khitai.avif";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const toastId = toast.loading("Đang đăng nhập...");

    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.dismiss(toastId);
      toast.success("Đăng nhập thành công");

      navigate("/dashboard");
    } catch (err: any) {
      toast.dismiss(toastId);

      // Không kết nối được server
      if (!err.response) {
        toast.error(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.",
        );
        return;
      }

      const status = err.response.status;

      switch (status) {
        case 400:
          toast.error(err.response.data?.message || "Dữ liệu không hợp lệ.");
          break;

        case 401:
          toast.error("Sai tên đăng nhập hoặc mật khẩu.");
          break;

        case 403:
          toast.error("Bạn không có quyền thực hiện thao tác này.");
          break;

        case 404:
          toast.error("Không tìm thấy máy chủ hoặc API.");
          break;

        case 500:
          toast.error("Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.");
          break;

        default:
          toast.error(
            err.response.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
          );
          break;
      }
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        position: "relative",

        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
        },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: 320,
          borderRadius: 4,
          p: 5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "red",
              width: 70,
              height: 70,
              mb: 2,
            }}
          >
            <LockOutlined fontSize="large" />
          </Avatar>

          <Typography component="h1" variant="h4" sx={{ fontWeight: "bold" }}>
            Quản lý khí tài
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            Đăng nhập để tiếp tục
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          fullWidth
          type="password"
          label="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              login();
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: 16,
            color: "white",
            backdropFilter: "blur(10px)",
            backgroundColor: "red",
            "&:hover": {
              background: "rgba(153, 27, 27, 0.7)",
            },
          }}
          onClick={login}
        >
          Đăng nhập
        </Button>

        <Typography
          align="center"
          color="text.secondary"
          sx={{ mt: 4, fontSize: 14 }}
        >
          © 2026 Hệ thống quản lý khí tài
        </Typography>
      </Paper>
    </Box>
  );
}

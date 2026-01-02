import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Link,
  Alert,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";

import kopiakuLogo from "../assets/kopiaku-logo.png";
import useAuthStore from "../stores/authStore";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const loginData = await login(formData.username, formData.password);
      console.log(loginData);
      if (!loginData.presence && loginData.role !== "Admin") {
        navigate({ to: "/photo-verification" });
        return;
      }
      // Navigate to dashboard
      navigate({ to: "/dashboard" });
    } catch (error) {
      setError(error.message || "Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box sx={{ m: 1, display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={kopiakuLogo}
                alt="Kopiaku Logo"
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>
          <Typography component="h1" variant="h5">
            Masuk ke Kopiaku
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleInputChange("username")}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange("password")}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || !formData.username || !formData.password}
            >
              {isLoading ? "Sedang Masuk..." : "Masuk"}
            </Button>
          </Box>
        </Paper>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 2 }}
        >
          {"Copyright © "}
          <Link color="inherit" href="#">
            Kopiaku
          </Link>{" "}
          {new Date().getFullYear()}
          {"."}
        </Typography>
      </Box>
    </Container>
  );
}

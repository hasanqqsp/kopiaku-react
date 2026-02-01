import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Avatar,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { updateMyProfile, changePassword } from "../utils/api";
import useAuthStore from "../stores/authStore";
import Grid from "@mui/material/Grid";
export default function AccountPage() {
  const { user, setUser } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    name: "",
    nickname: "",
    email: "",
    contact: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        nickname: user.nickname || "",
        email: user.email || "",
        contact: user.contact || "",
      });
      setProfilePicturePreview(user.profilePictureUrl);
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setSuccess("");
  };

  const handleProfileChange = (field) => (event) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfilePicturePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const updatedUser = await updateMyProfile({
        ...profileData,
        profilePicture,
      });
      setUser(updatedUser);
      setSuccess("Profil berhasil diperbarui");
    } catch (err) {
      setError(err.message || "Gagal memperbarui profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess("Password berhasil diubah");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Gagal mengubah password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Akun Saya
        </Typography>

        <Paper elevation={3} sx={{ mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Profil" />
            <Tab label="Ubah Password" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ m: 2 }}>
              {success}
            </Alert>
          )}

          {tabValue === 0 && (
            <Box component="form" onSubmit={handleProfileSubmit} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informasi Profil
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }} display="flex" justifyContent="center">
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={profilePicturePreview}
                      sx={{ width: 150, height: 150 }}
                    />
                    <IconButton
                      color="primary"
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "white",
                      }}
                    >
                      <PhotoCamera />
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleProfilePictureChange}
                      />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Nama"
                    value={profileData.name}
                    onChange={handleProfileChange("name")}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Nickname"
                    value={profileData.nickname}
                    onChange={handleProfileChange("nickname")}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange("email")}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Kontak"
                    value={profileData.contact}
                    onChange={handleProfileChange("contact")}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{ mt: 2 }}
                  >
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 1 && (
            <Box component="form" onSubmit={handlePasswordSubmit} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ubah Password
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Password Lama"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange("currentPassword")}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Password Baru"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange("newPassword")}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Konfirmasi Password Baru"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange("confirmPassword")}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{ mt: 2 }}
                  >
                    {isLoading ? "Mengubah..." : "Ubah Password"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

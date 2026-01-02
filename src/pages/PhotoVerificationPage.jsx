import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Alert,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "@tanstack/react-router";
import { checkIn } from "../utils/api";

export default function PhotoVerificationPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedPhotoFile, setCapturedPhotoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const navigate = useNavigate();

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      setError("");
      setIsLoading(true);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Use front camera for selfie
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera dan menggunakan browser yang mendukung."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        const photoUrl = URL.createObjectURL(blob);
        setCapturedPhoto(photoUrl);
        setCapturedPhotoFile(
          new File([blob], "photo.jpg", { type: "image/jpeg" })
        );
        stopCamera(); // Stop camera after capture
      },
      "image/jpeg",
      0.8
    );
  };

  const retakePhoto = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
      setCapturedPhoto(null);
    }
    startCamera();
  };

  const submitPhoto = async () => {
    if (!capturedPhoto) return;

    setIsLoading(true);
    try {
      // Simulate API call to submit photo
      await checkIn({ file: capturedPhotoFile });

      // Navigate back to attendance page or dashboard
      navigate({ to: "/employees" });
    } catch {
      setError("Gagal mengirim foto. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Verifikasi Foto Masuk Shift
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Ambil foto selfie untuk verifikasi kehadiran Anda
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          {!capturedPhoto ? (
            // Camera view
            <Box>
              <Typography variant="h6" gutterBottom>
                Posisikan wajah Anda di depan kamera
              </Typography>

              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 640,
                  height: 480,
                  mx: "auto",
                  mb: 2,
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#f5f5f5",
                }}
              >
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "text.secondary",
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress />
                    ) : (
                      <>
                        <CameraAltIcon sx={{ fontSize: 48, mb: 2 }} />
                        <Typography>Menunggu akses kamera...</Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CameraAltIcon />}
                  onClick={capturePhoto}
                  disabled={!cameraActive || isLoading}
                  size="large"
                >
                  Ambil Foto
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={retakePhoto}
                  disabled={isLoading}
                >
                  Mulai Ulang
                </Button>
              </Box>
            </Box>
          ) : (
            // Photo preview
            <Box>
              <Typography variant="h6" gutterBottom>
                Pratinjau Foto
              </Typography>

              <Card sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    component="img"
                    src={capturedPhoto}
                    alt="Captured photo"
                    sx={{
                      width: "100%",
                      height: 300,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={retakePhoto}
                    disabled={isLoading}
                  >
                    Ambil Ulang
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <CheckCircleIcon />
                      )
                    }
                    onClick={submitPhoto}
                    disabled={isLoading}
                  >
                    {isLoading ? "Mengirim..." : "Kirim untuk Verifikasi"}
                  </Button>
                </CardActions>
              </Card>

              <Alert severity="info" sx={{ mt: 2 }}>
                Pastikan foto Anda jelas dan wajah terlihat dengan baik untuk
                verifikasi kehadiran.
              </Alert>
            </Box>
          )}
        </Paper>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </Box>
    </Container>
  );
}

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import HomeIcon from '@mui/icons-material/Home';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { keyframes } from '@mui/system';

// Animation for floating effect
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Animation for pulse effect
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate({ to: '/dashboard' });
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 32px)',
        minWidth: 'calc(100vw - 32px)',
        background: 'linear-gradient(135deg, #2a1bed 0%, #1e40af 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        overflow: 'hidden',
        top: 0,
        left: 0,
        m: 0,
        p: 2
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          animation: `${float} 8s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          animation: `${float} 7s ease-in-out infinite`,
        }}
      />

      <Paper
        elevation={24}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #2a1bed 0%, #6366f1 50%, #9333ea 100%)',
          }
        }}
      >
        {/* 404 Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            animation: `${pulse} 3s ease-in-out infinite`,
          }}
        >
          <SearchOffIcon
            sx={{
              fontSize: { xs: 80, md: 100 },
              color: '#2a1bed',
              filter: 'drop-shadow(0 4px 8px rgba(42, 27, 237, 0.3))',
            }}
          />
        </Box>

        {/* 404 Text */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '4rem', md: '6rem' },
            fontWeight: 900,
            background: 'linear-gradient(90deg, #2a1bed 0%, #6366f1 50%, #9333ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 2,
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}
        >
          404
        </Typography>

        {/* Main Message */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1f2937',
            mb: 2,
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          Halaman Tidak Ditemukan
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: '#6b7280',
            mb: 4,
            lineHeight: 1.6,
            fontSize: { xs: '1rem', md: '1.125rem' }
          }}
        >
          Maaf, halaman yang Anda cari tidak dapat ditemukan. 
          Mungkin halaman tersebut telah dipindahkan atau tidak tersedia.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(90deg, #2a1bed 0%, #6366f1 100%)',
              textTransform: 'none',
              boxShadow: '0 8px 25px rgba(42, 27, 237, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(42, 27, 237, 0.4)',
                background: 'linear-gradient(90deg, #1e40af 0%, #4f46e5 100%)',
              }
            }}
          >
            Kembali ke Dashboard
          </Button>

          <Button
            variant="text"
            onClick={() => window.history.back()}
            sx={{
              color: '#6b7280',
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                color: '#2a1bed',
                backgroundColor: 'rgba(42, 27, 237, 0.04)',
              }
            }}
          >
            ← Kembali ke halaman sebelumnya
          </Button>
        </Box>

        {/* Bottom decoration */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(42, 27, 237, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            zIndex: -1,
          }}
        />
      </Paper>
    </Box>
  );
}

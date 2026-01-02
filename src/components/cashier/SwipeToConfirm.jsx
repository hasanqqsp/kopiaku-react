import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const SwipeToConfirm = ({ onConfirm, disabled = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const trackRef = useRef(null);
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [translate, setTranslate] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const calcMax = () => {
    const track = trackRef.current;
    const knob = knobRef.current;
    if (!track || !knob) return 0;
    return track.clientWidth - knob.clientWidth - 4; // small padding
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || disabled) return;
    const track = trackRef.current;
    const knob = knobRef.current;
    if (!track || !knob) return;
    const rect = track.getBoundingClientRect();
    const knobW = knob.clientWidth;
    let x = e.clientX - rect.left - knobW / 2;
    const max = calcMax();
    if (x < 0) x = 0;
    if (x > max) x = max;
    setTranslate(x);
    // auto-confirm threshold
    if (x >= max * 0.88 && !confirmed) {
      setConfirmed(true);
      // small delay for UX
      setTimeout(() => onConfirm(), 150);
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const max = calcMax();
    if (translate < max * 0.92) {
      // snap back
      setTranslate(0);
      setConfirmed(false);
    } else {
      setTranslate(max);
    }
  };

  return (
    <Box sx={{ width: 1 }}>
      <Box
        ref={trackRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        sx={{
          height: 56,
          bgcolor: disabled ? "grey.200" : "grey.100",
          borderRadius: 4,
          position: "relative",
          display: "flex",
          alignItems: "center",
          px: 2,
          userSelect: "none",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 12,
            right: 12,
            textAlign: "center",
            color: disabled ? "text.disabled" : "text.secondary",
            pointerEvents: "none",
          }}
        >
          <Typography variant="body1">
            {disabled
              ? "Memproses..."
              : confirmed
              ? "Terkonfirmasi"
              : "Geser untuk Konfirmasi"}
          </Typography>
        </Box>

        <Box
          ref={knobRef}
          onPointerDown={handlePointerDown}
          sx={{
            width: isMobile ? 50 : 72,
            height: 44,
            borderRadius: 2,
            bgcolor: disabled ? "grey.400" : "primary.main",
            color: disabled ? "grey.600" : "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            left: 6,
            transform: `translateX(${translate}px)`,
            transition: isDragging ? "none" : "transform 200ms ease",
            boxShadow: 2,
            touchAction: "none",
            cursor: disabled ? "not-allowed" : "grab",
            pointerEvents: disabled ? "none" : "auto",
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 28 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default SwipeToConfirm;

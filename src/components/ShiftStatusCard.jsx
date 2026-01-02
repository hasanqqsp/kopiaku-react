import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";

function ShiftStatusCard({ user }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Status Shift
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={
                user?.presence?.checkInTime ? "Sedang Berlangsung" : "Selesai"
              }
              color={user?.presence?.checkInTime ? "info" : "default"}
              size="small"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Shift anda dimulai pada{" "}
            {new Date(user?.presence?.checkInTime).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ShiftStatusCard;

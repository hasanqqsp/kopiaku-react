import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

const currency = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    value
  );

function SalesCard({ title, amount, count }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h6" color="primary">
            {currency(amount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {count} transaksi
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default SalesCard;

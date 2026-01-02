import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InstagramIcon from "@mui/icons-material/Instagram";

import kopiakuLogo from "../assets/kopiaku-logo.png";
import { getTransactionDetailsAPI } from "../utils/api";

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = d.getSeconds().toString().padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${s}`;
  } catch {
    return iso;
  }
}

export default function TransactionDetailPage() {
  const { id } = useParams({
    // from: "/transactions/$id",
    strict: false,
  });
  const navigate = useNavigate({ from: "/" });

  const [transaction, setTransaction] = useState(null);
  const [transactionItems, setTransactionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!id) {
        setError("Transaction ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch transaction details
        const transactionData = await getTransactionDetailsAPI(id);

        // Map menuItems to include menu details
        const itemsWithDetails = transactionData.menuItems.map((item) => {
          return {
            id: item.menuId,
            name: item.name,
            price: item.unitPrice,
            quantity: item.quantity,
          };
        });

        console.log(transactionData);

        setTransaction(transactionData);
        setTransactionItems(itemsWithDetails);
      } catch (err) {
        console.error("Error fetching transaction details:", err);
        setError("Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  const subtotal = transactionItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: "/transactions" })}
          sx={{ mb: 2 }}
        >
          Kembali
        </Button>
        <Paper sx={{ p: 3 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: "/transactions" })}
          sx={{ mb: 2 }}
        >
          Kembali
        </Button>
        <Paper sx={{ p: 3 }}>
          <Typography align="center">Transaction not found</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <style>{`
        /* Print styles: use 58mm width and let height flow to content. Also set @page size when supported. */
        @media print {
          @page { size: 58mm auto; margin: 2mm; }
          body * { visibility: hidden !important; }
          .receipt-print, .receipt-print * { visibility: visible !important; }
          /* 58mm thermal paper */
          .receipt-print { position: absolute !important; left: 0; top: 0; width: 58mm; padding: 4mm; background: #fff; height: auto !important; display: block !important; }
          .receipt-print img { width: 20mm; height: auto; }
          .receipt-print { font-size: 10pt; }
        }
        .receipt-print {
            display:none;
        }
      `}</style>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate({ to: "/transactions" })}
        sx={{ mb: 2 }}
      >
        Kembali
      </Button>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography variant="h5" gutterBottom>
                  Detail Transaksi
                </Typography>
                <Typography variant="h6" color="primary">
                  {transaction.id}
                </Typography>
              </Box>
              <Chip
                label={transaction.status}
                color={
                  transaction.status === "VERIFIED" ? "success" : "warning"
                }
                size="large"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Transaction Info */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Waktu Transaksi
              </Typography>
              <Typography variant="body1">
                {formatDateTime(transaction.transactionDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Kasir
              </Typography>
              <Typography variant="body1">
                {transaction.user
                  ? transaction.user.name
                  : `User ${transaction.userId}`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Metode Pembayaran
              </Typography>
              <Typography variant="body1">QRIS</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Kode QRIS
              </Typography>
              <Typography variant="body1">
                {transaction.qrisOrderId || "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Waktu Pembayaran
              </Typography>
              <Typography variant="body1">
                {transaction.qrisTransactionTime
                  ? formatDateTime(transaction.qrisTransactionTime)
                  : "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Pendapatan Bersih
              </Typography>
              <Typography variant="body1">
                {transaction.netAmount
                  ? `Rp ${transaction.netAmount.toLocaleString("id-ID")}`
                  : "-"}
              </Typography>
            </Grid>
          </Grid>

          <Divider />

          {/* Items Table */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Daftar Item
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Harga</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">
                        Rp {item.price.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          {/* Totals */}
          <Box>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">
                  Rp {subtotal.toLocaleString("id-ID")}
                </Typography>
              </Stack>

              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  Rp {transaction.totalAmount.toLocaleString("id-ID")}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => window.print()}>
              Print Receipt
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* On-page printable receipt (used by @media print) */}
      <Box
        className="receipt-print"
        sx={{
          display: "none",
          p: 1,
          width: "58mm",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <img
            src={kopiakuLogo}
            alt="logo"
            style={{ width: 64, height: "auto" }}
          />
          <Typography variant="h6">Kopiaku</Typography>
          <Typography variant="body2" color="text.secondary">
            Jl. Ahmad Yani No. 2 RT.05/RW.04
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tanah Sareal, Kota Bogor, Jawa Barat, 16161
          </Typography>
          <Typography variant="body2" color="text.secondary">
            082298958382
          </Typography>
        </Box>

        <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">Transaksi</Typography>
          <Typography variant="body2">{transaction.id}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">Waktu</Typography>
          <Typography variant="body2">
            {formatDateTime(transaction.transactionDate)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Kasir</Typography>
          <Typography variant="body2">
            {transaction.user
              ? transaction.user.name
              : `User ${transaction.userId}`}
          </Typography>
        </Box>
        <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />

        {transactionItems.map((it) => (
          <Box
            key={it.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "monospace",
              mb: 0.5,
            }}
          >
            <div>{`${it.quantity}x ${it.name}`}</div>
            <div>Rp {(it.price * it.quantity).toLocaleString("id-ID")}</div>
          </Box>
        ))}

        <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography>Subtotal</Typography>
          <Typography>Rp {subtotal.toLocaleString("id-ID")}</Typography>
        </Box>

        <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography>Total</Typography>
          <Typography>
            <strong>
              Rp {transaction.totalAmount.toLocaleString("id-ID")}
            </strong>
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "center",
            mt: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <InstagramIcon /> @kopiakuu
        </Box>
      </Box>
    </Box>
  );
}

import React from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import InstagramIcon from "@mui/icons-material/Instagram";
import PrintIcon from "@mui/icons-material/Print";
import kopiakuLogo from "../../assets/kopiaku-logo.png";

const currency = (v) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    v
  );

const ReceiptDialog = ({ open, onClose, receipt }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      {/* On-page printable receipt (used by @media print) */}
      <Box
        className="receipt-print"
        sx={{
          display: receipt ? "block" : "none",
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

        {receipt && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Transaksi</Typography>
              <Typography variant="body2">{receipt.id}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Waktu</Typography>
              <Typography variant="body2">{receipt.time}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2">Kasir</Typography>
              <Typography variant="body2">{receipt.cashier}</Typography>
            </Box>
            <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />

            {receipt.items.map((it) => (
              <Box
                key={it.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "monospace",
                  mb: 0.5,
                }}
              >
                <div>{`${it.qty}x ${it.name}`}</div>
                <div>{currency(it.price * it.qty)}</div>
              </Box>
            ))}

            <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Subtotal</Typography>
              <Typography>{currency(receipt.total)}</Typography>
            </Box>
            <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>Total</Typography>
              <Typography>
                <strong>{currency(receipt.total)}</strong>
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
          </>
        )}
      </Box>

      {/* Receipt dialog shown after successful payment */}
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Struk Pembayaran</DialogTitle>
        <DialogContent>
          {receipt ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              {/* Preview uses the same layout as the printable receipt */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  p: 1,
                  bgcolor: "background.paper",
                  borderRadius: 1,
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
                  <Typography variant="body2">Receipt Number</Typography>
                  <Typography variant="body2">{receipt.id}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2">Waktu</Typography>
                  <Typography variant="body2">{receipt.time}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Kasir</Typography>
                  <Typography variant="body2">{receipt.cashier}</Typography>
                </Box>
                <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />

                {receipt.items.map((it) => (
                  <Box
                    key={it.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: "monospace",
                      mb: 0.5,
                    }}
                  >
                    <div>{`${it.qty}x ${it.name}`}</div>
                    <div>{currency(it.price * it.qty)}</div>
                  </Box>
                ))}

                <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Subtotal</Typography>
                  <Typography>{currency(receipt.total)}</Typography>
                </Box>
                <Box sx={{ borderTop: "1px dashed #000", my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Total</Typography>
                  <Typography>
                    <strong>{currency(receipt.total)}</strong>
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

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button onClick={onClose}>Selesai</Button>
                <Button
                  startIcon={<PrintIcon />}
                  onClick={() => {
                    setTimeout(() => window.print(), 150);
                  }}
                  variant="contained"
                >
                  Print
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography>Memproses struk...</Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptDialog;

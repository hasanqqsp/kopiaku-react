import React from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import SwipeToConfirm from "./SwipeToConfirm";
import qrisFrame from "../../assets/qris-frame.png";
import {
  qrisdynamicgenerator,
  qrisimagegenerator,
} from "@misterdevs/qris-static-to-dynamic";
import { createTransactionAPI } from "../../utils/api";
import useAuthStore from "../../stores/authStore";
const currency = (v) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    v
  );

const PaymentDialog = ({
  open,
  onClose,
  total,
  cartItems,
  onPaymentConfirm,
  cashierName = "Default Cashier",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const FRAME_ORIG = { w: 1545, h: 2000 };
  const TOP_OFFSET_PCT = (612 / FRAME_ORIG.h) * 100; // percent from top where QR should start

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const { user } = useAuthStore();

  const formatDate24 = (d = new Date()) => {
    const pad = (n) => String(n).padStart(2, "0");
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    return `${day}/${month}/${year} ${hours}:${mins}`;
  };

  const QRIS_DATA_STATIC = `00020101021126610014COM.GO-JEK.WWW01189360091430208080860210G0208080860303UMI51440014ID.CO.QRIS.WWW0215ID10254364673810303UMI5204581253033605802ID5925ADELIA TIARA PUTRI, Makan6005DEPOK61051651462070703A016304FAA5`;
  const [qrisUrl, setQrisUrl] = React.useState("");
  (async function getQrisUrl() {
    const qrisDataDynamic = qrisdynamicgenerator(QRIS_DATA_STATIC, total);
    return qrisimagegenerator(qrisDataDynamic);
  })().then((url) => {
    setQrisUrl(url);
  });
  const handleConfirm = async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare transaction data for API
      const transactionData = {
        userId: user.id,
        totalAmount: total,
        status: "UNVERIFIED",
        transactionDate: new Date().toISOString(),
        menuItems: cartItems.map((item) => ({
          menuId: item.id,
          quantity: item.qty,
        })),
      };

      // Create transaction via API
      const createdTransaction = await createTransactionAPI(transactionData);

      // Create receipt data for UI
      const trx = {
        id: createdTransaction.id,
        time: formatDate24(new Date()),
        cashier: cashierName,
        items: cartItems.map((it) => ({
          id: it.id,
          name: it.name,
          qty: it.qty,
          price: it.price,
        })),
        total,
      };

      onPaymentConfirm(trx);
    } catch (err) {
      console.error("Failed to create transaction:", err);
      setError("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Bayar</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          py: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="h5" color="primary">
            {currency(total)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          {/* Frame container: background PNG + positioned QR overlay. */}
          {(() => {
            const topPct = TOP_OFFSET_PCT; // percent from top

            return (
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: `1545 / 2000`,
                  backgroundImage: `url(${qrisFrame})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  maxHeight: "60vh",
                  width: "min(100%, calc(60vh * 1545 / 2000))",
                }}
              >
                <img
                  src={qrisUrl}
                  alt="QR Code Pembayaran"
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    top: `${topPct}%`,
                    aspectRatio: "1 / 1",
                    height: `60%`,
                  }}
                />
              </Box>
            );
          })()}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            width: "100%",
          }}
        >
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <SwipeToConfirm
            key={open}
            onConfirm={handleConfirm}
            disabled={loading}
          />

          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Button onClick={onClose} color="secondary" disabled={loading}>
              Tutup
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

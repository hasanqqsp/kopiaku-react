import React, { useMemo, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { getMenusWithDetails } from "../utils/api.js";
import kopiakuLogo from "../assets/kopiaku-logo.png";
import {
  ProductGrid,
  SearchBar,
  CartSidebar,
  PaymentDialog,
  ReceiptDialog,
  MobileCart,
} from "../components/cashier";
import InstagramIcon from "@mui/icons-material/Instagram";
import useAuthStore from "../stores/authStore.js";

export default function CashierPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState({}); // { productId: qty }
  const [cartExpanded, setCartExpanded] = useState(false);
  const [recentAdded, setRecentAdded] = useState([]); // track recent added product ids (order preserved)
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const response = await getMenusWithDetails(); // Fetch more items
        const availableMenus = response.nodes.filter(
          (menu) => menu.isAvailable
        );
        setProducts(availableMenus);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch menus:", err);
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const currency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory)
        return false;
      if (!query) return true;
      return p.name.toLowerCase().includes(query.toLowerCase());
    });
  }, [products, query, activeCategory]);

  const addToCart = (product) => {
    setCart((s) => ({ ...s, [product.id]: (s[product.id] || 0) + 1 }));
    setRecentAdded((r) => {
      const next = [...r, product.id];
      // keep recent history reasonable
      if (next.length > 200) next.splice(0, next.length - 200);
      return next;
    });
  };

  const setQty = (productId, qty) => {
    setCart((s) => {
      const next = { ...s };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  };

  const clearCart = () => setCart({});

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return { ...p, qty };
    });
  }, [cart, products]);

  // preview of last 3 distinct products added (most recent first)
  const previewProducts = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (let i = recentAdded.length - 1; i >= 0 && list.length < 3; i--) {
      const id = recentAdded[i];
      if (seen.has(id)) continue;
      const qty = cart[id] || 0;
      if (!qty) continue; // skip removed items
      const p = products.find((x) => x.id === id);
      if (!p) continue;
      seen.add(id);
      list.push({ name: p.name, qty });
    }
    return list;
  }, [recentAdded, cart, products]);

  const total = cartItems.reduce((s, it) => s + it.price * it.qty, 0);

  // const formatDate24 = (d = new Date()) => {
  //   const pad = (n) => String(n).padStart(2, "0");
  //   const day = pad(d.getDate());
  //   const month = pad(d.getMonth() + 1);
  //   const year = d.getFullYear();
  //   const hours = pad(d.getHours());
  //   const mins = pad(d.getMinutes());
  //   return `${day}/${month}/${year} ${hours}:${mins}`;
  // };

  const user = useAuthStore((state) => state.user);

  const cashierName = user?.name || "Default Cashier"; // hardcoded for now

  return (
    <Box sx={{ pb: isMobile ? 12 : 0 }}>
      <style>{`
        /* Print styles: use 58mm width and let height flow to content. Also set @page size when supported. */
        @media print {
          @page { size: 58mm auto; margin: 2mm; }
          body * { visibility: hidden !important; }
          .receipt-print, .receipt-print * { visibility: visible !important; }
          /* 58mm thermal paper */
          .receipt-print { position: absolute !important; left: 0; top: 0; width: 58mm; padding: 4mm; background: #fff; height: auto !important; }
          .receipt-print img { width: 20mm; height: auto; }
          .receipt-print { font-size: 10pt; }
        }
        .receipt-print {
            display:none;
        }
      `}</style>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Kasir — Kopiaku
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Left column: search, filters, products */}
          <Grid size={{ xs: 12, md: 6, lg: 8, xl: 9 }}>
            <SearchBar query={query} onQueryChange={setQuery} />
            <ProductGrid
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              filteredProducts={filteredProducts}
              loading={loading}
              error={error}
              onAddToCart={addToCart}
            />
          </Grid>

          {/* Right column: persistent cart for md+ */}
          {isDesktop && (
            <Grid size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
              <CartSidebar
                cartItems={cartItems}
                total={total}
                onUpdateQuantity={setQty}
                onRemoveItem={(id) => setQty(id, 0)}
                onClearCart={clearCart}
                onCheckout={() => setPaymentOpen(true)}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      {/* sticky bottom summary / collapsible cart for mobile */}
      {!paymentOpen && (
        <MobileCart
          cartItems={cartItems}
          total={total}
          previewProducts={previewProducts}
          cartExpanded={cartExpanded}
          onToggleExpanded={() => setCartExpanded((expanded) => !expanded)}
          onUpdateQuantity={setQty}
          onRemoveItem={(id) => setQty(id, 0)}
          onClearCart={clearCart}
          onCheckout={() => {
            setPaymentOpen(true);
            setCartExpanded(false);
          }}
        />
      )}

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
      <ReceiptDialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        receipt={receipt}
      />

      {/* Payment modal */}
      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={total}
        cartItems={cartItems}
        onPaymentConfirm={(trx) => {
          setReceipt(trx);
          setReceiptOpen(true);
          // clear cart and close payment UI
          clearCart();
          setPaymentOpen(false);
          setCartExpanded(false);
        }}
        cashierName={cashierName}
      />
    </Box>
  );
}

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const currency = (v) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    v
  );

const MobileCart = ({
  cartItems,
  total,
  previewProducts,
  cartExpanded,
  onToggleExpanded,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 1400,
      }}
    >
      {/* Collapsed bar (always visible on mobile) */}
      <Box sx={{ display: { xs: "block", md: "none" }, mb: 1 }}>
        <Paper
          elevation={6}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1,
            borderRadius: 2,
          }}
          onClick={onToggleExpanded}
          role="button"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <ShoppingCartIcon />

            <Box>
              <Typography variant="subtitle2">
                {cartItems.length} item(s)
                {previewProducts.length ? (
                  <>
                    :{" "}
                    {previewProducts
                      .map((p) => `${p.name} (${p.qty})`)
                      .join(", ")}
                    {cartItems.length - previewProducts.length > 0
                      ? ` dan ${
                          cartItems.length - previewProducts.length
                        } lainnya`
                      : ""}
                  </>
                ) : null}
              </Typography>
              <Typography variant="subtitle1" color="primary">
                {currency(total)}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            aria-label={cartExpanded ? "collapse" : "expand"}
          >
            {cartExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </IconButton>
        </Paper>
      </Box>

      {/* Expanded bottom sheet */}
      {cartExpanded && (
        <Paper
          elevation={10}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            maxHeight: "70vh",
            overflow: "auto",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="h6">Keranjang</Typography>
              <IconButton onClick={() => onToggleExpanded(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {cartItems.length === 0 ? (
              <Typography>Keranjang kosong</Typography>
            ) : (
              <>
                <List>
                  {cartItems.map((it) => (
                    <React.Fragment key={it.id}>
                      <ListItem
                        sx={{ width: "100%" }}
                        secondaryAction={
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                onUpdateQuantity(it.id, it.qty - 1)
                              }
                            >
                              <RemoveCircleOutlineIcon />
                            </IconButton>
                            <Typography>{it.qty}</Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                onUpdateQuantity(it.id, it.qty + 1)
                              }
                            >
                              <AddCircleOutlineIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => onRemoveItem(it.id)}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemAvatar sx={{ mr: 2 }}>
                          <img
                            src={
                              it.imageUrl || "https://via.placeholder.com/64"
                            }
                            alt={it.name}
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 6,
                              objectFit: "cover",
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={it.name}
                          secondary={currency(it.price)}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}

                  <ListItem>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1">
                      {currency(total)}
                    </Typography>
                  </ListItem>
                </List>

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button onClick={onClearCart} color="secondary">
                    Hapus Semua
                  </Button>
                  <Button variant="contained" onClick={onCheckout}>
                    Bayar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default MobileCart;

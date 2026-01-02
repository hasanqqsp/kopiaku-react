import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CartItem from "./CartItem";

const currency = (v) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    v
  );

const CartSidebar = ({
  cartItems,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  return (
    <Box sx={{ position: "sticky", top: 72 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <ShoppingCartIcon />
          <Typography variant="h6" sx={{ ml: 1 }}>
            Keranjang
          </Typography>
        </Box>

        {cartItems.length === 0 ? (
          <Typography>Keranjang kosong</Typography>
        ) : (
          <>
            <List>
              {cartItems.map((it) => (
                <React.Fragment key={it.id}>
                  <CartItem
                    item={it}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemoveItem}
                  />
                  <Divider />
                </React.Fragment>
              ))}
              <ListItem>
                <ListItemText primary="Total" />
                <Typography variant="subtitle1">{currency(total)}</Typography>
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
      </Paper>
    </Box>
  );
};

export default CartSidebar;

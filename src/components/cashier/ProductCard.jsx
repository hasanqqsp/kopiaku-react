import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

const currency = (v) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    v
  );

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <Paper
      onClick={() => onAddToCart(product)}
      role="button"
      tabIndex={0}
      elevation={1}
      sx={{
        width: "100%",
        height: 88,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        cursor: "pointer",
        px: 1,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ mr: 1 }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: 72,
            height: 64,
            borderRadius: 6,
            objectFit: "cover",
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1" noWrap>
          {product.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {currency(product.price)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ProductCard;

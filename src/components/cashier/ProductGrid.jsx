import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  categories,
  activeCategory,
  onCategoryChange,
  filteredProducts,
  loading,
  error,
  onAddToCart,
}) => {
  return (
    <Grid>
      <Box sx={{ mb: 1, overflowX: "auto" }}>
        <Stack direction="row" spacing={1}>
          {categories.map((c) => (
            <Chip
              key={c}
              label={c}
              clickable
              color={activeCategory === c ? "primary" : "default"}
              onClick={() => onCategoryChange(c)}
            />
          ))}
        </Stack>
      </Box>

      <Grid container spacing={1}>
        {loading ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography>Loading menu items...</Typography>
            </Box>
          </Grid>
        ) : error ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          </Grid>
        ) : (
          filteredProducts.map((p) => (
            <Grid
              key={p.id}
              size={{ xs: 12, sm: 6, lg: 4 }}
              sx={{ boxSizing: "border-box" }}
            >
              <ProductCard product={p} onAddToCart={onAddToCart} />
            </Grid>
          ))
        )}
      </Grid>
    </Grid>
  );
};

export default ProductGrid;

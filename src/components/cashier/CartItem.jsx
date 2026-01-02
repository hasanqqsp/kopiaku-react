import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const currency = (v) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    v
  );

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <ListItem
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
            onClick={() => onUpdateQuantity(item.id, item.qty - 1)}
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
          <Typography>{item.qty}</Typography>
          <IconButton
            size="small"
            onClick={() => onUpdateQuantity(item.id, item.qty + 1)}
          >
            <AddCircleOutlineIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onRemove(item.id)}>
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      }
    >
      <ListItemAvatar sx={{ mr: 2 }}>
        <img
          src={item.imageUrl || "https://via.placeholder.com/64"}
          alt={item.name}
          style={{
            width: 56,
            height: 56,
            borderRadius: 6,
            objectFit: "cover",
          }}
        />
      </ListItemAvatar>
      <ListItemText primary={item.name} secondary={currency(item.price)} />
    </ListItem>
  );
};

export default CartItem;

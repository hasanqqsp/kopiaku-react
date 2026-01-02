import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

function StockStatusCard({ stockStatus }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Status Stok
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={stockStatus.length ? "Stok Menipis" : "Stok Aman"}
              color={stockStatus.length ? "warning" : "success"}
              size="small"
            />
          </Stack>
          {stockStatus.length > 0 ? (
            <List
              dense
              sx={{
                listStyleType: "disc",
                pl: 2,
              }}
            >
              {stockStatus.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{ display: "list-item" }}
                  disablePadding
                >
                  <ListItemText
                    primary={`${item.name} tersisa ${item.quantity} ${item.unit}`}
                    slotProps={{
                      primary: {
                        sx: {
                          variant: "body2",
                          color: "text.secondary",
                        },
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : null}
          <Typography variant="body2" color="text.secondary">
            Periksa level stok dan lakukan restock jika diperlukan
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default StockStatusCard;

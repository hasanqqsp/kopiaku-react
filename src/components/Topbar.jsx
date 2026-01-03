import React, { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { drawerWidth, collapsedWidth } from "../config/drawer";
import { topbarHeight } from "../config/ui";

export default function Topbar({
  open: controlledOpen,
  setOpen: controlledSetOpen,
}) {
  const isControlled =
    typeof controlledOpen === "boolean" &&
    typeof controlledSetOpen === "function";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? controlledSetOpen : setUncontrolledOpen;

  const toggle = () => setOpen(!open);

  return (
    // make AppBar fixed and above the Drawer so it doesn't appear "below" the sidebar
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={(theme) => ({
        borderBottom: "1px solid #e5e7eb",
        zIndex: theme.zIndex.drawer + 1,
        // full width on xs (sidebar hidden), shift right on sm+ to avoid overlaying the permanent drawer
        left: { xs: 0, sm: open ? `${drawerWidth}px` : `${collapsedWidth}px` },
        right: 0,
        transition: theme.transitions.create("left", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        }),
      })}
    >
      <Toolbar
        sx={{
          minHeight: `${topbarHeight}px`,
          px: 1.5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Render hamburger only when uncontrolled (component manages open state) */}
          {open ? null : (
            <IconButton
              onClick={toggle}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              size="medium"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                display: {
                  xs: "block",
                  md: "none",
                },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            KopiAku POS System
          </Typography>
        </Box>

        
      </Toolbar>
    </AppBar>
  );
}

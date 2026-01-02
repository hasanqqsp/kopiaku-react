import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import CompareIcon from "@mui/icons-material/Compare";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import imageSrc from "../assets/kopiaku-logo.png";
import { useNavigate } from "@tanstack/react-router";
import { drawerWidth, collapsedWidth } from "../config/drawer";
import { bottomSpacing } from "../config/ui";
import useAuthStore from "../stores/authStore";
import { checkOut } from "../utils/api";
const primaryBlue = "#1c0cdc";
const primaryContrast = "#ffffff";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    id: "cashier",
    label: "Cashier",
    icon: <PointOfSaleIcon />,
    path: "/cashier",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: <ReceiptLongIcon />,
    path: "/transactions",
  },
  { id: "menu", label: "Menu", icon: <RestaurantMenuIcon />, path: "/menu" },
  {
    id: "stock",
    label: "Stock Management",
    icon: <Inventory2Icon />,
    path: "/stock",
  },
  {
    id: "employees",
    label: "Employees",
    icon: <PeopleIcon />,
    path: "/employees",
  },
  {
    id: "reconciliation",
    label: "Reconciliation",
    icon: <CompareIcon />,
    path: "/reconciliation",
  },
  {
    id: "content",
    label: "Content Management",
    icon: <ArticleIcon />,
    path: "/content",
  },
];

export default function Sidebar({ onSelect, open = true, setOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const variant = isMobile ? "temporary" : "permanent";

  const navigate = useNavigate();

  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const handleSelect = (item) => {
    setSelected(item.id);
    if (onSelect) onSelect(item.id);
    if (item.path) {
      try {
        navigate({ to: item.path });
      } catch {
        // fallback
        window.location.assign(item.path);
      }
    }
    if (isMobile && setOpen) setOpen(false);
  };

  const onLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleEndShift = async () => {
    try {
      await checkOut();
    } catch (error) {
      console.error("Error during check out:", error);
    }
    const { logout } = useAuthStore.getState();
    logout();
    navigate({ to: "/login" });
  };

  const handleLogoutOnly = () => {
    const { logout } = useAuthStore.getState();
    logout();
    navigate({ to: "/login" });
  };

  const { user } = useAuthStore();

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (user?.role !== "Admin") {
      return !["employees", "content", "reconciliation"].includes(item.id);
    }
    return true;
  });

  const getSelectedFromPath = React.useCallback(
    (path) => {
      if (!path) return "dashboard";
      const found = filteredMenuItems.find(
        (m) =>
          m.path &&
          (m.path === path || (m.path !== "/" && path.startsWith(m.path)))
      );
      return found ? found.id : "dashboard";
    },
    [filteredMenuItems]
  );
  const [selected, setSelected] = React.useState(() =>
    getSelectedFromPath(
      typeof window !== "undefined" ? window.location.pathname : "/"
    )
  );

  React.useEffect(() => {
    const onPop = () =>
      setSelected(getSelectedFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [getSelectedFromPath]);

  // width used for the paper: mobile always uses the full drawerWidth when open
  const paperWidth = isMobile
    ? drawerWidth
    : open
    ? drawerWidth
    : collapsedWidth;

  const drawerSx = {
    width: paperWidth,
    flexShrink: 0,
    zIndex: open ? 1400 : 1200,
    "& .MuiDrawer-paper": {
      display: "flex",
      flexDirection: "column",
      top: 0,
      height: "100vh",
      position: "fixed",
      width: paperWidth,
      boxSizing: "border-box",
      bgcolor: primaryBlue,
      color: primaryContrast,
      overflowX: "visible",
      overflowY: "auto",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.standard,
      }),
    },
  };

  return (
    <Drawer
      variant={variant}
      open={isMobile ? open : true}
      onClose={() => isMobile && setOpen && setOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={drawerSx}
    >
      <Toolbar
        sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1 }}
      >
        <img
          src={imageSrc}
          width={open ? 100 : 40}
          style={{
            marginInline: open ? "auto" : 0,
            transition: theme.transitions.create(["width", "margin"], {
              duration: 200,
            }),
          }}
          alt="logo"
        />
      </Toolbar>

      <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.12) }} />

      {/* Scrollable menu area. pb keeps last item visible above bottom user box */}
      <Box sx={{ overflow: "auto", flex: 1, pb: `${bottomSpacing}px` }}>
        <List>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={selected === item.id}
                onClick={() => handleSelect(item)}
                sx={{
                  px: 2,
                  justifyContent: open ? "flex-start" : "center",
                  "&.Mui-selected, &.Mui-selected:hover": {
                    bgcolor: theme.palette.common.white,
                    color: primaryBlue,
                    "& .MuiListItemIcon-root": { color: primaryBlue },
                    "& .MuiListItemText-root": { color: primaryBlue },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 0,
                    justifyContent: "center",
                    color:
                      selected === item.id
                        ? primaryBlue
                        : alpha(theme.palette.common.white, 0.9),
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  sx={{
                    display: open ? "block" : "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                  slotProps={{
                    primary: {
                      sx: {
                        color:
                          selected === item.id
                            ? primaryBlue
                            : alpha(theme.palette.common.white, 0.95),
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom user box anchored to bottom */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Divider
          sx={{ borderColor: alpha(theme.palette.common.white, 0.12), mb: 1 }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user?.profilePictureUrl || ""}
              sx={{
                bgcolor: theme.palette.secondary.main,
                width: 40,
                height: 40,
              }}
            >
              {user?.name?.slice(0, 1).toUpperCase() || ""}
            </Avatar>
            <Box sx={{ display: open ? "block" : "none" }}>
              <Typography variant="subtitle1" sx={{ color: primaryContrast }}>
                {user?.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha(primaryContrast, 0.85) }}
              >
                {user?.role}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: open ? "block" : "none" }}>
            <Button
              onClick={onLogout}
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon />}
              fullWidth
              sx={{
                color: primaryContrast,
                borderColor: alpha(primaryContrast, 0.12),
                textTransform: "none",
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Collapse/Expand button fixed to viewport edge so it won't be clipped by Drawer. Hidden on mobile. */}
      <IconButton
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        onClick={() => setOpen && setOpen(!open)}
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer + 10,
          position: "fixed",
          top: "50%",
          left: open ? drawerWidth - 12 : collapsedWidth - 12,
          transform: "translateY(-50%)",
          display: { xs: "none", sm: "inline-flex" },
          bgcolor: primaryContrast,
          color: primaryBlue,
          borderRadius: 8,
          boxShadow: theme.shadows[1],
          minWidth: 24,
          width: 24,
          height: 36,
          transition: theme.transitions.create("left", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          "&:hover": { bgcolor: alpha(primaryContrast, 0.95) },
        })}
        size="small"
      >
        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Konfirmasi Logout</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda ingin mengakhiri shift (check out) atau hanya logout?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleLogoutOnly} color="secondary">
            Logout Saja
          </Button>
          <Button onClick={handleEndShift} variant="contained" color="primary">
            Akhiri Shift
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}

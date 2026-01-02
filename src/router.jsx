import React, { useEffect } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import Box from "@mui/material/Box";
import { drawerWidth, collapsedWidth } from "./config/drawer";
import { topbarHeight } from "./config/ui";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

// pages
import DashboardPage from "./pages/DashboardPage";
import CashierPage from "./pages/CashierPage";
import MenuPage from "./pages/MenuPage";
import StockManagementPage from "./pages/StockManagementPage";
import EmployeesPage from "./pages/EmployeesPage";
import ContentManagementPage from "./pages/ContentManagementPage";
import TransactionsPage from "./pages/TransactionsPage";
import TransactionDetailPage from "./pages/TransactionDetailPage";
import LoginPage from "./pages/LoginPage";
import PhotoVerificationPage from "./pages/PhotoVerificationPage";
import ReconciliationPage from "./pages/ReconciliationPage";

import useAuthStore from "./stores/authStore";
import { getCurrentUser } from "./utils/api";
import { useState } from "react";

// Helper functions
const isLoggedIn = () => !!localStorage.getItem("authToken");

const hasPresence = (user) => {
  return !!user?.presence;
};
const requireAuth = async () => {
  if (!isLoggedIn()) {
    throw redirect({
      to: "/login",
      search: {},
    });
  }
  const user = await getCurrentUser();
  if (!user) {
    throw redirect({
      to: "/login",
      search: {},
    });
  }
  if (user?.role !== "Admin" && !hasPresence(user)) {
    throw redirect({
      to: "/photo-verification",
      search: {},
    });
  }
};

// Reusable role-based guards

const requireAdmin = async () => {
  await requireAuth();
  const user = await getCurrentUser();
  if (user?.role !== "Admin") {
    throw redirect({
      to: "/",
      search: {},
    });
  }
};

// Root layout component
function RootLayout() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Sidebar open={open} setOpen={setOpen} />
      <Topbar open={open} setOpen={setOpen} />

      <Box
        component="main"
        sx={{
          pt: `${topbarHeight + 8}px`,
          px: 2,
          ml: { sm: open ? `${drawerWidth}px` : `${collapsedWidth}px` },
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}

// Auth layout component (for login page - no sidebar/topbar)
function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Outlet />
    </Box>
  );
}

// Create root route and route tree using code-based routing
const rootRoute = createRootRoute();

const rootLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "rootLayout",
  component: RootLayout,
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authLayout",
  component: AuthLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "/",
  component: DashboardPage,
  beforeLoad: requireAuth,
});
const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "login",
  component: LoginPage,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      const user = await getCurrentUser();
      if (!hasPresence(user) && user?.role !== "Admin") {
        throw redirect({
          to: "/photo-verification",
          search: {},
        });
      }
      if (user?.role === "Admin") {
        throw redirect({
          to: "/",
          search: {},
        });
      }
    }
  },
});
const dashboardAlias = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "dashboard",
  component: DashboardPage,
  beforeLoad: requireAuth,
});

const cashierRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "cashier",
  component: CashierPage,
  beforeLoad: requireAuth,
});

const menuRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "menu",
  component: MenuPage,
  beforeLoad: requireAuth,
});

const stockRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "stock",
  component: StockManagementPage,
  beforeLoad: requireAuth,
});

const employeesRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "employees",
  component: EmployeesPage,
  beforeLoad: requireAdmin,
});

const photoVerificationRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "photo-verification",
  component: PhotoVerificationPage,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    requireAuth();
    if (user?.role === "Admin") {
      throw redirect({
        to: "/",
        search: {},
      });
    }
    if (user?.presence) {
      throw redirect({
        to: "/",
        search: {},
      });
    }
  },
});
const contentRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "content",
  component: ContentManagementPage,
  beforeLoad: requireAdmin,
});
const transactionsRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "transactions",
  component: TransactionsPage,
  beforeLoad: requireAuth,
});
const transactionDetailRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "transactions/$id",
  component: TransactionDetailPage,
  beforeLoad: requireAuth,
});

const reconciliationRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "reconciliation",
  component: ReconciliationPage,
  beforeLoad: requireAdmin,
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  rootLayoutRoute.addChildren([
    dashboardRoute,
    dashboardAlias,
    cashierRoute,
    menuRoute,
    stockRoute,
    employeesRoute,
    contentRoute,
    transactionDetailRoute,
    transactionsRoute,
    reconciliationRoute,
  ]),
  authLayoutRoute.addChildren([loginRoute, photoVerificationRoute]),
]);

const router = createRouter({ routeTree });

export default function AppRouter() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <RouterProvider router={router} />;
}

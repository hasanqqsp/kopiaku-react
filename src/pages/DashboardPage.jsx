import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { getDashboard } from "../utils/api";
import SalesCard from "../components/SalesCard";
import StockStatusCard from "../components/StockStatusCard";
import ShiftStatusCard from "../components/ShiftStatusCard";
import SalesChart from "../components/SalesChart";
import useAuthStore from "../stores/authStore";

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    salesToday: 0,
    salesTodayCount: 0,
    salesThisMonth: 0,
    salesThisMonthCount: 0,
    stockStatus: [],
    timeSeriesLast30Days: [],
  });

  const { user } = useAuthStore();
  useEffect(() => {
    getDashboard().then((data) => {
      setStats(data);
    });
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SalesCard
            title="Penjualan Hari Ini"
            amount={stats.salesToday}
            count={stats.salesTodayCount}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SalesCard
            title="Penjualan Bulan Ini"
            amount={stats.salesThisMonth}
            count={stats.salesThisMonthCount}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StockStatusCard stockStatus={stats.stockStatus} />
        </Grid>
        {user?.role !== "Admin" ? (
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <ShiftStatusCard user={user} />
          </Grid>
        ) : null}
      </Grid>
      <Box sx={{ mt: 3 }}>
        <SalesChart timeSeriesData={stats.timeSeriesLast30Days} />
      </Box>
    </Box>
  );
}

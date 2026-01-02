import React, { useEffect, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chart from "chart.js/auto";

const currency = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    value
  );

function SalesChart({ timeSeriesData }) {
  const chartRef = useRef(null);

  const { labels30, data30 } = useMemo(() => {
    const dates = getLastNDates(30);
    const labels = dates.map((d) =>
      d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
    );
    const data = timeSeriesData.map((item) => item.totalSales);
    return { labels30: labels, data30: data };
  }, [timeSeriesData]);

  const chartWidth = useMemo(() => {
    const perPoint = 40;
    const min = 800;
    return Math.max(min, labels30.length * perPoint);
  }, [labels30]);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels30,
        datasets: [
          {
            label: "Penjualan (IDR)",
            data: data30,
            borderColor: "#1976d2",
            backgroundColor: "rgba(25,118,210,0.08)",
            tension: 0.3,
            pointRadius: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                const val = context.parsed.y ?? context.parsed;
                return currency(val);
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: {
              callback(value) {
                return new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(value);
              },
            },
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [labels30, data30]);

  return (
    <Card>
      <CardHeader
        title="Penjualan 30 Hari Terakhir"
        subheader="Grafik penjualan per hari (30 hari)"
      />
      <CardContent>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: `${chartWidth}px`, height: 340 }}>
            <canvas
              id="sales30Chart"
              ref={chartRef}
              style={{ width: `${chartWidth}px`, height: "100%" }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// helpers
function getLastNDates(n) {
  const dates = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(d);
  }
  return dates;
}

export default SalesChart;

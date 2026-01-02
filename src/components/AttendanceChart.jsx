import React, { useEffect, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chart from "chart.js/auto";

function AttendanceChart({ attendanceData }) {
  const chartRef = useRef(null);

  const { labels30, data30 } = useMemo(() => {
    const dates = getLastNDates(30);
    const labels = dates.map((d) =>
      d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
    );
    const data = attendanceData.map((item) => item.attendanceCount);
    return { labels30: labels, data30: data };
  }, [attendanceData]);

  const chartWidth = useMemo(() => {
    const perPoint = 40;
    const min = 800;
    return Math.max(min, labels30.length * perPoint);
  }, [labels30]);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels30,
        datasets: [
          {
            label: "Kehadiran",
            data: data30,
            backgroundColor: "#4caf50",
            borderColor: "#4caf50",
            borderWidth: 1,
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
                return `${val} orang`;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: {
              stepSize: 1,
              beginAtZero: true,
            },
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
        title="Kehadiran 30 Hari Terakhir"
        subheader="Grafik kehadiran per hari (30 hari)"
      />
      <CardContent>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: `${chartWidth}px`, height: 340 }}>
            <canvas
              id="attendance30Chart"
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

export default AttendanceChart;

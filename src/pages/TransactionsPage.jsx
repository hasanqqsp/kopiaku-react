import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { getTransactionsAPI, getTransactionsByUserIdAPI } from "../utils/api";
import useAuthStore from "../stores/authStore";
// using plain MUI table with local sort — removed tanstack dependency for compatibility

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${s}`;
  } catch {
    return iso;
  }
}

export default function TransactionsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        let result;
        if (user?.role === "Admin") {
          result = await getTransactionsAPI();
        } else {
          result = await getTransactionsByUserIdAPI(user?.id);
        }
        setData(result.nodes || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "No Transaksi",
        accessor: (r) => r.id,
        cell: (r) => r.id,
      },
      {
        id: "transactionDate",
        header: "Waktu",
        accessor: (r) => r.transactionDate,
        cell: (r) => formatDateTime(r.transactionDate),
      },
      {
        id: "totalAmount",
        header: "Total",
        accessor: (r) => r.totalAmount,
        cell: (r) => `Rp ${Number(r.totalAmount).toLocaleString("id-ID")}`,
      },
      {
        id: "userName",
        header: "Kasir",
        accessor: (r) => r.user.name,
        cell: (r) => r.user.name,
      },
      {
        id: "status",
        header: "Status",
        accessor: (r) => r.status,
        cell: (r) => (
          <Chip
            label={r.status}
            color={r.status === "VERIFIED" ? "success" : "warning"}
          />
        ),
      },
      {
        id: "qrisOrderId",
        header: "Kode Transaksi QRIS",
        accessor: (r) => r.qrisOrderId,
        cell: (r) => r.qrisOrderId || "-",
      },
      {
        id: "qrisTransactionTime",
        header: "Waktu Pembayaran",
        accessor: (r) => r.qrisTransactionTime,
        cell: (r) =>
          r.qrisTransactionTime ? formatDateTime(r.qrisTransactionTime) : "-",
      },
      {
        id: "netAmount",
        header: "Pendapatan Bersih",
        accessor: (r) => r.netAmount,
        cell: (r) =>
          r.netAmount
            ? `Rp ${Number(r.netAmount).toLocaleString("id-ID")}`
            : "-",
      },
    ],
    []
  );

  const sortedData = useMemo(() => {
    if (!sorting || !sorting.id) return data;
    const dir = sorting.desc ? -1 : 1;
    const col = columns.find((c) => c.id === sorting.id);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const va = col.accessor(a);
      const vb = col.accessor(b);
      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;
      if (typeof va === "number" && typeof vb === "number")
        return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [data, sorting, columns]);

  const toggleSort = (colId) => {
    if (sorting?.id !== colId) setSorting({ id: colId, desc: false });
    else setSorting({ id: colId, desc: !sorting.desc });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transaksi
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  onClick={() => toggleSort(col.id)}
                  sx={{ cursor: "pointer" }}
                >
                  {col.header}{" "}
                  {sorting?.id === col.id ? (sorting.desc ? " �" : " �") : null}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate({
                      to: "/transactions/$id",
                      params: { id: row.id },
                    })
                  }
                >
                  {columns.map((col) => (
                    <TableCell key={col.id}>{col.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

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
import TablePagination from "@mui/material/TablePagination";
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
  const [sorting, setSorting] = useState({ id: null, desc: false });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const toggleSort = (id) => {
    setSorting((prev) => {
      if (prev.id === id) {
        return { ...prev, desc: !prev.desc };
      } else {
        return { id, desc: false };
      }
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        let result;
        if (user?.role === "Admin") {
          result = await getTransactionsAPI({
            take: pageSize,
            skip: page * pageSize,
          });
        } else {
          result = await getTransactionsByUserIdAPI(user?.id, {
            take: pageSize,
            skip: page * pageSize,
          });
        }
        setData(result.items || []);
        setTotalCount(result.totalCount || 0);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user, page, pageSize]);

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
    [],
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
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

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangePageSize}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Baris per halaman:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
        }
      />
    </Box>
  );
}

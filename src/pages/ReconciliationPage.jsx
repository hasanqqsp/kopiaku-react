import React, { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import UploadIcon from "@mui/icons-material/Upload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CircularProgress from "@mui/material/CircularProgress";
import Papa from "papaparse";
import dayjs from "dayjs";
import {
  getTransactionsByStatusAPI,
  reconcileTransactionsAPI,
} from "../utils/api";

/**
 * @typedef {Object} CsvTransaction
 * @property {string} id - Unique identifier for the CSV row
 * @property {string} [orderId]
 * @property {string} transactionTime - ISO string
 * @property {number} amount - The amount to match against DB
 * @property {number} [netAmount] - Optional nett amount
 */

/**
 * @typedef {Object} DbTransaction
 * @property {string} id
 * @property {string} [orderId]
 * @property {string} transactionDate - ISO string
 * @property {number} totalAmount
 */

/**
 * @typedef {Object} Candidate
 * @property {string} id
 * @property {string} [orderId]
 * @property {string} transactionDate
 * @property {number} totalAmount
 * @property {number} score
 * @property {number} timeDiffSec
 */

/**
 * @typedef {Object} ReconciliationRow
 * @property {CsvTransaction} csv
 * @property {'AUTO_MATCHED'|'NEEDS_REVIEW'|'UNMATCHED'} status
 * @property {string} [matchedId]
 * @property {Candidate[]} [candidates]
 */

/**
 * Fuzzy matching algorithm for transaction reconciliation
 * Matching logic:
 * 1. Exact match: time and amount match exactly → AUTO_MATCHED
 * 2. Fuzzy match: amount matches, time diff ≤ 15s → score-based matching
 * @param {CsvTransaction[]} csvRows
 * @param {DbTransaction[]} dbRows
 * @returns {Object} {matchedRows: ReconciliationRow[], unmatchedDbRows: DbTransaction[]}
 */
function reconcileCsvRows(csvRows, dbRows) {
  const results = [];
  const matchedDbIds = new Set();

  for (const csv of csvRows) {
    let status = "UNMATCHED";
    let matchedId = null;
    let candidates = [];

    // Step 1: Exact match by time and amount (no orderId matching)
    // Only consider DB transactions that haven't been matched yet
    const availableDbRows = dbRows.filter((db) => !matchedDbIds.has(db.id));
    const exactMatches = availableDbRows.filter((db) => {
      const csvTime = dayjs(csv.transactionTime);
      const dbTime = dayjs(db.transactionDate);
      const timeDiffSec = Math.abs(csvTime.diff(dbTime, "second"));
      return csv.amount === db.totalAmount && timeDiffSec < 60;
    });

    if (exactMatches.length === 1) {
      status = "AUTO_MATCHED";
      matchedId = exactMatches[0].id;
      matchedDbIds.add(matchedId);
    } else if (exactMatches.length > 1) {
      // Multiple exact matches - needs review
      status = "NEEDS_REVIEW";
      candidates = exactMatches.map((db) => ({
        ...db,
        score: 100, // Perfect match
        timeDiffSec: 0,
      }));
      // For multiple matches, we don't mark them as matched yet
    } else {
      // Step 2: Fuzzy candidate search (time diff ≤ 15s, amount match)
      candidates = availableDbRows
        .filter((db) => {
          if (csv.amount !== db.totalAmount) return false;
          const csvTime = dayjs(csv.transactionTime);
          const dbTime = dayjs(db.transactionDate);
          const timeDiffSec = Math.abs(csvTime.diff(dbTime, "second"));
          return timeDiffSec <= 15;
        })
        .map((db) => {
          const csvTime = dayjs(csv.transactionTime);
          const dbTime = dayjs(db.transactionDate);
          const timeDiffSec = Math.abs(csvTime.diff(dbTime, "second"));

          // Step 3: Scoring (no orderId scoring)
          let score = 0;
          if (csv.amount === db.totalAmount) score += 40;
          if (timeDiffSec <= 5) score += 30;
          else if (timeDiffSec <= 15) score += 15;

          return {
            ...db,
            score,
            timeDiffSec,
          };
        })
        .sort((a, b) => b.score - a.score); // Sort by score descending

      // Step 4: Decision for fuzzy matches
      if (candidates.length === 1 && candidates[0].score >= 80) {
        status = "AUTO_MATCHED";
        matchedId = candidates[0].id;
        matchedDbIds.add(matchedId);
      } else if (candidates.length > 1) {
        status = "NEEDS_REVIEW";
      } else if (candidates.length === 0) {
        status = "UNMATCHED";
      }
    }

    results.push({
      csv,
      status,
      matchedId,
      candidates: candidates.length > 0 ? candidates : undefined,
    });
  }

  // Find unmatched DB transactions
  const unmatchedDbRows = dbRows.filter((db) => !matchedDbIds.has(db.id));

  return { matchedRows: results, unmatchedDbRows, matchedDbIds };
}

export default function ReconciliationPage() {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState([]);
  const [dbData, setDbData] = useState([]);
  const [autoMatchedRows, setAutoMatchedRows] = useState([]);
  const [unmatchedCsvRows, setUnmatchedCsvRows] = useState([]);
  const [unmatchedDbRows, setUnmatchedDbRows] = useState([]);
  const [matchedDbIds, setMatchedDbIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyImportedCsvRows, setAlreadyImportedCsvRows] = useState([]);
  const fileFormRef = React.useRef(null);
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    fileFormRef.current.value = null;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers based on real CSV format:
        // Transaction ID,Transaction Date,Stan,Nett Amount,Merchant name,Merchant ID,Currency,Amount,Transaction time,Transaction Status,Transaction Reference,Order ID
        const normalized = header.toLowerCase().trim();
        if (normalized === "order id") return "orderId";
        if (normalized === "transaction time") return "transactionTime";
        if (normalized === "amount") return "amount"; // Primary amount field for matching
        if (normalized === "nett amount") return "netAmount"; // Optional nett amount
        if (normalized === "transaction status") return "status";
        return header;
      },
      complete: async (results) => {
        const parsedData = results.data
          .map((row, index) => ({
            id: `csv_${index}`, // Add unique ID for each CSV row
            orderId: row.orderId || undefined,
            transactionTime: row.transactionTime,
            amount: parseFloat(row.amount) || 0,
            netAmount: parseFloat(row.netAmount) || undefined,
            status: row.status || undefined,
          }))
          .filter(
            (row) =>
              row.transactionTime &&
              row.amount > 0 &&
              row.status === "SETTLEMENT"
          );

        setCsvData(parsedData);

        // Reset reconciliation state when new CSV is uploaded
        setAutoMatchedRows([]);
        setUnmatchedCsvRows([]);
        setUnmatchedDbRows([]);
        setMatchedDbIds(new Set());
        setAlreadyImportedCsvRows([]);
        loadDbTransactions(parsedData.map((row) => row.orderId))
          .then((result) => {
            console.log(result);
            const filteredCsvData = parsedData.filter(
              (csvRow) => !result.existingQrisOrderIds.includes(csvRow.orderId)
            );

            setAlreadyImportedCsvRows(
              parsedData.filter((csvRow) =>
                result.existingQrisOrderIds.includes(csvRow.orderId)
              )
            );
            performReconciliation(filteredCsvData, result.transactions);
          })
          .catch(() => {
            setLoading(false);
          });
      },
    });
  };

  const loadDbTransactions = async (qrisOrderIds) => {
    try {
      const result = await getTransactionsByStatusAPI(
        "UNVERIFIED",
        qrisOrderIds
      );
      setDbData(result.transactions || []);

      // Filter CSV data based on existing QRIS order IDs

      // Reset reconciliation state when new DB data is loaded
      setAutoMatchedRows([]);
      setUnmatchedCsvRows([]);
      setUnmatchedDbRows([]);
      setMatchedDbIds(new Set());

      return result;
    } catch (error) {
      console.error("Error loading DB transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const performReconciliation = (csv, db) => {
    setDbData(db);
    if (csv.length === 0) return;
    const {
      matchedRows,
      unmatchedDbRows,
      matchedDbIds: newMatchedDbIds,
    } = reconcileCsvRows(csv, db);

    // Separate rows by status
    const autoMatched = matchedRows.filter(
      (row) => row.status === "AUTO_MATCHED"
    );
    const needsReview = matchedRows.filter(
      (row) => row.status === "NEEDS_REVIEW"
    );
    const unmatchedCsv = matchedRows.filter(
      (row) => row.status === "UNMATCHED"
    );

    setAutoMatchedRows(autoMatched);
    setUnmatchedCsvRows([...needsReview, ...unmatchedCsv]); // Combine NEEDS_REVIEW and UNMATCHED for CSV
    setUnmatchedDbRows(unmatchedDbRows);
    setMatchedDbIds(newMatchedDbIds);
    setLoading(false);
  };

  const handleDirectMatch = (row, selectedDbId) => {
    const oldMatchedId = row.matchedId;

    if (selectedDbId === "create_new") {
      // Create new transaction
      const updatedRow = {
        ...row,
        status: "CREATE_NEW",
        matchedId: "create_new",
      };

      // Update the row in unmatchedCsvRows
      setUnmatchedCsvRows((prev) =>
        prev.map((r) => (r.csv.id === row.csv.id ? updatedRow : r))
      );

      // Remove old match from matchedDbIds if it existed
      if (oldMatchedId && oldMatchedId !== "create_new") {
        setMatchedDbIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(oldMatchedId);
          return newSet;
        });

        // Add back to unmatchedDbRows
        const oldMatch = dbData.find((db) => db.id === oldMatchedId);
        if (oldMatch) {
          setUnmatchedDbRows((prev) => [...prev, oldMatch]);
        }
      }
    } else if (selectedDbId) {
      // Selecting or changing a match
      const updatedRow = {
        ...row,
        status: "MANUAL_MATCHED",
        matchedId: selectedDbId,
      };

      // Update the row in unmatchedCsvRows
      setUnmatchedCsvRows((prev) =>
        prev.map((r) => (r.csv.id === row.csv.id ? updatedRow : r))
      );

      // Handle DB transaction changes
      setMatchedDbIds((prev) => {
        const newSet = new Set(prev);
        // Remove old match if it exists
        if (oldMatchedId) {
          newSet.delete(oldMatchedId);
        }
        // Add new match
        newSet.add(selectedDbId);
        return newSet;
      });

      // Update unmatchedDbRows
      setUnmatchedDbRows((prev) => {
        let newUnmatched = [...prev];
        // Add back the old match if it was matched
        if (oldMatchedId) {
          const oldMatch = dbData.find((db) => db.id === oldMatchedId);
          if (oldMatch) {
            newUnmatched.push(oldMatch);
          }
        }
        // Remove the new match
        newUnmatched = newUnmatched.filter((db) => db.id !== selectedDbId);
        return newUnmatched;
      });
    } else {
      // Clearing the selection - go back to unmatched
      const updatedRow = {
        ...row,
        status:
          row.candidates && row.candidates.length > 1
            ? "NEEDS_REVIEW"
            : "UNMATCHED",
        matchedId: undefined,
      };

      // Update the row in unmatchedCsvRows
      setUnmatchedCsvRows((prev) =>
        prev.map((r) => (r.csv.id === row.csv.id ? updatedRow : r))
      );

      // Remove from matchedDbIds if it was matched
      if (oldMatchedId) {
        setMatchedDbIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(oldMatchedId);
          return newSet;
        });

        // Add back to unmatchedDbRows
        const oldMatch = dbData.find((db) => db.id === oldMatchedId);
        if (oldMatch) {
          setUnmatchedDbRows((prev) => [...prev, oldMatch]);
        }
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "AUTO_MATCHED":
        return <CheckCircleIcon color="success" />;
      case "MANUAL_MATCHED":
        return <CheckCircleIcon color="info" />;
      case "CREATE_NEW":
        return <AddCircleIcon color="primary" />;
      case "NEEDS_REVIEW":
        return <WarningIcon color="warning" />;
      case "UNMATCHED":
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "AUTO_MATCHED":
        return "success";
      case "MANUAL_MATCHED":
        return "info";
      case "CREATE_NEW":
        return "primary";
      case "NEEDS_REVIEW":
        return "warning";
      case "UNMATCHED":
        return "error";
      default:
        return "default";
    }
  };

  const handleSubmitReconciliation = async () => {
    setSubmitting(true);
    try {
      const autoMatchedResults = autoMatchedRows.map((row) => ({
        transactionId: row.matchedId,
        qrisOrderId: row.csv.orderId,
        qrisTransactionTime: row.csv.transactionTime,
        netAmount: row.csv.netAmount,
        status: "VERIFIED",
      }));

      const manualMatchedResults = unmatchedCsvRows
        .filter((row) => row.status === "MANUAL_MATCHED")
        .map((row) => ({
          transactionId: row.matchedId,
          qrisOrderId: row.csv.orderId,
          qrisTransactionTime: row.csv.transactionTime,
          netAmount: row.csv.netAmount,
          status: "VERIFIED",
        }));

      const createNewResults = unmatchedCsvRows
        .filter((row) => row.status === "CREATE_NEW")
        .map((row) => ({
          qrisOrderId: row.csv.orderId,
          qrisTransactionTime: row.csv.transactionTime,
          totalAmount: row.csv.amount,
          netAmount: row.csv.netAmount,
          status: "CREATE_NEW",
        }));

      const allResults = [
        ...autoMatchedResults,
        ...manualMatchedResults,
        ...createNewResults,
      ];

      await reconcileTransactionsAPI(allResults).then(() => {
        navigate({ to: "/transactions" });
      });
    } catch (error) {
      console.error("Reconciliation submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const manualMatched = unmatchedCsvRows.filter(
      (r) => r.status === "MANUAL_MATCHED"
    ).length;
    const csvTotal =
      autoMatchedRows.length +
      manualMatched +
      unmatchedCsvRows.length +
      alreadyImportedCsvRows.length;
    const dbTotal =
      autoMatchedRows.length + manualMatched + unmatchedDbRows.length;
    const autoMatched = autoMatchedRows.length;
    const needsReview = 0; // No longer needed since users can directly match
    const unmatchedCsv = unmatchedCsvRows.filter(
      (r) => r.status !== "MANUAL_MATCHED"
    ).length;
    const unmatchedDb = unmatchedDbRows.length;
    const alreadyImported = alreadyImportedCsvRows.length;

    return {
      csvTotal,
      dbTotal,
      autoMatched,
      manualMatched,
      needsReview,
      unmatchedCsv,
      unmatchedDb,
      alreadyImported,
    };
  }, [
    autoMatchedRows,
    unmatchedCsvRows,
    unmatchedDbRows,
    alreadyImportedCsvRows,
  ]);

  return (
    <Box sx={{ p: 3, position: "relative" }}>
      {submitting && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">Submitting Reconciliation...</Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your reconciliation data.
            </Typography>
          </Paper>
        </Box>
      )}
      <Typography variant="h4" gutterBottom>
        Impor data Gopay Merchant
      </Typography>

      {/* Upload Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            disabled={loading}
          >
            {loading ? (
              "Memuat..."
            ) : (
              <>
                Upload CSV
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  ref={fileFormRef}
                  onChange={handleFileUpload}
                />
              </>
            )}
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            CSV Rows: {csvData.length} | DB Transactions: {dbData.length}
          </Typography>
        </Box>
      </Paper>

      {/* Stats */}
      {(autoMatchedRows.length > 0 ||
        unmatchedCsvRows.length > 0 ||
        unmatchedDbRows.length > 0) && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Reconciliation Summary
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip label={`CSV Total: ${stats.csvTotal}`} color="primary" />
                <Chip label={`DB Total: ${stats.dbTotal}`} color="primary" />
                <Chip
                  label={`Auto Matched: ${stats.autoMatched}`}
                  color="success"
                />
                <Chip
                  label={`Manual Matched: ${stats.manualMatched}`}
                  color="info"
                />
                <Chip
                  label={`Unmatched CSV: ${stats.unmatchedCsv}`}
                  color="error"
                />
                <Chip
                  label={`Unmatched DB: ${stats.unmatchedDb}`}
                  color="error"
                />
                <Chip
                  label={`Already Imported: ${stats.alreadyImported}`}
                  color="info"
                />
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitReconciliation}
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {submitting ? "Submitting..." : "Submit Reconciliation"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Already Imported CSV Table */}
      {alreadyImportedCsvRows.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "info.main" }}>
            ℹ️ Data Already Imported Before
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kode Transaksi QRIS</TableCell>
                  <TableCell>Amount (Total Belanja)</TableCell>
                  <TableCell>Pendapatan Bersih</TableCell>
                  <TableCell>Waktu Pembayaran</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alreadyImportedCsvRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.orderId || "-"}</TableCell>
                    <TableCell>Rp {row.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {row.netAmount
                        ? `Rp ${row.netAmount.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {dayjs(row.transactionTime).format("DD/MM/YYYY HH:mm:ss")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Auto Matched Table */}
      {autoMatchedRows.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "success.main" }}>
            ✅ Auto Matched Transactions
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Nomor Transaksi</TableCell>
                  <TableCell>Kode Transaksi QRIS</TableCell>
                  <TableCell>Amount (Total Belanja)</TableCell>
                  <TableCell>Pendapatan Bersih</TableCell>
                  <TableCell>Waktu Transaksi</TableCell>
                  <TableCell>Waktu Pembayaran</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {autoMatchedRows.map((row) => {
                  const matchedDbTransaction = dbData.find(
                    (db) => db.id === row.matchedId
                  );
                  return (
                    <TableRow key={row.csv.id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {getStatusIcon(row.status)}
                          <Chip
                            label={row.status.replace("_", " ")}
                            color={getStatusColor(row.status)}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{row.matchedId}</TableCell>
                      <TableCell>{row.csv.orderId || "-"}</TableCell>
                      <TableCell>
                        Rp {row.csv.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {row.csv.netAmount
                          ? `Rp ${row.csv.netAmount.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {matchedDbTransaction
                          ? dayjs(matchedDbTransaction.transactionDate).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {dayjs(row.csv.transactionTime).format(
                          "DD/MM/YYYY HH:mm:ss"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Unmatched CSV Table */}
      {unmatchedCsvRows.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "warning.main" }}>
            ⚠️ Data Found in CSV Not Found (Conflicting) in Database
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Kode Transaksi QRIS</TableCell>
                  <TableCell>Amount (Total Belanja)</TableCell>
                  <TableCell>Pendapatan Bersih</TableCell>
                  <TableCell>Waktu Pembayaran</TableCell>
                  <TableCell>Match</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unmatchedCsvRows.map((row) => (
                  <TableRow key={row.csv.id}>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {getStatusIcon(row.status)}
                        <Chip
                          label={
                            row.status === "MANUAL_MATCHED"
                              ? "Manual Match"
                              : row.status === "CREATE_NEW"
                              ? "Create New"
                              : row.status.replace("_", " ")
                          }
                          color={getStatusColor(row.status)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{row.csv.orderId || "-"}</TableCell>
                    <TableCell>Rp {row.csv.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {row.csv.netAmount
                        ? `Rp ${row.csv.netAmount.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {dayjs(row.csv.transactionTime).format(
                        "DD/MM/YYYY HH:mm:ss"
                      )}
                    </TableCell>
                    <TableCell>
                      <FormControl
                        size="small"
                        sx={{ minWidth: 300, maxWidth: 300 }}
                      >
                        <Select
                          value={row.matchedId || ""}
                          displayEmpty
                          onChange={(e) =>
                            handleDirectMatch(row, e.target.value)
                          }
                          renderValue={(selected) => {
                            if (!selected) return <em>Select match...</em>;
                            if (selected === "create_new")
                              return <em>+ Create New Transaction</em>;
                            const selectedOption = [
                              ...(row.candidates && row.candidates.length > 0
                                ? row.candidates.filter(
                                    (candidate) =>
                                      !matchedDbIds.has(candidate.id) ||
                                      candidate.id === row.matchedId
                                  )
                                : [
                                    ...unmatchedDbRows,
                                    ...dbData.filter(() =>
                                      matchedDbIds.has(row.matchedId)
                                    ),
                                  ]),
                            ].find((option) => option.id === selected);
                            return selectedOption
                              ? `${
                                  selectedOption.id
                                } - Rp ${selectedOption.totalAmount.toLocaleString()}`
                              : selected;
                          }}
                        >
                          <MenuItem value="">
                            <em>Select match...</em>
                          </MenuItem>
                          <MenuItem value="create_new">
                            <em>+ Create New Transaction</em>
                          </MenuItem>
                          {(row.candidates && row.candidates.length > 0
                            ? row.candidates.filter(
                                (candidate) =>
                                  !matchedDbIds.has(candidate.id) ||
                                  candidate.id === row.matchedId
                              )
                            : [
                                ...unmatchedDbRows,
                                ...dbData.filter(() =>
                                  matchedDbIds.has(row.matchedId)
                                ),
                              ]
                          ).map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.id} -{" "}
                              {dayjs(option.transactionDate).format(
                                "DD/MM/YYYY HH:mm:ss"
                              )}{" "}
                              - Rp {option.totalAmount.toLocaleString()}{" "}
                              {option.orderId ? `- ${option.orderId}` : ""}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Unmatched DB Table */}
      {unmatchedDbRows.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "error.main" }}>
            ❌ Data Found in Database Not Found in CSV
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Transaksi</TableCell>
                  <TableCell>Kode Transaksi QRIS</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Waktu Transaksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unmatchedDbRows.map((dbRow) => (
                  <TableRow key={dbRow.id}>
                    <TableCell>{dbRow.id}</TableCell>
                    <TableCell>{dbRow.orderId || "-"}</TableCell>
                    <TableCell>
                      Rp {dbRow.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {dayjs(dbRow.transactionDate).format(
                        "DD/MM/YYYY HH:mm:ss"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Review Dialog - Removed: Now using direct selection in table */}
    </Box>
  );
}

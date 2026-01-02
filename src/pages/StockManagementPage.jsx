import React, { useState, useEffect } from "react";
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
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  getStocks,
  updateStock,
  batchUpdateStocks,
  addStock,
  deleteStock,
} from "../utils/api";
import useAuthStore from "../stores/authStore";

const getStatusColor = (status) => {
  switch (status) {
    case "Normal":
      return "success";
    case "Low":
      return "warning";
    case "Out of Stock":
      return "error";
    default:
      return "default";
  }
};

export default function StockManagementPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "Admin";
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    unit: "",
    notificationThreshold: 0,
  });
  const [saving, setSaving] = useState(false);
  const [correctionData, setCorrectionData] = useState([]);
  const [showCorrection, setShowCorrection] = useState(false);
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [newStockForm, setNewStockForm] = useState({
    itemName: "",
    quantity: 0,
    unit: "",
    notificationThreshold: 0,
  });
  const [deletingStockId, setDeletingStockId] = useState(null);

  useEffect(() => {
    const fetchStocksData = async () => {
      try {
        const data = await getStocks();
        setStocks(data.nodes);
        // Initialize correction data with current stock quantities
        setCorrectionData(
          data.nodes.map((stock) => ({
            id: stock.id,
            name: stock.name,
            systemStock: stock.currentStock,
            realStock: stock.currentStock, // Default to current stock
          }))
        );
      } catch (error) {
        console.error("Error fetching stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocksData();
  }, []);

  const handleEditClick = (stock) => {
    setSelectedStock(stock);
    setEditForm({
      name: stock.name,
      unit: stock.unit,
      notificationThreshold: stock.notificationThreshold,
    });
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedStock(null);
    setEditForm({
      name: "",
      unit: "",
      notificationThreshold: 0,
    });
  };

  const handleSave = async () => {
    if (!selectedStock) return;

    setSaving(true);
    try {
      await updateStock({
        id: selectedStock.id,
        itemName: editForm.name,
        unit: editForm.unit,
        notificationThreshold: editForm.notificationThreshold,
      });

      // Update the local state
      const data = await getStocks();
      setStocks(data.nodes);
      setCorrectionData(
        data.nodes.map((stock) => ({
          id: stock.id,
          name: stock.name,
          systemStock: stock.currentStock,
          realStock: stock.currentStock,
        }))
      );

      handleModalClose();
    } catch (error) {
      console.error("Error updating stock:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCorrectionChange = (id, realStock) => {
    setCorrectionData(
      correctionData.map((item) =>
        item.id === id ? { ...item, realStock: parseInt(realStock) || 0 } : item
      )
    );
  };

  const handleApplyCorrections = async () => {
    setSaving(true);
    try {
      const updates = correctionData
        .filter((item) => item.realStock !== item.systemStock)
        .map((item) => ({ id: item.id, quantity: item.realStock }));

      if (updates.length > 0) {
        await batchUpdateStocks(updates);
      }

      // Refresh the data
      const data = await getStocks();
      setStocks(data.nodes);
      setCorrectionData(
        data.nodes.map((stock) => ({
          id: stock.id,
          name: stock.name,
          systemStock: stock.currentStock,
          realStock: stock.currentStock,
        }))
      );

      // Reset to normal view after successful correction
      setShowCorrection(false);
    } catch (error) {
      console.error("Error applying corrections:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStock = async (stockId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item stok ini?")) {
      return;
    }

    setDeletingStockId(stockId);
    try {
      await deleteStock(stockId);
      // Refresh the data
      const data = await getStocks();
      setStocks(data.nodes);
      setCorrectionData(
        data.nodes.map((stock) => ({
          id: stock.id,
          name: stock.name,
          systemStock: stock.currentStock,
          realStock: stock.currentStock,
        }))
      );
    } catch (error) {
      console.error("Error deleting stock:", error);
      alert("Gagal menghapus item stok. Silakan coba lagi.");
    } finally {
      setDeletingStockId(null);
    }
  };

  const handleAddStockClick = () => {
    setAddStockModalOpen(true);
  };

  const handleAddStockModalClose = () => {
    setAddStockModalOpen(false);
    setNewStockForm({
      itemName: "",
      quantity: 0,
      unit: "",
      notificationThreshold: 0,
    });
  };

  const handleAddStock = async () => {
    if (!newStockForm.itemName.trim() || !newStockForm.unit.trim()) {
      alert("Nama item dan satuan harus diisi");
      return;
    }

    setSaving(true);
    try {
      await addStock({
        itemName: newStockForm.itemName,
        quantity: newStockForm.quantity,
        unit: newStockForm.unit,
        notificationThreshold: newStockForm.notificationThreshold,
      });

      // Refresh the data
      const data = await getStocks();
      setStocks(data.nodes);
      setCorrectionData(
        data.nodes.map((stock) => ({
          id: stock.id,
          name: stock.name,
          systemStock: stock.currentStock,
          realStock: stock.currentStock,
        }))
      );

      handleAddStockModalClose();
    } catch (error) {
      console.error("Error adding stock:", error);
      alert("Gagal menambah stok. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">
          {showCorrection ? "Koreksi Stok" : "Manajemen Stok"}
        </Typography>
        {isAdmin && !showCorrection && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleAddStockClick}
              disabled={deletingStockId !== null}
            >
              Tambah Stok
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowCorrection(true)}
              disabled={deletingStockId !== null}
            >
              Koreksi Stok
            </Button>
          </Box>
        )}
        {isAdmin && showCorrection && (
          <Button
            variant="outlined"
            onClick={() => setShowCorrection(false)}
            disabled={deletingStockId !== null}
          >
            Kembali ke Manajemen Stok
          </Button>
        )}
      </Box>

      {!showCorrection && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nama Material</TableCell>
                <TableCell align="right">Stok Saat Ini</TableCell>
                <TableCell align="right">Digunakan Hari Ini</TableCell>
                <TableCell align="right">Digunakan Bulan Ini</TableCell>
                <TableCell>Status</TableCell>
                {isAdmin && <TableCell align="center">Aksi</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">
                    {row.currentStock} {row.unit}
                  </TableCell>
                  <TableCell align="right">
                    {row.usedToday} {row.unit}
                  </TableCell>
                  <TableCell align="right">
                    {row.usedThisMonth} {row.unit}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={getStatusColor(row.status)}
                      size="small"
                    />
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEditClick(row)}
                        disabled={saving || deletingStockId !== null}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteStock(row.id)}
                        disabled={saving || deletingStockId === row.id}
                        sx={{ ml: 1 }}
                      >
                        {deletingStockId === row.id ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {showCorrection && (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, mt: 2 }}
          >
            Masukkan jumlah stok aktual untuk memperbaiki ketidaksesuaian.
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell align="right">Stok Sistem</TableCell>
                  <TableCell align="right">Stok Real</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {correctionData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.systemStock}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={item.realStock}
                        onChange={(e) =>
                          handleCorrectionChange(item.id, e.target.value)
                        }
                        sx={{ width: 100 }}
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {isAdmin && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleApplyCorrections}
                disabled={
                  saving ||
                  !correctionData.some(
                    (item) => item.realStock !== item.systemStock
                  )
                }
              >
                {saving ? <CircularProgress size={20} /> : "Terapkan Koreksi"}
              </Button>
            </Box>
          )}
        </>
      )}

      {isAdmin && (
        <Dialog
          open={editModalOpen}
          onClose={handleModalClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Item Stok</DialogTitle>
          <DialogContent>
            <Box
              sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Nama"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Satuan"
                value={editForm.unit}
                onChange={(e) =>
                  setEditForm({ ...editForm, unit: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Batas Notifikasi"
                type="number"
                value={editForm.notificationThreshold}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    notificationThreshold: parseInt(e.target.value) || 0,
                  })
                }
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={20} /> : "Simpan"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {isAdmin && (
        <Dialog
          open={addStockModalOpen}
          onClose={handleAddStockModalClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Tambah Item Stok Baru</DialogTitle>
          <DialogContent>
            <Box
              sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Nama Item"
                value={newStockForm.itemName}
                onChange={(e) =>
                  setNewStockForm({ ...newStockForm, itemName: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Jumlah Awal"
                type="number"
                value={newStockForm.quantity}
                onChange={(e) =>
                  setNewStockForm({
                    ...newStockForm,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Satuan"
                value={newStockForm.unit}
                onChange={(e) =>
                  setNewStockForm({ ...newStockForm, unit: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Batas Notifikasi"
                type="number"
                value={newStockForm.notificationThreshold}
                onChange={(e) =>
                  setNewStockForm({
                    ...newStockForm,
                    notificationThreshold: parseInt(e.target.value) || 0,
                  })
                }
                fullWidth
                inputProps={{ min: 0 }}
                helperText="Notifikasi akan muncul ketika stok di bawah batas ini"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddStockModalClose} disabled={saving}>
              Batal
            </Button>
            <Button
              onClick={handleAddStock}
              variant="contained"
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : "Tambah"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

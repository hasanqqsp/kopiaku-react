import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// Sample employee data
const sampleEmployeeData = [
  {
    id: 1,
    name: "Ahmad Rahman",
    nickname: "Ahmad",
    username: "ahmad.rahman",
    position: "Manager",
    lastLogin: "2025-12-15 09:30",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    nickname: "Siti",
    username: "siti.nurhaliza",
    position: "Kasir",
    lastLogin: "2025-12-15 08:15",
  },
  {
    id: 3,
    name: "Budi Santoso",
    nickname: "Budi",
    username: "budi.santoso",
    position: "Barista",
    lastLogin: "2025-12-14 16:45",
  },
  {
    id: 4,
    name: "Maya Sari",
    nickname: "Maya",
    username: "maya.sari",
    position: "Kasir",
    lastLogin: "2025-12-15 10:20",
  },
  {
    id: 5,
    name: "Rizki Pratama",
    nickname: "Rizki",
    username: "rizki.pratama",
    position: "Barista",
    lastLogin: "2025-12-13 14:10",
  },
];

// Sample attendance data
const sampleAttendanceData = [
  {
    id: 1,
    name: "Ahmad Rahman",
    waktuMasuk: "2025-12-15 08:00",
    waktuKeluar: "2025-12-15 17:00",
    status: "Hadir",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    waktuMasuk: "2025-12-15 08:15",
    waktuKeluar: null,
    status: "Masih Bekerja",
  },
  {
    id: 3,
    name: "Budi Santoso",
    waktuMasuk: "2025-12-15 08:30",
    waktuKeluar: "2025-12-15 16:30",
    status: "Hadir",
  },
  {
    id: 4,
    name: "Maya Sari",
    waktuMasuk: "2025-12-15 09:00",
    waktuKeluar: null,
    status: "Masih Bekerja",
  },
  {
    id: 5,
    name: "Rizki Pratama",
    waktuMasuk: "2025-12-14 08:00",
    waktuKeluar: "2025-12-14 17:15",
    status: "Hadir",
  },
];

const getAttendanceStatusColor = (status) => {
  switch (status) {
    case "Hadir":
      return "success";
    case "Masih Bekerja":
      return "primary";
    case "Tidak Hadir":
      return "error";
    default:
      return "default";
  }
};

export default function EmployeesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    nickname: "",
    username: "",
    position: "",
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewPhoto = (employee) => {
    setSelectedEmployee(employee);
    setPhotoModalOpen(true);
  };

  const handleClosePhotoModal = () => {
    setPhotoModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleOpenAddEmployeeModal = () => {
    setAddEmployeeModalOpen(true);
  };

  const handleCloseAddEmployeeModal = () => {
    setAddEmployeeModalOpen(false);
    setNewEmployee({
      name: "",
      nickname: "",
      username: "",
      position: "",
    });
  };

  const handleAddEmployee = () => {
    // In a real app, this would make an API call to add the employee
    console.log("Adding employee:", newEmployee);
    handleCloseAddEmployeeModal();
  };

  const handleEmployeeInputChange = (field, value) => {
    setNewEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employees
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="employee tabs"
        >
          <Tab label="Kehadiran" />
          <Tab label="Daftar Karyawan" />
        </Tabs>
      </Box>

      {/* Kehadiran Tab */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Kehadiran Karyawan
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell>Waktu Masuk</TableCell>
                  <TableCell>Waktu Keluar</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleAttendanceData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.waktuMasuk}</TableCell>
                    <TableCell>{row.waktuKeluar || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        color={getAttendanceStatusColor(row.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewPhoto(row)}
                      >
                        Lihat Foto
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Daftar Karyawan Tab */}
      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Daftar Karyawan</Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddEmployeeModal}
            >
              Tambah Karyawan
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Nickname</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Last Login</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleEmployeeData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.nickname}</TableCell>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell>{row.lastLogin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Photo Modal */}
      <Dialog
        open={photoModalOpen}
        onClose={handleClosePhotoModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Foto Karyawan
          <IconButton
            aria-label="close"
            onClick={handleClosePhotoModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEmployee && (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                {selectedEmployee.name}
              </Typography>
              <Box
                component="img"
                src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face`}
                alt={`Foto ${selectedEmployee.name}`}
                sx={{
                  width: 250,
                  height: 250,
                  borderRadius: 2,
                  objectFit: "cover",
                  border: "2px solid #e0e0e0",
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {selectedEmployee.position}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhotoModal}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Add Employee Modal */}
      <Dialog
        open={addEmployeeModalOpen}
        onClose={handleCloseAddEmployeeModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Tambah Karyawan Baru
          <IconButton
            aria-label="close"
            onClick={handleCloseAddEmployeeModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Nama Lengkap"
              value={newEmployee.name}
              onChange={(e) =>
                handleEmployeeInputChange("name", e.target.value)
              }
              fullWidth
              required
            />
            <TextField
              label="Panggilan"
              value={newEmployee.nickname}
              onChange={(e) =>
                handleEmployeeInputChange("nickname", e.target.value)
              }
              fullWidth
            />
            <TextField
              label="Username"
              value={newEmployee.username}
              onChange={(e) =>
                handleEmployeeInputChange("username", e.target.value)
              }
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Posisi</InputLabel>
              <Select
                value={newEmployee.position}
                label="Posisi"
                onChange={(e) =>
                  handleEmployeeInputChange("position", e.target.value)
                }
              >
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Kasir">Kasir</MenuItem>
                <MenuItem value="Barista">Barista</MenuItem>
                <MenuItem value="Waiter">Waiter</MenuItem>
                <MenuItem value="Cleaner">Cleaner</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddEmployeeModal}>Batal</Button>
          <Button
            onClick={handleAddEmployee}
            variant="contained"
            disabled={
              !newEmployee.name ||
              !newEmployee.username ||
              !newEmployee.position
            }
          >
            Tambah Karyawan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

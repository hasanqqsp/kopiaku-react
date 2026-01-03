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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
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
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import { 
  fetchUsers, 
  fetchPresences, 
  addEmployees, 
  validatePresence,
  setUserActiveStatus,
  updateUserProfile 
} from "../utils/api";

const getAttendanceStatusColor = (status) => {
  switch (status) {
    case "Present":
      return "success";
    case "Working":
      return "primary";  
    case "Absent":
      return "error";
    default:
      return "default";
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPresenceStatus = (presence) => {
  if (!presence) return "Absent";
  if (presence.checkInTime && presence.checkOutTime) return "Present";
  if (presence.checkInTime && !presence.checkOutTime) return "Working";
  return "Absent";
};

export default function EmployeesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState(null);
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [editEmployeeModalOpen, setEditEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    contact: "",
    nickname: "",
  });
  const [editEmployee, setEditEmployee] = useState({
    name: "",
    username: "",
    email: "",
    contact: "",
    nickname: "",
  });
  
  // Data states
  const [employees, setEmployees] = useState([]);
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validatingPresence, setValidatingPresence] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [employeesData, presencesData] = await Promise.all([
        fetchUsers({ first: 1000 }),
        fetchPresences({ first: 1000 })
      ]);
      
      setEmployees(employeesData.nodes || []);
      setPresences(presencesData.nodes || []);
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
      console.error('Error loading employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewPhoto = (presence) => {
    setSelectedPresence(presence);
    setPhotoModalOpen(true);
  };

  const handleClosePhotoModal = () => {
    setPhotoModalOpen(false);
    setSelectedPresence(null);
  };

  const handleOpenAddEmployeeModal = () => {
    setAddEmployeeModalOpen(true);
  };

  const handleCloseAddEmployeeModal = () => {
    setAddEmployeeModalOpen(false);
    setNewEmployee({
      name: "",
      username: "",
      email: "",
      password: "",
      contact: "",
      nickname: "",
    });
  };

  const handleOpenEditEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    setEditEmployee({
      name: employee.name,
      username: employee.username,
      email: employee.email,
      contact: employee.contact || "",
      nickname: employee.nickname || "",
    });
    setEditEmployeeModalOpen(true);
  };

  const handleCloseEditEmployeeModal = () => {
    setEditEmployeeModalOpen(false);
    setSelectedEmployee(null);
    setEditEmployee({
      name: "",
      username: "",
      email: "",
      contact: "",
      nickname: "",
    });
  };

  const handleAddEmployee = async () => {
    try {
      setLoading(true);
      await addEmployees({
        name: newEmployee.name,
        username: newEmployee.username,
        email: newEmployee.email,
        password: newEmployee.password,
        contact: newEmployee.contact || null,
        nickname: newEmployee.nickname || null,
      });
      
      // Refresh the employees list
      await loadData();
      handleCloseAddEmployeeModal();
    } catch (err) {
      setError(`Failed to add employee: ${err.message}`);
      console.error('Error adding employee:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeInputChange = (field, value) => {
    setNewEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditEmployeeInputChange = (field, value) => {
    setEditEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditEmployee = async () => {
    try {
      setLoading(true);
      await updateUserProfile({
        userId: selectedEmployee.id,
        input: {
          name: editEmployee.name,
          username: editEmployee.username,
          email: editEmployee.email,
          contact: editEmployee.contact || null,
          nickname: editEmployee.nickname || null,
        },
      });
      
      // Refresh the employees list
      await loadData();
      handleCloseEditEmployeeModal();
    } catch (err) {
      setError(`Failed to update employee: ${err.message}`);
      console.error('Error updating employee:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePresence = async (presenceId) => {
    try {
      setValidatingPresence(presenceId);
      await validatePresence(presenceId);
      
      // Refresh the presences list
      await loadData();
    } catch (err) {
      setError(`Failed to validate presence: ${err.message}`);
      console.error('Error validating presence:', err);
    } finally {
      setValidatingPresence(null);
    }
  };

  const handleToggleEmployeeStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'deactivate';
    
    try {
      setLoading(true);
      await setUserActiveStatus({ userId, isActive: newStatus });
      
      // Refresh the employees list
      await loadData();
    } catch (err) {
      setError(`Failed to ${actionText} employee: ${err.message}`);
      console.error(`Error ${actionText}ing employee:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employees
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
                  <TableCell>User ID</TableCell>
                  <TableCell>Waktu Masuk</TableCell>
                  <TableCell>Waktu Keluar</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Validated</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {presences.map((presence) => {
                  const status = getPresenceStatus(presence);
                  return (
                    <TableRow key={presence.id}>
                      <TableCell>{presence.userId}</TableCell>
                      <TableCell>{formatDateTime(presence.checkInTime)}</TableCell>
                      <TableCell>{formatDateTime(presence.checkOutTime)}</TableCell>
                      <TableCell>
                        <Chip
                          label={status}
                          color={getAttendanceStatusColor(status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={presence.validated ? "Validated" : "Pending"}
                          color={presence.validated ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewPhoto(presence)}
                          sx={{ mr: 1 }}
                        >
                          Lihat Foto
                        </Button>
                        {!presence.validated && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            startIcon={validatingPresence === presence.id ? <CircularProgress size={16} /> : <CheckIcon />}
                            onClick={() => handleValidatePresence(presence.id)}
                            disabled={validatingPresence === presence.id}
                          >
                            Validate
                          </Button>
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
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell align="center">Active Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.nickname || '-'}</TableCell>
                    <TableCell>{employee.username}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={employee.role} 
                        color={employee.role === 'Admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{employee.contact || '-'}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={employee.isActive}
                        onChange={() => handleToggleEmployeeStatus(employee.id, employee.isActive)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditEmployeeModal(employee)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
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
          Foto Kehadiran
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
          {selectedPresence && (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                User ID: {selectedPresence.userId}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Check-in: {formatDateTime(selectedPresence.checkInTime)}
              </Typography>
              {selectedPresence.imageUrl ? (
                <Box
                  component="img"
                  src={selectedPresence.imageUrl}
                  alt={`Foto kehadiran ${selectedPresence.userId}`}
                  sx={{
                    width: 250,
                    height: 250,
                    borderRadius: 2,
                    objectFit: "cover",
                    border: "2px solid #e0e0e0",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 250,
                    height: 250,
                    borderRadius: 2,
                    border: "2px solid #e0e0e0",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    mx: 'auto'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No image available
                  </Typography>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Status: {selectedPresence.validated ? 'Validated' : 'Pending Validation'}
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
              label="Nickname"
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
            <TextField
              label="Email"
              type="email"
              value={newEmployee.email}
              onChange={(e) =>
                handleEmployeeInputChange("email", e.target.value)
              }
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={newEmployee.password}
              onChange={(e) =>
                handleEmployeeInputChange("password", e.target.value)
              }
              fullWidth
              required
            />
            <TextField
              label="Contact (Optional)"
              value={newEmployee.contact}
              onChange={(e) =>
                handleEmployeeInputChange("contact", e.target.value)
              }
              fullWidth
            />
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
              !newEmployee.email ||
              !newEmployee.password ||
              loading
            }
          >
            {loading ? <CircularProgress size={20} /> : 'Tambah Karyawan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog
        open={editEmployeeModalOpen}
        onClose={handleCloseEditEmployeeModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Edit Karyawan
          <IconButton
            aria-label="close"
            onClick={handleCloseEditEmployeeModal}
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
              value={editEmployee.name}
              onChange={(e) =>
                handleEditEmployeeInputChange("name", e.target.value)
              }
              fullWidth
              required
            />
            <TextField
              label="Nickname"
              value={editEmployee.nickname}
              onChange={(e) =>
                handleEditEmployeeInputChange("nickname", e.target.value)
              }
              fullWidth
            />
            <TextField
              label="Username"
              value={editEmployee.username}
              onChange={(e) =>
                handleEditEmployeeInputChange("username", e.target.value)
              }
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={editEmployee.email}
              onChange={(e) =>
                handleEditEmployeeInputChange("email", e.target.value)
              }
              fullWidth
              required
            />
            <TextField
              label="Contact"
              value={editEmployee.contact}
              onChange={(e) =>
                handleEditEmployeeInputChange("contact", e.target.value)
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditEmployeeModal}>Batal</Button>
          <Button
            onClick={handleEditEmployee}
            variant="contained"
            disabled={
              !editEmployee.name ||
              !editEmployee.username ||
              !editEmployee.email ||
              loading
            }
          >
            {loading ? <CircularProgress size={20} /> : 'Update Karyawan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

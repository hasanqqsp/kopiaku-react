import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  getMenusWithDetails,
  createMenu,
  createRecipe,
  fetchStocks,
  deleteMenu,
  updateMenu,
  deleteRecipe,
} from "../utils/api";
import useAuthStore from "../stores/authStore";

export default function MenuPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "Admin";
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [ingredients, setIngredients] = useState([
    { stockId: "", quantity: 1 },
  ]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [deletingMenuId, setDeletingMenuId] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const data = await getMenusWithDetails();
        setMenus(data.nodes);
      } catch (error) {
        console.error("Error fetching menus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  useEffect(() => {
    if (createDialogOpen) {
      const fetchStocksData = async () => {
        try {
          const data = await fetchStocks();
          setStocks(data.nodes);
        } catch (error) {
          console.error("Error fetching stocks:", error);
        }
      };
      fetchStocksData();
    }
  }, [createDialogOpen]);

  const handleCreateMenu = async () => {
    if (!menuForm.name.trim()) {
      alert("Nama menu harus diisi");
      return;
    }

    setSaving(true);
    try {
      const menuData = {
        name: menuForm.name,
        description: menuForm.description,
        category: menuForm.category,
        price: menuForm.price,
        ingredients: ingredients
          .filter((ing) => ing.stockId)
          .map((ing) => ({
            stockId: ing.stockId,
            quantity: ing.quantity,
          })),
      };

      // Create recipe with ingredients
      await createMenu({ menu: menuData, image: selectedImage });
      // Reset form and close dialog
      setMenuForm({
        name: "",
        description: "",
        category: "",
        price: 0,
      });
      setSelectedImage(null);
      setIngredients([{ stockId: "", quantity: 1 }]);
      setCreateDialogOpen(false);

      // Refresh menus
      const data = await getMenusWithDetails();
      setMenus(data.nodes);
    } catch (error) {
      console.error("Error creating menu:", error);
      alert("Gagal membuat menu. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setIsEditMode(true);
    setMenuForm({
      name: menu.name,
      description: menu.description,
      category: menu.category || "",
      price: menu.price || 0,
    });
    setSelectedImage(null); // Don't pre-populate file input
    setExistingImageUrl(menu.imageUrl); // Show existing image
    // Populate ingredients from existing recipe
    const existingIngredients =
      menu.recipes?.[0]?.ingredients?.map((ing) => ({
        stockId: ing.stockId,
        quantity: ing.quantity,
      })) || [];
    setIngredients(
      existingIngredients.length > 0
        ? existingIngredients
        : [{ stockId: "", quantity: 1 }]
    );
    setCreateDialogOpen(true);
  };

  const handleDeleteMenu = async (menuId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
      return;
    }

    setDeletingMenuId(menuId);
    try {
      await deleteMenu(menuId);
      // Refresh menus
      const data = await getMenusWithDetails();
      setMenus(data.nodes);
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Gagal menghapus menu. Silakan coba lagi.");
    } finally {
      setDeletingMenuId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!menuForm.name.trim()) {
      alert("Nama menu harus diisi");
      return;
    }

    setSaving(true);
    try {
      const menuData = {
        name: menuForm.name,
        description: menuForm.description,
        category: menuForm.category,
        price: menuForm.price,
      };

      await updateMenu({
        id: editingMenu.id,
        menu: menuData,
        image: selectedImage,
      });

      // Handle recipe updates - delete existing recipes and create new ones
      const newIngredients = ingredients.filter((ing) => ing.stockId);
      const existingRecipes = editingMenu.recipes || [];

      // Delete existing recipes
      for (const recipe of existingRecipes) {
        if (recipe.id) {
          await deleteRecipe(recipe.id);
        }
      }

      // Create new recipe if there are ingredients
      if (newIngredients.length > 0) {
        await createRecipe(
          editingMenu.id,
          newIngredients.map((ing) => ({
            stockId: ing.stockId,
            quantity: ing.quantity,
          }))
        );
      }

      // Reset form and close dialog
      setMenuForm({
        name: "",
        description: "",
        category: "",
        price: 0,
      });
      setSelectedImage(null);
      setExistingImageUrl(null);
      setIngredients([{ stockId: "", quantity: 1 }]);
      setCreateDialogOpen(false);
      setIsEditMode(false);
      setEditingMenu(null);

      // Refresh menus
      const data = await getMenusWithDetails();
      setMenus(data.nodes);
    } catch (error) {
      console.error("Error updating menu:", error);
      alert("Gagal mengupdate menu. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Menu
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={saving || deletingMenuId !== null}
          >
            Tambah Menu
          </Button>
        )}
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={3}>
            {menus.map((item) => (
              <Grid
                item
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                }}
                key={item.id}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
                  >
                    {isAdmin && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleEditMenu(item)}
                          disabled={saving || deletingMenuId !== null}
                          sx={{ bgcolor: "rgba(255, 255, 255, 0.8)", mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteMenu(item.id)}
                          disabled={saving || deletingMenuId === item.id}
                          sx={{ bgcolor: "rgba(255, 255, 255, 0.8)" }}
                        >
                          {deletingMenuId === item.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </>
                    )}
                  </Box>
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      item.imageUrl || "https://via.placeholder.com/400x300"
                    }
                    alt={item.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {item.description}
                    </Typography>

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Ingredients:
                    </Typography>

                    <Box sx={{ fontSize: "0.875rem" }}>
                      {item.recipes
                        ?.flatMap((recipe) => recipe.ingredients || [])
                        .map((ingredient, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                              borderBottom:
                                index <
                                (item.recipes?.flatMap(
                                  (r) => r.ingredients || []
                                ).length || 0) -
                                  1
                                  ? "1px dashed #e0e0e0"
                                  : "none",
                              pb: 0.5,
                            }}
                          >
                            <Typography variant="body2">
                              {ingredient.stock?.itemName || "Unknown"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {ingredient.quantity}{" "}
                              {ingredient.stock?.unit || ""}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Dialog
            open={createDialogOpen}
            onClose={() => {
              setCreateDialogOpen(false);
              setIsEditMode(false);
              setEditingMenu(null);
              setMenuForm({
                name: "",
                description: "",
                category: "",
                price: 0,
              });
              setSelectedImage(null);
              setExistingImageUrl(null);
              setIngredients([{ stockId: "", quantity: 1 }]);
            }}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {isEditMode ? "Edit Menu" : "Tambah Menu Baru"}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Nama Menu"
                fullWidth
                variant="outlined"
                value={menuForm.name}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, name: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Deskripsi"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={menuForm.description}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, description: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Kategori"
                fullWidth
                variant="outlined"
                value={menuForm.category}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, category: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Harga"
                type="number"
                fullWidth
                variant="outlined"
                value={menuForm.price}
                onChange={(e) =>
                  setMenuForm({
                    ...menuForm,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                Upload Foto
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
              </Button>
              {(selectedImage || existingImageUrl) && (
                <Box sx={{ mb: 2 }}>
                  {selectedImage && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      File baru dipilih: {selectedImage.name}
                    </Typography>
                  )}
                  {!selectedImage && existingImageUrl && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Foto saat ini:
                    </Typography>
                  )}
                  <Box
                    component="img"
                    src={
                      selectedImage
                        ? URL.createObjectURL(selectedImage)
                        : existingImageUrl
                    }
                    alt="Preview"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                  />
                </Box>
              )}

              <Typography variant="h6" sx={{ mb: 2 }}>
                Bahan-bahan
              </Typography>
              {ingredients.map((ingredient, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    width: "100%",
                  }}
                >
                  <Autocomplete
                    options={stocks}
                    getOptionLabel={(option) =>
                      `${option.itemName} (${option.unit})`
                    }
                    value={
                      stocks.find((stock) => stock.id === ingredient.stockId) ||
                      null
                    }
                    onChange={(event, newValue) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index].stockId = newValue
                        ? newValue.id
                        : "";
                      setIngredients(newIngredients);
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value?.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Bahan"
                        sx={{ mr: 2, minWidth: 200, flex: 1 }}
                      />
                    )}
                    sx={{ mr: 2, minWidth: 200, flex: 1 }}
                    noOptionsText="Tidak ada bahan tersedia"
                    clearText="Hapus"
                    closeText="Tutup"
                  />
                  <TextField
                    label="Jumlah"
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index].quantity =
                        parseFloat(e.target.value) || 1;
                      setIngredients(newIngredients);
                    }}
                    sx={{ mr: 2, width: 100 }}
                  />
                  <IconButton
                    onClick={() => {
                      const newIngredients = ingredients.filter(
                        (_, i) => i !== index
                      );
                      setIngredients(newIngredients);
                    }}
                    disabled={ingredients.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  setIngredients([...ingredients, { stockId: "", quantity: 1 }])
                }
                sx={{ mt: 1 }}
              >
                Tambah Bahan
              </Button>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setCreateDialogOpen(false);
                  setIsEditMode(false);
                  setEditingMenu(null);
                  setMenuForm({
                    name: "",
                    description: "",
                    category: "",
                    price: 0,
                  });
                  setSelectedImage(null);
                  setExistingImageUrl(null);
                  setIngredients([{ stockId: "", quantity: 1 }]);
                }}
              >
                Batal
              </Button>
              <Button
                onClick={isEditMode ? handleSaveEdit : handleCreateMenu}
                variant="contained"
                disabled={saving}
              >
                {saving ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

const STORAGE_KEY = "landingContent";

const initialData = {
  hero: {
    title: "Kopi Berkualitas, Harga Bersahabat.",
    desc: "Kami percaya setiap orang berhak menikmati secangkir kopi yang baik tanpa harus menguras dompet. Temukan semangatmu di setiap tegukan.",
    bg: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?q=80&w=3456&auto=format&fit=crop",
  },
  about: {
    story: [
      "Kopi Aku lahir dari kecintaan mendalam terhadap kopi dan keresahan akan tingginya harga kopi di sekitar kampus. Kehadiran kami bertujuan untuk mengubah pandangan bahwa kualitas selalu identik dengan harga tinggi.",
      "Kami ingin membuktikan bahwa kopi berkualitas dapat dinikmati oleh siapa saja.",
    ],
    vision:
      "Menjadi merek kopi pilihan mahasiswa dan masyarakat luas dengan menyajikan kopi berkualitas tinggi yang mudah diakses dan terjangkau.",
    mission: [
      "Menyajikan kualitas unggul",
      "Menciptakan pengalaman berkesan",
      "Berinovasi tanpa henti",
      "Menjadi bagian dari gaya hidup",
    ],
    origin:
      "Perjalanan Kopi Aku dimulai dari tempat yang sederhana di atas kendaraan, di sekitar kampus, hingga di booth kecil di berbagai acara.",
  },
  menu: [
    {
      category: "REFRESHMENT DRINK",
      items: [
        { name: "Espresso", price: 8000 },
        { name: "Americano", price: 12000 },
      ],
    },
  ],
  promo: {
    title: "Promosi Spesial Untukmu!",
    rules: [
      "Temukan booth KOPI AKU di sekitarmu",
      "Ajak minimal 2 temanmu untuk beli KOPI AKU bareng",
      "Follow Instagram @kopiakuu dan tunjukkan ke kasir",
      "Langsung dapetin kopimu dengan SETENGAH HARGA",
    ],
  },
  location: {
    hours: "11:00 - 22:00 WIB",
    address:
      "Jl. Belimbing, RT.02/RW.05, Tegal Gundil, Kec. Bogor Utara, Kota Bogor, Jawa Barat 16152",
    phone: "6287814811610",
    instagram: "@kopiakuu",
    map: "",
  },
  carousel: [
    {
      url: "https://image2url.com/images/1761188402746-8047f73e-0b1e-4312-aeb5-bb1917613a72.png",
      alt: "Kopi Pilihan",
    },
  ],
};

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : initialData;
    } catch {
      return initialData;
    }
  });

  useEffect(() => {
    // keep local state in sync if storage changes elsewhere
    const handler = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setData(JSON.parse(raw));
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const saveSection = () => {
    const copy = { ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
    alert("Konten berhasil disimpan!");
  };

  const update = (path, value) => {
    // path as array
    const next = JSON.parse(JSON.stringify(data));
    let cur = next;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
    cur[path[path.length - 1]] = value;
    setData(next);
  };

  const addMission = () => {
    const next = { ...data };
    next.about.mission.push("Misi baru");
    setData(next);
  };

  const removeMission = (idx) => {
    const next = { ...data };
    next.about.mission.splice(idx, 1);
    setData(next);
  };

  const addCategory = () => {
    const next = { ...data };
    next.menu.push({ category: "Kategori Baru", items: [] });
    setData(next);
  };

  const removeCategory = (idx) => {
    const next = { ...data };
    next.menu.splice(idx, 1);
    setData(next);
  };

  const addMenuItem = (catIdx) => {
    const next = { ...data };
    next.menu[catIdx].items.push({ name: "Item Baru", price: 0 });
    setData(next);
  };

  const removeMenuItem = (catIdx, itemIdx) => {
    const next = { ...data };
    next.menu[catIdx].items.splice(itemIdx, 1);
    setData(next);
  };

  const addPromoRule = () => {
    const next = { ...data };
    next.promo.rules.push("Aturan baru");
    setData(next);
  };

  const removePromoRule = (idx) => {
    const next = { ...data };
    next.promo.rules.splice(idx, 1);
    setData(next);
  };

  const addCarouselImage = () => {
    const next = { ...data };
    next.carousel.push({ url: "", alt: "" });
    setData(next);
  };

  const removeCarouselImage = (idx) => {
    const next = { ...data };
    next.carousel.splice(idx, 1);
    setData(next);
  };

  // Sidebar removed — main content will use full width

  return (
    <Box sx={{ display: "block", width: "100%" }}>
      <Box component="main" sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Content Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Kelola konten landing page Kopi Aku
        </Typography>

        {/* Tabs header */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ mb: 3 }}
        >
          {[
            ["hero", "Hero Section"],
            ["about", "Tentang Kami"],
            ["menu", "Menu"],
            ["promo", "Promosi"],
            ["location", "Lokasi & Kontak"],
            ["carousel", "Carousel Images"],
          ].map(([key, label]) => (
            <Tab key={key} label={label} value={key} />
          ))}
        </Tabs>

        {/* Content area */}
        <Paper sx={{ p: 3 }}>
          {activeTab === "hero" && (
            <Box>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6">Hero Section</Typography>
                  <TextField
                    fullWidth
                    label="Judul Hero"
                    value={data.hero.title}
                    onChange={(e) => update(["hero", "title"], e.target.value)}
                    sx={{ my: 1 }}
                  />
                  <TextField
                    fullWidth
                    label="Deskripsi Hero"
                    multiline
                    minRows={3}
                    value={data.hero.desc}
                    onChange={(e) => update(["hero", "desc"], e.target.value)}
                    sx={{ my: 1 }}
                  />
                  <TextField
                    fullWidth
                    label="Background Image URL"
                    value={data.hero.bg}
                    onChange={(e) => update(["hero", "bg"], e.target.value)}
                    sx={{ my: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Preview</Typography>
                  <Box
                    sx={{
                      mt: 1,
                      borderRadius: 1,
                      overflow: "hidden",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        height: 120,
                        backgroundImage: `url(${data.hero.bg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle1">
                        {data.hero.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {data.hero.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={() => saveSection("hero")}>
                  Simpan
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === "about" && (
            <Box>
              <Typography variant="h6">Tentang Kami</Typography>
              <TextField
                label="Paragraf 1"
                fullWidth
                multiline
                minRows={2}
                value={data.about.story[0] || ""}
                onChange={(e) => {
                  const next = { ...data };
                  next.about.story[0] = e.target.value;
                  setData(next);
                }}
                sx={{ my: 1 }}
              />
              <TextField
                label="Paragraf 2"
                fullWidth
                multiline
                minRows={2}
                value={data.about.story[1] || ""}
                onChange={(e) => {
                  const next = { ...data };
                  next.about.story[1] = e.target.value;
                  setData(next);
                }}
                sx={{ my: 1 }}
              />
              <TextField
                label="Visi"
                fullWidth
                multiline
                minRows={2}
                value={data.about.vision}
                onChange={(e) => update(["about", "vision"], e.target.value)}
                sx={{ my: 1 }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Misi</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {data.about.mission.map((m, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        fullWidth
                        value={m}
                        onChange={(e) => {
                          const next = { ...data };
                          next.about.mission[idx] = e.target.value;
                          setData(next);
                        }}
                      />
                      <Button color="error" onClick={() => removeMission(idx)}>
                        Hapus
                      </Button>
                    </Box>
                  ))}
                  <Button onClick={addMission}>+ Tambah Misi</Button>
                </Stack>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Awal Mula</Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={data.about.origin}
                  onChange={(e) => update(["about", "origin"], e.target.value)}
                  sx={{ my: 1 }}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => saveSection("about")}
                >
                  Simpan
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === "menu" && (
            <Box>
              <Typography variant="h6">Menu</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {data.menu.map((cat, idx) => (
                  <Paper key={idx} sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <TextField
                        label="Kategori"
                        value={cat.category}
                        onChange={(e) => {
                          const next = { ...data };
                          next.menu[idx].category = e.target.value;
                          setData(next);
                        }}
                        sx={{ flex: 1 }}
                      />
                      <Button color="error" onClick={() => removeCategory(idx)}>
                        Hapus
                      </Button>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      {cat.items.map((it, i2) => (
                        <Box key={i2} sx={{ display: "flex", gap: 1, mb: 1 }}>
                          <TextField
                            value={it.name}
                            onChange={(e) => {
                              const next = { ...data };
                              next.menu[idx].items[i2].name = e.target.value;
                              setData(next);
                            }}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            type="number"
                            value={it.price}
                            onChange={(e) => {
                              const next = { ...data };
                              next.menu[idx].items[i2].price = Number(
                                e.target.value
                              );
                              setData(next);
                            }}
                            sx={{ width: 120 }}
                          />
                          <Button
                            color="error"
                            onClick={() => removeMenuItem(idx, i2)}
                          >
                            Hapus
                          </Button>
                        </Box>
                      ))}
                      <Button onClick={() => addMenuItem(idx)}>
                        + Tambah Item
                      </Button>
                    </Box>
                  </Paper>
                ))}
                <Button onClick={addCategory}>+ Tambah Kategori Menu</Button>
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={() => saveSection("menu")}>
                  Simpan
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === "promo" && (
            <Box>
              <Typography variant="h6">Promosi Spesial</Typography>
              <TextField
                fullWidth
                label="Judul Promosi"
                value={data.promo.title}
                onChange={(e) => update(["promo", "title"], e.target.value)}
                sx={{ my: 1 }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Aturan Promosi</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {data.promo.rules.map((r, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        fullWidth
                        value={r}
                        onChange={(e) => {
                          const next = { ...data };
                          next.promo.rules[idx] = e.target.value;
                          setData(next);
                        }}
                      />
                      <Button
                        color="error"
                        onClick={() => removePromoRule(idx)}
                      >
                        Hapus
                      </Button>
                    </Box>
                  ))}
                  <Button onClick={addPromoRule}>+ Tambah Aturan</Button>
                </Stack>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => saveSection("promo")}
                >
                  Simpan
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === "location" && (
            <Box>
              <Typography variant="h6">Lokasi & Kontak</Typography>
              <TextField
                fullWidth
                label="Jam Operasional"
                value={data.location.hours}
                onChange={(e) => update(["location", "hours"], e.target.value)}
                sx={{ my: 1 }}
              />
              <TextField
                fullWidth
                label="Alamat"
                multiline
                minRows={2}
                value={data.location.address}
                onChange={(e) =>
                  update(["location", "address"], e.target.value)
                }
                sx={{ my: 1 }}
              />
              <TextField
                fullWidth
                label="Nomor WhatsApp"
                value={data.location.phone}
                onChange={(e) => update(["location", "phone"], e.target.value)}
                sx={{ my: 1 }}
              />
              <TextField
                fullWidth
                label="Instagram"
                value={data.location.instagram}
                onChange={(e) =>
                  update(["location", "instagram"], e.target.value)
                }
                sx={{ my: 1 }}
              />
              <TextField
                fullWidth
                label="Google Maps Embed URL"
                multiline
                minRows={2}
                value={data.location.map}
                onChange={(e) => update(["location", "map"], e.target.value)}
                sx={{ my: 1 }}
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => saveSection("location")}
                >
                  Simpan
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === "carousel" && (
            <Box>
              <Typography variant="h6">Gambar Carousel</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {data.carousel.map((img, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ mb: 1 }}>
                        <img
                          src={img.url}
                          alt={img.alt}
                          style={{
                            width: "100%",
                            height: 140,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Image URL"
                        value={img.url}
                        onChange={(e) => {
                          const next = { ...data };
                          next.carousel[idx].url = e.target.value;
                          setData(next);
                        }}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Alt Text"
                        value={img.alt}
                        onChange={(e) => {
                          const next = { ...data };
                          next.carousel[idx].alt = e.target.value;
                          setData(next);
                        }}
                        sx={{ mb: 1 }}
                      />
                      <Button
                        color="error"
                        onClick={() => removeCarouselImage(idx)}
                      >
                        Hapus Gambar
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Button sx={{ mt: 2 }} onClick={addCarouselImage}>
                + Tambah Gambar
              </Button>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => saveSection("carousel")}
                >
                  Simpan
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  getActiveHeroContent,
  updateOrCreateHeroContent,
  updateOrCreateHeroContentWithImage,
  getActiveAboutUsContent,
  updateOrCreateAboutUsContent,
  getActivePromotionContent,
  updateOrCreatePromotionContent,
  getActiveContactContent,
  updateOrCreateContactContent,
  getAllCarouselContents,
  addCarouselContent,
  deleteCarouselContent,
  getMenus,
} from "../utils/api";

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Content states
  const [heroContent, setHeroContent] = useState({
    title: "",
    description: ""
  });
  
  const [heroImageFile, setHeroImageFile] = useState(null);
  
  const [aboutContent, setAboutContent] = useState({
    paragraph1: "",
    paragraph2: "",
    vision: "",
    background: "",
    mission: [""]
  });
  
  const [promotionContent, setPromotionContent] = useState({
    title: "",
    rules: [""]
  });
  
  const [contactContent, setContactContent] = useState({
    operationalHours: "",
    address: "",
    whatsapp: "",
    instagram: "",
    googleMaps: ""
  });
  
  const [carouselContent, setCarouselContent] = useState([]);
  const [newCarouselItem, setNewCarouselItem] = useState({
    altText: "",
    imageFile: null
  });

  const [menuContent, setMenuContent] = useState([]);

  // Load content on component mount and tab change
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === "hero") {
        const data = await getActiveHeroContent();
        if (data) {
          setHeroContent({
            title: data.title || "",
            description: data.description || "",
            backgroundImageUrl: data.backgroundImageUrl || ""
          });
        }
        setHeroImageFile(null); // Reset file selection when loading
      } else if (activeTab === "about") {
        const data = await getActiveAboutUsContent();
        if (data) {
          setAboutContent({
            paragraph1: data.paragraph1 || "",
            paragraph2: data.paragraph2 || "",
            vision: data.vision || "",
            background: data.background || "",
            mission: Array.isArray(data.mission) ? 
              (data.mission.length > 0 ? data.mission : [""]) : 
              (data.mission ? [data.mission] : [""])
          });
        } else {
          setAboutContent({
            paragraph1: "",
            paragraph2: "",
            vision: "",
            background: "",
            mission: [""]
          });
        }
      } else if (activeTab === "promotion") {
        const data = await getActivePromotionContent();
        if (data) {
          setPromotionContent({
            title: data.title || "",
            rules: Array.isArray(data.rules) ? 
              (data.rules.length > 0 ? data.rules : [""]) : 
              (data.rules ? [data.rules] : [""])
          });
        } else {
          setPromotionContent({
            title: "",
            rules: [""]
          });
        }
      } else if (activeTab === "contact") {
        const data = await getActiveContactContent();
        if (data) {
          setContactContent({
            operationalHours: data.operationalHours || "",
            address: data.address || "",
            whatsapp: data.whatsapp || "",
            instagram: data.instagram || "",
            googleMaps: data.googleMaps || ""
          });
        }
      } else if (activeTab === "carousel") {
        const data = await getAllCarouselContents();
        setCarouselContent(data || []);
      } else if (activeTab === "menu") {
        const data = await getMenus();
        setMenuContent(data?.nodes || []);
      }
    } catch (err) {
      console.error("Error loading content:", err);
      setError("Failed to load content: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const saveContent = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (activeTab === "hero") {
        if (heroImageFile) {
          await updateOrCreateHeroContentWithImage(heroContent, heroImageFile);
        } else {
          await updateOrCreateHeroContent(heroContent);
        }
      } else if (activeTab === "about") {
        // Filter out empty strings before saving
        const filteredAboutContent = {
          ...aboutContent,
          mission: aboutContent.mission.filter(item => item.trim() !== "")
        };
        await updateOrCreateAboutUsContent(filteredAboutContent);
      } else if (activeTab === "promotion") {
        // Filter out empty strings before saving
        const filteredPromotionContent = {
          ...promotionContent,
          rules: promotionContent.rules.filter(item => item.trim() !== "")
        };
        await updateOrCreatePromotionContent(filteredPromotionContent);
      } else if (activeTab === "contact") {
        await updateOrCreateContactContent(contactContent);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset hero image file after successful save
      if (activeTab === "hero" && heroImageFile) {
        setHeroImageFile(null);
        // Reload hero content to get the new background image URL
        const data = await getActiveHeroContent();
        if (data) {
          setHeroContent({
            title: data.title || "",
            description: data.description || ""
          });
        }
      }
    } catch (err) {
      console.error("Error saving content:", err);
      setError("Failed to save content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarousel = async () => {
    if (!newCarouselItem.altText || !newCarouselItem.imageFile) {
      setError("Please provide both alt text and image file");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await addCarouselContent(newCarouselItem.altText, newCarouselItem.imageFile);
      setNewCarouselItem({ altText: "", imageFile: null });
      await loadContent(); // Reload carousel data
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error adding carousel item:", err);
      setError("Failed to add carousel item: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCarousel = async (id) => {
    if (!confirm("Are you sure you want to delete this carousel item?")) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteCarouselContent(id);
      await loadContent(); // Reload carousel data
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error deleting carousel item:", err);
      setError("Failed to delete carousel item: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carousel Slideshow Component
  const CarouselSlideshow = ({ images }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
      if (images.length <= 1 || isPaused) return;

      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % images.length);
      }, 4000);

      return () => clearInterval(timer);
    }, [images.length, isPaused]);

    const goToSlide = (index) => {
      setCurrentSlide(index);
    };

    const nextSlide = () => {
      setCurrentSlide(prev => (prev + 1) % images.length);
    };

    const prevSlide = () => {
      setCurrentSlide(prev => (prev - 1 + images.length) % images.length);
    };

    if (images.length === 0) {
      return (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#6b7280',
          gap: 2
        }}>
          <Box sx={{ width: 48, height: 48, color: '#9ca3af' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </Box>
          <Typography variant="body2">
            Carousel Images
          </Typography>
        </Box>
      );
    }

    return (
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        {images.map((img, index) => (
          <Box
            key={img.id || index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${img.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          />
        ))}

        {/* Navigation Controls */}
        {images.length > 1 && (
          <>
            <IconButton
              sx={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'white' },
                color: '#2a1bed',
                width: 40,
                height: 40,
                boxShadow: 1
              }}
              onClick={prevSlide}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <IconButton
              sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'white' },
                color: '#2a1bed',
                width: 40,
                height: 40,
                boxShadow: 1
              }}
              onClick={nextSlide}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}

        {/* Indicators */}
        {images.length > 1 && (
          <Box sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 2
          }}>
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === currentSlide ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.7)'
                  }
                }}
              />
            ))}
          </Box>
        )}

        
      </Box>
    );
  };

  return (
    <Box sx={{ display: "block", width: "100%" }}>
      <Box component="main" sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Manajemen Konten
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kelola konten landing page Kopi Aku
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#2a1bed',
              color: 'white',
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              '&:hover': {
                bgcolor: '#1e40af'
              }
            }}
            onClick={() => window.open('/landing-preview', '_blank')}
          >
            Lihat Preview Lengkap
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Content saved successfully!
          </Alert>
        )}

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
            ["promotion", "Promosi"],
            ["contact", "Lokasi & Kontak"],
            ["carousel", "Carousel Images"],
          ].map(([key, label]) => (
            <Tab key={key} label={label} value={key} />
          ))}
        </Tabs>

        {/* Content area */}
        <Paper sx={{ p: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && activeTab === "hero" && (
            <Box>
                  <Typography variant="h6">Hero Section</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Judul Hero"
                    value={heroContent.title}
                    onChange={(e) => setHeroContent({...heroContent, title: e.target.value})}
                    sx={{ my: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Deskripsi Hero"
                    multiline
                    minRows={3}
                    value={heroContent.description}
                    onChange={(e) => setHeroContent({...heroContent, description: e.target.value})}
                    sx={{ my: 1 }}
                  />
                  <Box sx={{ my: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ mb: 1 }}
                    >
                      Upload Background Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setHeroImageFile(file);
                        }}
                      />
                    </Button>
                    {heroImageFile && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        File dipilih: {heroImageFile.name}
                      </Typography>
                    )}
                  </Box>
                
                <Box sx={{ my: 2 }}>
                  <Button variant="contained" onClick={saveContent} disabled={loading}>
                    Simpan
                  </Button>
                </Box>

                  <Typography variant="subtitle2">Preview (1200px width)</Typography>
                  <Box
                    sx={{
                      mt: 1,
                      width: '100%',
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                      overflow: 'auto'
                    }}
                  >
                    <Box
                      sx={{
                        width: 1200,
                        overflow: "hidden",
                        position: 'relative'
                      }}
                    >
                    <Box
                      sx={{
                        height: 384, // py-48 equivalent (12rem = 192px * 2 = 384px)
                        backgroundImage: heroImageFile 
                          ? `linear-gradient(rgba(31, 41, 55, 0.7), rgba(31, 41, 55, 0.7)), url(${URL.createObjectURL(heroImageFile)})` 
                          : heroContent.backgroundImageUrl 
                          ? `linear-gradient(rgba(31, 41, 55, 0.7), rgba(31, 41, 55, 0.7)), url(${heroContent.backgroundImageUrl})`
                          : 'linear-gradient(rgba(156, 163, 175, 0.8), rgba(156, 163, 175, 0.8))',
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        textAlign: 'center',
                        padding: '48px 24px'
                      }}
                    >
                      <Box sx={{ maxWidth: '768px', width: '100%' }}>
                        {heroContent.title ? (
                          <Typography 
                            variant="h2" 
                            sx={{ 
                              fontSize: { xs: '2.25rem', md: '3.75rem' },
                              fontWeight: 800,
                              mb: 3,
                              lineHeight: 'tight',
                              textShadow: '0 3px 6px rgba(0, 0, 0, 0.4)'
                            }}
                          >
                            {heroContent.title}
                          </Typography>
                        ) : (
                          <Typography 
                            variant="h2" 
                            sx={{ 
                              fontSize: { xs: '2.25rem', md: '3.75rem' },
                              fontWeight: 800,
                              mb: 3,
                              lineHeight: 'tight',
                              textShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
                              color: 'rgba(255, 255, 255, 0.5)'
                            }}
                          >
                            Hero Title
                          </Typography>
                        )}
                        
                        {heroContent.description ? (
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontSize: { xs: '1.125rem', md: '1.25rem' },
                              maxWidth: '48rem',
                              mx: 'auto',
                              lineHeight: 'relaxed'
                            }}
                          >
                            {heroContent.description}
                          </Typography>
                        ) : (
                          <Typography 
                            variant="h6"
                            sx={{ 
                              fontSize: { xs: '1.125rem', md: '1.25rem' },
                              maxWidth: '48rem',
                              mx: 'auto',
                              lineHeight: 'relaxed',
                              color: 'rgba(255, 255, 255, 0.5)'
                            }}
                          >
                            Hero Description
                          </Typography>
                        )}
                      </Box>
                      
                      {!heroImageFile && !heroContent.backgroundImageUrl && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            fontSize: '0.875rem'
                          }}
                        >
                          No background image
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
               
              
            </Box>
          )}

          {!loading && activeTab === "about" && (
            <Box>
              <Typography variant="h6">Tentang Kami</Typography>
              <TextField
                label="Paragraf 1"
                fullWidth
                size="small"
                multiline
                minRows={3}
                value={aboutContent.paragraph1}
                onChange={(e) => setAboutContent({...aboutContent, paragraph1: e.target.value})}
                sx={{ my: 1 }}
              />
              <TextField
              
                label="Paragraf 2"
                fullWidth
                size="small"
                multiline
                minRows={3}
                value={aboutContent.paragraph2}
                onChange={(e) => setAboutContent({...aboutContent, paragraph2: e.target.value})}
                sx={{ my: 1 }}
              />
              <TextField
                label="Visi"
                fullWidth
                size="small"
                multiline
                minRows={2}
                value={aboutContent.vision}
                onChange={(e) => setAboutContent({...aboutContent, vision: e.target.value})}
                sx={{ my: 1 }}
              />
              
              
              {/* Mission as individual text fields */}
              <Box >
                <Typography variant="subtitle1" gutterBottom>Misi</Typography>
                <Stack spacing={1}>
                  {aboutContent.mission.map((missionItem, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={missionItem}
                        onChange={(e) => {
                          const newMission = [...aboutContent.mission];
                          newMission[index] = e.target.value;
                          setAboutContent({...aboutContent, mission: newMission});
                        }}
                        placeholder={`Misi ${index + 1}`}
                      />
                      <Button
                        color="error"
                        onClick={() => {
                          const newMission = aboutContent.mission.filter((_, i) => i !== index);
                          setAboutContent({...aboutContent, mission: newMission});
                        }}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        Hapus
                      </Button>
                    </Box>
                  ))}
                  <Button 
                    onClick={() => {
                      setAboutContent({...aboutContent, mission: [...aboutContent.mission, ""]});
                    }}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    + Tambah Misi
                  </Button>
                </Stack>
              </Box>
              <TextField
                label="Awal Mula"
                fullWidth
                size="small"
                multiline
                minRows={3}
                value={aboutContent.background}
                onChange={(e) => setAboutContent({...aboutContent, background: e.target.value})}
                sx={{ my: 1 }}
              />
              
              <Box sx={{ mt: 2, mb: 3 }}>
                <Button variant="contained" onClick={saveContent} disabled={loading}>
                  Simpan
                </Button>
              </Box>
              
              {/* About Us Preview */}
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Preview (1200px width)</Typography>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  overflow: 'auto'
                }}
              >
                <Box
                  sx={{
                    width: 1200,
                    bgcolor: 'white',
                    p: 3
                  }}
                >
                {/* Carousel and Story Section */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                  gap: 5, 
                  alignItems: 'center', 
                  mb: 10,
                  px: { xs: 2, md: 12 }
                }}>
                  {/* Carousel Placeholder */}
                  <Box>
                    <Box sx={{ 
                      position: 'relative', 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      boxShadow: 2,
                      paddingBottom: '125%', // 4:5 aspect ratio
                      bgcolor: '#f3f4f6'
                    }}>
                      <CarouselSlideshow images={carouselContent} />
                    </Box>
                  </Box>
                  
                  {/* Story Content */}
                  <Box>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold', 
                      color: '#2a1bed', 
                      mb: 3 
                    }}>
                      Kisah Kopi Aku
                    </Typography>
                    {aboutContent.paragraph1 ? (
                      <Typography sx={{ 
                        fontSize: '1.125rem', 
                        color: '#6b7280', 
                        lineHeight: 1.75,
                        mb: 2
                      }}>
                        {aboutContent.paragraph1}
                      </Typography>
                    ) : (
                      <Typography sx={{ 
                        fontSize: '1.125rem', 
                        color: 'rgba(107, 114, 128, 0.5)', 
                        lineHeight: 1.75,
                        mb: 2
                      }}>
                        Paragraf 1 - cerita tentang Kopi Aku
                      </Typography>
                    )}
                    
                    {aboutContent.paragraph2 ? (
                      <Typography sx={{ 
                        fontSize: '1.125rem', 
                        color: '#6b7280', 
                        lineHeight: 1.75,
                        fontWeight: 'normal'
                      }}>
                        {aboutContent.paragraph2}
                      </Typography>
                    ) : (
                      <Typography sx={{ 
                        fontSize: '1.125rem', 
                        color: 'rgba(107, 114, 128, 0.5)', 
                        lineHeight: 1.75
                      }}>
                        Paragraf 2 - lanjutan cerita
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Vision, Mission, and Background Cards */}
                <Box sx={{ maxWidth: '80rem', mx: 'auto' }}>
                  {/* Vision and Mission Grid */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                    gap: 5, 
                    textAlign: 'center', 
                    mb: 5 
                  }}>
                    {/* Vision Card */}
                    <Box sx={{ 
                      bgcolor: '#f9fafb', 
                      p: 5, 
                      borderRadius: 2, 
                      boxShadow: 1,
                      height: 'fit-content'
                    }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 'bold', 
                        color: '#2a1bed', 
                        mb: 2.5 
                      }}>
                        Visi Kami
                      </Typography>
                      {aboutContent.vision ? (
                        <Typography sx={{ 
                          color: '#374151', 
                          lineHeight: 1.75 
                        }}>
                          {aboutContent.vision}
                        </Typography>
                      ) : (
                        <Typography sx={{ 
                          color: 'rgba(55, 65, 81, 0.5)', 
                          lineHeight: 1.75 
                        }}>
                          Visi perusahaan akan ditampilkan di sini
                        </Typography>
                      )}
                    </Box>
                    
                    {/* Mission Card */}
                    <Box sx={{ 
                      bgcolor: '#f9fafb', 
                      p: 5, 
                      borderRadius: 2, 
                      boxShadow: 1,
                      height: 'fit-content'
                    }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 'bold', 
                        color: '#2a1bed', 
                        mb: 2.5 
                      }}>
                        Misi Kami
                      </Typography>
                      {aboutContent.mission.filter(m => m.trim()).length > 0 ? (
                        <Box component="ul" sx={{ 
                          textAlign: 'left', 
                          color: '#374151', 
                          lineHeight: 1.75,
                          pl: 2,
                          fontFamily: 'Inter, sans-serif',
                          '& li': {
                            mb: 0.5
                          }
                        }}>
                          {aboutContent.mission.filter(m => m.trim()).map((missionItem, index) => (
                            <li key={index}>{missionItem}</li>
                          ))}
                        </Box>
                      ) : (
                        <Box component="ul" sx={{ 
                          textAlign: 'left', 
                          color: 'rgba(55, 65, 81, 0.5)', 
                          lineHeight: 1.75,
                          pl: 2,
                          fontFamily: 'Inter, sans-serif',
                          '& li': {
                            mb: 0.5
                          }
                        }}>
                          <li>Misi 1</li>
                          <li>Misi 2</li>
                          <li>Misi 3</li>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Background Card */}
                  <Box sx={{ 
                    bgcolor: '#f9fafb', 
                    p: 5, 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    textAlign: 'center' 
                  }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 'bold', 
                      color: '#2a1bed', 
                      mb: 2.5 
                    }}>
                      Awal Mula
                    </Typography>
                    {aboutContent.background ? (
                      <Typography sx={{ 
                        color: '#374151', 
                        lineHeight: 1.75 
                      }}>
                        {aboutContent.background}
                      </Typography>
                    ) : (
                      <Typography sx={{ 
                        color: 'rgba(55, 65, 81, 0.5)', 
                        lineHeight: 1.75 
                      }}>
                      Cerita awal mula berdirinya Kopi Aku akan ditampilkan di sini
                    </Typography>
                  )}
                </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          )}

          {!loading && activeTab === "promotion" && (
            <Box>
              <Typography variant="h6">Promosi Spesial</Typography>
              <TextField
                fullWidth
                size="small"
                label="Judul Promosi"
                value={promotionContent.title}
                onChange={(e) => setPromotionContent({...promotionContent, title: e.target.value})}
                sx={{ my: 1 }}
              />
              
              {/* Rules as individual text fields */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Aturan Promosi</Typography>
                <Stack spacing={1}>
                  {promotionContent.rules.map((rule, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={rule}
                        onChange={(e) => {
                          const newRules = [...promotionContent.rules];
                          newRules[index] = e.target.value;
                          setPromotionContent({...promotionContent, rules: newRules});
                        }}
                        placeholder={`Aturan ${index + 1}`}
                      />
                      <Button
                        color="error"
                        onClick={() => {
                          const newRules = promotionContent.rules.filter((_, i) => i !== index);
                          setPromotionContent({...promotionContent, rules: newRules});
                        }}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        Hapus
                      </Button>
                    </Box>
                  ))}
                  <Button 
                    onClick={() => {
                      setPromotionContent({...promotionContent, rules: [...promotionContent.rules, ""]});
                    }}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    + Tambah Aturan
                  </Button>
                </Stack>
              </Box>
              
              <Box sx={{ mt: 2, mb: 3 }}>
                <Button variant="contained" onClick={saveContent} disabled={loading}>
                  Simpan
                </Button>
              </Box>
              
              {/* Promotion Preview */}
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Preview (1200px width)</Typography>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  overflow: 'auto'
                }}
              >
                <Box
                  sx={{
                    width: 1200,
                    background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                    py: 10,
                    px: 3,
                    textAlign: 'center'
                  }}
                >
                {/* Title */}
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    mb: 6,
                    background: 'linear-gradient(90deg, #2a1bed 0%, #6366f1 50%, #9333ea 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: { xs: '2rem', md: '3rem' }
                  }}
                >
                  {promotionContent.title || 'Promosi Spesial Untukmu!'}
                </Typography>

                {/* Main Card */}
                <Box sx={{ maxWidth: '48rem', mx: 'auto' }}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #2a1bed 0%, #6366f1 100%)',
                      p: 0.125,
                      borderRadius: 2,
                      boxShadow: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-8px) scale(1.02)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'white',
                        p: { xs: 4, md: 5 },
                        borderRadius: 1.5
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          mb: 4,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em'
                        }}
                      >
                        Rules Promo Spesial
                      </Typography>

                      {/* Rules List */}
                      <Box sx={{ textAlign: 'left', '& > *:not(:last-child)': { mb: 3 } }}>
                        {promotionContent.rules.filter(rule => rule.trim()).length > 0 ? (
                          promotionContent.rules
                            .filter(rule => rule.trim())
                            .map((rule, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    background: 
                                      '#2a1bed',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1.25rem',
                                    boxShadow: 1,
                                    flexShrink: 0,
                                    fontFamily: 'Inter, sans-serif'
                                  }}
                                >
                                  {index + 1}
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: '1.125rem',
                                    color: '#475569',
                                    pt: 0.5,
                                    lineHeight: 1.6,
                                    '& strong': {
                                      color: '#1f2937'
                                    }
                                  }}
                                >
                                  {rule}
                                </Typography>
                              </Box>
                            ))
                        ) : (
                          // Show placeholder rules matching the number of rule fields or at least 1
                          Array.from({ length: Math.max(promotionContent.rules.length, 1) }).map((_, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  background: index === Math.max(promotionContent.rules.length, 1) - 1 
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : '#2a1bed',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '1.25rem',
                                  boxShadow: 1,
                                  flexShrink: 0
                                }}
                              >
                                {index + 1}
                              </Box>
                              <Typography
                                sx={{
                                  fontSize: '1.125rem',
                                  color: 'rgba(71, 85, 105, 0.5)',
                                  pt: 0.5,
                                  lineHeight: 1.6
                                }}
                              >
                                Aturan promosi {index + 1} akan ditampilkan di sini
                              </Typography>
                            </Box>
                          ))
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          )}

          {!loading && activeTab === "contact" && (
            <Box>
              <Typography variant="h6">Lokasi & Kontak</Typography>
              <TextField
                fullWidth
                size="small"
                label="Jam Operasional"
                value={contactContent.operationalHours}
                onChange={(e) => setContactContent({...contactContent, operationalHours: e.target.value})}
                sx={{ my: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Alamat"
                multiline
                minRows={2}
                value={contactContent.address}
                onChange={(e) => setContactContent({...contactContent, address: e.target.value})}
                sx={{ my: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Nomor WhatsApp"
                value={contactContent.whatsapp}
                onChange={(e) => setContactContent({...contactContent, whatsapp: e.target.value})}
                sx={{ my: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Instagram"
                value={contactContent.instagram}
                onChange={(e) => setContactContent({...contactContent, instagram: e.target.value})}
                sx={{ my: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Google Maps Embed URL"
                multiline
                minRows={2}
                value={contactContent.googleMaps}
                onChange={(e) => setContactContent({...contactContent, googleMaps: e.target.value})}
                sx={{ my: 1 }}
              />
              
              <Box sx={{ mt: 2, mb: 3 }}>
                <Button variant="contained" onClick={saveContent} disabled={loading}>
                  Simpan
                </Button>
              </Box>
              
              {/* Contact & Location Preview */}
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Preview (1200px width)</Typography>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  overflow: 'auto'
                }}
              >
                <Box
                  sx={{
                    width: 1200,
                    bgcolor: 'white',
                    py: 10,
                    px: 3
                  }}
                >
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: '#2a1bed',
                      mb: 2,
                      fontSize: { xs: '1.875rem', md: '2.25rem' }
                    }}
                  >
                    Temukan Kami Di Sini
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: '1.125rem', 
                      color: '#6b7280', 
                      lineHeight: 1.75
                    }}
                  >
                    Mampir untuk secangkir kopi atau sekadar menyapa!
                  </Typography>
                </Box>

                {/* Main Content Grid */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
                  gap: 5, 
                  alignItems: 'center' 
                }}>
                  {/* Info Card */}
                  <Box sx={{ 
                    bgcolor: 'white', 
                    p: { xs: 5, md: 6 }, 
                    borderRadius: 2, 
                    boxShadow: 2 
                  }}>
                    <Stack spacing={5}>
                      {/* Operating Hours */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ flexShrink: 0, pt: 0.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              color: '#2a1bed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </Box>
                        </Box>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827' }}>
                            Jam Operasional
                          </Typography>
                          <Typography sx={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            color: '#2a1bed', 
                            mt: 0.5 
                          }}>
                            {contactContent.operationalHours || (
                              <span style={{ color: 'rgba(42, 27, 237, 0.5)' }}>
                                20:00 - 02:00 
                              </span>

                            )}
                            <span class="text-lg text-gray-600 font-medium" style={
                              {
                                color: contactContent.operationalHours ? '#6b7280' : 'rgba(107, 114, 128, 0.5)',
                                marginLeft: '8px',
                                fontSize: '1rem',
                                fontWeight: '400'
                              }
                            }>WIB</span>
                          </Typography>
                          
                        </Box>
                      </Box>

                      {/* Address */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ flexShrink: 0, pt: 0.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              color: '#2a1bed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                          </Box>
                        </Box>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827' }}>
                            Alamat
                          </Typography>
                          <Typography sx={{ 
                            fontSize: '1.125rem', 
                            color: contactContent.address ? '#6b7280' : 'rgba(107, 114, 128, 0.5)', 
                            mt: 0.5, 
                            lineHeight: 1.75 
                          }}>
                            {contactContent.address || 'Alamat akan ditampilkan di sini'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Contact */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ flexShrink: 0, pt: 0.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              color: '#2a1bed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.822-1.423-5.143-3.744-6.566-6.566l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                          </Box>
                        </Box>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827' }}>
                            Kontak
                          </Typography>
                          <Stack spacing={2} sx={{ mt: 1.5 }}>
                            {/* WhatsApp */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              cursor: 'pointer',
                              '&:hover': {
                                color: '#2a1bed',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.3s ease'
                            }}>
                              <Box sx={{ width: 24, height: 24, color: '#9ca3af' }}>
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.69-8.23 8.24-8.23 2.22 0 4.31.87 5.82 2.39 1.52 1.51 2.39 3.6 2.39 5.83.01 4.54-3.68 8.23-8.22 8.23zm4.52-6.13c-.25-.12-1.47-.72-1.7-.8s-.39-.12-.56.12c-.17.25-.64.8-.79.96s-.3.19-.56.06c-.26-.12-1.08-.4-2.06-1.27s-1.47-1.44-1.64-1.69c-.17-.25-.02-.38.11-.51s.25-.29.37-.43c.13-.14.17-.25.25-.41s.04-.3-.02-.43c-.06-.12-.56-1.34-.76-1.84s-.4-.42-.55-.43c-.15 0-.31-.01-.48-.01s-.43.06-.66.31c-.23.25-.87.85-.87 2.07s.9 2.4 1.02 2.56c.12.17 1.76 2.67 4.25 3.73.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18s.21-1.09.15-1.18c-.07-.1-.23-.16-.48-.28z"/>
                                </svg>
                              </Box>
                              <Typography sx={{ 
                                fontSize: '1.125rem', 
                                color: contactContent.whatsapp ? '#6b7280' : 'rgba(107, 114, 128, 0.5)' 
                              }}>
                                {contactContent.whatsapp || '087814811610'}
                              </Typography>
                            </Box>

                            {/* Instagram */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              cursor: 'pointer',
                              '&:hover': {
                                color: '#2a1bed',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.3s ease'
                            }}>
                              <Box sx={{ width: 24, height: 24, color: '#9ca3af' }}>
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.947s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"/>
                                </svg>
                              </Box>
                              <Typography sx={{ 
                                fontSize: '1.125rem', 
                                color: contactContent.instagram ? '#6b7280' : 'rgba(107, 114, 128, 0.5)' 
                              }}>
                                {contactContent.instagram || '@kopiakuu'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Map */}
                  <Box sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    boxShadow: 2, 
                    height: { xs: 384, lg: 500 },
                    bgcolor: '#f3f4f6'
                  }}>
                    {contactContent.googleMaps ? (
                      <Box
                        component="iframe"
                        src={contactContent.googleMaps}
                        sx={{
                          width: '100%',
                          height: '100%',
                          border: 0
                        }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <Box sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        <Box sx={{ width: 48, height: 48, color: '#9ca3af' }}>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                          </svg>
                        </Box>
                        <Typography variant="body2">
                          Google Maps akan ditampilkan di sini
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          )}          {!loading && activeTab === "carousel" && (
            <Box>
              <Typography variant="h6">Gambar Carousel</Typography>
              
              {/* Add new carousel item */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tambah Gambar Baru
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Alt Text"
                  value={newCarouselItem.altText}
                  onChange={(e) => setNewCarouselItem({...newCarouselItem, altText: e.target.value})}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ mb: 1 }}
                  >
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setNewCarouselItem({...newCarouselItem, imageFile: file});
                      }}
                    />
                  </Button>
                  {newCarouselItem.imageFile && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      File dipilih: {newCarouselItem.imageFile.name}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Button 
                    variant="contained" 
                    onClick={handleAddCarousel}
                    disabled={loading || !newCarouselItem.altText || !newCarouselItem.imageFile}
                  >
                    Tambah Gambar
                  </Button>
                </Box>
              </Paper>

              {/* Existing carousel items */}
              <Grid container spacing={2}>
                {carouselContent.map((img, idx) => (
                  <Grid item xs={12} md={6} key={img.id || idx}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ mb: 1 }}>
                        <img
                          src={img.imageUrl}
                          alt={img.altText}
                          style={{
                            width: "100%",
                            height: 140,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Alt Text:</strong> {img.altText}
                      </Typography>
                      
                      <Button
                        color="error"
                        onClick={() => handleDeleteCarousel(img.id)}
                        disabled={loading}
                      >
                        Hapus Gambar
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              {carouselContent.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Belum ada gambar carousel. Tambahkan gambar pertama di atas.
                </Typography>
              )}

              {/* Carousel Preview */}
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Preview (1200px width)</Typography>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  overflow: 'auto'
                }}
              >
                <Box
                  sx={{
                    width: 1200,
                    bgcolor: 'white',
                    py: 10,
                    px: 3
                  }}
                >
                  {/* Carousel Section */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                    gap: 5, 
                    alignItems: 'center',
                    px: { xs: 2, md: 12 }
                  }}>
                    {/* Carousel Display */}
                    <Box>
                      <Box sx={{ 
                        position: 'relative', 
                        borderRadius: 2, 
                        overflow: 'hidden',
                        boxShadow: 2,
                        paddingBottom: '125%', // 4:5 aspect ratio
                        bgcolor: '#f3f4f6'
                      }}>
                        <CarouselSlideshow images={carouselContent} />
                      </Box>
                      
                      
                    </Box>
                    
                    {/* Story Content Placeholder */}
                    <Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: '#2a1bed', 
                        mb: 3 
                      }}>
                        Kisah Kopi Aku
                      </Typography>
                      <Typography sx={{ 
                        fontSize: '1.125rem', 
                        color: 'rgba(107, 114, 128, 0.5)', 
                        lineHeight: 1.75,
                        mb: 2
                      }}>
                        Konten cerita dari section "Tentang Kami" akan ditampilkan di sebelah carousel
                      </Typography>
                      <Typography sx={{ 
                        fontSize: '1.125rem', 
                        color: 'rgba(107, 114, 128, 0.5)', 
                        lineHeight: 1.75
                      }}>
                        Carousel dan cerita akan tampil berdampingan pada landing page
                      </Typography>
                    </Box>
                  </Box>
                  
                </Box>
              </Box>
            </Box>
          )}

          {!loading && activeTab === "menu" && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6">Menu Andalan Kami</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preview menu yang akan ditampilkan di landing page (hanya preview, tidak dapat diedit)
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#2a1bed',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: '#1e40af'
                    }
                  }}
                  onClick={() => window.open('/menus', '_blank')}
                >
                  Edit Menu
                </Button>
              </Box>
              
              {/* Menu Preview */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview (1200px width)</Typography>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  overflow: 'auto'
                }}
              >
                <Box
                  sx={{
                    width: 1200,
                    bgcolor: 'white',
                    py: { xs: 8, md: 12 },
                    px: 3
                  }}
                >
                  {/* Header Section */}
                  <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: '#2a1bed',
                        mb: 2,
                        fontSize: { xs: '1.875rem', md: '2.25rem' }
                      }}
                    >
                      Menu Andalan Kami
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: '1.125rem', 
                        color: '#6b7280'
                      }}
                    >
                      Diseduh dengan passion, disajikan untuk Anda.
                    </Typography>
                  </Box>

                  {/* Menu Card */}
                  <Box sx={{ 
                    maxWidth: '32rem', 
                    mx: 'auto', 
                    bgcolor: 'white', 
                    p: { xs: 4, md: 6 }, 
                    borderRadius: 3, 
                    boxShadow: 3
                  }}>
                    {/* Menu Title */}
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '3rem', md: '3.75rem' },
                        fontWeight: 800,
                        textAlign: 'center',
                        mb: 5,
                        background: 'linear-gradient(90deg, #2a1bed 0%, #6366f1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.025em'
                      }}
                    >
                      MENU
                    </Typography>

                    <Box sx={{ '& > *:not(:last-child)': { mb: 4 } }}>
                      {/* Dynamic Menu Categories */}
                      {Object.entries(
                        menuContent
                          .filter(item => item.isAvailable)
                          .reduce((acc, item) => {
                            const category = item.category || 'Other';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(item);
                            return acc;
                          }, {})
                      ).map(([category, items]) => (
                        <Box key={category}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: '#2a1bed', 
                              letterSpacing: '0.1em',
                              borderBottom: '2px solid #2a1bed',
                              pb: 1,
                              mb: 2,
                              textTransform: 'uppercase'
                            }}
                          >
                            {category}
                          </Typography>
                          <Box sx={{ 
                            '& > *:not(:last-child)': { 
                              borderBottom: '1px dashed #dbeafe' 
                            }
                          }}>
                            {items.map((item, index) => (
                              <Box 
                                key={item.id || index} 
                                sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  py: 1.5,
                                  fontSize: '1.125rem',
                                  color: '#374151',
                                  fontFamily: 'Inter, sans-serif',
                                  '&:hover': {
                                    bgcolor: 'rgba(42, 27, 237, 0.05)',
                                    transform: 'translateX(4px)',
                                  },
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                <span>{item.name}</span>
                                <span style={{ fontWeight: 600 }}>
                                  {new Intl.NumberFormat('id-ID').format(item.price)}
                                </span>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      ))}

                      {/* Fallback if no menu data */}
                      {menuContent.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            Tidak ada menu yang tersedia saat ini.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

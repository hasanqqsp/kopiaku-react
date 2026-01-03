import { loadContentData } from "./api";

// Content population script for static landing page
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Loading dynamic content...");

  // Show loading state
  const loadingOverlay = document.createElement("div");
  loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: 'Inter', sans-serif;
        font-size: 1.5rem;
        color: #2a1bed;
    `;
  loadingOverlay.textContent = "Loading content...";
  document.body.appendChild(loadingOverlay);

  try {
    // Load content from API
    const contentData = await loadContentData();

    // Update Hero Section
    updateHeroSection(contentData.hero);

    // Update About Section
    updateAboutSection(contentData.about);

    // Update Menu Section
    updateMenuSection(contentData.menu);

    // Update Promotion Section
    updatePromotionSection(contentData.promotion);

    // Update Contact Section
    updateContactSection(contentData.contact);

    // Update Carousel
    updateCarousel(contentData.carousel);

    console.log("Content loaded successfully!");
  } catch (error) {
    console.error("Error loading content:", error);
  } finally {
    // Remove loading overlay
    document.body.removeChild(loadingOverlay);
  }
});

function updateHeroSection(heroData) {
  // Update hero title
  const heroTitle = document.getElementById("hero-title");
  if (heroTitle && heroData.title) {
    heroTitle.textContent = heroData.title;
  }

  // Update hero description
  const heroDesc = document.getElementById("hero-description");
  if (heroDesc && heroData.description) {
    heroDesc.textContent = heroData.description;
  }

  // Update hero background image
  if (heroData.backgroundImageUrl) {
    document.documentElement.style.setProperty(
      "--hero-bg-image",
      `url('${heroData.backgroundImageUrl}')`
    );
  }
}

function updateAboutSection(aboutData) {
  // Update story paragraphs
  const paragraph1 = document.getElementById("about-paragraph1");
  if (paragraph1 && aboutData.paragraph1) {
    paragraph1.textContent = aboutData.paragraph1;
  }

  const paragraph2 = document.getElementById("about-paragraph2");
  if (paragraph2 && aboutData.paragraph2) {
    paragraph2.textContent = aboutData.paragraph2;
  }

  // Update vision
  const visionText = document.getElementById("about-vision");
  if (visionText && aboutData.vision) {
    visionText.textContent = aboutData.vision;
  }

  // Update mission
  const missionList = document.getElementById("about-mission");
  if (
    missionList &&
    aboutData.mission &&
    Array.isArray(aboutData.mission) &&
    aboutData.mission.length > 0
  ) {
    missionList.innerHTML = "";
    aboutData.mission
      .filter((m) => m?.trim())
      .forEach((missionItem) => {
        const li = document.createElement("li");
        li.textContent = missionItem;
        missionList.appendChild(li);
      });
  }

  // Update background story
  const backgroundText = document.getElementById("about-background");
  if (backgroundText && aboutData.background) {
    backgroundText.textContent = aboutData.background;
  }
}

function updateMenuSection(menuData) {
  if (!Array.isArray(menuData) || menuData.length === 0) {
    return;
  }

  const menuContainer = document.querySelector("#menu .space-y-8");
  if (!menuContainer) return;

  // Clear existing static content
  menuContainer.innerHTML = "";

  // Group menu items by category
  const groupedMenu = menuData
    .filter((item) => item.isAvailable)
    .reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

  // Create menu sections for each category
  Object.entries(groupedMenu).forEach(([category, items]) => {
    const categoryDiv = document.createElement("div");

    // Category header
    const categoryHeader = document.createElement("h4");
    categoryHeader.className =
      "text-xl font-bold text-[#2a1bed] tracking-wider border-b-2 border-[#2a1bed] pb-2 mb-4";
    categoryHeader.textContent = category.toUpperCase();
    categoryDiv.appendChild(categoryHeader);

    // Menu items list
    const itemsList = document.createElement("ul");
    itemsList.className =
      "divide-y divide-dashed divide-blue-200 text-lg text-gray-700 menu-item-list";

    items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = "flex justify-between py-3";
      listItem.innerHTML = `
                <span>${item.name}</span>
                <span class="font-semibold">${new Intl.NumberFormat(
                  "id-ID"
                ).format(item.price)}</span>
            `;
      itemsList.appendChild(listItem);
    });

    categoryDiv.appendChild(itemsList);
    menuContainer.appendChild(categoryDiv);
  });
}

function updatePromotionSection(promotionData) {
  // Update promotion title
  const promoTitle = document.getElementById("promotion-title");
  if (promoTitle && promotionData.title) {
    const titleSpan = promoTitle.querySelector("span");
    if (titleSpan) {
      titleSpan.textContent = promotionData.title;
    }
  }

  // Update promotion rules if available
  if (
    promotionData.rules &&
    Array.isArray(promotionData.rules) &&
    promotionData.rules.length > 0
  ) {
    const rulesContainer = document.querySelector("#promosi .space-y-6");
    if (rulesContainer) {
      // Clear existing rules
      rulesContainer.innerHTML = "";

      promotionData.rules
        .filter((rule) => rule?.trim())
        .forEach((rule, index) => {
          const ruleDiv = document.createElement("div");
          ruleDiv.className = "flex items-start space-x-4";
          ruleDiv.setAttribute("data-aos", "fade-up");
          ruleDiv.setAttribute(
            "data-aos-delay",
            (300 + index * 100).toString()
          );

          ruleDiv.innerHTML = `
                    <div class="flex-shrink-0 w-10 h-10 ${
                      index ===
                      promotionData.rules.filter((r) => r?.trim()).length - 1
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-[#2a1bed]"
                    } rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                        ${index + 1}
                    </div>
                    <p class="text-lg text-slate-700 pt-1">${rule}</p>
                `;

          rulesContainer.appendChild(ruleDiv);
        });
    }
  }
}

function updateContactSection(contactData) {
  // Update operational hours
  const operationalHours = document.getElementById("contact-hours");
  if (operationalHours && contactData.operationalHours) {
    operationalHours.innerHTML = `${contactData.operationalHours} <span class="text-lg text-gray-600 font-medium">WIB</span>`;
  }

  // Update address
  const address = document.getElementById("contact-address");
  if (address && contactData.address) {
    address.textContent = contactData.address;
  }

  // Update WhatsApp link and number
  const whatsappLink = document.querySelector('a[href*="wa.me"]');
  if (whatsappLink && contactData.whatsapp) {
    const whatsappNumber = contactData.whatsapp.replace(/^0/, "");
    whatsappLink.href = `https://wa.me/62${whatsappNumber}`;
    const whatsappSpan = whatsappLink.querySelector("span");
    if (whatsappSpan) {
      whatsappSpan.textContent = contactData.whatsapp;
    }
  }

  // Update Instagram link and handle
  const instagramLink = document.querySelector('a[href*="instagram.com"]');
  if (instagramLink && contactData.instagram) {
    const handle = contactData.instagram.replace("@", "");
    instagramLink.href = `https://www.instagram.com/${handle}`;
    const instagramSpan = instagramLink.querySelector("span");
    if (instagramSpan) {
      instagramSpan.textContent = contactData.instagram.startsWith("@")
        ? contactData.instagram
        : `@${contactData.instagram}`;
    }
  }

  // Update Google Maps
  if (contactData.googleMaps) {
    const mapIframe = document.querySelector("#lokasi iframe");
    if (mapIframe) {
      mapIframe.src = contactData.googleMaps;
    }
  }
}

function updateCarousel(carouselData) {
  if (!Array.isArray(carouselData) || carouselData.length === 0) {
    return;
  }

  const carouselSlides = document.querySelector(".carousel-slides");
  const carouselIndicators = document.querySelector(
    "#aboutCarousel .flex.space-x-2"
  );

  if (!carouselSlides || !carouselIndicators) return;

  // Clear existing slides and indicators
  carouselSlides.innerHTML = "";
  carouselIndicators.innerHTML = "";

  // Add new slides
  carouselData.forEach((slide, index) => {
    // Create slide
    const slideElement = document.createElement("li");
    slideElement.className =
      "carousel-slide absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out";
    slideElement.setAttribute("data-slide", index.toString());
    slideElement.setAttribute("aria-hidden", "true");

    slideElement.innerHTML = `
            <img width="1080" height="1350" 
                 src="${slide.imageUrl}" 
                 alt="${slide.altText || `Slide ${index + 1}`}" 
                 class="w-full h-full object-cover rounded-2xl" 
                 onerror="this.src='https://placehold.co/1080x1350/2a1bed/white?text=Kopi+Aku'">
        `;

    carouselSlides.appendChild(slideElement);

    // Create indicator
    const indicator = document.createElement("button");
    indicator.className = `carousel-indicator w-3 h-3 rounded-full ${
      index === 0 ? "bg-white/70" : "bg-white/40"
    } ring-1 ring-white`;
    indicator.setAttribute("aria-label", `Slide ${index + 1}`);
    indicator.setAttribute("data-to", index.toString());

    carouselIndicators.appendChild(indicator);
  });

  // Show first slide
  const firstSlide = carouselSlides.querySelector('[data-slide="0"]');
  if (firstSlide) {
    firstSlide.style.opacity = "1";
    firstSlide.setAttribute("aria-hidden", "false");
  }

  // Reinitialize carousel if needed
  if (window.initializeCarousel) {
    window.initializeCarousel();
  }
}

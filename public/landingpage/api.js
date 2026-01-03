// API functions for static landing page
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5031/graphql";

// Create axios-like function for GraphQL requests
async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data;
  } catch (error) {
    console.error("GraphQL request error:", error);
    throw error;
  }
}

// API Functions
async function getActiveHeroContent() {
  const query = `
    query GetActiveHeroContent {
      activeHeroContent {
        id
        title
        description
        backgroundImageUrl
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data.activeHeroContent;
  } catch (err) {
    console.error("getActiveHeroContent error:", err);
    return null;
  }
}

async function getActiveAboutUsContent() {
  const query = `
    query GetActiveAboutUsContent {
      activeAboutUsContent {
        id
        paragraph1
        paragraph2
        vision
        mission
        background
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data.activeAboutUsContent;
  } catch (err) {
    console.error("getActiveAboutUsContent error:", err);
    return null;
  }
}

async function getActivePromotionContent() {
  const query = `
    query GetActivePromotionContent {
      activePromotionContent {
        id
        title
        rules
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data.activePromotionContent;
  } catch (err) {
    console.error("getActivePromotionContent error:", err);
    return null;
  }
}

async function getActiveContactContent() {
  const query = `
    query GetActiveContactContent {
      activeContactContent {
        id
        operationalHours
        address
        whatsapp
        instagram
        googleMaps
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data.activeContactContent;
  } catch (err) {
    console.error("getActiveContactContent error:", err);
    return null;
  }
}

async function getAllCarouselContents() {
  const query = `
    query GetAllCarouselContents {
      carouselContents {
        nodes {
          id
          imageUrl
          altText
          createdAt
          updatedAt
        }
      }
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data.carouselContents.nodes || [];
  } catch (err) {
    console.error("getAllCarouselContents error:", err);
    return [];
  }
}

async function getMenus() {
  const query = `
    query GetMenus {
      menus(first: 1000) {
        nodes {
          id
          name
          description
          category
          price
          imageUrl
          isAvailable
        }
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        totalCount
      }
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data.menus;
  } catch (err) {
    console.error("getMenus error:", err);
    return { nodes: [] };
  }
}

// Main function to load all content
export async function loadContentData() {
  console.log("Loading content from API...");

  try {
    const [hero, about, promotion, contact, carousel, menu] = await Promise.all(
      [
        getActiveHeroContent(),
        getActiveAboutUsContent(),
        getActivePromotionContent(),
        getActiveContactContent(),
        getAllCarouselContents(),
        getMenus(),
      ]
    );

    return {
      hero: hero || { title: "", description: "", backgroundImageUrl: "" },
      about: about || {
        paragraph1: "",
        paragraph2: "",
        vision: "",
        mission: [],
        background: "",
      },
      promotion: promotion || { title: "", rules: [] },
      contact: contact || {
        operationalHours: "",
        address: "",
        whatsapp: "",
        instagram: "",
        googleMaps: "",
      },
      carousel: carousel || [],
      menu: menu?.nodes || [],
    };
  } catch (error) {
    console.error("Error loading content:", error);
    return {
      hero: { title: "", description: "", backgroundImageUrl: "" },
      about: {
        paragraph1: "",
        paragraph2: "",
        vision: "",
        mission: [],
        background: "",
      },
      promotion: { title: "", rules: [] },
      contact: {
        operationalHours: "",
        address: "",
        whatsapp: "",
        instagram: "",
        googleMaps: "",
      },
      carousel: [],
      menu: [],
    };
  }
}

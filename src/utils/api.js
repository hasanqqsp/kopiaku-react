import axios from "axios";

axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5031/graphql";

const axiosWithAuth = axios.create();
axiosWithAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    // preserve existing headers and avoid assigning a plain object to AxiosHeaders
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// axiosWithAuth.interceptors.response.use(
//   (response) => {
//     if (response.data.errors) {
//       console.error("GraphQL errors:", response.data.errors);
//       if (
//         response.data.errors[0].extensions.code === "AUTH_NOT_AUTHENTICATED"
//       ) {
//         // Handle unauthenticated error globally
//         window.location.href = "/login";
//         localStorage.removeItem("authToken");
//         localStorage.removeItem("needsPhotoVerification");
//       }
//     }
//     return response;
//   },
//   (error) => Promise.reject(error)
// );

axiosWithAuth.defaults.baseURL = "http://localhost:5031/graphql";

export async function login(email, password) {
  const query = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        email
        id
        isActive
        name
        profilePictureUrl
        token
        username
        role
				presence {
					id
					checkInTime
					checkOutTime
				}
      }
    }
  `;

  const response = await axios.post("/", {
    query,
    variables: { input: { username: email, password } },
  });

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }
  if (response.data.data.login.token) {
    localStorage.setItem("authToken", response.data.data.login.token || "");
  }
  return response.data.data.login;
}

export async function checkIn({ file }) {
  const operations = JSON.stringify({
    query: `
      mutation ($image: Upload!) {
        checkIn(image: $image) {
          id
          userId
          imageUrl
          checkInTime
          validated
        }
      }
    `,
    variables: {
      image: null,
    },
  });

  const map = JSON.stringify({
    0: ["variables.image"],
  });

  const formData = new FormData();
  formData.append("operations", operations);
  formData.append("map", map);
  formData.append("0", file);

  return axiosWithAuth
    .post("/", formData, {
      headers: {
        "GraphQL-Preflight": 1,
      },
    })
    .then((response) => {
      return response.data.data.checkIn;
    });
}

export async function checkOut() {
  const mutation = `
    mutation CheckOut {
      checkOut {
        id
        userId
        checkInTime
        checkOutTime
        validated
        imageUrl
      }
    }
  `;

  const response = await axiosWithAuth.post("/", {
    query: mutation,
  });

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }

  return response.data.data.checkOut;
}

export async function getCurrentUser() {
  const query = `
    query MyProfile {
      myProfile {
        id
        name
        username
        email
        role
        contact
        isActive
        profilePictureUrl
        presence {
          id
          checkInTime
          checkOutTime
        }
      }
    }
  `;
  try {
    const response = await axiosWithAuth.post("", {
      query,
      variables: {},
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.myProfile;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    // throw err;
  }
}

export async function fetchUsers({ first = 10, after = null } = {}) {
  const query = `
    query Users($first: Int, $after: String) {
      users(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          username
          nickname
          email
          role
          contact
          isActive
          profilePictureUrl
        }
      }
    }
  `;

  const variables = { first, after };

  const res = await axiosWithAuth.post("", { query, variables });

  if (res.data.errors) {
    console.error(res.data.errors);
    throw new Error(res.data.errors[0].message);
  }

  return res.data.data.users;
}

export async function addEmployees({
  name,
  username,
  email,
  password,
  contact = null,
  nickname = null,
}) {
  const mutation = `
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        id
        name
        username
        nickname
        email
        role
        contact
        isActive
        profilePictureUrl
      }
    }
  `;

  const input = {
    name,
    username,
    email,
    password,
    contact,
    nickname,
  };

  try {
    const res = await axiosWithAuth.post("", {
      query: mutation,
      variables: { input },
    });

    if (res.data.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.register;
  } catch (err) {
    console.error("AddEmployees error:", err);
    throw err;
  }
}

export async function deleteUser({ userId }) {
  const mutation = `
    mutation DeleteUser($userId: String!) {
      deleteUser(userId: $userId)
    }
  `;

  const res = await axiosWithAuth.post("", {
    query: mutation,
    variables: { userId },
  });

  if (res.data.errors) {
    throw new Error(res.data.errors[0].message);
  }

  return res.data.data.deleteUser; // Boolean: true / false
}

export async function setUserActiveStatus({ userId, isActive }) {
  const mutation = `
    mutation SetUserActiveStatus($userId: String!, $isActive: Boolean!) {
      setUserActiveStatus(userId: $userId, isActive: $isActive) {
        id
        name
        nickname
        username
        isActive
      }
    }
  `;

  const res = await axiosWithAuth.post("", {
    query: mutation,
    variables: { userId, isActive },
  });

  if (res.data.errors) {
    throw new Error(res.data.errors[0].message);
  }

  return res.data.data.setUserActiveStatus;
}

// export const updateUserProfile = async ({
//   userId,
//   input,
//   profilePicture,
// }: {
//   userId: string
//   input: {
//     name?: string
//     email?: string
//     contact?: string
//   }
//   profilePicture?: File
// }) => {
//   const formData = new FormData()

//   // Kirim ke endpoint GraphQL seperti biasa
//   const query = `
//     mutation UpdateUserProfile(
//       $userId: String!
//       $input: RegisterInput!
//     ) {
//       updateUserProfile(
//         userId: $userId,
//         input: $input,
//       ) {
//         id
//         name
//         username
//         email
//         role
//         contact
//         isActive
//         profilePictureUrl
//       }
//     }
//   `

//   formData.append(
//     'operations',
//     JSON.stringify({
//       query,
//       variables: {
//         userId,
//         input,
//         // profilePicture: profilePicture ? null : undefined,
//       },
//     }),
//   )

//   formData.append(
//     'map',
//     JSON.stringify({
//       '0': ['variables.profilePicture'],
//     }),
//   )

//   // if (profilePicture) {
//   //   formData.append('0', profilePicture)
//   // }

//   const res = await axiosWithAuth.post('', formData, {
//     headers: { 'Content-Type': 'multipart/form-data', 'GraphQL-Preflight': 1 },
//   })

//   return res.data.data.updateUserProfile
// }

export const updateUserProfile = async ({ userId, input, file }) => {
  if (file) {
    const formData = new FormData();

    // Tambahkan userId
    formData.append("userId", userId);

    // Kirim ke endpoint GraphQL seperti biasa
    const query = `
    mutation UpdateUserProfile(
      $userId: String!
      $input: RegisterInput!
      $profilePicture: Upload
    ) {
      updateUserProfile(
        userId: $userId,
        input: $input,
        profilePicture: $profilePicture
      ) {
        id
        name
        username
        email
        role
        contact
        isActive
        profilePictureUrl
      }
    }
  `;

    formData.append(
      "operations",
      JSON.stringify({
        query,
        variables: {
          userId,
          input,
          profilePicture: file ? null : undefined,
        },
      })
    );

    formData.append(
      "map",
      JSON.stringify({
        0: ["variables.profilePicture"],
      })
    );

    formData.append("0", file);

    const res = await axiosWithAuth.post("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "GraphQL-Preflight": 1,
      },
    });

    return res.data.data.updateUserProfile;
  }
  const query = `
    mutation UpdateUserProfile($userId: String!, $input: UpdateUserProfileInput!) {
      updateUserProfile(
        userId: $userId,
        input: $input
      ) {
        id
        name
        username
        email
        role
        contact
        isActive
        profilePictureUrl
      }
    }
  `;

  const res = await axiosWithAuth.post("", {
    query,
    variables: {
      userId,
      input,
    },
  });

  return res.data.data.updateUserProfile;
};

export const getMyPresence = async () => {
  const query = `
    query {
      myPresence {
        id
        userId
        imageUrl
        checkInTime
        validated
      }
    }
  `;

  const res = await axiosWithAuth.post("/", {
    query,
  });

  return res.data.data.myPresence;
};

export const getDashboard = async () => {
  const query = `
    query {
      dashboard {
        salesToday
        salesTodayCount
        salesThisMonth
        salesThisMonthCount
        stockStatus {
          id
          name
          quantity
          unit
        }
        timeSeriesLast30Days {
          date
          totalSales
        }
      }
    }
  `;

  const res = await axiosWithAuth.post("/", {
    query,
  });

  return res.data.data.dashboard;
};

export const getMenus = async ({
  first = 10,
  after = null,
  last = null,
  before = null,
  where = null,
  order = null,
} = {}) => {
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

  const res = await axiosWithAuth.post("/", {
    query,
    variables: {
      first,
      after,
      last,
      before,
      where,
      order,
    },
  });

  return res.data.data.menus;
};

export const fetchPresences = async ({
  first = 1000,
  after = null,
  where = null,
  order = null,
} = {}) => {
  const query = `
    query Presences($first: Int, $after: String, $where: PresenceFilterInput, $order: [PresenceSortInput!]) {
      presences(
        first: $first
        after: $after
        where: $where
        order: $order
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        nodes {
          id
          userId
          imageUrl
          checkInTime
          validated
        }
      }
    }
  `;

  const variables = {
    first,
    after,
    where,
    order,
  };

  const res = await axiosWithAuth.post("/", {
    query,
    variables,
  });

  return res.data.data.presences;
};

export async function fetchStocks({
  first = 1000,
  after = null,
  where = null,
} = {}) {
  const query = `
    query($first: Int, $after: String, $where: StockFilterInput) {
      stocks(first: $first, after: $after, where: $where) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          itemName
          quantity
          unit
          notificationThreshold
        }
      }
    }
  `;

  const variables = { first, after, where };

  const response = await axiosWithAuth.post("", {
    query,
    variables,
  });

  return response.data.data.stocks;
}

export async function addStock({
  itemName,
  quantity,
  unit,
  notificationThreshold,
}) {
  const mutation = `
    mutation($itemName: String!, $quantity: Int!, $unit: String!, $notificationThreshold: Int!) {
      addStock(
        itemName: $itemName
        quantity: $quantity
        unit: $unit
        notificationThreshold: $notificationThreshold
      ) {
        id
        itemName
        quantity
        unit
        notificationThreshold
      }
    }
  `;

  const variables = { itemName, quantity, unit, notificationThreshold };

  const response = await axiosWithAuth.post("", {
    query: mutation,
    variables,
  });

  return response.data.data.addStock;
}

export async function updateStock({
  id,
  itemName,
  unit,
  notificationThreshold,
  quantity,
}) {
  const mutation = `
    mutation UpdateStockDetails($stockId: String!, $itemName: String, $unit: String, $notificationThreshold: Int, $quantity: Int) {
      updateStock(
        stockId: $stockId
        itemName: $itemName
        unit: $unit
        notificationThreshold: $notificationThreshold
        quantity: $quantity
      ) {
        id
        itemName
        unit
        notificationThreshold
        quantity
      }
    }
  `;

  const variables = {
    stockId: id,
    itemName,
    unit,
    notificationThreshold,
    quantity,
  };

  const response = await axiosWithAuth.post("", {
    query: mutation,
    variables,
  });

  return response.data.data.updateStock;
}

export async function correctStock({ id, quantity }) {
  return updateStock({ id, quantity });
}

export async function batchUpdateStocks(updates) {
  const mutation = `
    mutation BatchUpdateStocks($updates: [BatchUpdateInput!]!) {
      batchUpdateStocks(updates: $updates) {
        id
        itemName
        unit
        notificationThreshold
        quantity
      }
    }
  `;

  const variables = { updates };

  const response = await axiosWithAuth.post("", {
    query: mutation,
    variables,
  });

  return response.data.data.batchUpdateStocks;
}

export async function deleteStock(stockId) {
  const mutation = `
    mutation DeleteStock($stockId: String!) {
      deleteStock(stockId: $stockId)
    }
  `;

  const variables = { stockId };

  const response = await axiosWithAuth.post("", {
    query: mutation,
    variables,
  });

  return response.data.data.deleteStock;
}

export async function createMenu({ menu, image }) {
  const mutation = `
    mutation CreateMenu($menu: CreateMenuInput!, $image: Upload!) {
      createMenu(menu: $menu, image: $image) {
        id
        name
        description
        category
        price
        imageUrl
        isAvailable
        recipes {
          ingredients {
            stockId
            quantity
            stock {
              itemName
            }
          }
        }
      }
    }
  `;

  const formData = new FormData();
  formData.append(
    "operations",
    JSON.stringify({
      query: mutation,
      variables: {
        menu,
        image: null, // harus null di operasi karena upload dipisah
      },
    })
  );

  formData.append("map", JSON.stringify({ 0: ["variables.image"] }));
  formData.append("0", image);

  const response = await axiosWithAuth.post("", formData, {
    headers: { "Content-Type": "multipart/form-data", "GraphQL-Preflight": 1 },
  });

  return response.data.data.createMenu;
}

export async function updateMenu({ id, menu, image }) {
  let mutation;
  let variables;
  let hasImage = !!image;

  if (hasImage) {
    mutation = `
      mutation UpdateMenu($id: String!, $menu: UpdateMenuInput!, $image: Upload) {
        updateMenu(id: $id, menu: $menu, image: $image) {
          id
          name
          description
          category
          price
          imageUrl
          isAvailable
          recipes {
            ingredients {
              stockId
              quantity
              stock {
                itemName
              }
            }
          }
        }
      }
    `;
    variables = { id, menu, image: null };
  } else {
    mutation = `
      mutation UpdateMenu($id: String!, $menu: UpdateMenuInput!) {
        updateMenu(id: $id, menu: $menu) {
          id
          name
          description
          category
          price
          imageUrl
          isAvailable
          recipes {
            ingredients {
              stockId
              quantity
              stock {
                itemName
              }
            }
          }
        }
      }
    `;
    variables = { id, menu };
    const response = await axiosWithAuth.post("", {
      query: mutation,
      variables,
    });
    return response.data.data.updateMenu;
  }

  const formData = new FormData();
  formData.append(
    "operations",
    JSON.stringify({
      query: mutation,
      variables,
    })
  );

  if (hasImage) {
    formData.append("map", JSON.stringify({ 0: ["variables.image"] }));
    formData.append("0", image);
  }

  const response = await axiosWithAuth.post("", formData, {
    headers: { "Content-Type": "multipart/form-data", "GraphQL-Preflight": 1 },
  });

  return response.data.data.updateMenu;
}

export async function getMenusWithDetails() {
  const query = `
    query GetMenusWithDetails {
      menus(first: 1000) {
        nodes {
          id
          name
          description
          category
          price
          imageUrl
          isAvailable
          recipes {
            id
            ingredients {
              stockId
              quantity
              stock {
                id
                itemName
                quantity
                unit
                notificationThreshold
              }
            }
          }
        }
      }
    }
  `;

  const response = await axiosWithAuth.post("", {
    query,
  });

  return response.data.data.menus;
}

export async function validatePresence(presenceId) {
  const mutation = `
    mutation($presenceId: String!) {
      validatePresence(presenceId: $presenceId) {
        id
        userId
        imageUrl
        checkInTime
        validated
      }
    }
  `;

  const response = await axiosWithAuth.post("", {
    query: mutation,
    variables: { presenceId },
  });

  return response.data.data.validatePresence;
}

export const changeUserPassword = async ({ userId, newPassword }) => {
  const mutation = `
    mutation($userId: String!, $newPassword: String!) {
      changeUserPassword(userId: $userId, newPassword: $newPassword) {
        id
        name
        username
        email
        role
        isActive
      }
    }
  `;

  const res = await axiosWithAuth.post("", {
    query: mutation,
    variables: { userId, newPassword },
  });

  return res.data.data.changeUserPassword;
};

export const getRecipes = async ({
  first = 1000,
  after = null,
  where = null,
}) => {
  const query = `
    query ($first: Int, $after: String, $where: RecipeFilterInput) {
      recipes(first: $first, after: $after, where: $where) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          menuId
          ingredients {
            stockId
            quantity
          }
        }
      }
    }
  `;

  const res = await axiosWithAuth.post("", {
    query,
    variables: { first, after, where },
  });

  return res.data.data.recipes;
};

export const deleteMenu = async (id) => {
  const mutation = `
    mutation($id: String!) {
      deleteMenu(id: $id)
    }
  `;

  const res = await axiosWithAuth.post("", {
    query: mutation,
    variables: { id },
  });

  return res.data.data.deleteMenu;
};

export const deleteRecipe = async (recipeId) => {
  const mutation = `
    mutation($recipeId: String!) {
      deleteRecipe(recipeId: $recipeId)
    }
  `;

  const res = await axiosWithAuth.post("", {
    query: mutation,
    variables: { recipeId },
  });

  return res.data.data.deleteRecipe;
};

export const createRecipe = async (menuId, ingredients) => {
  const mutation = `
    mutation($menuId: String!, $ingredients: [RecipeIngredientInput!]!) {
      createRecipe(menuId: $menuId, ingredients: $ingredients) {
        id
        menuId
        ingredients {
          stockId
          quantity
        }
      }
    }
  `;

  const res = await axiosWithAuth.post("", {
    query: mutation,
    variables: { menuId, ingredients },
  });

  return res.data.data.createRecipe;
};

export async function createTransactionAPI(transaction) {
  const query = `
    mutation CreateTransaction($transaction: TransactionInput!) {
      createTransaction(transaction: $transaction) {
        id
        userId
        totalAmount
        status
        transactionDate
        menuItems {
          menuId
          quantity
        }
      }
    }
  `;

  const response = await axiosWithAuth.post("/", {
    query,
    variables: { transaction },
  });

  return response.data.data.createTransaction;
}

export async function updateTransactionStatusAPI(transactionId, status) {
  const query = `
    mutation UpdateTransactionStatus($transactionId: String!, $status: String!) {
      updateTransactionStatus(transactionId: $transactionId, status: $status) {
        id
        status
        
      }
    }
  `;

  const response = await axiosWithAuth.post("/", {
    query,
    variables: { transactionId, status },
  });

  return response.data.data.updateTransactionStatus;
}

export async function deleteTransactionAPI(transactionId) {
  const query = `
    mutation DeleteTransaction($transactionId: String!) {
      deleteTransaction(transactionId: $transactionId)
    }
  `;

  const response = await axiosWithAuth.post("/", {
    query,
    variables: { transactionId },
  });

  return response.data.data.deleteTransaction;
}
export async function getTransactionsAPI() {
  const query = `
    query GetTransactions {
      transactions(first: 1000) {
        nodes {
          id
          userId
          totalAmount
          status
          transactionDate
          qrisTransactionTime
          qrisOrderId
          netAmount
          user {
            id
            name
          }
        }
      }
    }
  `;

  const response = await axiosWithAuth.post("/", {
    query,
  });

  return response.data.data.transactions;
}

export async function getTransactionsByStatusAPI(status, qrisOrderIds = []) {
  const query = `
    query GetTransactionsByStatus($status: String!, $qrisOrderIds: [String!]!) {
      transactionsByStatus(status: $status, qrisOrderIds: $qrisOrderIds) {
        transactions {
          id
          userId
          totalAmount
          status
          transactionDate
          qrisTransactionTime
          qrisOrderId
          netAmount
          menuItems {
            menuId
            quantity
          }
          user {
            id
            username
            email
            role
          }
        }
        existingQrisOrderIds
      }
    }
  `;

  const response = await axiosWithAuth.post("/", {
    query,
    variables: { status, qrisOrderIds },
  });

  return response.data.data.transactionsByStatus;
}

export async function getTransactionDetailsAPI(transactionId) {
  const query = `
    query GetTransactionById($id: String!) {
  transactionById(id: $id) {
    id
    userId
    totalAmount
    status
    transactionDate
    qrisTransactionTime
    qrisOrderId
    netAmount
    menuItems {
      menuId
      quantity
      unitPrice
      name
    }
    user {
      id
      username
      name
      email
      role
    }
  }
}`;
  const response = await axiosWithAuth.post("/", {
    query,
    variables: { id: transactionId },
  });
  return response.data.data.transactionById;
}

export async function getStocks() {
  const query = `
    query GetStocks {
      stocks {
        nodes {
          id
          name
          currentStock
          usedToday
          usedThisMonth
          status
          unit
          notificationThreshold
        }
      }
    }
  `;

  const response = await axiosWithAuth.post("", {
    query,
  });

  return response.data.data.stocks;
}

export async function getTransactionsByUserIdAPI(userId) {
  const query = `
    query GetTransactionsByUserId($userId: String!) {
      transactionsByUserId(userId: $userId, first: 1000) {
        nodes {
          id
          userId
          totalAmount
          status
          transactionDate
          qrisTransactionTime
          qrisOrderId
          netAmount
          user {
            id
            name
            
          }
        }
      }
    }
  `;

  const response = await axiosWithAuth.post("/", {
    query,
    variables: { userId },
  });

  return response.data.data.transactionsByUserId;
}

export async function reconcileTransactionsAPI(reconciliationData) {
  const mutation = `
    mutation ReconcileTransactions($reconciliationData: [ReconciliationItemInput!]!) {
      reconcileTransactions(reconciliationData: $reconciliationData)
    }
  `;

  const response = await axiosWithAuth.post("/", {
    query: mutation,
    variables: { reconciliationData },
  });

  return response.data.data.reconcileTransactions;
}

export async function getActiveHeroContent() {
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
    const response = await axiosWithAuth.post("", {
      query,
      variables: {},
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.activeHeroContent;
  } catch (err) {
    console.error("getActiveHeroContent error:", err);
    throw err;
  }
}
export function createFormDataForFileUpload(query, variables) {
  const formData = new FormData();

  // Extract files from variables
  const files = {};
  let fileIndex = 0;

  const processedVariables = JSON.parse(
    JSON.stringify(variables, (key, value) => {
      if (value instanceof File) {
        const fileKey = fileIndex.toString();
        files[fileKey] = {
          file: value,
          path: `variables.input.${key}`,
        };
        fileIndex++;
        return null; // Replace file with null in variables
      }
      return value;
    })
  );

  // Add the operations (query + variables)
  const operations = {
    query,
    variables: processedVariables,
  };
  formData.append("operations", JSON.stringify(operations));

  // Add the map
  const map = {};
  Object.keys(files).forEach((fileKey) => {
    map[fileKey] = [files[fileKey].path];
  });
  formData.append("map", JSON.stringify(map));

  // Add the files
  Object.keys(files).forEach((fileKey) => {
    formData.append(fileKey, files[fileKey].file);
  });

  return formData;
}

export async function uploadWithFile(mutation, variables) {
  try {
    const formData = createFormDataForFileUpload(mutation, variables);

    const response = await axiosWithAuth.post("", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "GraphQL-Preflight": 1,
      },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    // Return the first mutation result (assuming single mutation)
    const mutationName = Object.keys(response.data.data)[0];
    return response.data.data[mutationName];
  } catch (err) {
    console.error("uploadWithFile error:", err);
    throw err;
  }
}
export async function updateOrCreateHeroContent(input) {
  const mutation = `
    mutation UpdateOrCreateHeroContent($input: UpdateHeroContentInput!, $backgroundImage: Upload) {
      updateOrCreateHeroContent(input: $input, backgroundImage: $backgroundImage) {
        id
        title
        description
        backgroundImageUrl
        createdAt
        updatedAt
      }
    }
  `;

  // Check if there's a file in the input
  const hasFile = input.backgroundImage instanceof File;

  if (hasFile) {
    // Extract the file and remove it from input
    const backgroundImageFile = input.backgroundImage;
    const inputWithoutFile = { ...input };
    delete inputWithoutFile.backgroundImage;

    // Use the utility function for file upload with separate file parameter
    return await uploadWithFile(mutation, {
      input: inputWithoutFile,
      backgroundImage: backgroundImageFile,
    });
  } else {
    // Regular GraphQL request without files
    const inputWithoutFile = { ...input };
    delete inputWithoutFile.backgroundImage;

    try {
      const response = await axiosWithAuth.post("", {
        query: mutation,
        variables: {
          input: inputWithoutFile,
          backgroundImage: null,
        },
      });
      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }
      return response.data.data.updateOrCreateHeroContent;
    } catch (err) {
      console.error("updateOrCreateHeroContent error:", err);
      throw err;
    }
  }
}

export async function updateOrCreateHeroContentWithImage(
  input,
  backgroundImageFile
) {
  try {
    // Use FormData for file upload
    const formData = new FormData();

    const operations = JSON.stringify({
      query: `
        mutation UpdateOrCreateHeroContent($input: UpdateHeroContentInput!, $backgroundImage: Upload) {
          updateOrCreateHeroContent(input: $input, backgroundImage: $backgroundImage) {
            id
            title
            description
            backgroundImageUrl
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          title: input.title,
          description: input.description,
        },
        backgroundImage: null,
      },
    });

    const map = JSON.stringify({
      0: ["variables.backgroundImage"],
    });

    formData.append("operations", operations);
    formData.append("map", map);
    formData.append("0", backgroundImageFile);

    const response = await axiosWithAuth.post("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "GraphQL-Preflight": 1,
      },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.updateOrCreateHeroContent;
  } catch (err) {
    console.error("updateOrCreateHeroContentWithImage error:", err);
    throw err;
  }
}

export async function getActiveAboutUsContent() {
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
    const response = await axiosWithAuth.post("", {
      query,
      variables: {},
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.activeAboutUsContent;
  } catch (err) {
    console.error("getActiveAboutUsContent error:", err);
    throw err;
  }
}

export async function updateOrCreateAboutUsContent(input) {
  const mutation = `
    mutation UpdateOrCreateAboutUsContent($input: UpdateAboutUsContentInput!) {
      updateOrCreateAboutUsContent(input: $input) {
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
    const response = await axiosWithAuth.post("", {
      query: mutation,
      variables: {
        input,
      },
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.updateOrCreateAboutUsContent;
  } catch (err) {
    console.error("updateOrCreateAboutUsContent error:", err);
    throw err;
  }
}

export async function getActivePromotionContent() {
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
    const response = await axiosWithAuth.post("", {
      query,
      variables: {},
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.activePromotionContent;
  } catch (err) {
    console.error("getActivePromotionContent error:", err);
    throw err;
  }
}

export async function updateOrCreatePromotionContent(input) {
  const mutation = `
    mutation UpdateOrCreatePromotionContent($input: UpdatePromotionContentInput!) {
      updateOrCreatePromotionContent(input: $input) {
        id
        title
        rules
        createdAt
        updatedAt
      }
    }
  `;
  try {
    const response = await axiosWithAuth.post("", {
      query: mutation,
      variables: {
        input,
      },
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.updateOrCreatePromotionContent;
  } catch (err) {
    console.error("updateOrCreatePromotionContent error:", err);
    throw err;
  }
}

export async function getAllCarouselContents() {
  const query = `
    query GetAllCarouselContents {
      allCarouselContents {
        id
        altText
        imageUrl
        createdAt
        updatedAt
      }
    }
  `;
  try {
    const response = await axiosWithAuth.post("", {
      query,
      variables: {},
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.allCarouselContents;
  } catch (err) {
    console.error("getAllCarouselContents error:", err);
    throw err;
  }
}

export async function addCarouselContent(altText, image) {
  const mutation = `
    mutation AddCarouselContent($input: CarouselContentInput!) {
      addCarouselContent(input: $input) {
        id
        altText
        imageUrl
        createdAt
        updatedAt
      }
    }
  `;

  const input = {
    altText,
    image,
  };

  // Check if there's a file in the input
  const hasFile = image instanceof File;

  if (hasFile) {
    // Use the utility function for file upload
    return await uploadWithFile(mutation, { input });
  } else {
    // Regular GraphQL request without files
    try {
      const response = await axiosWithAuth.post("", {
        query: mutation,
        variables: { input },
      });
      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }
      return response.data.data.addCarouselContent;
    } catch (err) {
      console.error("addCarouselContent error:", err);
      throw err;
    }
  }
}

export async function deleteCarouselContent(id) {
  const mutation = `
    mutation DeleteCarouselContent($id: String!) {
      deleteCarouselContent(id: $id)
    }
  `;
  try {
    const response = await axiosWithAuth.post("", {
      query: mutation,
      variables: { id },
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.deleteCarouselContent;
  } catch (err) {
    console.error("deleteCarouselContent error:", err);
    throw err;
  }
}

export async function getActiveContactContent() {
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
    const response = await axiosWithAuth.post("", {
      query,
      variables: {},
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.activeContactContent;
  } catch (err) {
    console.error("getActiveContactContent error:", err);
    throw err;
  }
}

export async function updateOrCreateContactContent(input) {
  const mutation = `
    mutation UpdateOrCreateContactContent($input: UpdateContactContentInput!) {
      updateOrCreateContactContent(input: $input) {
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
    const response = await axiosWithAuth.post("", {
      query: mutation,
      variables: {
        input,
      },
    });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.updateOrCreateContactContent;
  } catch (err) {
    console.error("updateOrCreateContactContent error:", err);
    throw err;
  }
}

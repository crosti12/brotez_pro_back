export const ROLES = {
  SELLER: "seller",
  MAGANER: "manager",
  ADMIN: "admin",
  DEVELOPER: "developer",
};

export const PRODUCT_TYPES = {
  vegetable: "vegetable",
  fruit: "fruit",
  meat: "meat",
  dairy: "dairy",
  grain: "grain",
};

const permissions = {
  userManagement: true,
  addOrder: true,
  history: true,
  dashboard: true,
  products: true,
  manageCost: true,
  deleteProduct: true,
  allHistory: true,
  deleteOrder: true,
  changeUsername: true,
};

export const PERMISSIONS = {
  seller: {
    products: true,
    history: true,
    allHistory: false,
    addOrder: true,
  },

  manager: {
    addOrder: true,
    allHistory: true,
    history: true,
    products: true,
    manageCost: true,
    deleteProduct: true,
  },

  admin: permissions,
  developer: permissions,
};

export const EVENT_TYPES = {
  product: "products",
  order: "orders",
};
export const isAllowedToHistoryAll = (req) => PERMISSIONS[req.user.role]?.allHistory;

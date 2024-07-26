module.exports = {
  statusCode: {
    SUCCESS: 200,
    NO_CONTENT: 204,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },

  MASTER_DATA: {
    MODULES: {
      DASHBOARD: "Dashboard",
      ROLES: "Roles",
      USERS: "Users",
      PRODUCTS: "Products",
      CATEGORIES: "Categories",
      REPORTS: "Reports",
    },
    SYSTEM_ROLE: {
      SUPER_ADMIN: "Super Admin",
      USER: "User",
    },
  },
};

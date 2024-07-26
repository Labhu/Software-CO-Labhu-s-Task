module.exports = {
  ERROR: "Error",
  BAD_REQUEST: "Bad request",
  VALIDATION_FAILED: "Validation Failed",
  SERVER_ERROR: "Something went to wrong",

  UNAUTHORIZED_KEY: "Unauthorized: X-API-KEY not provided",
  INVALID_ACCESS_KEY: "Invalid X-API-KEY",

  UNAUTHORIZED: "Unauthorized: No token provided",
  INVALID_ACCESS_TOKEN: "Invalid token",

  ACCESS_DENIED: "Access denied!",

  USER_LOGIN: "Logged In successfully",
  USER_SIGNUP: "Sign up successfully",

  NOT_FOUND: "Data not found",
  USER_NOT_FOUND:
    "User account not found. Please check the credentials and try again.",
  INACTIVE_USER: "User account is deactivate. Please contact to admin.",
  ROLE_ACCESS_CHANGED:
    "Role access has been changed. Please try to re-login to your account.",

  LISTING: "Data fetched successfully",
  CREATED: "Data saved successfully",
  UPDATED: "Data updated successfully",
  DELETED: "Data deleted successfully",

  ALREADY_EXISTS: "Data Already Exists.",
  EMAIL_ALREADY_EXISTS: "Email Id is Already assigned to User.",
  CAN_NOT_BULK_UPDATE_EMAIL:
    "Email is unique for all users; you cannot update it for all.",

  EMAIL_INVALID: "Your login id is invalid!",
  PASSWORD_INVALID: "Your password is invalid",
  ACCOUNT_DEACTIVATE: "Your Account is deactivated",

  SYSTEM_ROLE_NOT_DELETED: "You can't delete system role.",
  SYSTEM_ROLE_NOT_UPDATE: "You can't update system role.",

  SUPER_ADMIN_NOT_UPDATE: "You can't update super admin data.",
  SUPER_ADMIN_NOT_DELETE: "You can't delete super admin data.",

  ROLE_NOT_DELETED: "You can't delete a role because it has associated user(s)",
  ROLE_NOT_DEACTIVE:
    "You can't deactivate a role because it has associated user(s)",
};

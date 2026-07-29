const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ROLES = {
  ADMIN: "ADMIN",
  ISSUER: "ISSUER",
  HOLDER: "HOLDER",
};

export const CREDENTIAL_STATUS = {
  ACTIVE: "ACTIVE",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED",
};

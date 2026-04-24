export const ENV = {
  cookieSecret: process.env.JWT_SECRET || process.env.COOKIE_SECRET || "default_secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.FORGE_API_URL || process.env.BUILT_IN_FORGE_API_URL || "",
  forgeApiKey: process.env.FORGE_API_KEY || process.env.BUILT_IN_FORGE_API_KEY || "",
};

import "dotenv/config";

const required = ["MONGO_URI", "PORT"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[ENV] Missing required env variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",

  mongoUri: process.env.MONGO_URI,
};

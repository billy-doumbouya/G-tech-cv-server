import dotenv from "dotenv/config";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

console.log("Debug URI:", process.env.MONGO_URI);

const sessionConfig = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: mongoose.connection
      .asPromise()
      .then((conn) => conn.getClient()),
    collectionName: "sessions",
    ttl: parseInt(process.env.SESSION_MAX_AGE) / 1000,
    autoRemove: "native",
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
  },
  name: "gtech.sid",
});

export default sessionConfig;

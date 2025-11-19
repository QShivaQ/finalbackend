// MUST load environment variables before any other imports
// Use override: true to override any existing shell environment variables
import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import cors from "cors";
import { corsOptions, limiter, securityHeaders, requestLogger, errorHandler } from "./middleware/security.js";
import { yoga } from "./graphql-server.js";
import { prisma } from "./database.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use(requestLogger);

// Health check endpoint (REST)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GraphQL endpoint - Use Yoga's handle method for Express
app.use("/graphql", yoga as any);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 GraphQL API Server Running
================================
Port: ${PORT}
Environment: ${process.env.NODE_ENV || "development"}
Database: ${process.env.DATABASE_URL ? "Connected" : "Not configured"}
Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}
GraphQL Endpoint: http://localhost:${PORT}/graphql
GraphiQL IDE: http://localhost:${PORT}/graphql
Health Check: http://localhost:${PORT}/health
================================
  `);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("HTTP server closed");

    try {
      await prisma.$disconnect();
      console.log("Database disconnected");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

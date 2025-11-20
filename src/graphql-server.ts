import { createYoga } from "graphql-yoga";
import { useDepthLimit } from "@envelop/depth-limit";
import { schema } from "./schema/index";
import { prisma } from "./database";
import { extractToken, verifyToken } from "./auth/jwt";
import { createLoaders } from "./loaders/index";
import type { Context } from "./schema/builder";

/**
 * Create GraphQL Yoga server with security plugins
 */
export const yoga = createYoga<Context>({
  schema,
  graphiql: {
    title: "E-commerce GraphQL API",
  },
  plugins: [
    // Limit query depth to prevent deeply nested queries
    useDepthLimit({
      maxDepth: 10,
      ignore: ["__typename", "__Schema", "__Type"], // Ignore introspection
    }),
  ],
  context: async ({ request }) => {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader || "");
    const user = token ? verifyToken(token) : null;

    // Create fresh DataLoaders for this request
    const loaders = createLoaders();

    return {
      prisma,
      user,
      loaders,
    };
  },
  // Enable CORS
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      process.env.FRONTEND_URL_PRODUCTION || "",
      "http://localhost:4173",
    ].filter(Boolean),
    credentials: true,
  },
  // Logging
  logging: {
    debug: (...args) => console.log(...args),
    info: (...args) => console.info(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
  },
});

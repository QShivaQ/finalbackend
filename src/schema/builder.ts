import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { DateTimeResolver, JSONResolver } from "graphql-scalars";
import { prisma } from "../database.js";
import type { Loaders } from "../loaders/index.js";

export interface Context {
  prisma: typeof prisma;
  user: {
    userId: number;
    email: string;
  } | null;
  loaders: Loaders;
}

export const builder = new SchemaBuilder<{
  PrismaTypes: typeof PrismaTypes;
  Context: Context;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    JSON: {
      Input: any;
      Output: any;
    };
  };
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
});

// Add DateTime scalar
builder.addScalarType("DateTime", DateTimeResolver, {});

// Add JSON scalar
builder.addScalarType("JSON", JSONResolver, {});

// Query and Mutation root types
builder.queryType({});
builder.mutationType({});

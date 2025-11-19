// MUST load dotenv before any other imports
import { config } from "dotenv";
config();

import { prisma } from "../src/database.js";

async function addPasswordColumn() {
  try {
    console.log("Checking if password column exists...");

    // Check if column already exists
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'password'
    `;

    if (result.length > 0) {
      console.log("✅ Password column already exists!");
      return;
    }

    console.log("Adding password column...");

    // Add password column with a default empty string
    await prisma.$executeRaw`
      ALTER TABLE users
      ADD COLUMN password TEXT NOT NULL DEFAULT ''
    `;

    console.log("✅ Password column added successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addPasswordColumn();

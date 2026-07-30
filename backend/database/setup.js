// Runs schema.sql then sample_data.sql against the database in DATABASE_URL.
// Usage: npm run db:setup        (schema + sample data)
//        npm run db:setup:schema (schema only)

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const schemaOnly = process.argv.includes("--schema-only");

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from backend/.env");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    console.log("Running schema.sql...");
    await client.query(schemaSql);
    console.log("Schema applied.");

    if (!schemaOnly) {
      const sampleDataSql = fs.readFileSync(path.join(__dirname, "sample_data.sql"), "utf8");
      console.log("Running sample_data.sql...");
      await client.query(sampleDataSql);
      console.log("Sample data inserted.");
    }
  } finally {
    await client.end();
  }
}

run()
  .then(() => {
    console.log("Database setup complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database setup failed:", error.message);
    process.exit(1);
  });

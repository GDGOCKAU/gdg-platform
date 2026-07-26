const net = require("net");
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from .env");
}

// Node's Happy Eyeballs (autoSelectFamily) races IPv4 and IPv6 connection
// attempts in parallel. Under WSL2's NAT, IPv6 has no real route, which
// causes the whole race to fail even when a plain IPv4 connection works.
if (net.setDefaultAutoSelectFamily) {
  net.setDefaultAutoSelectFamily(false);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error);
});

module.exports = pool;
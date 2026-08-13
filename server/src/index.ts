import app from "./app.js";
import { config } from "./config.js";
import { prisma } from "./db.js";

const server = app.listen(config.port, () => {
  console.log(`FlowDesk API listening on http://localhost:${config.port}`);
});

const shutdown = async () => {
  console.log("\nShutting down...");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

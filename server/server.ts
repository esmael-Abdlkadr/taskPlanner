import dotenv from "dotenv";
import app from "./app";
import { logger } from "./config/logger";
import http from "http";
import { connectDb, disconnectDb } from "./config/db";
import { seedDefaultCategories } from "./seed/categorySeeder";

dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDb();
    
    // Run seeders after DB connection
    logger.info("Running database seeders...");
    await seedDefaultCategories();
    logger.info("Database seeding completed");

    // Start the server
    const server = http.createServer(app);
    server.listen(port, () => {
      logger.info(`Server is listening on port ${port}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info("Shutting down server...");
      server.close(async () => {
        await disconnectDb();
        logger.info("Server shut down successfully");
        process.exit(0);
      });
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Server startup error", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unknown server startup error");
    }
    process.exit(1);
  }
};

startServer();
import mongoose, { MongooseError } from "mongoose";
import { logger } from "./logger";

export const connectDb = async () => {
  try {
    logger.info("MongoDB: Attempting to connect...");
    
    // Check environment variable
    const mongoUri =  process.env.MONGO_URL;
    if (!mongoUri) {
      throw new Error("MongoDB URI not defined in environment variables");
    }
    
    // Log connection info (hiding credentials)
    const sanitizedUri = mongoUri.includes('@') 
      ? `${mongoUri.split('@')[0].replace(/mongodb(\+srv)?:\/\/[^:]+:/, 'mongodb$1://[username]:[hidden]')}@${mongoUri.split('@')[1]}`
      : 'Invalid URI format';
    logger.info(`MongoDB: Connecting to ${sanitizedUri}`);
    
    // Connect with improved options
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 60000,        
      serverSelectionTimeoutMS: 30000, 
      connectTimeoutMS: 30000,      
      heartbeatFrequencyMS: 10000,  
      retryWrites: true,           
      retryReads: true           
    });
    
    // Add event listeners for connection state
    mongoose.connection.on('error', (err) => {
      logger.error("MongoDB: Connection error", {
        message: err.message,
        stack: err.stack,
      });
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn("MongoDB: Disconnected");
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info("MongoDB: Reconnected");
    });
    
    logger.info("MongoDB: Connected successfully");
    return true;
    
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      logger.error("MongoDB: Connection failed", {
        message: error.message,
        stack: error.stack,
      });
    } else if (error instanceof Error) {
      logger.error("MongoDB: Connection failed", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("MongoDB: Connection failed", {
        message: "Unknown error occurred",
        stack: String(error),
      });
    }
    
    // Return false to indicate connection failure
    return false;
  }
};

export const disconnectDb = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB: Disconnected successfully");
    return true;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      logger.error("MongoDB: Disconnect failed", {
        message: error.message,
        stack: error.stack,
      });
    } else if (error instanceof Error) {
      logger.error("MongoDB: Disconnect failed", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("MongoDB: Disconnect failed", {
        message: "Unknown error occurred",
        stack: String(error),
      });
    }
    return false;
  }
};
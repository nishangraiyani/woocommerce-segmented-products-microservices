import mongoose from "mongoose";

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect(uri) {
    try {
      if (this.isConnected) {
        console.log("Database already connected");
        return;
      }

      await mongoose.connect(uri);
      this.isConnected = true;
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log("MongoDB disconnected successfully");
    } catch (error) {
      console.error("MongoDB disconnection error:", error);
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }
}

export default new Database();

import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      retryWrites: true,
      w: "majority",
    })
    .then(() => {
      console.log("✅ Connected to database!");
    })
    .catch((err) => {
      console.error("❌ Error connecting to database:", err.message);
      console.log("\n🔍 Common solutions:");
      console.log("1. Check if your IP address is whitelisted in MongoDB Atlas");
      console.log("2. Verify your MongoDB Atlas cluster is running (not paused)");
      console.log("3. Check your network connection");
      console.log("4. Verify MONGO_URI in config.env is correct");
      console.log("\n📝 To whitelist your IP in MongoDB Atlas:");
      console.log("   - Go to Network Access in MongoDB Atlas");
      console.log("   - Click 'Add IP Address'");
      console.log("   - Add '0.0.0.0/0' (for all IPs) OR your specific IP");
      process.exit(1);
    });
};

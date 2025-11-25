import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/userSchema.js";
import bcrypt from "bcrypt";
import readline from "readline";

// Load environment variables
dotenv.config({ path: "./config/config.env" });

// Check if running in interactive mode
const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

// Create readline interface for user input (only if interactive)
let rl = null;
if (isInteractive) {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

const askQuestion = (query) => {
  if (!isInteractive || !rl) {
    return Promise.resolve("");
  }
  return new Promise((resolve) => rl.question(query, resolve));
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_PERSONAL_PORTFOLIO",
    });
    console.log("✅ Connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    await connectDB();

    // Get admin email from environment or use default
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    // Check if user already exists and delete it
    const existingUser = await User.findOne({
      email: adminEmail,
    });

    if (existingUser) {
      console.log("⚠️  Admin user already exists!");
      console.log("Email:", adminEmail);
      console.log("🗑️  Deleting existing admin user...");
      await User.deleteOne({ email: adminEmail });
      console.log("✅ Existing admin user deleted.\n");
    }

    console.log("\n📝 Creating Admin User\n");

    let fullName, email, phone, aboutMe, password, portfolioURL;
    let githubURL, linkedInURL, instagramURL, twitterURL, facebookURL;

    if (isInteractive) {
      console.log("You can use default values (just press Enter) or provide your own:\n");

      // Get user input interactively
      fullName =
        (await askQuestion("Full Name [John Doe]: ")) || "John Doe";
      email = (await askQuestion(`Email [${adminEmail}]: `)) || adminEmail;
      phone = (await askQuestion("Phone [1234567890]: ")) || "1234567890";
      aboutMe =
        (await askQuestion("About Me [Full Stack Developer]: ")) ||
        "Full Stack Developer";
      
      while (true) {
        password = await askQuestion("Password (min 8 characters) [admin1234]: ");
        if (!password) password = "admin1234";
        if (password.length >= 8) break;
        console.log("❌ Password must be at least 8 characters long!");
      }

      portfolioURL =
        (await askQuestion("Portfolio URL [http://localhost:5173]: ")) ||
        "http://localhost:5173";
      githubURL =
        (await askQuestion("GitHub URL (optional): ")) || "";
      linkedInURL =
        (await askQuestion("LinkedIn URL (optional): ")) || "";
      instagramURL =
        (await askQuestion("Instagram URL (optional): ")) || "";
      twitterURL =
        (await askQuestion("Twitter URL (optional): ")) || "";
      facebookURL =
        (await askQuestion("Facebook URL (optional): ")) || "";
    } else {
      // Non-interactive mode: use environment variables or defaults
      console.log("Running in non-interactive mode with defaults...\n");
      fullName = process.env.ADMIN_FULL_NAME || "John Doe";
      email = adminEmail;
      phone = process.env.ADMIN_PHONE || "1234567890";
      aboutMe = process.env.ADMIN_ABOUT || "Full Stack Developer";
      password = process.env.ADMIN_PASSWORD || "admin1234";
      portfolioURL = process.env.ADMIN_PORTFOLIO_URL || "http://localhost:5173";
      githubURL = process.env.ADMIN_GITHUB_URL || "";
      linkedInURL = process.env.ADMIN_LINKEDIN_URL || "";
      instagramURL = process.env.ADMIN_INSTAGRAM_URL || "";
      twitterURL = process.env.ADMIN_TWITTER_URL || "";
      facebookURL = process.env.ADMIN_FACEBOOK_URL || "";

      // Validate password
      if (password.length < 8) {
        console.error("❌ Password must be at least 8 characters long!");
        if (rl) rl.close();
        process.exit(1);
      }
    }

    // Use placeholder images from a public CDN (you can change these later)
    // Using placeholder.com or similar service
    const placeholderAvatar = "https://via.placeholder.com/200/4A90E2/ffffff?text=Avatar";
    const placeholderResume = "https://via.placeholder.com/800/FFFFFF/000000?text=Resume+PDF";

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      aboutMe,
      password, // Will be hashed automatically by the pre-save hook
      portfolioURL,
      githubURL,
      linkedInURL,
      instagramURL,
      twitterURL,
      facebookURL,
      avatar: {
        public_id: "placeholder_avatar",
        url: placeholderAvatar,
      },
      resume: {
        public_id: "placeholder_resume",
        url: placeholderResume,
      },
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📧 Login Credentials:");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("\n⚠️  IMPORTANT: Please change your password after first login!");
    console.log("\n✨ You can now login to the dashboard at: http://localhost:5174\n");

    if (rl) rl.close();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    if (error.code === 11000) {
      console.log("⚠️  A user with this email already exists!");
    }
    if (rl) rl.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
createAdminUser();


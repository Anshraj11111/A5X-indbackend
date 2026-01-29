import { v2 as cloudinary } from "cloudinary";

// Don't configure here - will be configured in server.js after .env is loaded
export default cloudinary;

// Export a function to configure cloudinary when needed
export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✅ Cloudinary configured");
};

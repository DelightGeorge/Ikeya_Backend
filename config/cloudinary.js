import { v2 as cloudinaryV2 } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configure the credentials
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryV2,
  params: {
    folder: "Ikeya_Products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// Initialize Multer
const upload = multer({ storage: storage });

// We export the configured v2 instance (renamed back to 'cloudinary' for your other files)
// and the upload middleware.
export { cloudinaryV2 as cloudinary, upload };
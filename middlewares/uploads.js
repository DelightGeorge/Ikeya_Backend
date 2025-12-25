import multer from "multer";

// Set up storage (memory or disk)
const storage = multer.memoryStorage(); // or diskStorage({ ... })

const uploads = multer({ storage });

export default uploads; // default export

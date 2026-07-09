// agents/upload.middleware.ts

import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "reactivation-requests"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const fileExt =
      path.extname(file.originalname);

    const fileName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

    cb(null, fileName);
  },
});

export const uploadReactivationRequest =
  multer({
    storage,

    limits: {
      fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (_req, file, cb) => {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return cb(
          new Error(
            "Only PDF, JPG, JPEG, and PNG files are allowed."
          )
        );
      }

      cb(null, true);
    },
  });
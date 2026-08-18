import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "agent-profile"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    callback
  ) => {
    callback(
      null,
      uploadDirectory
    );
  },

  filename: (
    _req,
    file,
    callback
  ) => {
    const extension =
      path.extname(
        file.originalname
      ) || ".jpg";

    const filename =
      `agent-${Date.now()}${extension}`;

    callback(
      null,
      filename
    );
  },
});

export const uploadAgentProfile =
  multer({
    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },

    fileFilter: (
      _req,
      file,
      callback
    ) => {
      if (
        !file.mimetype.startsWith(
          "image/"
        )
      ) {
        callback(
          new Error(
            "Only image files are allowed."
          )
        );

        return;
      }

      callback(null, true);
    },
  });
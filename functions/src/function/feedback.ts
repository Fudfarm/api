import multer from "multer";
import path from "path";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

interface MulterCallback {
  (error: Error | null, destination: string): void;
}

interface MulterFilenameCallback {
  (error: Error | null, filename: string): void;
}

const storage: multer.StorageEngine = multer.diskStorage({
  destination: (req: Express.Request, file: MulterFile, cb: MulterCallback) => {
    cb(null, "uploads/"); // make sure folder exists
  },
  filename: (req: Express.Request, file: MulterFile, cb: MulterFilenameCallback) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

export const upload = multer({ storage });

import express from "express";
import multer from "multer";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import File from '../models/files.model.js'
import { storeEmbeddings } from '../services/langchain.service.js'

const router = express.Router();

// Multer storage setup (uploads to "uploads/" directory)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// 🔹 Upload a new PDF
router.post("/upload", upload.single("file"), async (req, res) => {
  try {

    const filePath = req.file.path;

    // Parse text from PDF
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();



    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      //uploadedBy: req.user.id,
    });

    await file.save();
    await storeEmbeddings(docs, file._id);

    res.status(201).json({ message: "File uploaded successfully", file });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "File upload failed", error });
  }
});

// 🔹 Get all uploaded files
router.get("/", async (req, res) => {
  const files = await File.find({ uploadedBy: req.user.id });
  res.json(files);
});

// 🔹 Get a specific file by ID
router.get("/:id", async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });
  res.json(file);
});

// 🔹 Delete a file
router.delete("/:id", async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });

  await File.findByIdAndDelete(req.params.id);
  res.json({ message: "File deleted successfully" });
});

export default router;

import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("File", FileSchema);

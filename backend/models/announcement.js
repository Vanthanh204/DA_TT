const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", AnnouncementSchema);
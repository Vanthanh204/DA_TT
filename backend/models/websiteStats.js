const mongoose = require("mongoose");

const WebsiteStatsSchema = new mongoose.Schema({
  visitCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("WebsiteStats", WebsiteStatsSchema);
import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  boardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Boarding",
    required: true
  },

  studentName: {
    type: String,
    required: true
  },

  studentPhone: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },

  visitDate: {
    type: String,
    default: ""
  },

  visitTime: {
    type: String,
    default: ""
  },

  rejectReason: {
    type: String,
    default: ""
  }

}, { timestamps: true });

export default mongoose.model("Request", requestSchema);
import mongoose from "mongoose";

const boardingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  distanceFromUniversity: { type: String, required: true },

  price: { type: Number, required: true },
  roomCount: { type: Number, required: true },
  studentsCapacity: { type: Number, required: true },

  description: { type: String, required: true },
  specialNote: { type: String, default: "" },

  image: {
    type: String,
    default: "https://buysell.lk/wp-content/uploads/2024/03/House-for-Sale-in-Thandikulam-Vavuniya-600x375.jpg"
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

export default mongoose.model("Boarding", boardingSchema);
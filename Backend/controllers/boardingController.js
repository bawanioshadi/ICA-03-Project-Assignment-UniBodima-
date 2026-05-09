import Boarding from "../models/Boarding.js";

// CREATE BOARDING (OWNER)
export const createBoarding = async (req, res) => {
  try {
    const {
      title,
      location,
      distanceFromUniversity,
      price,
      roomCount,
      studentsCapacity,
      description,
      specialNote,

    } = req.body;

    if (!title || !location || !distanceFromUniversity || !price || !roomCount || !studentsCapacity || !description) {
      return res.status(400).json({ status: "fail", message: "All fields except specialNote are required" });
    }

    const boarding = await Boarding.create({
      title,
      location,
      distanceFromUniversity,
      price,
      roomCount,
      studentsCapacity,
      description,
      specialNote,
      ownerId: req.user.id
    });

    res.status(201).json({status: "success", message: "Boarding created successfully", boarding });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};


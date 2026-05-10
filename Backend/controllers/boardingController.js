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

// GET OWNER'S BOARDINGS
export const getOwnerBoardings = async (req, res) => {
  try {
    const boardings = await Boarding.find({ ownerId: req.user.id });
    res.json({ status: "success", boardings });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// UPDATE BOARDING (OWNER)
export const updateBoarding = async (req, res) => {
  try {
    const boarding = await Boarding.findById(req.params.id);

    if (!boarding) {
      return res.status(404).json({status: "fail", message: "Boarding not found" });
    }


    if (boarding.ownerId.toString() !== req.user.id) {
      return res.status(403).json({status:'fail', message: "Not your boarding post" });
    }

    const updated = await Boarding.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({status: "success",message: "Boarding updated successfully", boarding: updated });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// DELETE BOARDING (OWNER)
export const deleteBoarding = async (req, res) => {
  try {
    const boarding = await Boarding.findById(req.params.id);

    if (!boarding) {
      return res.status(404).json({ status: "fail", message: "Boarding not found" });
    }

    if (boarding.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Not your boarding post" });
    }

    await boarding.deleteOne();

    res.json({ status: "success", message: "Boarding deleted successfully" });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export const getPublicBoardings = async (req, res) => {
  try {
    const boardings = await Boarding.find();
    res.json({ status: "success", boardings });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};


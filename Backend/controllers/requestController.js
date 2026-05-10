import Request from "../models/Request.js";
// CREATE REQUEST (STUDENT)
export const createRequest = async (req, res) => {
  try {
    const { boardingId, studentName, studentPhone } = req.body;
    if (!boardingId || !studentName || !studentPhone) {
      return res.status(400).json({ status: "fail", message: "All fields are required" });
    }

    const request = await Request.create({
      studentId: req.user.id,
      boardingId,
      studentName,
      studentPhone
    });

    res.status(201).json({ status: "success", message: "Request send successfully", request });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// GET OWNER'S REQUESTS
export const getOwnerRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("boardingId")
      .populate("studentId", "name phone");

    res.json({ status: "success", requests });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
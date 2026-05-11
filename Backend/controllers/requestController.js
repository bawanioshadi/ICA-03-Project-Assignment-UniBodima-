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
// ACCEPT REQUEST (OWNER)
export const acceptRequest = async (req, res) => {
  try {
    const { visitDate, visitTime } = req.body;
    if (!visitDate || !visitTime) {
      return res.status(400).json({ status: "fail", message: "All fields are required" });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ status: "fail", message: "Request not found" });
    }

    request.status = "accepted";
    request.visitDate = visitDate;
    request.visitTime = visitTime;

    await request.save();

    res.json({ status: "success", message: "Request accepted successfully", request });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// GET STUDENT'S REQUESTS
export const getStudentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ studentId: req.user.id })
      .populate("boardingId");

    res.json({ status: "success", requests });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
// REJECT REQUEST (OWNER)
export const rejectRequest = async (req, res) => {
  try {
    const { rejectReason } = req.body;
    if (!rejectReason) {
      return res.status(400).json({ status: "fail", message: "Reject reason is required" });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ status: "fail", message: "Request not found" });
    }

    request.status = "rejected";
    request.rejectReason = rejectReason;

    await request.save();

    res.json({ status: "success", message: "Request rejected successfully", request });

  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

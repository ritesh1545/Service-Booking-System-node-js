const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createBooking,
  getBookings,
  updateBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  deleteBooking,
} = require("../controllers/bookingController");

router.use(protect);

router.post("/", createBooking);
router.get("/", getBookings);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

router.patch("/:id/approve", adminOnly, approveBooking);
router.patch("/:id/reject", adminOnly, rejectBooking);

module.exports = router;
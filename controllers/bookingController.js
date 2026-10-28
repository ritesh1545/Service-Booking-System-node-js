const mongoose = require("mongoose");
const Booking = require("../models/Booking");

const validDate = (value) =>
  typeof value === "string" &&
  !Number.isNaN(Date.parse(value)) &&
  !Number.isNaN(new Date(value).getTime());

exports.createBooking = async (req, res) => {
  try {
    const { serviceName, requestedDate } = req.body;

    if (
      typeof serviceName !== "string" ||
      !serviceName.trim() ||
      !validDate(requestedDate) ||
      new Date(requestedDate) <= new Date()
    ) {
      return res.status(400).json({
        message: "Provide a service name and a valid future date",
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      serviceName: serviceName.trim(),
      requestedDate: new Date(requestedDate),
      status: "pending",
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin" ? {} : { user: req.user.id };

    const bookings = await Booking.find(filter)
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can update only your own bookings",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be updated",
      });
    }

    const { serviceName, requestedDate } = req.body;

    if (serviceName !== undefined) {
      if (typeof serviceName !== "string" || !serviceName.trim()) {
        return res.status(400).json({
          message: "Service name must be a non-empty string",
        });
      }

      booking.serviceName = serviceName.trim();
    }

    if (requestedDate !== undefined) {
      if (
        !validDate(requestedDate) ||
        new Date(requestedDate) <= new Date()
      ) {
        return res.status(400).json({
          message: "Requested date must be a valid future date",
        });
      }

      booking.requestedDate = new Date(requestedDate);
    }

    await booking.save();

    return res.status(200).json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can cancel only your own bookings",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be approved",
      });
    }

    booking.status = "approved";
    await booking.save();

    return res.status(200).json({
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be rejected",
      });
    }

    booking.status = "rejected";
    await booking.save();

    return res.status(200).json({
      message: "Booking rejected successfully",
      booking,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }


    if (req.user.role === "admin") {
      await booking.deleteOne();

      return res.status(200).json({
        message: "Booking deleted by admin",
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can cancel only your own bookings",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 4000;

// Middleware
app.use(bodyParser.json());

// Room data
const rooms = [
  {
    id: "room-a",
    name: "Room A",
    seats: 50,
    amenities: ["projector", "microphone", "whiteboard"],
    price: 50,
    bookings: [],
  },
  {
    id: "room-b",
    name: "Room B",
    seats: 20,
    amenities: ["projector", "whiteboard"],
    price: 30,
    bookings: [],
  },
];

// Booking data
const bookings = [];

app.get("/", (req, res) => {
  res.send("Welcome!!!");
});

// Routes
app.get("/rooms", async (req, res) => {
  // Asynchronous function that retrieves all the available rooms
  try {
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving rooms", error: error });
  }
});

app.post("/rooms", async (req, res) => {
  // Asynchronous function that adds a new room
  try {
    const room = req.body;
    rooms.push(room);
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Error adding room", error: error });
  }
});

app.post("/bookings", async (req, res) => {
  // Asynchronous function that creates a new booking
  try {
    const booking = req.body;
    const room = rooms.find((room) => room.id === booking.roomId);
    if (!room) {
      res.status(400).json({ message: "Invalid Room ID" });
    } else {
      // Check for conflicts with existing bookings
      const conflict = room.bookings.find((existingBooking) => {
        return (
          booking.date === existingBooking.date &&
          booking.endTime > existingBooking.startTime &&
          booking.startTime < existingBooking.endTime
        );
      });
      if (conflict) {
        res.status(400).json({ message: "Booking Conflict" });
      } else {
        booking.id = bookings.length + 1;
        bookings.push(booking);
        room.bookings.push(booking);
        res.json(booking);
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error });
  }
});

app.get("/bookings", async (req, res) => {
  // Asynchronous function that retrieves all the bookings
  try {
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving bookings", error: error });
  }
});

app.get("/customers", async (req, res) => {
  // Asynchronous function that retrieves all the customers and their bookings
  try {
    const customers = [];
    for (const booking of bookings) {
      const room = rooms.find((room) => room.id === booking.roomId);
      customers.push({
        customerName: booking.customerName,
        roomName: room.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      });
    }
    res.json(customers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving customers", error: error });
  }
});

app.get("/customers/:customerId/bookings", async (req, res) => {
  // Asynchronous function that retrieves a customer's bookings by customer ID
  try {
    const customerId = req.params.customerId;

    const customerBookings = bookings.filter(
      (booking) => booking.customerId === customerId
    );
    const customerData = customerBookings.map((booking) => {
      const room = rooms.find((room) => room.id === booking.roomId);
      return {
        customerName: booking.customerName,
        roomName: room.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingId: booking.id,
        bookingStatus: booking.status,
        bookingDate: booking.bookingDate,
      };
    });
    res.json(customerData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving customer bookings", error: error });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Hall Booking API listening at http://localhost:${port}`);
});

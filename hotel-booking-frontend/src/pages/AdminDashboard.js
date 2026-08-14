import { useState, useEffect } from "react";
import api from "../services/api";

function AdminDashboard() {
  // Form State
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("SINGLE");
  const [pricePerNight, setPricePerNight] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState("");

  // UI Feedback States
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [bookingsError, setBookingsError] = useState("");

  // Data State
  const [bookings, setBookings] = useState([]);

  //Room State
  const [rooms, setRooms] = useState([]);

  //Filter State
  const [filter, setFilter] = useState("ALL");

  // Fetch all bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings/admin/all");
      setBookings(response.data);
    } catch (err) {
      setBookingsError("Failed to fetch bookings list.");
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setFormSuccess("");
    setFormError("");

    const roomData = {
      roomNumber,
      type,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      description,
      amenities,
    };

    try {
      await api.post("/rooms/admin", roomData);
      setFormSuccess(`Room ${roomNumber} added successfully!`);

      // Clear form inputs
      setRoomNumber("");
      setType("SINGLE");
      setPricePerNight("");
      setCapacity("");
      setDescription("");
      setAmenities("");
    } catch (err) {
      setFormError("Failed to add room. Check details or connection.");
    }
  };
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get("/rooms");
        // Axios stores the server response data inside the .data property
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms data:", error);
      }
    };

    fetchRooms();
  }, []);
  const filteredRooms = rooms.filter((room) => {
    if (filter === "AVAILABLE") return room.available;
    if (filter === "BOOKED") return !room.available;
    return true;
  });
  return (
    <div className="admin-dashboard-container" style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {/* Section 1: Add Room Form */}
      <section className="add-room-section" style={{ marginBottom: "40px" }}>
        <h3>Add Room</h3>
        {formSuccess && (
          <p className="success-message" style={{ color: "green" }}>
            {formSuccess}
          </p>
        )}
        {formError && (
          <p className="error-message" style={{ color: "red" }}>
            {formError}
          </p>
        )}

        <form
          onSubmit={handleAddRoom}
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "400px",
            gap: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="SINGLE">SINGLE</option>
            <option value="DOUBLE">DOUBLE</option>
            <option value="SUITE">SUITE</option>
          </select>
          <input
            type="number"
            placeholder="Price Per Night"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Amenities (e.g. WiFi, TV, AC)"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            required
          />
          <button type="submit">Add Room</button>
        </form>
      </section>

      {/* Section 2: All Bookings List */}
      <section className="bookings-section">
        <h3>All Bookings</h3>
        {bookingsError && (
          <p className="error-message" style={{ color: "red" }}>
            {bookingsError}
          </p>
        )}

        <div
          className="bookings-list"
          style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}
        >
          {bookings.length === 0 ? (
            <p>No bookings available.</p>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="booking-card"
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  borderRadius: "5px",
                  minWidth: "250px",
                }}
              >
                <h4>Booking ID: {booking.id}</h4>
                <p>
                  <strong>User Email:</strong> {booking.guestEmail}
                </p>
                <p>
                  <strong>Room Number:</strong> {booking.roomNumber}
                </p>
                <p>
                  <strong>Check In:</strong>{" "}
                  {booking.checkInDate || booking.checkIn}
                </p>
                <p>
                  <strong>Check Out:</strong>{" "}
                  {booking.checkOutDate || booking.checkOut}
                </p>
                <p>
                  <strong>Status:</strong> {booking.status || "Confirmed"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
      {/* Section 3: Rooms Management */}

      <div className="page-container">
        <button onClick={() => setFilter("ALL")}>All</button>
        <button onClick={() => setFilter("AVAILABLE")}>Available</button>
        <button onClick={() => setFilter("BOOKED")}>Booked</button>
        <h2>
          {filter === "ALL"
            ? "All Rooms"
            : filter === "AVAILABLE"
              ? "Available Rooms"
              : "Booked Rooms"}
        </h2>
        <div className="rooms-grid">
          {filteredRooms.length === 0 ? (
            <p>No rooms available or loading...</p>
          ) : (
            filteredRooms.map((room) => (
              <div className="room-card" key={room.id}>
                <h3>Room {room.roomNumber}</h3>
                <p>Type: {room.type}</p>
                <p>Capacity: {room.capacity} persons</p>
                <p>Amenities: {room.amenities}</p>
                <p className="price">${room.pricePerNight} / night</p>
                <p
                  className={
                    room.available ? "status-available" : "status-booked"
                  }
                >
                  {room.available ? "Available" : "Booked"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

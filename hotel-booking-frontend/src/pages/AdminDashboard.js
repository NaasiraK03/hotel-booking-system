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

  //Filter State (Expanded to include CANCELLED)
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
      setFormSuccess(`Room ₹{roomNumber} added successfully!`);

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
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms data:", error);
      }
    };

    fetchRooms();
  }, []);

  // Filter Bookings Based on Filter State
  const filteredBookings = bookings.filter((booking) => {
    if (filter === "CANCELLED") return booking.status === "CANCELLED";
    // For standard filters, filter out cancelled bookings so they don't pollute active lists
    if (booking.status === "CANCELLED") return false;
    return true;
  });
  // 1. THIS IS THE FIX: Keep guest bookings locked strictly to non-cancelled items
  const allGuestActiveBookings = bookings.filter(
    (b) => b.status !== "CANCELLED",
  );

  // 2. This filter is used exclusively by your bottom room management section
  const filteredRooms = rooms.filter((room) => {
    if (filter === "AVAILABLE") return room.available;
    if (filter === "BOOKED") return !room.available;
    return true;
  });

  return (
    <div className="admin-dashboard-container">
   <h2 className="section-title" style={{ display: "block", textAlign: "center", width: "100%" }}>
    Admin Dashboard
</h2>
      {/* Section 1: Add Room Form */}
      <section style={{ marginBottom: "48px" }}>
        <h3 className="section-title">Add New Room</h3>
        {formSuccess && (
          <p style={{ color: "green", marginBottom: "12px" }}>
            ✅ {formSuccess}
          </p>
        )}
        {formError && (
          <p style={{ color: "red", marginBottom: "12px" }}>❌ {formError}</p>
        )}

        <form
          onSubmit={handleAddRoom}
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "450px",
            gap: "12px",
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
            placeholder="Price Per Night (₹)"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            required
            min="0"
          />
          <input
            type="number"
            placeholder="Capacity (persons)"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
          />
          <input
            type="text"
            placeholder="Amenities (e.g. WiFi, TV, AC)"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            required
          />
          <button type="submit">➕ Add Room</button>
        </form>
      </section>

      {/* Section 2: Active Guest Bookings */}
      <section style={{ marginBottom: "48px" }}>
        <h3 className="section-title">Active Guest Bookings</h3>
        {bookingsError && <p className="error-message">{bookingsError}</p>}
        <div className="bookings-grid">
          {allGuestActiveBookings.length === 0 ? (
            <p>No active bookings.</p>
          ) : (
            allGuestActiveBookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <h3>📋 Booking #{booking.id}</h3>
                <p>👤 {booking.guestEmail}</p>
                <p>🏨 Room: {booking.roomNumber}</p>
                <p>📅 Check-in: {booking.checkInDate}</p>
                <p>📅 Check-out: {booking.checkOutDate}</p>
                <p className="status-available">● {booking.status}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section 3: Rooms Management */}
      <section>
        <h3 className="section-title">Rooms Management</h3>
        <div className="filter-buttons" style={{ marginBottom: "20px" }}>
          <button onClick={() => setFilter("ALL")}>All Rooms</button>
          <button onClick={() => setFilter("AVAILABLE")}>Available</button>
          <button onClick={() => setFilter("BOOKED")}>Booked</button>
          <button onClick={() => setFilter("CANCELLED")}>
            Cancelled Bookings
          </button>
        </div>

        <h4 style={{ marginBottom: "16px", color: "#666" }}>
          {filter === "ALL"
            ? "All Rooms"
            : filter === "AVAILABLE"
              ? "Available Rooms"
              : filter === "BOOKED"
                ? "Booked Rooms"
                : "Cancelled Booking History"}
        </h4>

        {filter === "CANCELLED" ? (
          <div className="bookings-grid">
            {filteredBookings.length === 0 ? (
              <p>No cancelled bookings found.</p>
            ) : (
              filteredBookings.map((booking) => (
                <div className="booking-card" key={booking.id}>
                  <h3>📋 Booking #{booking.id}</h3>
                  <p>👤 {booking.guestEmail}</p>
                  <p>🏨 Room: {booking.roomNumber}</p>
                  <p>📅 Check-in: {booking.checkInDate}</p>
                  <p>📅 Check-out: {booking.checkOutDate}</p>
                  <p className="status-booked">● CANCELLED</p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.length === 0 ? (
              <p>No rooms found.</p>
            ) : (
              filteredRooms.map((room) => (
                <div className="room-card" key={room.id}>
                
                  <div className="room-card-body">
                    <h3>Room {room.roomNumber}</h3>
                    <p>🛏 {room.type}</p>
                    <p>👥 {room.capacity} persons</p>
                    <p>✨ {room.amenities}</p>
                    <p className="price">₹{room.pricePerNight} / night</p>
                    <p
                      className={
                        room.available ? "status-available" : "status-booked"
                      }
                    >
                      ● {room.available ? "Available" : "Booked"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;

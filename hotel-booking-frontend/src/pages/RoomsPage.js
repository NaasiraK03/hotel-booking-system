import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  // Helper functions to fetch data
  const fetchRooms = async () => {
    try {
      const response = await api.get("/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms data:", error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await api.get("/bookings/my");
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching your bookings:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchMyBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?",
    );
    if (!confirmCancel) return;

    try {
      await api.delete(`/bookings/${bookingId}`);
      alert("Booking cancelled successfully!");
      fetchRooms();
      fetchMyBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  // Filter lists in memory before rendering
  //const availableOnlyRooms = rooms.filter((room) => room.available);
  const filteredRooms = rooms
    .filter((room) => room.available)
    .filter((room) => filter === "ALL" || room.type === filter);
  const activeBookings = bookings.filter((b) => b.status !== "CANCELLED");
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");

  return (
    <div>
      <div style={{ marginBottom: "20px", marginTop: "20px", display: "flex", gap: "10px" }}></div>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setFilter("ALL")}
          style={{
            padding: "8px 20px",
            borderRadius: "20px",
            border: "1px solid #c8a96e",
            backgroundColor: filter === "ALL" ? "#c8a96e" : "white",
            color: filter === "ALL" ? "white" : "#c8a96e",
            cursor: "pointer",
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("SINGLE")}
          style={{
            padding: "8px 20px",
            borderRadius: "20px",
            border: "1px solid #c8a96e",
            backgroundColor: filter === "SINGLE" ? "#c8a96e" : "white",
            color: filter === "SINGLE" ? "white" : "#c8a96e",
            cursor: "pointer",
          }}
        >
          Single
        </button>
        <button
          onClick={() => setFilter("DOUBLE")}
          style={{
            padding: "8px 20px",
            borderRadius: "20px",
            border: "1px solid #c8a96e",
            backgroundColor: filter === "DOUBLE" ? "#c8a96e" : "white",
            color: filter === "DOUBLE" ? "white" : "#c8a96e",
            cursor: "pointer",
          }}
        >
          Double
        </button>
        <button
          onClick={() => setFilter("SUITE")}
          style={{
            padding: "8px 20px",
            borderRadius: "20px",
            border: "1px solid #c8a96e",
            backgroundColor: filter === "SUITE" ? "#c8a96e" : "white",
            color: filter === "SUITE" ? "white" : "#c8a96e",
            cursor: "pointer",
          }}
        >
          Suite
        </button>
      </div>

      <div className="page-container">
        {/* SECTION 1 — AVAILABLE ROOMS */}
        <h2 className="section-title">Available Rooms</h2>
        <div className="rooms-grid">
          {filteredRooms.length === 0 ? (
            <p>No rooms available at the moment.</p>
          ) : (
            filteredRooms.map((room) => (
              <div className="room-card" key={room.id}>
               <div style={{
    height: "80px",
    background: room.type === "SINGLE" ? "#1a1a2e" :
                room.type === "DOUBLE" ? "#c8a96e" : "#2d2d44",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "bold",
    letterSpacing: "2px"
}}>
    {room.type}
</div>
                <div className="room-card-body">
                  <h3>Room {room.roomNumber}</h3>
                  <p>🛏 Type: {room.type}</p>
                  <p>👥 Capacity: {room.capacity} persons</p>
                  <p>✨ {room.amenities}</p>
                  <p className="price">₹{room.pricePerNight} / night</p>
                  <p className="status-available">● Available</p>
                  <button
                    className="btn-book"
                    onClick={() => navigate(`/booking/${room.id}`)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SECTION 2 — MY ACTIVE BOOKINGS */}
        <h2 className="section-title">My Booked Rooms</h2>
        <div className="bookings-grid">
          {activeBookings.length === 0 ? (
            <p>You have no active bookings.</p>
          ) : (
            activeBookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <h3>📋 {booking.bookingReference}</h3>
                <p>🏨 Room: {booking.roomNumber}</p>
                <p>🛏 Type: {booking.roomType}</p>
                <p>📅 Check-in: {booking.checkInDate}</p>
                <p>📅 Check-out: {booking.checkOutDate}</p>
                <p className="price">Total: ₹{booking.totalPrice}</p>
                <p className="status-available">● {booking.status}</p>
                <button
                  className="btn-cancel"
                  onClick={() => handleCancel(booking.id)}
                >
                  Cancel Booking
                </button>
              </div>
            ))
          )}
        </div>

        {/* SECTION 3 — CANCELLED BOOKINGS */}
        <h2 className="section-title">Cancelled Bookings</h2>
        <div className="bookings-grid">
          {cancelledBookings.length === 0 ? (
            <p>No cancelled bookings.</p>
          ) : (
            cancelledBookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <h3>📋 {booking.bookingReference}</h3>
                <p>🏨 Room: {booking.roomNumber}</p>
                <p>📅 Check-in: {booking.checkInDate}</p>
                <p>📅 Check-out: {booking.checkOutDate}</p>
                <p className="price">Total: ₹{booking.totalPrice}</p>
                <p className="status-booked">● CANCELLED</p>
                <button className="btn-cancel" disabled>
                  Cancelled
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomsPage;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
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
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
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
  const availableOnlyRooms = rooms.filter((room) => room.available);
  const activeBookings = bookings.filter((b) => b.status !== "CANCELLED");
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero">
        <h1>Find Your Perfect Room</h1>
        <p>Luxury stays at unbeatable prices</p>
      </div>

      <div className="page-container">
        {/* SECTION 1 — AVAILABLE ROOMS */}
        <h2 className="section-title">Available Rooms</h2>
        <div className="rooms-grid">
          {availableOnlyRooms.length === 0 ? (
            <p>No rooms available at the moment.</p>
          ) : (
            availableOnlyRooms.map((room) => (
              <div className="room-card" key={room.id}>
                <img
                  className="room-card-image"
                  src={
                    room.type === "SINGLE"
                      ? "https://unsplash.com" // Modern City Single Room
                      : room.type === "DOUBLE"
                      ? "https://unsplash.com" // Luxury Couch Double Room
                      : "https://unsplash.com" // Wood Tropical Villa Suite
                  }
                  alt={room.type}
                />
                <div className="room-card-body">
                  <h3>Room {room.roomNumber}</h3>
                  <p>🛏 Type: {room.type}</p>
                  <p>👥 Capacity: {room.capacity} persons</p>
                  <p>✨ {room.amenities}</p>
                  <p className="price">${room.pricePerNight} / night</p>
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
                <p className="price">Total: ${booking.totalPrice}</p>
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
                <p className="price">Total: ${booking.totalPrice}</p>
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

import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

function BookingPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill dates from RoomsPage if passed via navigation state
  const [checkInDate, setCheckInDate] = useState(location.state?.checkIn || "");
  const [checkOutDate, setCheckOutDate] = useState(location.state?.checkOut || "");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!checkInDate || !checkOutDate) {
      setError("Please select both check-in and check-out dates");
      return;
    }

    try {
      const response = await api.post("/bookings", {
        checkInDate,
        checkOutDate,
        roomId: Number(roomId),
      });
      setBooking(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    }
  };

  // ── Success screen ───────────────────────────────────────────────
  if (booking) {
    return (
      <div className="login-container">
        <div className="success-icon">✓</div>
        <h2>Booking Confirmed!</h2>
        <p className="success-message">Your booking has been successfully created.</p>
        <div className="booking-summary">
          <div className="summary-row">
            <span>Reference</span>
            <strong>{booking.bookingReference}</strong>
          </div>
          <div className="summary-row">
            <span>Room</span>
            <strong>{booking.roomNumber} ({booking.roomType})</strong>
          </div>
          <div className="summary-row">
            <span>Check-in</span>
            <strong>{booking.checkInDate}</strong>
          </div>
          <div className="summary-row">
            <span>Check-out</span>
            <strong>{booking.checkOutDate}</strong>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <strong>₹{booking.totalPrice?.toLocaleString("en-IN")}</strong>
          </div>
        </div>
        <div className="success-actions">
          <button onClick={() => navigate("/dashboard")}>
            View My Bookings
          </button>
          <button className="btn-secondary" onClick={() => navigate("/rooms")}>
            Browse More Rooms
          </button>
        </div>
      </div>
    );
  }

  // ── Booking form ─────────────────────────────────────────────────
  return (
    <div className="login-container">
      <h2>Book a Room</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Check-In Date</label>
        <input
          type="date"
          value={checkInDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setCheckInDate(e.target.value)}
        />

        <label>Check-Out Date</label>
        <input
          type="date"
          value={checkOutDate}
          min={checkInDate || new Date().toISOString().split("T")[0]}
          onChange={(e) => setCheckOutDate(e.target.value)}
        />

        <button type="submit">Confirm Booking</button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/rooms")}
        >
          Back to Rooms
        </button>
      </form>
    </div>
  );
}

export default BookingPage;
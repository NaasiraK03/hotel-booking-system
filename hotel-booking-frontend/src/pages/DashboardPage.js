import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function DashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings/my");
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      fetchBookings();
    } catch (err) {
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const filteredBookings = bookings.filter((b) =>
    filter === "ALL" ? true : b.status === filter
  );

  const counts = {
    ALL: bookings.length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  const nightsBetween = (checkIn, checkOut) =>
    Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>My Bookings</h2>
          <p className="dashboard-subtitle">
            {bookings.length === 0
              ? "You have no bookings yet"
              : `${bookings.length} booking${bookings.length > 1 ? "s" : ""} total`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/rooms")}>
          + New Booking
        </button>
      </div>

      {/* Stats */}
      {bookings.length > 0 && (
        <div className="dash-stats">
          <div className="stat-card">
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-sub">all time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Confirmed</div>
            <div className="stat-value">{counts.CONFIRMED}</div>
            <div className="stat-sub">active</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cancelled</div>
            <div className="stat-value">{counts.CANCELLED}</div>
            <div className="stat-sub">cancelled</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Nights Booked</div>
            <div className="stat-value">
              {bookings
                .filter((b) => b.status === "CONFIRMED")
                .reduce((sum, b) => sum + nightsBetween(b.checkInDate, b.checkOutDate), 0)}
            </div>
            <div className="stat-sub">total nights</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {bookings.length > 0 && (
        <div className="filter-tabs">
          {["ALL", "CONFIRMED", "CANCELLED"].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
              <span className="tab-count">{counts[tab]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏨</div>
          <h3>No bookings yet</h3>
          <p>Browse our rooms and make your first booking</p>
          <button className="btn-primary" onClick={() => navigate("/rooms")}>
            Browse Rooms
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p>No {filter.toLowerCase()} bookings found</p>
        </div>
      ) : (
        <div className="admin-bookings-table">
          {/* Table header */}
          <div className="dash-table-header">
            <span>Booking</span>
            <span>Room</span>
            <span>Type</span>
            <span>Check-in</span>
            <span>Check-out</span>
            <span>Nights</span>
            <span>Total</span>
            <span>Status</span>
            <span></span>
          </div>

          {/* Table rows */}
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className={`dash-table-row ${booking.status === "CANCELLED" ? "cancelled" : ""}`}
            >
              <span className="cell-ref">#{booking.bookingReference}</span>
              <span className="cell-text">Room {booking.roomNumber}</span>
              <span>
                <span className="room-type-badge">{booking.roomType}</span>
              </span>
              <span className="cell-text">{formatDate(booking.checkInDate)}</span>
              <span className="cell-text">{formatDate(booking.checkOutDate)}</span>
              <span className="cell-text">
                {nightsBetween(booking.checkInDate, booking.checkOutDate)} nights
              </span>
              <span className="cell-gold">
                ₹{booking.totalPrice?.toLocaleString("en-IN")}
              </span>
              <span>
                <span className={`status-badge ${booking.status === "CONFIRMED" ? "confirmed" : "cancelled"}`}>
                  {booking.status}
                </span>
              </span>
              <span>
                <button
                  className="btn-cancel"
                  onClick={() => handleCancel(booking.id)}
                  disabled={booking.status === "CANCELLED"}
                >
                  {booking.status === "CANCELLED" ? "Cancelled" : "Cancel"}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
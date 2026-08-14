import { useState, useEffect } from "react";
import api from "../services/api";

function DashboardPage() {
  // 1. create state to store bookings array
  const [bookings, setBookings] = useState([]);
  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?",
    );
    if (!confirmCancel) return;

    try {
      const response = await api.delete(`/bookings/${bookingId}`);
      alert("Booking cancelled successfully!");
      fetchBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };
 const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/my");
        // Axios stores the server response data inside the .data property
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings data:", error);
      }
    };

  // 2. useEffect to call api.get('/bookings') when component loads
  //    and store result in bookings state
  useEffect(() => {
    fetchBookings();
   
  }, []); // Empty array ensures this runs exactly once when the page loads

  return (
    <div className="page-container">
      <h2>Available Bookings</h2>
      <div className="rooms-grid">
        {bookings.length === 0 ? (
          <p>No bookings available or loading...</p>
        ) : (
          bookings.map((booking) => (
            <div className="room-card" key={booking.id}>
              <h3>Booking: {booking.bookingReference}</h3>
              <p>Room: {booking.roomNumber}</p>
              <p>Type: {booking.roomType}</p>
              <p>Check-in: {booking.checkInDate}</p>
              <p>Check-out: {booking.checkOutDate}</p>
              <p className="price">Total: ${booking.totalPrice}</p>
              <p
                className={
                  booking.status === "CONFIRMED"
                    ? "status-available"
                    : "status-booked"
                }
              >
                {booking.status}
              </p>
              <button onClick={() => handleCancel(booking.id)}>Cancel</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DashboardPage;

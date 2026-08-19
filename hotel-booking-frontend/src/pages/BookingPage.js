import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function BookingPage() {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const { roomId } = useParams();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/bookings", {
        checkInDate,
        checkOutDate,
        roomId: Number(roomId),
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create booking");
    }
  };

  return (
    <div className="login-container">
      <h2>Booking Page</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="date"
        placeholder="CheckInDate"
        value={checkInDate}
        onChange={(e) => setCheckInDate(e.target.value)}
      />
      <input
        type="date"
        placeholder="CheckOutDate"
        value={checkOutDate}
        onChange={(e) => setCheckOutDate(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default BookingPage;

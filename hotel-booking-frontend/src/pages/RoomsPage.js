import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RoomsPage() {
  // 1. create state to store rooms array
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  // 2. useEffect to call api.get('/rooms') when component loads
  //    and store result in rooms state
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
  }, []); // Empty array ensures this runs exactly once when the page loads

  return (
    <div className="page-container">
      <h2>Available Rooms</h2>
      <div className="rooms-grid">
        {rooms.length === 0 ? (
          <p>No rooms available or loading...</p>
        ) : (
          rooms.map((room) => (
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
              <button
                onClick={() => navigate(`/booking/${room.id}`)}
                disabled={!room.available}
                style={{
                  backgroundColor: room.available ? "" : "#ccc",
                  cursor: room.available ? "pointer" : "not-allowed",
                }}
              >
                {room.available ? "Book Now" : "Unavailable"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RoomsPage;

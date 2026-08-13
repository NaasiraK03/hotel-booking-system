import { useState, useEffect } from 'react';
import api from '../services/api';

function RoomsPage() {

  // 1. create state to store rooms array
  const [rooms, setRooms] = useState([]);

  // 2. useEffect to call api.get('/rooms') when component loads
  //    and store result in rooms state
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms');
        // Axios stores the server response data inside the .data property
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms data:", error);
      }
    };

    fetchRooms();
  }, []); // Empty array ensures this runs exactly once when the page loads

  return (
    <div style={{ padding: '20px' }}>
      <h2>Available Rooms</h2>

      {/* 3. map over rooms and display each one */}
      <div className="rooms-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {rooms.length === 0 ? (
          <p>No rooms available or loading...</p>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id || room._id}
              style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}
            >
              <h3>{room.name || room.roomNumber}</h3>
              <p>Type: {room.type}</p>
             <p>Price: ${room.pricePerNight} / night</p>
             <p>Capacity: {room.capacity} persons</p>
             <p>Amenities: {room.amenities}</p>
             <p>Status: {room.available ? 'Available' : 'Booked'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RoomsPage;

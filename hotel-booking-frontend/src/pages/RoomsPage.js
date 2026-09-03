import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const navigate = useNavigate();
 const role = localStorage.getItem("role");
  const today = new Date().toISOString().split("T")[0];

  const handleSearch = async () => {
    setSearchError("");
    if (!checkIn || !checkOut) {
      setSearchError("Please select both check-in and check-out dates");
      return;
    }
    if (checkOut <= checkIn) {
      setSearchError("Check-out date must be after check-in date");
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(
        `/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`
      );
      setRooms(response.data);
      setSearched(true);
      setFilter("ALL");
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setSearchError("Failed to fetch rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roomTypeIcon = { SINGLE: "🛏", DOUBLE: "🛏🛏", SUITE: "👑" };

  const filteredRooms = rooms.filter(
    (room) => filter === "ALL" || room.type === filter
  );

  const counts = {
    ALL: rooms.length,
    SINGLE: rooms.filter((r) => r.type === "SINGLE").length,
    DOUBLE: rooms.filter((r) => r.type === "DOUBLE").length,
    SUITE: rooms.filter((r) => r.type === "SUITE").length,
  };

  const nightsBetween = checkIn && checkOut
    ? Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>Find a Room</h2>
          <p className="dashboard-subtitle">
            Select your dates to see available rooms
          </p>
        </div>
            {role !== "ADMIN" && (
        <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
          My Bookings
        </button>)}
      </div>

      {/* Date search card */}
      <div className="date-search-card">
        <div className="date-search-fields">
          <div className="date-field">
            <label>Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setSearched(false);
                if (checkOut && checkOut <= e.target.value) setCheckOut("");
              }}
            />
          </div>
          <div className="date-divider">→</div>
          <div className="date-field">
            <label>Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setSearched(false);
              }}
            />
          </div>
          {nightsBetween > 0 && (
            <div className="nights-summary">
              <span>{nightsBetween}</span>
              <small>night{nightsBetween > 1 ? "s" : ""}</small>
            </div>
          )}
        </div>
        {searchError && <p className="search-error">{searchError}</p>}
        <button
          className="btn-search"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search Rooms"}
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Finding available rooms...</p>
        </div>
      )}

      {searched && !loading && (
        <>
          {/* Filter tabs */}
          <div className="filter-tabs">
            {["ALL", "SINGLE", "DOUBLE", "SUITE"].map((tab) => (
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

          {filteredRooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏨</div>
              <h3>No {filter !== "ALL" ? filter.toLowerCase() : ""} rooms available</h3>
              <p>Try different dates or a different room type</p>
              {filter !== "ALL" && (
                <button className="btn-primary" onClick={() => setFilter("ALL")}>
                  View All Types
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="dashboard-subtitle" style={{ marginBottom: "16px" }}>
                {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""} available
                {checkIn && checkOut && ` · ${checkIn} to ${checkOut}`}
              </p>
              <div className="rooms-grid">
                {filteredRooms.map((room) => (
                  <div className="room-card" key={room.id}>
                    <div className={`room-card-header room-type-${room.type.toLowerCase()}`}>
                      <span className="room-type-icon">{roomTypeIcon[room.type]}</span>
                      <span className="room-type-label">{room.type}</span>
                      <span className="room-available-dot">● Available</span>
                    </div>
                    <div className="room-card-body">
                      <div className="room-number">Room {room.roomNumber}</div>
                      <div className="room-meta">
                        <div className="room-meta-item">
                          <span className="meta-label">Capacity</span>
                          <span className="meta-value">
                            {room.capacity} person{room.capacity > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="room-meta-item">
                          <span className="meta-label">Type</span>
                          <span className="meta-value">{room.type}</span>
                        </div>
                      </div>
                      {room.amenities && (
                        <p className="room-amenities">✨ {room.amenities}</p>
                      )}
                      <div className="room-card-footer">
                        <div className="room-price">
                          <span className="price-amount">
                            ₹{room.pricePerNight?.toLocaleString("en-IN")}
                          </span>
                          <span className="price-label">/ night</span>
                        </div>
                      {nightsBetween > 0 && role !== "ADMIN" && (
  <span className="total-estimate">
    ₹{(room.pricePerNight * nightsBetween).toLocaleString("en-IN")} total
  </span>
)}
                        {role !== "ADMIN" && (
                        <button
                          className="btn-book"
                          onClick={() =>
                            navigate(`/booking/${room.id}`, {
                              state: { checkIn, checkOut },
                            })
                          }
                        >
                          Book Now
                        </button>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Initial state — not searched yet */}
      {!searched && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Select your dates</h3>
          <p>Choose check-in and check-out dates to see available rooms</p>
        </div>
      )}
    </div>
  );
}

export default RoomsPage;
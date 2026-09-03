import { useState, useEffect } from "react";
import api from "../services/api";
const Pagination = ({ current, total, onPageChange }) => {
  if (total <= 1) return null;
  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(current - 1)}
        disabled={current === 0}
      >
        ← Prev
      </button>
      {[...Array(total)].map((_, i) => (
        <button
          key={i}
          className={`page-btn ${current === i ? "active" : ""}`}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="page-btn"
        onClick={() => onPageChange(current + 1)}
        disabled={current === total - 1}
      >
        Next →
      </button>
    </div>
  );
};
function AdminDashboard() {
  // Add Room form state
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("SINGLE");
  const [pricePerNight, setPricePerNight] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // Walk-in booking form state
  const [walkInGuestName, setWalkInGuestName] = useState("");
  const [walkInGuestEmail, setWalkInGuestEmail] = useState("");
  const [walkInRoomId, setWalkInRoomId] = useState("");
  const [walkInCheckIn, setWalkInCheckIn] = useState("");
  const [walkInCheckOut, setWalkInCheckOut] = useState("");
  const [walkInSuccess, setWalkInSuccess] = useState("");
  const [walkInError, setWalkInError] = useState("");

  // Data state
 const [totalRoomPages, setTotalRoomPages] = useState(0);
const [currentRoomPage, setCurrentRoomPage] = useState(0);
const [totalRooms, setTotalRooms] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [bookingsError, setBookingsError] = useState("");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("bookings");

useEffect(() => {
  fetchActiveBookings(0);
  fetchCancelledBookings(0);
  fetchCancellationRequests(0);
  fetchTotalBookings();
  fetchRooms(0);
}, []);

const fetchActiveBookings = async (page = 0) => {
  try {
    const response = await api.get(
      `/bookings/admin/all?page=${page}&size=10&status=CONFIRMED&sortBy=createdAt&direction=desc`
    );
    setActiveBookings(response.data.content);
    setActiveBookingsTotal(response.data.totalElements);
    setActiveBookingsPages(response.data.totalPages);
    setActiveBookingsPage(page);
  } catch (err) { setBookingsError("Failed to fetch bookings."); }
};
const fetchCancelledBookings = async (page = 0) => {
  try {
    const response = await api.get(
      `/bookings/admin/all?page=${page}&size=10&status=CANCELLED&sortBy=createdAt&direction=desc`
    );
    setCancelledBookings(response.data.content);
    setCancelledPages(response.data.totalPages);
    setCancelledPage(page);
  } catch (err) { console.error(err); }
};
const fetchCancellationRequests = async (page = 0) => {
  try {
    const response = await api.get(
      `/bookings/admin/all?page=${page}&size=10&status=CANCELLATION_REQUESTED&sortBy=createdAt&direction=desc`
    );
    setCancellationRequests(response.data.content);
    setRequestsPages(response.data.totalPages);
    setRequestsPage(page);
  } catch (err) { console.error(err); }
};
const fetchTotalBookings = async () => {
  try {
    const response = await api.get(`/bookings/admin/all?page=0&size=1`);
    setTotalBookings(response.data.totalElements);
  } catch (err) { console.error(err); }
};
const [activeBookings, setActiveBookings] = useState([]);
const [activeBookingsTotal, setActiveBookingsTotal] = useState(0);
const [activeBookingsPages, setActiveBookingsPages] = useState(0);
const [activeBookingsPage, setActiveBookingsPage] = useState(0);

const [cancelledBookings, setCancelledBookings] = useState([]);
const [cancelledPages, setCancelledPages] = useState(0);
const [cancelledPage, setCancelledPage] = useState(0);

const [cancellationRequests, setCancellationRequests] = useState([]);
const [requestsPages, setRequestsPages] = useState(0);
const [requestsPage, setRequestsPage] = useState(0);

const [totalBookings, setTotalBookings] = useState(0);

const fetchRooms = async (page = 0) => {
  try {
    const response = await api.get(`/rooms?page=${page}&size=9`);
    setRooms(response.data.content); // ← extract content array
    setTotalRoomPages(response.data.totalPages);
    setTotalRooms(response.data.totalElements);
    setCurrentRoomPage(page);
  } catch (error) {
    console.error("Error fetching rooms:", error);
  }
};
  const handleAddRoom = async (e) => {
    e.preventDefault();
    setFormSuccess(""); setFormError("");
    try {
      await api.post("/rooms/admin", {
        roomNumber, type,
        pricePerNight: Number(pricePerNight),
        capacity: Number(capacity),
        description, amenities,
      });
      setFormSuccess(`Room ${roomNumber} added successfully!`);
      setRoomNumber(""); setType("SINGLE"); setPricePerNight("");
      setCapacity(""); setDescription(""); setAmenities("");
      fetchRooms();
    } catch (err) { setFormError("Failed to add room. Check details or connection."); }
  };

  const handleWalkInBooking = async (e) => {
    e.preventDefault();
    setWalkInSuccess(""); setWalkInError("");
    try {
      const response = await api.post("/bookings/admin/walk-in", {
        guestName: walkInGuestName,
        guestEmail: walkInGuestEmail,
        roomId: Number(walkInRoomId),
        checkInDate: walkInCheckIn,
        checkOutDate: walkInCheckOut,
      });
      setWalkInSuccess(
        `Booking confirmed! Reference: #${response.data.bookingReference}`
      );
      setWalkInGuestName(""); setWalkInGuestEmail("");
      setWalkInRoomId(""); setWalkInCheckIn(""); setWalkInCheckOut("");
     fetchActiveBookings(0);
    fetchCancelledBookings(0);
    fetchCancellationRequests(0);
    fetchTotalBookings();
    } catch (err) {
      setWalkInError(err.response?.data?.message || "Failed to create walk-in booking.");
    }
  };

  const handleCancellationDecision = async (bookingId, approve) => {
  try {
    await api.patch(`/bookings/admin/${bookingId}/cancellation?approve=${approve}`);
    fetchActiveBookings(0);
    fetchCancelledBookings(0);
    fetchCancellationRequests(0);
    fetchTotalBookings();
  } catch (err) { console.error("Failed to process cancellation:", err); }
};

  const toggleMaintenance = async (roomId, status) => {
    try {
      await api.patch(`/rooms/admin/${roomId}/maintenance?status=${status}`);
      fetchRooms();
    } catch (error) {
      console.error("Failed to update maintenance status:", error);
    }
  };




  const filteredRooms = rooms.filter((room) => {
    if (roomFilter === "AVAILABLE") return !room.underMaintenance;
    if (roomFilter === "MAINTENANCE") return room.underMaintenance;
    return true;
  });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  const roomTypeIcon = { SINGLE: "🛏", DOUBLE: "🛏🛏", SUITE: "👑" };

const tabs = [
  { key: "bookings", label: "Active Bookings", count: activeBookingsTotal },
  { key: "requests", label: "Cancellation Requests", count: requestsPages > 0 ? cancellationRequests.length : 0 },
  { key: "cancelled", label: "Cancelled", count: cancelledPages > 0 ? cancelledBookings.length : 0 },
  { key: "rooms", label: "Rooms", count: totalRooms },
  { key: "walkin", label: "Walk-in Booking", count: null },
  { key: "add", label: "+ Add Room", count: null },
];

  // Reusable booking table
  const renderBookingTable = (list, statusClass, statusLabel) => (
    <div className="admin-bookings-table">
      <div className="admin-table-header">
        <span>Booking</span>
        <span>Guest</span>
        <span>Room</span>
        <span>Check-in</span>
        <span>Check-out</span>
        <span>Total</span>
        <span>Status</span>
      </div>
      {list.map((booking) => (
        <div className={`admin-table-row ${statusClass}`} key={booking.id}>
          <span className="cell-ref">#{booking.bookingReference || booking.id}</span>
          <span className="cell-text">{booking.guestEmail}</span>
          <span className="cell-text">{booking.roomNumber}</span>
          <span className="cell-text">{formatDate(booking.checkInDate)}</span>
          <span className="cell-text">{formatDate(booking.checkOutDate)}</span>
          <span className="cell-gold">
            {booking.totalPrice ? `₹${booking.totalPrice.toLocaleString("en-IN")}` : "—"}
          </span>
          <span>
            <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-dashboard-container">

      {/* Header */}
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p className="dashboard-subtitle">Hotel management overview</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
  <div className="stat-label">Total Bookings</div>
  <div className="stat-value">{totalBookings}</div>
  <div className="stat-sub">all time</div>
</div>
        <div className="stat-card">
  <div className="stat-label">Active Bookings</div>
  <div className="stat-value">{activeBookingsTotal}</div>
  <div className="stat-sub">confirmed</div>
</div>
        <div className="stat-card">
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value" style={{ color: cancellationRequests.length > 0 ? "#f57c00" : "#c8a96e" }}>
            {cancellationRequests.length}
          </div>
          <div className="stat-sub">need action</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Rooms</div>
          <div className="stat-value">{totalRooms}</div>
          <div className="stat-sub">in system</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? "active" : ""} ${
              tab.key === "requests" && cancellationRequests.length > 0 ? "has-alert" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="admin-tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Active Bookings */}
      {activeTab === "bookings" && (
  <section>
    {bookingsError && <p className="error-message">{bookingsError}</p>}
    {activeBookings.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No active bookings</h3>
        <p>Bookings will appear here once guests make reservations</p>
      </div>
    ) : (
      <>
        {renderBookingTable(activeBookings, "confirmed", "Confirmed")}
<Pagination
  current={activeBookingsPage}
  total={activeBookingsPages}
  onPageChange={(page) => fetchActiveBookings(page)}
/>
      </>
    )}
  </section>
)}

      {/* Tab: Cancellation Requests */}
      {activeTab === "requests" && (
        <section>
          {cancellationRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>No pending cancellation requests</h3>
              <p>Guest cancellation requests will appear here</p>
            </div>
          ) : (
            <div className="admin-bookings-table">
              <div className="admin-table-header" style={{
                gridTemplateColumns: "150px 1fr 80px 120px 120px 100px 180px"
              }}>
                <span>Booking</span>
                <span>Guest</span>
                <span>Room</span>
                <span>Check-in</span>
                <span>Check-out</span>
                <span>Total</span>
                <span>Action</span>
              </div>
              {cancellationRequests.map((booking) => (
                <div
                  className="admin-table-row"
                  key={booking.id}
                  style={{ gridTemplateColumns: "150px 1fr 80px 120px 120px 100px 180px" }}
                >
                  <span className="cell-ref">#{booking.bookingReference || booking.id}</span>
                  <span className="cell-text">{booking.guestEmail}</span>
                  <span className="cell-text">{booking.roomNumber}</span>
                  <span className="cell-text">{formatDate(booking.checkInDate)}</span>
                  <span className="cell-text">{formatDate(booking.checkOutDate)}</span>
                  <span className="cell-gold">
                    {booking.totalPrice ? `₹${booking.totalPrice.toLocaleString("en-IN")}` : "—"}
                  </span>
                  <span style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn-approve"
                      onClick={() => handleCancellationDecision(booking.id, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleCancellationDecision(booking.id, false)}
                    >
                      Reject
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab: Cancelled */}
      {activeTab === "cancelled" && (
        <section>
          {cancelledBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>No cancelled bookings</h3>
            </div>
          ) : renderBookingTable(cancelledBookings, "cancelled", "Cancelled")}
          <Pagination
  current={cancelledPage}
  total={cancelledPages}
  onPageChange={(page) => fetchCancelledBookings(page)}
/>
        </section>
      )}

      {/* Tab: Rooms */}
      {activeTab === "rooms" && (
        <section>
          <div className="filter-tabs" style={{ marginBottom: "24px" }}>
            {[
              { key: "ALL", label: "All", count: totalRooms },
              { key: "AVAILABLE", label: "Active", count: rooms.filter((r) => !r.underMaintenance).length },
              { key: "MAINTENANCE", label: "Maintenance", count: rooms.filter((r) => r.underMaintenance).length },
            ].map((f) => (
              <button
                key={f.key}
                className={`filter-tab ${roomFilter === f.key ? "active" : ""}`}
                onClick={() => setRoomFilter(f.key)}
              >
                {f.label}
                <span className="tab-count">{f.count}</span>
              </button>
            ))}
          </div>
          {filteredRooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏨</div>
              <h3>No rooms found</h3>
            </div>
          ) : (
            <div className="rooms-grid">
              {filteredRooms.map((room) => (
                <div className="room-card" key={room.id}>
                  <div className={`room-card-header room-type-${room.type.toLowerCase()}`}>
                    <span className="room-type-icon">{roomTypeIcon[room.type]}</span>
                    <span className="room-type-label">{room.type}</span>
                    <span className={room.underMaintenance ? "room-booked-dot" : "room-available-dot"}>
                      ● {room.underMaintenance ? "Maintenance" : "Active"}
                    </span>
                  </div>
                  <div className="room-card-body">
                    <div className="room-number">Room {room.roomNumber}</div>
                    <div className="room-meta">
                      <div className="room-meta-item">
                        <span className="meta-label">Capacity</span>
                        <span className="meta-value">{room.capacity} person{room.capacity > 1 ? "s" : ""}</span>
                      </div>
                      <div className="room-meta-item">
                        <span className="meta-label">Type</span>
                        <span className="meta-value">{room.type}</span>
                      </div>
                    </div>
                    {room.amenities && <p className="room-amenities">✨ {room.amenities}</p>}
                    <div className="room-card-footer">
                      <div className="room-price">
                        <span className="price-amount">₹{room.pricePerNight?.toLocaleString("en-IN")}</span>
                        <span className="price-label">/ night</span>
                      </div>
                      <button
  className={room.underMaintenance ? "btn-maintenance-off" : "btn-maintenance-on"}
  onClick={() => toggleMaintenance(room.id, !room.underMaintenance)}
>
  {room.underMaintenance ? "Mark Active" : "Maintenance"}
</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          )}
          <Pagination
  current={currentRoomPage}
  total={totalRoomPages}
  onPageChange={(page) => fetchRooms(page)}
/>
        </section>
      )}

      {/* Tab: Walk-in Booking */}
      {activeTab === "walkin" && (
        <section>
          <div className="admin-form-container">
            <h3>Walk-in Guest Booking</h3>
            <p>Create a booking for a walk-in guest. A new account will be created if the guest email doesn't exist.</p>
            {walkInSuccess && <div className="form-success">✅ {walkInSuccess}</div>}
            {walkInError && <div className="form-error">❌ {walkInError}</div>}
            <form onSubmit={handleWalkInBooking} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Guest Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Smith"
                    value={walkInGuestName}
                    onChange={(e) => setWalkInGuestName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Guest Email</label>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={walkInGuestEmail}
                    onChange={(e) => setWalkInGuestEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Select Room</label>
                <select
                  value={walkInRoomId}
                  onChange={(e) => setWalkInRoomId(e.target.value)}
                  required
                >
                  <option value="">-- Select a room --</option>
                  {rooms.filter((r) => !r.underMaintenance).map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} — {room.type} — ₹{room.pricePerNight}/night
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Check-in Date</label>
                  <input
                    type="date"
                    value={walkInCheckIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setWalkInCheckIn(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Check-out Date</label>
                  <input
                    type="date"
                    value={walkInCheckOut}
                    min={walkInCheckIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setWalkInCheckOut(e.target.value)}
                    required
                  />
                </div>
              </div>
              {walkInRoomId && walkInCheckIn && walkInCheckOut && (
                <div className="walkin-summary">
                  <span>Estimated total:</span>
                  <strong className="cell-gold">
                    ₹{(
                      Math.round(
                        (new Date(walkInCheckOut) - new Date(walkInCheckIn)) /
                          (1000 * 60 * 60 * 24)
                      ) *
                      (rooms.find((r) => r.id === Number(walkInRoomId))?.pricePerNight || 0)
                    ).toLocaleString("en-IN")}
                  </strong>
                  <span style={{ fontSize: "12px", color: "#aaa" }}>
                    ({Math.round(
                      (new Date(walkInCheckOut) - new Date(walkInCheckIn)) /
                        (1000 * 60 * 60 * 24)
                    )} nights)
                  </span>
                </div>
              )}
              <button type="submit" className="form-submit">
                Confirm Walk-in Booking
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Tab: Add Room */}
      {activeTab === "add" && (
        <section>
          <div className="admin-form-container">
            <h3>Add New Room</h3>
            <p>Fill in the details below to add a new room to the system</p>
            {formSuccess && <div className="form-success">✅ {formSuccess}</div>}
            {formError && <div className="form-error">❌ {formError}</div>}
            <form onSubmit={handleAddRoom} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Room Number</label>
                  <input type="text" placeholder="e.g. 101" value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Room Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} required>
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double</option>
                    <option value="SUITE">Suite</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Night (₹)</label>
                  <input type="number" placeholder="e.g. 2500" value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)} required min="0" />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input type="number" placeholder="e.g. 2" value={capacity}
                    onChange={(e) => setCapacity(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Brief room description" value={description}
                  onChange={(e) => setDescription(e.target.value)} required rows={3} />
              </div>
              <div className="form-group">
                <label>Amenities</label>
                <input type="text" placeholder="e.g. WiFi, TV, AC, Pool" value={amenities}
                  onChange={(e) => setAmenities(e.target.value)} required />
              </div>
              <button type="submit" className="form-submit">Add Room</button>
            </form>
          </div>
        </section>
      )}
    </div>
  );

}

export default AdminDashboard;
package com.hotelbooking.service;

import com.hotelbooking.dto.request.BookingRequest;
import com.hotelbooking.dto.response.BookingResponse;
import com.hotelbooking.entity.Booking;
import com.hotelbooking.entity.Room;
import com.hotelbooking.entity.User;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.RoomRepository;
import com.hotelbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // ── Create booking ──────────────────────────────────────────────────
    public BookingResponse createBooking(BookingRequest request, String email) {

        User guest = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!room.isAvailable()) {
            throw new RuntimeException("Room is not available");
        }

        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
                request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        long nights = ChronoUnit.DAYS.between(
                request.getCheckInDate(), request.getCheckOutDate());
        Double totalPrice = nights * room.getPricePerNight();

        Booking booking = Booking.builder()
                .guest(guest)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .totalPrice(totalPrice)
                .status("CONFIRMED")
                .bookingReference(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        room.setAvailable(false);
        roomRepository.save(room);

        Booking savedBooking = bookingRepository.save(booking);
        emailService.sendBookingConfirmation(
                savedBooking.getGuest().getEmail(),
                savedBooking.getGuest().getName(),
                savedBooking.getBookingReference(),
                savedBooking.getRoom().getRoomNumber(),
                savedBooking.getRoom().getType(),
                savedBooking.getCheckInDate().toString(),
                savedBooking.getCheckOutDate().toString(),
                savedBooking.getTotalPrice()
        );
        return mapToResponse(savedBooking);
    }

    // ── Get booking by id ───────────────────────────────────────────────
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToResponse(booking);
    }

    // ── Get my bookings (guest) ─────────────────────────────────────────
    public List<BookingResponse> getMyBookings(String email) {
        User guest = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByGuestId(guest.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Cancel booking ──────────────────────────────────────────────────
    public BookingResponse cancelBooking(Long id, String email) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getGuest().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        if (booking.getStatus().equals("CANCELLED")) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");
        booking.getRoom().setAvailable(true);
        roomRepository.save(booking.getRoom());

        return mapToResponse(bookingRepository.save(booking));
    }

    // ── Admin: Get all bookings ─────────────────────────────────────────
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Mapper ──────────────────────────────────────────────────────────
    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .guestName(booking.getGuest().getName())
                .guestEmail(booking.getGuest().getEmail())
                .roomNumber(booking.getRoom().getRoomNumber())
                .roomType(booking.getRoom().getType())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .bookingReference(booking.getBookingReference())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
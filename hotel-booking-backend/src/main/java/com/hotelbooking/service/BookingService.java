package com.hotelbooking.service;


import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.hotelbooking.dto.request.WalkInBookingRequest;
import com.hotelbooking.dto.request.BookingRequest;
import com.hotelbooking.dto.response.BookingResponse;
import com.hotelbooking.entity.Booking;
import com.hotelbooking.entity.Room;
import com.hotelbooking.entity.User;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.RoomRepository;
import com.hotelbooking.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final PasswordEncoder passwordEncoder;

    //Create booking
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String email) {

        User guest = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Room room = roomRepository.findByIdWithLock(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.isUnderMaintenance()) {
            throw new RuntimeException("Room is currently under maintenance");
        }

        if (request.getCheckInDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Check-in date cannot be in the past");
        }

        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
                request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        boolean overlapping = bookingRepository.existsOverlappingBooking(
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );
        if (overlapping) {
            throw new RuntimeException("Room is not available for selected dates");
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

    // Walk-in booking
    @Transactional
    public BookingResponse createWalkInBooking(WalkInBookingRequest request) {
        User guest = userRepository.findByEmail(request.getGuestEmail())
                .orElseGet(() -> {
                    User newGuest = User.builder()
                            .name(request.getGuestName())
                            .email(request.getGuestEmail())
                            .password(passwordEncoder.encode("Welcome@123"))
                            .role("GUEST")
                            .build();
                    return userRepository.save(newGuest);
                });

        Room room = roomRepository.findByIdWithLock(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.isUnderMaintenance()) {
            throw new RuntimeException("Room is currently under maintenance");
        }

        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
                request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        boolean overlapping = bookingRepository.existsOverlappingBooking(
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );
        if (overlapping) {
            throw new RuntimeException("Room is not available for selected dates");
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

    //Get booking by id
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToResponse(booking);
    }

    //Get my bookings (guest)
    public List<BookingResponse> getMyBookings(String email) {
        User guest = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByGuestId(guest.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //Cancel booking
    @Transactional
    public BookingResponse cancelBooking(Long id, String email) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getGuest().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        if (booking.getStatus().equals("CANCELLED")) {
            throw new RuntimeException("Booking is already cancelled");
        }

        if (booking.getStatus().equals("CANCELLATION_REQUESTED")) {
            throw new RuntimeException("Cancellation already requested, awaiting admin approval");
        }

        long hoursUntilCheckIn = ChronoUnit.HOURS.between(
                LocalDateTime.now(),
                booking.getCheckInDate().atStartOfDay()
        );

        if (hoursUntilCheckIn > 24) {
            booking.setStatus("CANCELLED");
        } else {
            booking.setStatus("CANCELLATION_REQUESTED");
        }

        return mapToResponse(bookingRepository.save(booking));
    }

    //Admin: Handle cancellation request
    @Transactional
    public BookingResponse handleCancellationRequest(Long id, boolean approve) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStatus().equals("CANCELLATION_REQUESTED")) {
            throw new RuntimeException("No cancellation request found for this booking");
        }

        booking.setStatus(approve ? "CANCELLED" : "CONFIRMED");

        return mapToResponse(bookingRepository.save(booking));
    }

    //Admin: Get all bookings
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //Mapper
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
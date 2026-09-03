package com.hotelbooking.controller;

import com.hotelbooking.dto.request.BookingRequest;
import com.hotelbooking.dto.response.BookingResponse;
import com.hotelbooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.hotelbooking.dto.request.WalkInBookingRequest;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    //Guest: Create booking
    @PostMapping
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(bookingService.createBooking(request, email));
    }

    //Admin approves or rejects cancellation request
    @PatchMapping("/admin/{id}/cancellation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> handleCancellation(
            @PathVariable Long id,
            @RequestParam boolean approve) {
        return ResponseEntity.ok(bookingService.handleCancellationRequest(id, approve));
    }

    //Admin creates walk-in booking
    @PostMapping("/admin/walk-in")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> createWalkInBooking(
            @Valid @RequestBody WalkInBookingRequest request) {
        return ResponseEntity.ok(bookingService.createWalkInBooking(request));
    }

    //Guest: Get my bookings
    @GetMapping("/my")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(bookingService.getMyBookings(email));
    }

    //Guest: Get booking by id
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    //Guest: Cancel booking
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, email));
    }

    //Admin: Get all bookings
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}
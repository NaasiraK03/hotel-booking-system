package com.hotelbooking.service;

import com.hotelbooking.entity.Booking;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendBookingConfirmation(String guestEmail, String guestName,
                                        String bookingReference, String roomNumber,
                                        String roomType, String checkInDate,
                                        String checkOutDate, Double totalPrice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(guestEmail);
            helper.setSubject("Booking Confirmation - " + bookingReference);
            helper.setText(buildEmailBody(guestName, bookingReference, roomNumber,
                    roomType, checkInDate, checkOutDate, totalPrice), true);
            mailSender.send(message);
            System.out.println("Email sent to: " + guestEmail);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    private String buildEmailBody(String guestName, String bookingReference,
                                  String roomNumber, String roomType,
                                  String checkInDate, String checkOutDate, Double totalPrice) {
        return """
            <html><body>
            <h2>Booking Confirmed!</h2>
            <p>Dear %s,</p>
            <p>Reference: <b>%s</b></p>
            <p>Room: %s (%s)</p>
            <p>Check-in: %s</p>
            <p>Check-out: %s</p>
            <p>Total: &#8377;%s</p>
            </body></html>
            """.formatted(guestName, bookingReference, roomNumber,
                roomType, checkInDate, checkOutDate, totalPrice);
    }
}
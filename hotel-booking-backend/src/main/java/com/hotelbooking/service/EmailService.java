package com.hotelbooking.service;

import com.hotelbooking.entity.Booking;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendBookingConfirmation(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(booking.getGuest().getEmail());
            helper.setSubject("Booking Confirmation - " + booking.getBookingReference());
            helper.setText(buildEmailBody(booking), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    private String buildEmailBody(Booking booking) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #1a1a2e;">Booking Confirmation</h2>
                    <p>Dear <b>%s</b>,</p>
                    <p>Your booking has been confirmed!</p>
                    <table style="border-collapse: collapse; width: 100%%;">
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Booking Reference</b></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Room Number</b></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">%s</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Room Type</b></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Check-in Date</b></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">%s</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Check-out Date</b></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><b>Total Price</b></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">&#8377;%s</td>
                        </tr>
                    </table>
                    <br>
                    <p style="color: #c8a96e;"><b>Thank you for choosing Grand Plaza Hotel!</b></p>
                </body>
                </html>
                """.formatted(
                booking.getGuest().getName(),
                booking.getBookingReference(),
                booking.getRoom().getRoomNumber(),
                booking.getRoom().getType(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getTotalPrice()
        );
    }
}
package com.hotelbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;

@Entity
@Table(name="rooms")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true , nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Double pricePerNight;

    @Column(nullable = false)
    private Integer capacity;

    private String description;

    private String amenities;

    @Column(columnDefinition = "boolean default true")
    private boolean isAvailable;





}

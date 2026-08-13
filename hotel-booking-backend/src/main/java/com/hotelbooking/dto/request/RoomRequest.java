package com.hotelbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomRequest {

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotBlank(message = "Room type is required")
    private String type;

    @NotNull(message = "Price is required")
    private Double pricePerNight;

    @NotNull(message = "Capacity is required")
    private Integer capacity;

    private String description;

    private String amenities;

    private boolean isAvailable = true;
}
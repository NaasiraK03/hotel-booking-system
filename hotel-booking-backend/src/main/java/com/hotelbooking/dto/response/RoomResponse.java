package com.hotelbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {

    private Long id;
    private String roomNumber;
    private String type;
    private Double pricePerNight;
    private Integer capacity;
    private String description;
    private String amenities;
    private boolean isAvailable;
}
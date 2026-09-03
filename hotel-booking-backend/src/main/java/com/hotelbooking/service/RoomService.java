package com.hotelbooking.service;

import com.hotelbooking.dto.request.RoomRequest;
import com.hotelbooking.dto.response.RoomResponse;
import com.hotelbooking.entity.Room;
import com.hotelbooking.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    //Admin: Create room
    public RoomResponse createRoom(RoomRequest request) {
        if (roomRepository.findByRoomNumber(request.getRoomNumber()).isPresent()) {
            throw new RuntimeException("Room number already exists");
        }
        Room room = Room.builder()
                .roomNumber(request.getRoomNumber())
                .type(request.getType())
                .pricePerNight(request.getPricePerNight())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .amenities(request.getAmenities())
                .underMaintenance(false)
                .build();
        return mapToResponse(roomRepository.save(room));
    }

    //Admin: Toggle maintenance
    @Transactional
    public RoomResponse toggleMaintenance(Long id, boolean status) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setUnderMaintenance(status);
        return mapToResponse(roomRepository.save(room));
    }

    //Admin: Update room
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setRoomNumber(request.getRoomNumber());
        room.setType(request.getType());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        room.setAmenities(request.getAmenities());
        return mapToResponse(roomRepository.save(room));
    }

    //Admin: Delete room
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        roomRepository.delete(room);
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return mapToResponse(room);
    }

    public List<RoomResponse> getAvailableRooms(LocalDate checkIn, LocalDate checkOut) {
        return roomRepository.findAvailableRooms(checkIn, checkOut)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .type(room.getType())
                .pricePerNight(room.getPricePerNight())
                .capacity(room.getCapacity())
                .description(room.getDescription())
                .amenities(room.getAmenities())
                .underMaintenance(room.isUnderMaintenance())
                .build();
    }

    public Page<RoomResponse> getAllRooms(Pageable pageable) {
        return roomRepository.findAll(pageable)
                .map(this::mapToResponse);
    }
}
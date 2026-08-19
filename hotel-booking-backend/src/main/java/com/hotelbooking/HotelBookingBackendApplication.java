package com.hotelbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HotelBookingBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(HotelBookingBackendApplication.class, args);
	}

}

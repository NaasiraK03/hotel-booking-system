# Hotel Booking System

A full-stack hotel booking application built with Java Spring Boot and React.

## Tech Stack
**Backend:** Java 21, Spring Boot 4.1.0, Spring Security (JWT), Spring Data JPA, PostgreSQL

## Features
- JWT Authentication with role-based access (GUEST / ADMIN)
- Room search and availability management
- Booking creation with automatic price calculation
- Payment processing (simulated)
- Admin dashboard endpoints

## API Endpoints
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/rooms | Authenticated |
| POST | /api/rooms/admin | ADMIN only |
| POST | /api/bookings | GUEST only |
| GET | /api/bookings/my | GUEST only |
| POST | /api/payments | GUEST only |

## Running Locally
```bash
cd hotel-booking-backend
mvn spring-boot:run
```

## Running with Docker
```bash
docker-compose up --build
```
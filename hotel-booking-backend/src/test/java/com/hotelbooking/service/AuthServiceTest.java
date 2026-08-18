package com.hotelbooking.service;

import com.hotelbooking.dto.request.LoginRequest;
import com.hotelbooking.dto.request.RegisterRequest;
import com.hotelbooking.dto.response.AuthResponse;
import com.hotelbooking.entity.User;
import com.hotelbooking.repository.UserRepository;
import com.hotelbooking.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User savedUser;

    @BeforeEach
    void setUp() {
       // savedUser is shared — both register and login tests use it
        savedUser = User.builder()
                .id(1L)
                .name("Naasira")
                .email("naasira@test.com")
                .password("hashedPassword")
                .role("GUEST")
                .build();
    }

    private RegisterRequest buildRegisterRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Naasira");
        request.setEmail("naasira@test.com");
        request.setPassword("password123");
        request.setRole("GUEST");
        return request;
    }

    //TEST-1
    @Test
    void register_ShouldReturnToken_WhenEmailIsNew() {
        RegisterRequest registerRequest = buildRegisterRequest();
        // ARRANGE — set up mocks
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("mock.jwt.token");

        // ACT — call the method we're testing
        AuthResponse response = authService.register(registerRequest);

        // ASSERT — verify the result
        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("naasira@test.com", response.getEmail());
        assertEquals("GUEST", response.getRole());
        assertEquals("Registration successful", response.getMessage());

    }

    //TEST-2
    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        RegisterRequest registerRequest = buildRegisterRequest();
        // ARRANGE
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(savedUser));

        // ACT + ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("Email already registered", exception.getMessage());

    }


//TEST-3
    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        // ARRANGE
        when(userRepository.findByEmail("naasira@test.com")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("mock.jwt.token");

        // ACT
        var loginRequest = new LoginRequest();
        loginRequest.setEmail("naasira@test.com");
        loginRequest.setPassword("password123");

        AuthResponse response = authService.login(loginRequest);

        // ASSERT
        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("Login successful", response.getMessage());
    }

//TEST-4
    @Test
    void login_ShouldThrowException_WhenEmailNotFound(){
        //ARRANGE
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        //ACT+ASSERT
        var loginRequest = new LoginRequest();
        loginRequest.setEmail("wrong@test.com");
        loginRequest.setPassword("password123");

        RuntimeException runtimeException = assertThrows(RuntimeException.class,()->{
            authService.login(loginRequest);
        });

        assertEquals("Invalid email or password",runtimeException.getMessage());

    }

    //TEST-5
    @Test
    void login_ShouldThrowException_WhenPasswordIsWrong(){
        //ARRANGE
        when(userRepository.findByEmail("naasira@test.com")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches("wrongPassword","hashedPassword")).thenReturn(false);

        //ACT+ASSERT
        var loginRequest = new LoginRequest();
        loginRequest.setEmail("naasira@test.com");
        loginRequest.setPassword("wrongPassword");

        RuntimeException exception = assertThrows(RuntimeException.class,()->{
            authService.login(loginRequest);
        });

        assertEquals("Invalid email or password",exception.getMessage());
    }






}
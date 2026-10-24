package com.wecredit.auth.Controller;

import com.wecredit.auth.Dto.ApiResponse;
import com.wecredit.auth.Dto.LoginRequest;
import com.wecredit.auth.Dto.OtpRequest;
import com.wecredit.auth.Dto.RegisterRequest;
import com.wecredit.auth.Dto.UserResponse;
import com.wecredit.auth.Service.AuthService;
import com.wecredit.auth.Service.UserService;
import com.wecredit.auth.exception.InvalidOtpException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody RegisterRequest request,
                                           @RequestHeader(value = "Fingerprint", required = false) String fingerprint) {
        log.info("Register request received for mobile: {}, fingerprint: {}", request.getMobile(), fingerprint);
        String result = userService.register(request, fingerprint);
        return ResponseEntity.ok(ApiResponse.success("Success", result));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> requestOtp(@RequestBody OtpRequest request,
                                             @RequestHeader(value = "Fingerprint", required = false) String fingerprint) {
        log.info("OTP request received for mobile: {}, fingerprint: {}", request.getMobile(), fingerprint);
        String result = authService.sendOtp(request.getMobile(), fingerprint);
        return ResponseEntity.ok(ApiResponse.success("Success", result));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestBody LoginRequest request,
                                            @RequestHeader(value = "Fingerprint", required = false) String fingerprint) {
        log.info("OTP verification attempt for mobile: {}, fingerprint: {}", request.getMobile(), fingerprint);
        String token = authService.verifyOtp(request, fingerprint);
        return ResponseEntity.ok(ApiResponse.success("Login successful", token));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@RequestBody OtpRequest request,
                                            @RequestHeader(value = "Fingerprint", required = false) String fingerprint) {
        log.info("Resend OTP request received for mobile: {}, fingerprint: {}", request.getMobile(), fingerprint);
        String result = authService.sendOtp(request.getMobile(), fingerprint);
        return ResponseEntity.ok(ApiResponse.success("Success", result));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header");
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }

        String token = authorizationHeader.substring(7);
        log.info("Fetching current user for token: {}", token);
        UserResponse user = userService.getCurrentUser(token);

        if (user == null) {
            log.warn("Unauthorized access attempt with token: {}", token);
            throw new InvalidOtpException("Unauthorized");
        }

        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", user));
    }
}

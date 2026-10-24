package com.wecredit.auth.Service;

import com.wecredit.auth.Config.JwtUtil;
import com.wecredit.auth.Dto.LoginRequest;
import com.wecredit.auth.Model.User;
import com.wecredit.auth.Repository.UserRepository;
import com.wecredit.auth.Utils.FingerprintUtil;
import com.wecredit.auth.Utils.OtpUtil;
import com.wecredit.auth.exception.InvalidOtpException;
import com.wecredit.auth.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpUtil otpUtil;
    private final JwtUtil jwtUtil;

    @Value("${twofactor.api.key:}")
    private String twoFactorApiKey;

    public String sendOtp(String mobile, String fingerprint) {
        log.info("Attempting to send OTP to mobile: {}, fingerprint: {}", mobile, fingerprint);

        Optional<User> userOpt = userRepository.findByMobile(mobile);
        if (userOpt.isEmpty()) {
            log.warn("Mobile number not registered: {}", mobile);
            throw new ResourceNotFoundException("Mobile number not registered.");
        }

        User user = userOpt.get();

        if (user.getFingerprint() != null && !FingerprintUtil.isSameDevice(user.getFingerprint(), fingerprint)) {
            log.warn("Fingerprint mismatch for mobile: {}", mobile);
            throw new IllegalArgumentException("Fingerprint mismatch.");
        }

        if (twoFactorApiKey != null && !twoFactorApiKey.isEmpty()) {
            RestTemplate restTemplate = new RestTemplate();
            // Call AUTOGEN API (It generates OTP and returns a session_id)
            String url = String.format("https://2factor.in/API/V1/%s/SMS/%s/AUTOGEN", twoFactorApiKey, mobile);
            
            try {
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                if (response != null && "Success".equalsIgnoreCase((String) response.get("Status"))) {
                    String sessionId = (String) response.get("Details"); // This is the UUID session
                    
                    // Store sessionId instead of raw OTP in the DB
                    long expiry = Instant.now().plusSeconds(300).toEpochMilli();
                    user.setOtp(sessionId);
                    user.setOtpExpiryTime(expiry);
                    user.setFingerprint(fingerprint);
                    userRepository.save(user);
                    
                    log.info("2Factor.in AUTOGEN successful. Session ID saved for mobile: {}", mobile);
                    return "OTP sent successfully.";
                } else {
                    log.error("2Factor.in API returned error: {}", response);
                    throw new RuntimeException("SMS provider error. Try again later.");
                }
            } catch (Exception e) {
                log.error("Failed to connect to 2Factor.in API: {}. Falling back to console only if local.", e.getMessage());
                throw new RuntimeException("Failed to send OTP securely.");
            }
        } else {
            // Local Development Fallback if no API Key is provided
            String otp = otpUtil.generateOtp();
            long expiry = Instant.now().plusSeconds(300).toEpochMilli();
            user.setOtp(otp);
            user.setOtpExpiryTime(expiry);
            user.setFingerprint(fingerprint);
            userRepository.save(user);
            log.warn("2Factor.in API Key NOT configured. DEV MODE - OTP [{}] outputting ONLY to console.", otp);
            return "OTP sent: " + otp;
        }
    }

    public String verifyOtp(LoginRequest request, String fingerprint) {
        log.info("Verifying OTP for mobile: {}, fingerprint: {}", request.getMobile(), fingerprint);

        Optional<User> userOpt = userRepository.findByMobile(request.getMobile());
        if (userOpt.isEmpty()) {
            log.warn("User not found for mobile: {}", request.getMobile());
            throw new ResourceNotFoundException("User not found.");
        }

        User user = userOpt.get();

        if (Instant.now().toEpochMilli() > user.getOtpExpiryTime()) {
            log.warn("OTP/Session expired for mobile: {}", request.getMobile());
            throw new IllegalArgumentException("OTP session expired. Please request a new one.");
        }

        if (twoFactorApiKey != null && !twoFactorApiKey.isEmpty()) {
            // VERIFY via 2Factor API where user.getOtp() stores the session_id
            String sessionId = user.getOtp();
            String enteredOtp = request.getOtp();
            
            RestTemplate restTemplate = new RestTemplate();
            String url = String.format("https://2factor.in/API/V1/%s/SMS/VERIFY/%s/%s", twoFactorApiKey, sessionId, enteredOtp);
            
            try {
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                if (response == null || !"Success".equalsIgnoreCase((String) response.get("Status"))) {
                    log.warn("2Factor.in verification failed for mobile: {}. Response: {}", request.getMobile(), response);
                    throw new InvalidOtpException("Invalid OTP.");
                }
            } catch (InvalidOtpException e) {
                throw e; // Relaise Invalid OTP
            } catch (Exception e) {
                log.error("Error communicating with 2Factor API during VERIFY: ", e);
                // In some cases 2Factor returns 400 Bad Request for mismatched OTPs, which throws an exception in RestTemplate
                throw new InvalidOtpException("Invalid OTP or Verification Failed.");
            }
        } else {
            // Local dev fallback check
            if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
                log.warn("Invalid LOCAL OTP for mobile: {}", request.getMobile());
                throw new InvalidOtpException("Invalid OTP.");
            }
        }

        if (!FingerprintUtil.isSameDevice(user.getFingerprint(), fingerprint)) {
            log.warn("Unrecognized device for mobile: {}", request.getMobile());
            throw new IllegalArgumentException("Unrecognized device.");
        }

        String token = jwtUtil.generateToken(user.getMobile());

        user.setOtp(null);
        user.setOtpExpiryTime(0L);
        userRepository.save(user);

        log.info("OTP verified and token issued for mobile: {}", request.getMobile());
        return token;
    }
}

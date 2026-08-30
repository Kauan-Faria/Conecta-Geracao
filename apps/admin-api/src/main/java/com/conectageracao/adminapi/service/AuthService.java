package com.conectageracao.adminapi.service;

import com.conectageracao.adminapi.dto.LoginRequest;
import com.conectageracao.adminapi.dto.LoginResponse;
import com.conectageracao.adminapi.repository.AdminUserRepository;
import com.conectageracao.adminapi.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminUserRepository adminUserRepository;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                        AdminUserRepository adminUserRepository,
                        JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.adminUserRepository = adminUserRepository;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (Exception e) {
            throw new BadCredentialsException("Usuario ou senha invalidos");
        }

        var admin = adminUserRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Usuario ou senha invalidos"));

        String token = jwtService.generateToken(admin.getUsername(), admin.getRole());
        return new LoginResponse(token, admin.getUsername(), admin.getRole(), jwtService.getExpirationSeconds());
    }
}

package com.orionlogistic.api.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orionlogistic.api.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s ->
                        s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Preflight CORS: el navegador manda OPTIONS sin token,
                        // hay que dejarlo pasar para que el CorsFilter responda.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Endpoints públicos (doc 07.5)
                        .requestMatchers(
                                "/auth/login",
                                "/cotizador/**",
                                "/rastreo/**",
                                "/config/publica",
                                // Documentación de la API (Swagger / OpenAPI)
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()
                        // Solo ADMIN
                        .requestMatchers("/usuarios/**", "/admin/**")
                        .hasRole("ADMIN")
                        // Todo lo demás requiere auth
                        .anyRequest().authenticated()
                )
                // Respuestas de auth/permiso conformes al contrato ApiResponse
                // (antes Spring devolvía un 401/403 "pelado" sin envelope).
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(
                                new RestAuthenticationEntryPoint(objectMapper))
                        .accessDeniedHandler(
                                new RestAccessDeniedHandler(objectMapper)))
                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
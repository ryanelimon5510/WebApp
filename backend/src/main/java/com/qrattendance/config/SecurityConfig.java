package com.qrattendance.config;

import com.nimbusds.jwt.SignedJWT;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/register", "/error").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            );
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return token -> {
            try {
                SignedJWT signedJWT = SignedJWT.parse(token);
                Map<String, Object> claimsMap = signedJWT.getJWTClaimsSet().getClaims();

                // Build Jwt manually from Supabase token claims
                // Convert Date objects to Instant for Spring Security
                Instant issuedAt = null;
                Instant expiresAt = null;

                Object iatObj = claimsMap.get("iat");
                if (iatObj instanceof Date) {
                    issuedAt = ((Date) iatObj).toInstant();
                } else if (iatObj instanceof Long) {
                    issuedAt = Instant.ofEpochSecond((Long) iatObj);
                } else if (iatObj instanceof Number) {
                    issuedAt = Instant.ofEpochSecond(((Number) iatObj).longValue());
                }

                Object expObj = claimsMap.get("exp");
                if (expObj instanceof Date) {
                    expiresAt = ((Date) expObj).toInstant();
                } else if (expObj instanceof Long) {
                    expiresAt = Instant.ofEpochSecond((Long) expObj);
                } else if (expObj instanceof Number) {
                    expiresAt = Instant.ofEpochSecond(((Number) expObj).longValue());
                }

                Jwt.Builder builder = Jwt.withTokenValue(token)
                    .header("alg", signedJWT.getHeader().getAlgorithm().getName())
                    .claims(claims -> {
                        for (Map.Entry<String, Object> entry : claimsMap.entrySet()) {
                            String key = entry.getKey();
                            Object value = entry.getValue();
                            // Convert Date to Instant for Spring's validators
                            if (value instanceof Date) {
                                claims.put(key, ((Date) value).toInstant());
                            } else {
                                claims.put(key, value);
                            }
                        }
                    });

                if (issuedAt != null) builder.issuedAt(issuedAt);
                if (expiresAt != null) builder.expiresAt(expiresAt);

                return builder.build();
            } catch (Exception e) {
                System.err.println("[JWT DECODER ERROR] " + e.getMessage());
                e.printStackTrace();
                throw new BadJwtException("Invalid token: " + e.getMessage(), e);
            }
        };
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "https://localhost:*", "http://192.168.*:*", "https://192.168.*:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

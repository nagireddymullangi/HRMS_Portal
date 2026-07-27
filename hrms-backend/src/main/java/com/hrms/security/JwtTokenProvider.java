//security/JwtTokenProvider.java
package com.hrms.security;

import com.hrms.exception.HrmsAPIException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

 @Value("${app.jwt-secret}")
 private String jwtSecret;

 @Value("${app.jwt-expiration-milliseconds}")
 private long jwtExpirationDate;

 // Generate JWT Token
 public String generateToken(Authentication authentication) {
     String username = authentication.getName();
     Date currentDate = new Date();
     Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

     return Jwts.builder()
             .setSubject(username)
             .setIssuedAt(currentDate)
             .setExpiration(expireDate)
             .signWith(key())
             .compact();
 }

 // Generate Token from Username
 public String generateTokenFromUsername(String username) {
     Date currentDate = new Date();
     Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

     return Jwts.builder()
             .setSubject(username)
             .setIssuedAt(currentDate)
             .setExpiration(expireDate)
             .signWith(key())
             .compact();
 }

 // Get Username from JWT Token
 public String getUsername(String token) {
     Claims claims = Jwts.parserBuilder()
             .setSigningKey(key())
             .build()
             .parseClaimsJws(token)
             .getBody();
     return claims.getSubject();
 }

 // Validate JWT Token
 public boolean validateToken(String token) {
     try {
         Jwts.parserBuilder()
                 .setSigningKey(key())
                 .build()
                 .parseClaimsJws(token);
         return true;
     } catch (MalformedJwtException ex) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST, 
                 "Invalid JWT token");
     } catch (ExpiredJwtException ex) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST, 
                 "Expired JWT token");
     } catch (UnsupportedJwtException ex) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST, 
                 "Unsupported JWT token");
     } catch (IllegalArgumentException ex) {
         throw new HrmsAPIException(HttpStatus.BAD_REQUEST, 
                 "JWT claims string is empty");
     }
 }

 private Key key() {
     return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
 }
}
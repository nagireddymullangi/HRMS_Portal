//exception/GlobalExceptionHandler.java
package com.hrms.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

 // Handle Resource Not Found
 @ExceptionHandler(ResourceNotFoundException.class)
 public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
         ResourceNotFoundException ex, WebRequest request) {

     ErrorResponse error = new ErrorResponse(
             LocalDateTime.now(),
             HttpStatus.NOT_FOUND.value(),
             "Not Found",
             ex.getMessage(),
             request.getDescription(false)
     );
     return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
 }

 // Handle HRMS API Exception
 @ExceptionHandler(HrmsAPIException.class)
 public ResponseEntity<ErrorResponse> handleHrmsAPIException(
         HrmsAPIException ex, WebRequest request) {

     ErrorResponse error = new ErrorResponse(
             LocalDateTime.now(),
             ex.getStatus().value(),
             ex.getStatus().getReasonPhrase(),
             ex.getMessage(),
             request.getDescription(false)
     );
     return new ResponseEntity<>(error, ex.getStatus());
 }

 // Handle Validation Errors
 @Override
 protected ResponseEntity<Object> handleMethodArgumentNotValid(
         MethodArgumentNotValidException ex,
         HttpHeaders headers,
         HttpStatusCode status,
         WebRequest request) {

     Map<String, String> errors = new HashMap<>();
     ex.getBindingResult().getAllErrors().forEach(error -> {
         String fieldName = ((FieldError) error).getField();
         String message = error.getDefaultMessage();
         errors.put(fieldName, message);
     });

     ValidationErrorResponse validationError = new ValidationErrorResponse(
             LocalDateTime.now(),
             HttpStatus.BAD_REQUEST.value(),
             "Validation Failed",
             errors,
             request.getDescription(false)
     );
     return new ResponseEntity<>(validationError, HttpStatus.BAD_REQUEST);
 }

 // Handle Access Denied
 @ExceptionHandler(AccessDeniedException.class)
 public ResponseEntity<ErrorResponse> handleAccessDeniedException(
         AccessDeniedException ex, WebRequest request) {

     ErrorResponse error = new ErrorResponse(
             LocalDateTime.now(),
             HttpStatus.FORBIDDEN.value(),
             "Forbidden",
             "You don't have permission to access this resource",
             request.getDescription(false)
     );
     return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
 }

 // Handle Bad Credentials
 @ExceptionHandler(BadCredentialsException.class)
 public ResponseEntity<ErrorResponse> handleBadCredentialsException(
         BadCredentialsException ex, WebRequest request) {

     ErrorResponse error = new ErrorResponse(
             LocalDateTime.now(),
             HttpStatus.UNAUTHORIZED.value(),
             "Unauthorized",
             "Invalid username or password",
             request.getDescription(false)
     );
     return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
 }

 // Handle Global Exception
 @ExceptionHandler(Exception.class)
 public ResponseEntity<ErrorResponse> handleGlobalException(
         Exception ex, WebRequest request) {

     ErrorResponse error = new ErrorResponse(
             LocalDateTime.now(),
             HttpStatus.INTERNAL_SERVER_ERROR.value(),
             "Internal Server Error",
             ex.getMessage(),
             request.getDescription(false)
     );
     return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
 }

 // ---- Inner Classes ----
 public record ErrorResponse(
         LocalDateTime timestamp,
         int status,
         String error,
         String message,
         String path
 ) {}

 public record ValidationErrorResponse(
         LocalDateTime timestamp,
         int status,
         String error,
         Map<String, String> validationErrors,
         String path
 ) {}
}
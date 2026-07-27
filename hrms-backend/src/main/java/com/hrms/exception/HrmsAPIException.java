//exception/HrmsAPIException.java
package com.hrms.exception;

import org.springframework.http.HttpStatus;

public class HrmsAPIException extends RuntimeException {

 private HttpStatus status;
 private String message;

 public HrmsAPIException(HttpStatus status, String message) {
     super(message);
     this.status = status;
     this.message = message;
 }

 public HttpStatus getStatus() { return status; }

 @Override
 public String getMessage() { return message; }
}
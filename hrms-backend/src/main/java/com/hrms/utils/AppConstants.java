//utils/AppConstants.java
package com.hrms.utils;

public class AppConstants {

 // Roles
 public static final String ROLE_ADMIN = "ROLE_ADMIN";
 public static final String ROLE_EMPLOYEE = "ROLE_EMPLOYEE";

 // Pagination
 public static final String DEFAULT_PAGE_NUMBER = "0";
 public static final String DEFAULT_PAGE_SIZE = "10";
 public static final String DEFAULT_SORT_BY = "id";
 public static final String DEFAULT_SORT_DIRECTION = "asc";

 // JWT
 public static final String TOKEN_PREFIX = "Bearer ";
 public static final String HEADER_STRING = "Authorization";

 // Date Format
 public static final String DATE_FORMAT = "yyyy-MM-dd";
 public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

 // Leave Status
 public static final String LEAVE_STATUS_PENDING = "PENDING";
 public static final String LEAVE_STATUS_APPROVED = "APPROVED";
 public static final String LEAVE_STATUS_REJECTED = "REJECTED";

 // Attendance Status
 public static final String ATTENDANCE_PRESENT = "PRESENT";
 public static final String ATTENDANCE_ABSENT = "ABSENT";
 public static final String ATTENDANCE_HALF_DAY = "HALF_DAY";
 public static final String ATTENDANCE_ON_LEAVE = "ON_LEAVE";

 // Employee Status
 public static final String EMPLOYEE_ACTIVE = "ACTIVE";
 public static final String EMPLOYEE_INACTIVE = "INACTIVE";

 private AppConstants() {}
}
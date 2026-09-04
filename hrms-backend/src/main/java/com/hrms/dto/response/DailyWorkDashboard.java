package com.hrms.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyWorkDashboard {
    private Integer totalTasks;
    private Integer completed;
    private Integer inProgress;
    private Integer pending;
    private Integer blocked;
    private Integer overdue;
    private Long totalWorkMinutes;
    private Long totalBreakMinutes;
    private BreakSessionResponse currentBreak;
    private List<AssignmentResponse> todayTasks;
    private List<AssignmentResponse> upcomingTasks;
    private Double productivityScore;
}
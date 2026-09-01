
//dto/response/AIInsightsResponse.java
package com.hrms.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AIInsightsResponse {
 private List<AttritionRisk> attritionRisks;
 private List<Map<String, Object>> topPerformers;
 private List<Map<String, Object>> lowPerformers;
 private List<Map<String, Object>> attendanceAlerts;
 private List<Map<String, Object>> smartRecommendations;
 private Map<String, Object> sentimentAnalysis;
 private Map<String, Object> salaryBenchmarks;
 private List<Map<String, Object>> skillGaps;
 private Map<String, Object> predictions;
}


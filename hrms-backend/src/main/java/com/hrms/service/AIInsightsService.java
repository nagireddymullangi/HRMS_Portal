
//service/AIInsightsService.java
package com.hrms.service;

import com.hrms.dto.response.AIInsightsResponse;

import java.util.List;
import java.util.Map;

public interface AIInsightsService {
 AIInsightsResponse getComprehensiveInsights();

 List<Map<String, Object>> predictAttritionRisks();
 Map<String, Object> analyzeSentiment();
 List<Map<String, Object>> getTopPerformers(int limit);
 List<Map<String, Object>> getAttendanceAnomalies();
 List<Map<String, Object>> getSmartRecommendations();
 Map<String, Object> getSalaryBenchmarks();
 List<Map<String, Object>> getSkillGaps();
 Map<String, Object> chatbotResponse(String query);
}
package com.pactflow.unit.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pactflow.application.milestone.MilestoneService;
import com.pactflow.application.milestone.dto.CreateDeliverableRequest;
import com.pactflow.application.milestone.dto.DeliverableDto;
import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.infrastructure.web.controller.MilestoneController;
import com.pactflow.infrastructure.web.exception.GlobalExceptionHandler;
import com.pactflow.infrastructure.web.security.JwtAuthenticationFilter;
import com.pactflow.infrastructure.web.security.RateLimitFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = MilestoneController.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                        JwtAuthenticationFilter.class,
                        RateLimitFilter.class
                })
        }
)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("MilestoneController WebMvc unit tests")
class MilestoneControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MilestoneService milestoneService;

    private UUID userId;
    private User testUser;
    private UUID projectId;
    private UUID milestoneId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        projectId = UUID.randomUUID();
        milestoneId = UUID.randomUUID();
        testUser = new User(userId, new Email("test@pactflow.io"), "hash", AccountType.COMPANY, "Company", "UTC");

        // Mock security context
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(testUser, null, java.util.Collections.emptyList())
        );
    }

    @Test
    @DisplayName("POST /submit should return 200 OK")
    void submitDeliverable_Success() throws Exception {
        CreateDeliverableRequest request = new CreateDeliverableRequest("Deliverable title", "Description", "http://github.com/test", null, null);
        DeliverableDto responseDto = DeliverableDto.builder()
            .id(UUID.randomUUID())
            .title(request.getTitle())
            .description(request.getDescription())
            .fileUrl(request.getFileUrl())
            .build();

        when(milestoneService.submitDeliverable(eq(projectId), eq(milestoneId), any(CreateDeliverableRequest.class), eq(userId)))
                .thenReturn(responseDto);

        mockMvc.perform(post("/projects/{projectId}/milestones/{milestoneId}/submit", projectId, milestoneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Deliverable title"));

        verify(milestoneService).submitDeliverable(eq(projectId), eq(milestoneId), any(CreateDeliverableRequest.class), eq(userId));
    }

    @Test
    @DisplayName("POST /review should return 200 OK")
    void markInReview_Success() throws Exception {
        mockMvc.perform(post("/projects/{projectId}/milestones/{milestoneId}/review", projectId, milestoneId))
                .andExpect(status().isOk());

        verify(milestoneService).markInReview(projectId, milestoneId, userId);
    }

    @Test
    @DisplayName("POST /approve should return 200 OK")
    void approveMilestone_Success() throws Exception {
        mockMvc.perform(post("/projects/{projectId}/milestones/{milestoneId}/approve", projectId, milestoneId))
                .andExpect(status().isOk());

        verify(milestoneService).approveMilestone(projectId, milestoneId, userId);
    }

    @Test
    @DisplayName("POST /reject should return 200 OK")
    void rejectMilestone_Success() throws Exception {
        mockMvc.perform(post("/projects/{projectId}/milestones/{milestoneId}/reject", projectId, milestoneId))
                .andExpect(status().isOk());

        verify(milestoneService).rejectMilestone(projectId, milestoneId, userId);
    }
}

package com.pactflow.application.milestone.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMilestoneRequest {
    private String title;
    private String description;
    private BigDecimal amountXlm;
    private Integer sequenceOrder;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    private Boolean strictDeadline;
}

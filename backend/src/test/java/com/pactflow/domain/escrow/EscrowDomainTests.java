package com.pactflow.domain.escrow;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EscrowDomainTests {

    @Test
    void shouldCreateEscrowSuccessfully() {
        UUID projectId = UUID.randomUUID();
        UUID milestoneId = UUID.randomUUID();
        Escrow escrow = Escrow.create(projectId, milestoneId);
        
        assertThat(escrow.getId()).isNotNull();
        assertThat(escrow.getProjectId()).isEqualTo(projectId);
        assertThat(escrow.getMilestoneId()).isEqualTo(milestoneId);
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.CREATED);
        assertThat(escrow.getFundedAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void shouldCompleteHappyPathLifecycle() {
        Escrow escrow = Escrow.create(UUID.randomUUID(), UUID.randomUUID());
        
        escrow.initiateFunding();
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.PENDING_FUNDING);
        
        escrow.markFunded(BigDecimal.valueOf(100), "tx1");
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.FUNDED);
        assertThat(escrow.getFundedAmount()).isEqualByComparingTo(BigDecimal.valueOf(100));
        assertThat(escrow.getTransactionReferences()).isEqualTo("tx1");
        
        escrow.submitWork();
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.SUBMITTED);
        
        escrow.startReview();
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.UNDER_REVIEW);
        
        escrow.approve();
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.APPROVED);
        
        escrow.release("tx2");
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.RELEASED);
        assertThat(escrow.getTransactionReferences()).isEqualTo("tx1,tx2");
    }
    
    @Test
    void shouldFollowDisputeToReleaseLifecycle() {
        Escrow escrow = Escrow.create(UUID.randomUUID(), UUID.randomUUID());
        escrow.initiateFunding();
        escrow.markFunded(BigDecimal.valueOf(100), "tx1");
        escrow.submitWork();
        escrow.startReview();
        
        escrow.dispute();
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.DISPUTED);
        
        escrow.release("tx2");
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.RELEASED);
    }
    
    @Test
    void shouldFollowDisputeToRefundLifecycle() {
        Escrow escrow = Escrow.create(UUID.randomUUID(), UUID.randomUUID());
        escrow.initiateFunding();
        escrow.markFunded(BigDecimal.valueOf(100), "tx1");
        escrow.submitWork();
        escrow.startReview();
        
        escrow.dispute();
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.DISPUTED);
        
        escrow.refund("tx2");
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.REFUNDED);
    }
    
    @Test
    void shouldAllowRefundDirectlyFromFunded() {
        Escrow escrow = Escrow.create(UUID.randomUUID(), UUID.randomUUID());
        escrow.initiateFunding();
        escrow.markFunded(BigDecimal.valueOf(100), "tx1");
        
        escrow.refund("tx2");
        assertThat(escrow.getStatus()).isEqualTo(EscrowStatus.REFUNDED);
    }

    @Test
    void shouldRejectInvalidTransitions() {
        Escrow escrow = Escrow.create(UUID.randomUUID(), UUID.randomUUID());
        
        assertThatThrownBy(() -> escrow.markFunded(BigDecimal.TEN, "tx"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Cannot mark as funded");
            
        assertThatThrownBy(escrow::submitWork)
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Cannot submit work");
            
        assertThatThrownBy(() -> escrow.release("tx"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Cannot release funds");
            
        escrow.initiateFunding();
        assertThatThrownBy(() -> escrow.refund("tx"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Cannot refund");
    }
    
    @Test
    void shouldRejectDuplicateReleasesOrRefunds() {
        Escrow escrow = Escrow.create(UUID.randomUUID(), UUID.randomUUID());
        escrow.initiateFunding();
        escrow.markFunded(BigDecimal.valueOf(100), "tx1");
        escrow.submitWork();
        escrow.startReview();
        escrow.approve();
        
        escrow.release("tx2"); // First time succeeds
        
        assertThatThrownBy(() -> escrow.release("tx3"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Cannot release funds");
            
        assertThatThrownBy(() -> escrow.refund("tx4"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Cannot refund");
    }
}

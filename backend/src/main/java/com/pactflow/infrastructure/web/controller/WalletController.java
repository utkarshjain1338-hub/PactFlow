package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.wallet.WalletService;
import com.pactflow.application.wallet.dto.AddWalletRequest;
import com.pactflow.application.wallet.dto.ChallengeRequest;
import com.pactflow.application.wallet.dto.ChallengeResponse;
import com.pactflow.application.wallet.dto.VerifyWalletRequest;
import com.pactflow.application.wallet.dto.WalletResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/me/wallets")
@RequiredArgsConstructor
@Tag(name = "Wallets", description = "Endpoints for managing user Stellar wallets and verifications")
@SecurityRequirement(name = "bearerAuth")
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    @Operation(summary = "Get all wallets for the authenticated user", responses = {
            @ApiResponse(responseCode = "200", description = "Wallets retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    public ResponseEntity<List<WalletResponse>> getWallets(
            @AuthenticationPrincipal final Object principal) {
        final UUID userId = com.pactflow.infrastructure.web.security.PrincipalExtractor.extractUserId(principal);
        return ResponseEntity.ok(walletService.getWallets(userId));
    }

    @PostMapping
    @Operation(summary = "Add a new unverified wallet", responses = {
            @ApiResponse(responseCode = "201", description = "Wallet added successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "409", description = "Duplicate wallet or max limit reached",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    public ResponseEntity<WalletResponse> addWallet(
            @AuthenticationPrincipal final Object principal,
            @Valid @RequestBody final AddWalletRequest request) {
        final UUID userId = com.pactflow.infrastructure.web.security.PrincipalExtractor.extractUserId(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(walletService.addWallet(userId, request));
    }

    @PostMapping("/challenge")
    @Operation(summary = "Generate a verification challenge for a wallet", responses = {
            @ApiResponse(responseCode = "200", description = "Challenge generated successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Wallet not found",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "409", description = "Wallet is already verified or locked",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    public ResponseEntity<ChallengeResponse> generateChallenge(
            @AuthenticationPrincipal final Object principal,
            @Valid @RequestBody final ChallengeRequest request) {
        final UUID userId = com.pactflow.infrastructure.web.security.PrincipalExtractor.extractUserId(principal);
        return ResponseEntity.ok(walletService.generateChallenge(userId, request.walletId()));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify a wallet using a signed challenge nonce", responses = {
            @ApiResponse(responseCode = "204", description = "Wallet verified successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "403", description = "Signature invalid",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Wallet not found",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "409", description = "Wallet is already verified or locked",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "410", description = "Challenge expired",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> verifyWallet(
            @AuthenticationPrincipal final Object principal,
            @Valid @RequestBody final VerifyWalletRequest request) {
        final UUID userId = com.pactflow.infrastructure.web.security.PrincipalExtractor.extractUserId(principal);
        walletService.verifyWallet(userId, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/primary")
    @Operation(summary = "Set a verified wallet as the primary wallet", responses = {
            @ApiResponse(responseCode = "204", description = "Primary wallet updated successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Wallet not found",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "409", description = "Wallet is unverified or locked",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> setPrimaryWallet(
            @AuthenticationPrincipal final Object principal,
            @PathVariable("id") final UUID walletId) {
        final UUID userId = com.pactflow.infrastructure.web.security.PrincipalExtractor.extractUserId(principal);
        walletService.setPrimaryWallet(userId, walletId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a wallet", responses = {
            @ApiResponse(responseCode = "204", description = "Wallet deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "404", description = "Wallet not found",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "409", description = "Wallet is locked",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteWallet(
            @AuthenticationPrincipal final Object principal,
            @PathVariable("id") final UUID walletId) {
        final UUID userId = com.pactflow.infrastructure.web.security.PrincipalExtractor.extractUserId(principal);
        walletService.deleteWallet(userId, walletId);
        return ResponseEntity.noContent().build();
    }
}

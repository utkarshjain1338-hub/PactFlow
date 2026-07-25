package com.pactflow.application.auth.port;

import com.pactflow.domain.user.User;
import java.util.UUID;

public interface TokenProvider {
    String generateRefreshToken();
    String generateAccessToken(User user, UUID sessionId);
}

package com.iumeatelier.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static SecurityUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUser securityUser) {
            return securityUser;
        }
        return null;
    }

    public static Long getCurrentUserId() {
        SecurityUser user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    public static boolean isAdmin() {
        SecurityUser user = getCurrentUser();
        return user != null && "ADMIN".equals(user.getUser().getRole());
    }
}

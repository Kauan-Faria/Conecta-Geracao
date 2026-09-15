package com.conectageracao.adminapi.service;

import com.conectageracao.adminapi.dto.DashboardStatsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DashboardStatsService {

    private static final Logger log = LoggerFactory.getLogger(DashboardStatsService.class);

    private static final String COUNT_USERS_UNION = """
            SELECT COUNT(*) FROM (
                SELECT firebase_uid FROM device_tokens
                UNION
                SELECT firebase_uid FROM conversations
            ) users
            """;

    private static final String COUNT_USERS_DEVICE_TOKENS =
            "SELECT COUNT(DISTINCT firebase_uid) FROM device_tokens";

    private static final String COUNT_USERS_CONVERSATIONS =
            "SELECT COUNT(DISTINCT firebase_uid) FROM conversations";

    private static final String COUNT_AI_QUESTIONS =
            "SELECT COUNT(*) FROM messages WHERE CAST(role AS VARCHAR) = 'user'";

    private final JdbcTemplate jdbcTemplate;

    public DashboardStatsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DashboardStatsResponse getStats() {
        return new DashboardStatsResponse(countRegisteredUsers(), countAiQuestions());
    }

    private Long countRegisteredUsers() {
        Long union = queryCount(COUNT_USERS_UNION);
        if (union != null) {
            return union;
        }
        Long tokens = queryCount(COUNT_USERS_DEVICE_TOKENS);
        if (tokens != null) {
            return tokens;
        }
        return queryCount(COUNT_USERS_CONVERSATIONS);
    }

    private Long countAiQuestions() {
        return queryCount(COUNT_AI_QUESTIONS);
    }

    private Long queryCount(String sql) {
        try {
            Long count = jdbcTemplate.queryForObject(sql, Long.class);
            return count == null ? 0L : count;
        } catch (DataAccessException ex) {
            log.debug("Contagem do dashboard indisponível neste ambiente: {}", ex.getMessage());
            return null;
        }
    }
}

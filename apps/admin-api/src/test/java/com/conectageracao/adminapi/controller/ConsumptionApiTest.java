package com.conectageracao.adminapi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:admin-consumo;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "oracle.datasource.url=",
        "oracle.datasource.username=",
        "oracle.datasource.password="
})
class ConsumptionApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void semJwtConsultaEDisparoSaoRecusados() throws Exception {
        mockMvc.perform(get("/api/consumption")
                        .param("userId", "1")
                        .param("periodStart", "2026-09-01T00:00:00")
                        .param("periodEnd", "2026-09-30T23:59:59"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/consumption/alerts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId":1,"periodStart":"2026-09-01T00:00:00","periodEnd":"2026-09-30T23:59:59"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void healthEDashboardSeguemSemOracle() throws Exception {
        mockMvc.perform(get("/health")).andExpect(status().isOk());

        String token = login();
        long started = System.nanoTime();
        mockMvc.perform(get("/api/dashboard/stats").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/consumption")
                        .header("Authorization", "Bearer " + token)
                        .param("userId", "1")
                        .param("periodStart", "2026-09-01T00:00:00")
                        .param("periodEnd", "2026-09-30T23:59:59"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("ORACLE_UNAVAILABLE"));
        long elapsedMs = (System.nanoTime() - started) / 1_000_000;
        if (elapsedMs >= 3000) {
            throw new AssertionError("consulta com Oracle ausente levou " + elapsedMs + " ms");
        }
    }

    @Test
    void periodoInvertidoResponde400SemDependerDoOracle() throws Exception {
        String token = login();
        mockMvc.perform(get("/api/consumption")
                        .header("Authorization", "Bearer " + token)
                        .param("userId", "1")
                        .param("periodStart", "2026-09-30T23:59:59")
                        .param("periodEnd", "2026-09-01T00:00:00"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    private String login() throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode json = objectMapper.readTree(body);
        return json.get("token").asText();
    }
}

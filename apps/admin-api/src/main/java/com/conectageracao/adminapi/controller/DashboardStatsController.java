package com.conectageracao.adminapi.controller;

import com.conectageracao.adminapi.dto.DashboardStatsResponse;
import com.conectageracao.adminapi.service.DashboardStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "dashboard")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardStatsController {

    private final DashboardStatsService service;

    public DashboardStatsController(DashboardStatsService service) {
        this.service = service;
    }

    @GetMapping("/stats")
    @Operation(summary = "Contagens reais de usuários e perguntas à IA")
    public DashboardStatsResponse stats() {
        return service.getStats();
    }
}

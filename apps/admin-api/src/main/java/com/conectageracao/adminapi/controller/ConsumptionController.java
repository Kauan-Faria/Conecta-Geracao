package com.conectageracao.adminapi.controller;

import com.conectageracao.adminapi.dto.ConsumptionResponse;
import com.conectageracao.adminapi.dto.RegisterAlertRequest;
import com.conectageracao.adminapi.dto.RegisterAlertResponse;
import com.conectageracao.adminapi.service.ConsumoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@Tag(name = "consumo")
@Validated
@RestController
@RequestMapping("/api/consumption")
public class ConsumptionController {

    private final ConsumoService service;

    public ConsumptionController(ConsumoService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Indicador, texto, alertas e relatório de consumo no Oracle")
    public ConsumptionResponse consult(
            @RequestParam @Positive Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodEnd
    ) {
        return service.consult(userId, periodStart, periodEnd);
    }

    @PostMapping("/alerts")
    @Operation(summary = "Dispara PR_REGISTRAR_ALERTA_CONSUMO via JDBC")
    public RegisterAlertResponse register(@Valid @RequestBody RegisterAlertRequest request) {
        return service.registerAlert(request);
    }
}

package com.conectageracao.adminapi.controller;

import com.conectageracao.adminapi.dto.CampaignRequest;
import com.conectageracao.adminapi.dto.CampaignResponse;
import com.conectageracao.adminapi.service.CampaignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Substitui o antigo POST /notifications/campaigns do NestJS protegido por
 * X-Internal-Service-Key: agora quem dispara e um AdminUser autenticado por
 * JWT, e fica registrado quem pediu (requestedBy = username do operador).
 */
@Tag(name = "campaigns")
@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService service;

    public CampaignController(CampaignService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar campanhas")
    public List<CampaignResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter campanha por id")
    public CampaignResponse findById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar campanha (fica com status pending ate um worker disparar o push)")
    public CampaignResponse create(@Valid @RequestBody CampaignRequest request, Authentication authentication) {
        return service.create(request, authentication.getName());
    }
}

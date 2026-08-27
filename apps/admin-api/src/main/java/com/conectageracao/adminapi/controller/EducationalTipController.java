package com.conectageracao.adminapi.controller;

import com.conectageracao.adminapi.dto.EducationalTipRequest;
import com.conectageracao.adminapi.dto.EducationalTipResponse;
import com.conectageracao.adminapi.service.EducationalTipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "educational-tips")
@RestController
@RequestMapping("/api/educational-tips")
public class EducationalTipController {

    private final EducationalTipService service;

    public EducationalTipController(EducationalTipService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar dicas educacionais")
    public List<EducationalTipResponse> findAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar dica educacional")
    public EducationalTipResponse create(@Valid @RequestBody EducationalTipRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar dica educacional")
    public EducationalTipResponse update(@PathVariable String id, @Valid @RequestBody EducationalTipRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover dica educacional")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}

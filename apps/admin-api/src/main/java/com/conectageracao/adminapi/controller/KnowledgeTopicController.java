package com.conectageracao.adminapi.controller;

import com.conectageracao.adminapi.dto.KnowledgeTopicRequest;
import com.conectageracao.adminapi.dto.KnowledgeTopicResponse;
import com.conectageracao.adminapi.service.KnowledgeTopicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD de topicos da base de conhecimento (usados pelo RAG do assistente).
 * O NestJS continua sendo o unico a LER esses dados para o chat; aqui e onde
 * o operador cria/edita/remove sem precisar de deploy.
 */
@Tag(name = "knowledge-topics")
@RestController
@RequestMapping("/api/knowledge-topics")
public class KnowledgeTopicController {

    private final KnowledgeTopicService service;

    public KnowledgeTopicController(KnowledgeTopicService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar todos os topicos")
    public List<KnowledgeTopicResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter um topico por id")
    public KnowledgeTopicResponse findById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar um novo topico com seus passos")
    public KnowledgeTopicResponse create(@Valid @RequestBody KnowledgeTopicRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar um topico existente")
    public KnowledgeTopicResponse update(@PathVariable String id, @Valid @RequestBody KnowledgeTopicRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover um topico")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}

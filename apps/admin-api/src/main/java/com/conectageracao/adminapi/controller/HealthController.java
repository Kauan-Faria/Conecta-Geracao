package com.conectageracao.adminapi.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Unica tela renderizada no servidor (Thymeleaf), so para evidenciar o
 * conteudo da ementa (Spring MVC + Thymeleaf da Fase 1). O dashboard real
 * do operador e o Angular (admin-web), que consome a API JSON abaixo.
 */
@Controller
public class HealthController {

    @GetMapping("/health")
    public String health(Model model) {
        model.addAttribute("status", "UP");
        model.addAttribute("service", "admin-api");
        return "health";
    }
}

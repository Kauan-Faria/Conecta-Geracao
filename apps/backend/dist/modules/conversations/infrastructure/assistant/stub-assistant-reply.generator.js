"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubAssistantReplyGenerator = void 0;
const common_1 = require("@nestjs/common");
const message_content_vo_1 = require("../../domain/value-objects/message-content.vo");
let StubAssistantReplyGenerator = class StubAssistantReplyGenerator {
    async generateReply(input) {
        const topicHint = input.topicSlug ? ` (tópico: ${input.topicSlug})` : '';
        return {
            content: message_content_vo_1.MessageContent.create(`Recebi sua mensagem: ${input.userMessage}${topicHint}. (Resposta automática — assistente completo em breve.)`),
            nextCurrentStep: input.currentStep,
        };
    }
};
exports.StubAssistantReplyGenerator = StubAssistantReplyGenerator;
exports.StubAssistantReplyGenerator = StubAssistantReplyGenerator = __decorate([
    (0, common_1.Injectable)()
], StubAssistantReplyGenerator);
//# sourceMappingURL=stub-assistant-reply.generator.js.map
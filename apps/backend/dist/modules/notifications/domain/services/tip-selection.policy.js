"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipSelectionPolicy = void 0;
const common_1 = require("@nestjs/common");
let TipSelectionPolicy = class TipSelectionPolicy {
    selectTipForUser(firebaseUid, catalog) {
        if (catalog.length === 0) {
            throw new Error('Catálogo de dicas vazio.');
        }
        const weekNumber = this.getIsoWeekNumber(new Date());
        const hash = this.simpleHash(`${firebaseUid}:${weekNumber}`);
        const index = hash % catalog.length;
        return catalog[index];
    }
    getIsoWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }
    simpleHash(value) {
        let hash = 0;
        for (let i = 0; i < value.length; i += 1) {
            hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
        }
        return hash;
    }
};
exports.TipSelectionPolicy = TipSelectionPolicy;
exports.TipSelectionPolicy = TipSelectionPolicy = __decorate([
    (0, common_1.Injectable)()
], TipSelectionPolicy);
//# sourceMappingURL=tip-selection.policy.js.map
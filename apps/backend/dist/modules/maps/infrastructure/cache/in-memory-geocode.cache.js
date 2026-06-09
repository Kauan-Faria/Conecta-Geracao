"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryGeocodeCache = void 0;
const common_1 = require("@nestjs/common");
let InMemoryGeocodeCache = class InMemoryGeocodeCache {
    constructor() {
        this.forward = new Map();
        this.reverse = new Map();
    }
    getForward(key, ttlMs) {
        return this.get(this.forward, key, ttlMs);
    }
    setForward(key, value, ttlMs) {
        this.set(this.forward, key, value, ttlMs);
    }
    getReverse(key, ttlMs) {
        return this.get(this.reverse, key, ttlMs);
    }
    setReverse(key, value, ttlMs) {
        this.set(this.reverse, key, value, ttlMs);
    }
    get(store, key, ttlMs) {
        const entry = store.get(key);
        if (!entry)
            return null;
        if (Date.now() >= entry.expiresAt) {
            store.delete(key);
            return null;
        }
        void ttlMs;
        return entry.value;
    }
    set(store, key, value, ttlMs) {
        store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    }
};
exports.InMemoryGeocodeCache = InMemoryGeocodeCache;
exports.InMemoryGeocodeCache = InMemoryGeocodeCache = __decorate([
    (0, common_1.Injectable)()
], InMemoryGeocodeCache);
//# sourceMappingURL=in-memory-geocode.cache.js.map
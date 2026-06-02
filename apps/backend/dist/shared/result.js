"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.err = exports.ok = void 0;
const ok = (value) => ({ ok: true, value });
exports.ok = ok;
const err = (error) => ({ ok: false, error });
exports.err = err;
//# sourceMappingURL=result.js.map
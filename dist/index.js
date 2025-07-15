"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfanityChecker = exports.default = void 0;
const profanityChecker_1 = require("./profanityChecker");
Object.defineProperty(exports, "ProfanityChecker", { enumerable: true, get: function () { return profanityChecker_1.ProfanityChecker; } });
const checker = new profanityChecker_1.ProfanityChecker();
exports.default = checker;

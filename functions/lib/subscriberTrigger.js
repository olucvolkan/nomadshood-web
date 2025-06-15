"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSubscriberCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const resend_1 = require("resend");
const generateGuide_1 = require("./generateGuide");
const getResend = () => {
    var _a;
    const apiKey = (_a = functions.config().resend) === null || _a === void 0 ? void 0 : _a.api_key;
    if (!apiKey)
        throw new Error('Resend API key not set');
    return new resend_1.Resend(apiKey);
};
exports.onSubscriberCreate = functions.firestore
    .document('subscribers/{subscriberId}')
    .onCreate(async (snap, context) => {
    const data = snap.data();
    const language = data.language || 'en';
    const resend = getResend();
    const links = [];
    for (const country of data.countries) {
        try {
            const url = await (0, generateGuide_1.generateCountryGuide)(language, country);
            links.push(`${country}: ${url}`);
        }
        catch (err) {
            console.error('Error generating guide for', country, err);
        }
    }
    if (links.length > 0) {
        await resend.emails.send({
            from: 'info@nomadshood.com',
            to: data.email,
            subject: 'Your Nomad Guides',
            text: `Here are your guides:\n${links.join('\n')}`,
        });
    }
    await snap.ref.update({ pdfGenerated: true, emailSent: true });
});
//# sourceMappingURL=subscriberTrigger.js.map
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
exports.generateTestPdf = void 0;
const functions = __importStar(require("firebase-functions"));
const generateGuide_1 = require("./generateGuide");
exports.generateTestPdf = functions.https.onRequest(async (req, res) => {
    var _a, _b;
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).send();
        return;
    }
    try {
        // Get parameters from query string or body
        const language = req.query.language || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.language) || 'en';
        const countryCode = req.query.countryCode || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.countryCode);
        if (!countryCode) {
            res.status(400).json({
                error: 'countryCode parameter is required',
                example: '/generateTestPdf?countryCode=TR&language=en'
            });
            return;
        }
        console.log(`Generating guide data for country: ${countryCode}, language: ${language}`);
        // Generate the guide data
        const result = await (0, generateGuide_1.generateCountryGuide)(language, countryCode);
        // Return the JSON data
        res.set('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            jsonUrl: result.url,
            data: result.data
        });
    }
    catch (error) {
        console.error('Error generating guide data:', error);
        res.status(500).json({
            error: 'Failed to generate guide data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=testPdfEndpoint.js.map
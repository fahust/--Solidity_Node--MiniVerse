"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const city_model_1 = __importDefault(require("../models/city.model"));
async function CreatePet({ owner, name }) {
    return city_model_1.default.create({
        owner,
        name,
    });
}
exports.default = {
    CreatePet,
};

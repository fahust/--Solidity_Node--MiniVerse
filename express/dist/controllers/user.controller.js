"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
async function CreateUser({ email, firstName, lastName, gender, address }) {
    return user_model_1.default.create({
        email,
        gender,
        firstName,
        lastName,
        address
    });
}
exports.default = {
    CreateUser
};

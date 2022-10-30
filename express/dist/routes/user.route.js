"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const pet_controller_1 = __importDefault(require("../controllers/pet.controller"));
exports.default = (app) => {
    app.ws('/echo', (ws, req) => {
        ws.on('message', (msg) => {
            ws.send(msg);
        });
    });
    app.ws('/', function (ws, req) {
        ws.on('message', function (msg) {
            console.log(msg);
        });
        //console.log('socket', req.testing);
    });
    app.post('/api/user', async (req, res) => {
        const user = await user_controller_1.default.CreateUser({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
        const pet = await pet_controller_1.default.CreatePet({
            owner: user._id,
            name: req.body.petName
        });
        return res.send({ user, pet });
    });
};

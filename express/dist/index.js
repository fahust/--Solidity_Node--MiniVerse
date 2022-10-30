"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("./routes"));
const connect_1 = __importDefault(require("./connect"));
const express_ws_1 = __importDefault(require("express-ws"));
const router = express_1.default.Router();
const { app, getWss, applyTo } = (0, express_ws_1.default)((0, express_1.default)());
//const app = expressWs(express()).app;
const port = 8080;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.get("/", (req, res) => res.send("Welcome to the Mongoose & TypeScript example"));
app.listen(port, () => console.log(`Application started successfully on port ${port}.`));
const db = "mongodb://localhost:27017/test";
(0, connect_1.default)({ db });
(0, routes_1.default)(router);

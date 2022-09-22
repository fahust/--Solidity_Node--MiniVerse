"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var jwt = require("jsonwebtoken");
var ethers = require('ethers');
var port = 8088;
var messageSignature = "This is a simple signature that will not cost you any gas, it allows you to verify that you are really the owner of this wallet address";
module.exports = {
    authenticate: function authenticate(app, users) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                app.post('/authenticate', function (req, res) {
                    var jwtUser = jwt.sign({ walletAddress: req.query.walletAddress, password: req.query.password, username: req.query.username }, "secret-key", {
                        expiresIn: 15 * 24 * 60 * 60 * 1000, // 15 days
                    });
                    var userExist = false;
                    Object.keys(users).forEach(function (id) {
                        if (users[id].walletAddress == req.query.walletAddress) {
                            if (users[id].password == req.query.password) {
                                res.send({ code: 200, jwtUser: jwtUser });
                            }
                            else {
                                res.send({ code: 404, message: "Password not valid" });
                            }
                            userExist = true;
                        }
                    });
                    if (!userExist)
                        res.send({ code: 404, message: "User not found" });
                });
                return [2 /*return*/];
            });
        });
    },
    subscribe: function subscribe(app, users) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                app.post('/subscribe', function (req, res) {
                    var recoveredAddress = ethers.utils.verifyMessage(messageSignature, req.query.signature, req.query.walletAddress);
                    if (req.query.walletAddress == recoveredAddress) {
                        var userExist_1 = false;
                        Object.keys(users).forEach(function (walletUser) {
                            if (walletUser == recoveredAddress) {
                                res.send({ code: 404, message: "wallet already exist" });
                                userExist_1 = true;
                            }
                        });
                        if (userExist_1 == false) {
                            users[recoveredAddress] = {
                                "userName": req.query.userName,
                                "walletAddress": recoveredAddress,
                                "password": req.query.password,
                            };
                            res.send({ code: 200, user: users[recoveredAddress] });
                        }
                    }
                    else {
                        res.send({ code: 404, message: "Signature not valid" });
                    }
                });
                return [2 /*return*/];
            });
        });
    },
    listen: function listen(app) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                app.listen(port, function () {
                    console.log("Example app listening on port ".concat(port));
                });
                return [2 /*return*/];
            });
        });
    }
};

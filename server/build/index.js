"use strict";
var WS = require("ws");
var jwt = require("jsonwebtoken");
var express = require('express');
var ethers = require('ethers');
var api = require('./api/authenticate');
var routes = require('./socket/routes');
require('dotenv').config();
var app = express();
var provider = new ethers.providers.InfuraProvider('rinkeby', {
    projectId: process.env.INFURAID,
    projectSecret: process.env.INFURASECRET,
});
var privateKey = process.env.PRIVATEKEY;
var wallet = new ethers.Wallet(privateKey, provider);
var users = {
    "0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C81": {
        "walletAddress": "0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C81",
        "password": "test",
        "userName": "fahust"
    }
};
var clients = {};
api.listen(app);
api.authenticate(app, users);
api.subscribe(app, users);
var wss = new WS.Server({
    verifyClient: function (info, cb) {
        var token = info.req.headers.token;
        if (!token)
            cb(false, 401, "Unauthorized");
        else {
            jwt.verify(token, "secret-key", function (err, decoded) {
                if (err) {
                    cb(false, 401, "Unauthorized");
                }
                else {
                    info.req.user = decoded; //[1]
                    cb(true);
                }
            });
        }
    },
    port: 8080,
});
try {
    wss.on("connection", function (ws, req) {
        var currentJwt = jwt.verify(req.headers.token, 'secret-key');
        clients[currentJwt.walletAddress] = ws;
        ws.on("message", function (msg) {
            routes(ws, wss, msg, wallet, currentJwt, clients);
        });
    });
}
catch (error) {
    console.log(error);
}
wss.on("close", function close() {
});
function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WS.OPEN) {
            client.send(data);
        }
    });
}

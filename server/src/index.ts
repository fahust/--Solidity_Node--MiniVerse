const WS = require("ws");
const jwt = require("jsonwebtoken");
const express = require("express");
const ethers = require("ethers");

const MV = require("./blockchain/abi/MV.json");
const transaction = require("./blockchain/transactions");

const api = require("./api/authenticate");

const routes = require("./socket/route");

require("dotenv").config();

const app = express();
const provider = new ethers.providers.InfuraProvider("rinkeby", {
  projectId: process.env.INFURAID,
  projectSecret: process.env.INFURASECRET,
});
const privateKey = process.env.PRIVATEKEY;
const wallet = new ethers.Wallet(privateKey, provider);

const users = {
  "0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C81": {
    walletAddress: "0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C81",
    password: "test",
    userName: "fahust",
  },
};

let clients = {};

api.listen(app);
api.authenticate(app, users);
api.subscribe(app, users);

const wss = new WS.Server({
  verifyClient: (
    info: { req: { headers: { token: any }; user: object } },
    cb: (arg0: boolean, arg1: number, arg2: string) => void
  ) => {
    const token = info.req.headers["sec-websocket-protocol"];
    if (!token) cb(false, 401, "Unauthorized");
    else {
      jwt.verify(
        token,
        process.env.SECRETKEYJWT,
        (err: Error, decoded: object) => {
          if (err) {
            cb(false, 401, "Unauthorized");
          } else {
            info.req.user = decoded; //[1]
            cb(true, 200, "Authorized");
          }
        }
      );
    }
  },
  port: 8080,
});

try {
  wss.on(
    "connection",
    (
      ws: { on: (arg0: string, arg1: (msg: object) => void) => void },
      req: { headers: { token: any } }
    ) => {
      const currentJwt = jwt.verify(
        req.headers["sec-websocket-protocol"],
        process.env.SECRETKEYJWT
      );
      clients[currentJwt.walletAddress] = ws;

      ws.on("message", (msg: object) => {
        routes(ws, wss, msg, wallet, currentJwt, clients);
      });
    }
  );
} catch (error) {
  console.log(error);
}

wss.on("close", () => {
  // treat close
});

const broadcast = (data: string) => {
  wss.clients.forEach(
    (client: { readyState: any; send: (arg0: string) => void }) => {
      if (client.readyState === WS.OPEN) {
        client.send(data);
      }
    }
  );
};

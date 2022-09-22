const jwtAuthenticate = require("jsonwebtoken");
const ethersAuthenticate = require("ethers");
const port = 8088;
const messageSignature =
  "This is a simple signature that will not cost you any gas, it allows you to verify that you are really the owner of this wallet address";

module.exports = {
  authenticate: async (
    app: { post: (arg0: string, arg1: (req: any, res: any) => void) => void },
    users: [{ password: string }]
  ) => {
    app.post(
      "/authenticate",
      (
        req: { query: { walletAddress: any; password: any; username: any } },
        res: {
          send: (arg0: {
            code: number;
            jwtUser?: any;
            message?: string;
          }) => void;
        }
      ) => {
        const jwtUser = jwtAuthenticate.sign(
          {
            walletAddress: req.query.walletAddress,
            password: req.query.password,
            username: req.query.username,
          },
          process.env.SECRETKEYJWT,
          {
            expiresIn: 15 * 24 * 60 * 60 * 1000, // 15 days
          }
        );
        let userExist = false;
        Object.keys(users).forEach((id) => {
          if (users[id].walletAddress === req.query.walletAddress) {
            if (users[id].password === req.query.password) {
              res.send({ code: 200, jwtUser });
            } else {
              res.send({ code: 404, message: "Password not valid" });
            }
            userExist = true;
          }
        });
        if (!userExist) res.send({ code: 404, message: "User not found" });
      }
    );
  },

  subscribe: async (
    app: { post: (arg0: string, arg1: (req: any, res: any) => void) => void },
    users: { [x: string]: any }
  ) => {
    app.post(
      "/subscribe",
      (
        req: {
          query: {
            signature: any;
            walletAddress: any;
            userName: any;
            password: any;
          };
        },
        res: {
          send: (arg0: { code: number; message?: string; user?: any }) => void;
        }
      ) => {
        const recoveredAddress = ethersAuthenticate.utils.verifyMessage(
          messageSignature,
          req.query.signature,
          req.query.walletAddress
        );
        if (req.query.walletAddress === recoveredAddress) {
          let userExist = false;
          Object.keys(users).forEach((walletUser) => {
            if (walletUser === recoveredAddress) {
              res.send({ code: 404, message: "wallet already exist" });
              userExist = true;
            }
          });
          if (userExist === false) {
            users[recoveredAddress] = {
              userName: req.query.userName,
              walletAddress: recoveredAddress,
              password: req.query.password,
            };
            res.send({ code: 200, user: users[recoveredAddress] });
          }
        } else {
          res.send({ code: 404, message: "Signature not valid" });
        }
      }
    );
  },

  listen: async (app: { listen: (arg0: number, arg1: () => void) => void }) => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  },
};

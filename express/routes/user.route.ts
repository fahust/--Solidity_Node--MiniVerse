import UserController from "../controllers/user.controller";
import PeopleController from "../controllers/people.controller";
import expressWs from "express-ws";
import { IUser } from "../models/user.model";

export default (app: expressWs.Router) => {
  app.ws("/echo", (ws, req) => {
    ws.on("message", (msg: String) => {
      ws.send(msg);
    });
  });
  app.ws("/", function (ws, req) {
    ws.on("message", function (msg) {
      console.log(msg);
    });
    //console.log('socket', req.testing);
  });

  app.post("/api/user", async (req, res) => {
    const user: IUser = await UserController.createUser(req.body.user);
    return res.send({ user });
  });
};

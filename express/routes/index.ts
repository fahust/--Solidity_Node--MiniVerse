import UserRoute from "./user.route";
import expressWs from "express-ws";

export default (app: expressWs.Router) => {
  UserRoute(app);
};

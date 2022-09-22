const item = require("./method/item");
const hero = require("./method/hero");
const game = require("./method/game");
const utils = require("./method/utils");

module.exports = async (
  ws: any,
  wss: any,
  msg: string,
  wallet: any,
  jwt: any,
  clients: any
) => {
  try {
    const parsed = JSON.parse(msg);
    // setter
    if (parsed.route === "levelUp") hero.levelUp(ws, parsed, wallet, jwt);
    if (parsed.route === "mintHero") hero.mintHero(ws, parsed, wallet, jwt);
    if (parsed.route === "farmItem") item.farmItem(ws, parsed, wallet, jwt);
    if (parsed.route === "buyItem") item.buyItem(ws, parsed, wallet, jwt);
    if (parsed.route === "sellItem") item.sellItem(ws, parsed, wallet, jwt);
    if (parsed.route === "buyMV") MV.buyMV(ws, parsed, wallet, jwt);
    if (parsed.route === "sellMV") MV.sellMV(ws, parsed, wallet, jwt);
    // getter
    if (parsed.route === "getAllHeroForUser")
      hero.getAllHeroForUser(ws, parsed, wallet, jwt);
    if (parsed.route === "getHeroDetails")
      hero.getHeroDetails(ws, parsed, wallet, jwt);
    if (parsed.route === "getBalanceOfItem")
      item.getBalanceOfItem(ws, parsed, wallet, jwt);
    if (parsed.route === "getParamsItem")
      item.getParamsItem(ws, parsed, wallet, jwt);
    if (parsed.route === "getCurrentPrice")
      item.getCurrentPrice(ws, parsed, wallet, jwt);
    // game
    if (parsed.route === "move") game.move(parsed, jwt, clients);
  } catch (error) {
    console.log("ROUTE ERROR : ", error);
  }
};

module.exports = {
  farmItem: async (
    ws: { send: (arg0: any) => void },
    msg: { idHero: any; idItem: any },
    wallet: any,
    jwt: { walletAddress: any }
  ) => {
    const heroDetail = await transaction.transaction(
      process.env.ADDRESSDELEGATECONTACT,
      wallet,
      [msg.idHero],
      "getHeroDetails"
    );
    const amount = utils.randomIntFromInterval(
      0,
      heroDetail.params[0] + heroDetail.params[3]
    );
    ws.send(
      await transaction.transaction(
        process.env.ADDRESSDELEGATECONTACT,
        wallet,
        [msg.idItem, amount, jwt.walletAddress],
        "farmItem"
      )
    );
  },

  buyItem: async (ws, msg, wallet, jwt) => {
    // ws.send( await transaction.transaction(msg.contractAddress, wallet,[100],"buyItem") );
  },

  sellItem: async (ws, msg, wallet, jwt) => {
    // ws.send( await transaction.transaction(msg.contractAddress, wallet,[100],"sellItem") );
  },

  getBalanceOfItem: async (ws, msg, wallet, jwt) => {
    // ws.send( await transaction.transaction(msg.contractAddress, wallet,[100],"getBalanceOfItem") );
  },

  getParamsItem: async (ws, msg, wallet, jwt) => {
    // ws.send( await transaction.transaction(msg.contractAddress, wallet,[100],"getParamsItem") );
  },

  getCurrentPrice: async (ws, msg, wallet, jwt) => {
    // ws.send( await transaction.transaction(msg.contractAddress, wallet,[100],"getCurrentPrice") );
  },
};

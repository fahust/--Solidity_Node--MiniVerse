module.exports = {
  levelUp: async (ws, msg, wallet, jwt) => {
    ws.send(
      await transaction.levelUp(
        process.env.ADDRESSDELEGATECONTACT,
        wallet,
        [msg.statToLvlUp, msg.heroId],
        "levelUp"
      )
    );
  },

  mintHero: async (ws, msg, wallet, jwt) => {
    const data = JSON.stringify({
      name: "MVHERO #1",
      description: "",
      image: "https://tam.nyxiesnft.com/img/generated/1.png",
      edition: 0,
      seller_fee_basis_points: 0,
      collection: { name: "MVHERO", family: "CLASSIC" },
      symbol: "NYXS",
      properties: {
        files: [
          {
            uri: "https://tam.nyxiesnft.com/img/generated/1.png",
            type: "image/png",
          },
        ],
        category: "image",
        creators: [
          { address: "0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C80", share: 100 },
        ],
      },
      attributes: [
        { trait_type: "egg", value: 1 },
        { trait_type: "ears", value: "Uncommon" },
        { trait_type: "horn", value: "Rare" },
        { trait_type: "mouth", value: "Rare" },
        { trait_type: "eyes", value: "Common" },
      ],
    });

    const params = [
      jwt.walletAddress,
      "https://nftstorage.link/ipfs/" + (await utils.sendJSONToIpfs(data)),
      [
        utils.randomIntFromInterval(1, 6),
        utils.randomIntFromInterval(1, 6),
        utils.randomIntFromInterval(1, 6),
        utils.randomIntFromInterval(1, 6),
        utils.randomIntFromInterval(1, 6),
        utils.randomIntFromInterval(1, 6),
      ],
    ];
    ws.send(
      JSON.stringify({
        code: 200,
        hero: await transaction.transaction(
          process.env.ADDRESSDELEGATECONTACT,
          wallet,
          params,
          "mintHero"
        ),
      })
    );
  },

  getAllHeroForUser: async (ws, msg, wallet, jwt) => {
    ws.send(
      JSON.stringify(
        await transaction.transaction(
          process.env.ADDRESSDELEGATECONTACT,
          wallet,
          [jwt.walletAddress],
          "getAllHeroForUser"
        )
      )
    );
  },

  getHeroDetails: async (ws, msg, wallet, jwt) => {
    ws.send(
      JSON.stringify(
        await transaction.transaction(
          process.env.ADDRESSDELEGATECONTACT,
          wallet,
          [msg.idHero],
          "getHeroDetails"
        )
      )
    );
  },
};

import { NFTStorage, File, Blob } from "nft.storage";
const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN });

module.exports = {
  sendJSONToIpfs: async (data: object) => {
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });

    try {
      return await client.storeBlob(blob);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  randomIntFromInterval: (min: number, max: number) => {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
};

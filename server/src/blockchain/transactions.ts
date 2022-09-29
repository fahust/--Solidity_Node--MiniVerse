import { ethers } from "ethers";
const call = require("./estimateOrCall");

const instanceContractFunc = async (
  contractAddress: string,
  signer: ethers.Signer
) => {
  return new ethers.Contract(contractAddress, MV.abi, signer);
};

module.exports = {
  transaction: async (
    contractAddress: string,
    signer: ethers.Signer,
    params: [string | number],
    method: string
  ) => {
    try {
      const contract = instanceContractFunc(contractAddress, signer);
      const gasLimit = await call.estimate(contract, method, params, "");
      const tx = await call.call(contract, method, params, "", gasLimit);
      return await tx.wait();
    } catch (error) {
      throw error;
    }
  },

  instanceContract: instanceContractFunc,
};

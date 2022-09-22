import { ethers } from "ethers";

module.exports = {
  estimate: async (
    dpInstance: ethers.Contract,
    functionName: string,
    args: [
      | string
      | number
      | { value: string; gasLimit: string }
      | { value: string }
      | { gasLimit: string }
    ],
    value: string
  ) => {
    let arg = [];
    if (value !== "" && value && args && args.length > 0) {
      args?.push({ value });
      arg = args;
    } else if (value !== "" && value) {
      arg = [{ value }];
    } else if (args && args.length > 0) {
      arg = args;
    }
    const estimatedGas = await dpInstance.estimateGas[functionName](...arg);

    return estimatedGas;
  },

  call: async (
    dpInstance: ethers.Contract,
    functionName: string,
    args: [
      | string
      | number
      | { value: string; gasLimit: string }
      | { value: string }
      | { gasLimit: string }
    ],
    value: string,
    estimatedGas: string
  ) => {
    let arg = [];
    if (value !== "" && value && args && args.length > 0) {
      args?.push({ value, gasLimit: estimatedGas });
      arg = args;
    } else if (value !== "" && value) {
      arg = [{ value, gasLimit: estimatedGas }];
    } else if (args && args.length > 0) {
      args?.push({ gasLimit: estimatedGas });
      arg = args;
    }
    const returnedValue = await dpInstance[functionName](...arg);
    return returnedValue;
  },
};

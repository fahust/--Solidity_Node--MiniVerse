const {BigNumber, ethers} = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
var RLP = require('rlp');
const KANJIDROPERC721AWithReceive = artifacts.require("KANJIDROPERC721AWithReceive");
const HackContract = artifacts.require("HackContract");
const SimulateOpenSea = artifacts.require("SimulateOpenSea");

function hashLeafNode(
    address,
    maxClaimableAmount,
) {
    return ethers.utils.solidityKeccak256(
        ["address", "uint256"],
        [address, BigNumber.from(maxClaimableAmount)],
    );
}

/**
 * LIST OF ACCOUNTS IN TEST :
 * const kanji_Account = accounts[0];
 * const brand_Account = accounts[1];
 * const brand_client_account = accounts[2];
 * const brand_client_account2 = accounts[3];
 * const accountBrandsRoyalties1 = accounts[4];
 * const accountBrandsRoyalties2 = accounts[5];
 * const kanjiAddressFeesBeneficiaries = accounts[6];
 * const accountBrandBeneficiaries1 = accounts[7];
 * const accountBrandBeneficiaries2 = accounts[8];
 * const senderRoyalties = accounts[9];
 */


contract("KANJIDROPERC721AWithReceive", async accounts => {

    let tokens = {};
    accounts.forEach((element,key) => {
        tokens[key] = element;
    });

    const kanjiAddressFeesBeneficiaries = accounts[6];
    const accountBeneficiaries1 = accounts[7];
    const accountBeneficiaries2 = accounts[8];
    const senderRoyalties = accounts[9];
    const cloneAccounts = [];
    const cloneAccountsValue = [];
    const countRoyalties = 2;

    //for 30 account in royalties, send transaction to receive function cost 4420619999903744 wei
    //for 10 account in royalties, send transaction to receive function cost 1545619999948800 wei
    //for 2 account in royalties, send transaction to receive function cost 395619999940608 wei

    for (let index = 5; index < countRoyalties+5; index++) {
        cloneAccounts[index] = accounts[index]
        cloneAccountsValue[index] = 100
    }
    
    before(async function() {
        it('SUCCESS : Precalculate address of drop contract', async function () {
            let nonceME = await web3.eth.getTransactionCount("0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C80");
            console.log("we get the number of transactions of account deployer : ",nonceME)
            var preGeneratedAddressOfDeployedNextContract = "0x" + web3.utils.sha3(
                RLP.encode(
                    ["0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C80",40]
                )
            ).slice(12).substring(14)
            ///this address will be added to the address that will receive the royalties from the platforms (opensea, etc.) contained in the contracturi
            console.log(preGeneratedAddressOfDeployedNextContract)
        })


        let accountsWithoutOne = accounts;
        accountsWithoutOne.splice(1,accounts.length);

        const hashedLeafs = accountsWithoutOne.map((i) =>
            hashLeafNode(
            i,
            0,
            )
        );
        this.tree = new MerkleTree(hashedLeafs, keccak256, {
            sort: true,
        });

        this.buyDropWithReceive = await KANJIDROPERC721AWithReceive.new(
            'Name',
            'Symbol',
            500,
            kanjiAddressFeesBeneficiaries,
            500,
            cloneAccounts,
            cloneAccountsValue,
            [accountBeneficiaries1,accountBeneficiaries2],
            [8000,1500],
            "contracturi"
        );// we deploy contract

        console.log(this.buyDropWithReceive.address)// and see if address is same of precalculate
    });

    describe('simulate send splitter open sea', async function () {

        it('SUCCESS : simulate opensea', async function () {
            this.SimulateOpenSea = await SimulateOpenSea.new();// we deploy contract
        })

        it('SUCCESS : send transaction', async function () {
            let arrayBalance = [];
            let sendEth = 100000000000000000;
            let actualBalance = 0;

            let senderbalance = await web3.eth.getBalance(senderRoyalties);
            console.log("sender of eth before paiement : ",senderbalance)
            
            for (let index = 5; index < countRoyalties+5; index++) {
                actualBalance = await web3.eth.getBalance(cloneAccounts[index]);
                arrayBalance[index] = actualBalance;
                console.log("account balance WEI receiver "+index+" : ",actualBalance)
            }

            await this.SimulateOpenSea.sendTransaction({from:senderRoyalties,value:sendEth})
            let actualBalanceOpenSea = await web3.eth.getBalance(this.SimulateOpenSea.address);
            console.log("actualBalanceOpenSea",actualBalanceOpenSea)

            await this.SimulateOpenSea.sendFund(this.buyDropWithReceive.address,{from:senderRoyalties})
            

            for (let index = 5; index < countRoyalties+5; index++) {
                actualBalance = await web3.eth.getBalance(cloneAccounts[index]);
                console.log("account balance WEI receiver : "+index,actualBalance)
            }

            let senderbalance2 = await web3.eth.getBalance(senderRoyalties);
            console.log("sender of eth after paiement : ",senderbalance2)
            console.log("difference : ",parseInt(senderbalance)-parseInt(senderbalance2))

        });

        it('SUCCESS : deploy hack contract and add address hack contract to new drop contract', async function () {
            this.hackContract = await HackContract.new();

            console.log("accounts in royalties : ",cloneAccounts)

            cloneAccounts[cloneAccounts.length+1] = this.hackContract.address;
            cloneAccountsValue[cloneAccountsValue.length+1] = 100;

            this.buyDropWithReceive = await KANJIDROPERC721AWithReceive.new(
                'Name',
                'Symbol',
                500,
                kanjiAddressFeesBeneficiaries,
                500,
                cloneAccounts,
                cloneAccountsValue,
                [accountBeneficiaries1,accountBeneficiaries2],
                [8500,1000],
                "contracturi"
            );// we deploy contract
            console.log("accounts in royalties : ",cloneAccounts)
        })

        it('SUCCESS : send transaction with hack contract', async function () {
            let arrayBalance = [];
            let sendEth = 100000000000000000;
            let actualBalance = 0;

            let senderbalance = await web3.eth.getBalance(senderRoyalties);
            console.log("sender of eth before paiement : ",senderbalance)
            
            for (let index = 5; index < countRoyalties+5; index++) {
                if(index >= countRoyalties+5){
                    actualBalance = await web3.eth.getBalance(this.hackContract.address);
                    arrayBalance[index] = actualBalance;
                    console.log("account balance WEI hack contract : ",actualBalance)
                }else{
                    actualBalance = await web3.eth.getBalance(cloneAccounts[index]);
                    arrayBalance[index] = actualBalance;
                    console.log("account balance WEI receiver "+index+" : ",actualBalance)
                }
            }

            await this.SimulateOpenSea.sendTransaction({from:senderRoyalties,value:sendEth})

            await this.SimulateOpenSea.sendFund(this.buyDropWithReceive.address,{from:senderRoyalties})

            for (let index = 5; index < countRoyalties+5; index++) {
                if(index >= countRoyalties+5){
                    actualBalance = await web3.eth.getBalance(this.hackContract.address);
                    arrayBalance[index] = actualBalance;
                    console.log("account balance WEI hack contract : ",actualBalance)
                }else{
                    actualBalance = await web3.eth.getBalance(cloneAccounts[index]);
                    arrayBalance[index] = actualBalance;
                    console.log("account balance WEI receiver "+index+" : ",actualBalance)
                }
            }

            let senderbalance2 = await web3.eth.getBalance(senderRoyalties);
            console.log("sender of eth after paiement : ",senderbalance2)
            console.log("difference : ",parseInt(senderbalance)-parseInt(senderbalance2))
        });
    })
});

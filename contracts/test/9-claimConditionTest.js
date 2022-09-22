const {BigNumber, ethers} = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
var RLP = require('rlp');
const ArtifactKANJIDROPERC721A = artifacts.require("KANJIDROPERC721A");
const ArtifactKANJIDROPERC1155 = artifacts.require("KANJIDROPERC1155");
const HackContract = artifacts.require("HackContract");
const truffleAssert = require('truffle-assertions');
const fs = require('fs');

function hashLeafNode(
    address,
    maxClaimableAmount,
) {
    return ethers.utils.solidityKeccak256(
        ["address", "uint256"],
        [address, BigNumber.from(maxClaimableAmount)],
    );
}

async function hashDelayRevealPasword(
    batchTokenIndex,
    password,
    contractAddress
) {
    const chainId = await web3.eth.getChainId();
    return ethers.utils.solidityKeccak256(
        ["string", "uint256", "uint256", "address"],
        [password, chainId, batchTokenIndex+"", contractAddress],
    );
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


contract("REVEAL", async accounts => {
    let tokens = {};
    accounts.forEach((element,key) => {
        tokens[key] = element;
    });

    let condition = {};

    let analytics = {
        "tokenBuyed" : 0,
        "ethSendForBuySuccess" : 0,
        "ethSendForBuyError" : 0,
    }

    const kanji_account = accounts[0];
    const brand_Account = accounts[1];
    const brand_client_account = accounts[2];
    const brand_client_account2 = accounts[3];
    const accountBeneficiaries1 = accounts[7];
    const accountBeneficiaries2 = accounts[8];
    const kanjiAddressFeesBeneficiaries = accounts[6];
    const countRoyalties = 2;
    const cloneAccounts = [];
    const cloneAccountsValue = [];

    let KANJIDROPERC1155 = null;
    let KANJIDROPERC721A = null;

    //for 30 account in royalties, send transaction to receive function cost 4420619999903744 wei
    //for 10 account in royalties, send transaction to receive function cost 1545619999948800 wei
    //for 2 account in royalties, send transaction to receive function cost 395619999940608 wei

    for (let index = 5; index < countRoyalties+5; index++) {
        cloneAccounts[index] = web3.utils.toChecksumAddress(accounts[index])
    }

    const cloneAccountsfiltered = cloneAccounts.filter(function(x) {
        return x !== undefined;
    });

    for (let index = 0; index < cloneAccountsfiltered.length; index++) {
        cloneAccountsValue[index] = 100
    }
    
    before(async function() {

        it('SUCCESS : Precalculate address of reveal contract', async function () {
            let nonceME = await web3.eth.getTransactionCount("0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C80");
            console.log("we get the number of transactions of account deployer : ",nonceME)
            var preGenAddressContract = "0x" + web3.utils.sha3(
                RLP.encode(
                    ["0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C80",40]
                )).slice(12)
                .substring(14)
            ///this address will be added to the address that will receive the royalties from the platforms (opensea, etc.) contained in the contracturi
            console.log("We make a calculation on the address of the creator and the number of transactions to generate the address of the future deployed contract : ",preGenAddressContract)
        })

        const hashedLeafs = [brand_client_account].map((i) =>
            hashLeafNode(
            i,
            0,//ethers.utils.parseUnits(maxClaimable, tokenDecimals),
            )
        );
        this.tree = new MerkleTree(hashedLeafs, keccak256, {
            sort: true,
        });
        console.log("clone account filtedred",cloneAccountsfiltered)
        KANJIDROPERC721A = await ArtifactKANJIDROPERC721A.new(
            'Name',
            'Symbol',
            500,//Fees royalties for superrare
            kanjiAddressFeesBeneficiaries,//Address of Arkania fees
            500,//5% fees of arkania
            cloneAccountsfiltered,//accounts royalties for fees open sea (by payment splitter)
            cloneAccountsValue,//% royalties for fees open sea (by payment splitter)
            [accountBeneficiaries1,accountBeneficiaries2],//accounts beneficiaries
            [4750,4750],//47.5/47.5% fees beneficiaries
            "contracturi",
            1000,
            {from: brand_Account}
        );// we deploy contract

        console.log(KANJIDROPERC721A.address)// and see if address is same of precalculate
    });

    describe('simulate send splitter open sea', async function () {

        it('ERROR : deploy contract with not good max_bps beneficiaries count total', async function () {
            ArtifactKANJIDROPERC721A.new(
                'Name',
                'Symbol',
                500,//Fees royalties for superrare
                kanjiAddressFeesBeneficiaries,//Address of Arkania fees
                500,//5% fees of arkania
                cloneAccountsfiltered,//accounts royalties for fees open sea (by payment splitter)
                cloneAccountsValue,//% royalties for fees open sea (by payment splitter)
                [accountBeneficiaries1,accountBeneficiaries2],//accounts beneficiaries
                [4750,4760],// 47.5/47.6% fees beneficiaries
                "contracturi",
                1000,
                {from: brand_Account}
            ).catch((error)=>{
                console.log(error)
            })
            console.log("accounts in royalties : ",cloneAccountsfiltered)
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\n\n\nDROP CONTRACT', function (err) {
                    if (err) throw err;
                });
            });
        })

        it('SUCCESS : send transaction', async function () {
            let arrayBalance = [];
            let actualBalance = 0;

            let senderbalance = await web3.eth.getBalance(brand_Account);
            console.log("sender of eth before paiement : ",senderbalance)
            
            for (let index = 0; index < countRoyalties; index++) {
                actualBalance = await web3.eth.getBalance(web3.utils.toChecksumAddress(cloneAccountsfiltered[index]));
                arrayBalance[index] = actualBalance;
                console.log("account balance WEI receiver "+index+" : ",actualBalance)
            }

            await KANJIDROPERC721A.sendTransaction({from:brand_Account,value:"100000000000000000"})

            await KANJIDROPERC721A.releaseAll({from:brand_Account})

            for (let index = 0; index < countRoyalties; index++) {
                actualBalance = await web3.eth.getBalance(web3.utils.toChecksumAddress(cloneAccountsfiltered[index]));
                console.log("account balance WEI receiver : "+index,actualBalance)
            }

            let senderbalance2 = await web3.eth.getBalance(brand_Account);
            console.log("sender of eth after paiement : ",senderbalance2)
            console.log("difference : ",parseInt(senderbalance)-parseInt(senderbalance2))

        });

        it('SUCCESS : deploy hack contract and add address hack contract to new reveal contract', async function () {
            this.hackContract = await HackContract.new();

            console.log("accounts in royalties : ",cloneAccountsfiltered)
            
            cloneAccountsfiltered[cloneAccountsfiltered.length+1] = web3.utils.toChecksumAddress(this.hackContract.address);
            cloneAccountsValue[cloneAccountsValue.length+1] = 100;

            KANJIDROPERC721A = await ArtifactKANJIDROPERC721A.new(
                'Name',
                'Symbol',
                500,//Fees royalties for superrare
                kanjiAddressFeesBeneficiaries,//Address of Arkania fees
                500,//5% fees of arkania
                cloneAccountsfiltered,//accounts royalties for fees open sea (by payment splitter)
                cloneAccountsValue,//% royalties for fees open sea (by payment splitter)
                [accountBeneficiaries1,accountBeneficiaries2],//accounts beneficiaries
                [4750,4750],// 47.5/47.5% fees beneficiaries
                "contracturi",
                1000,
                {from: brand_Account}
            );
            console.log("accounts in royalties : ",cloneAccountsfiltered)
        })
    })

    describe('Phase 1 not in whitelist', async function () {
        it('SUCCESS : lazy mint', async function () {
            await KANJIDROPERC721A.lazyMint(
                1000,
                "ipfs://ipfsHash/0",
                ethers.utils.toUtf8Bytes(""),
                {from: brand_Account}
            )
        });

        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-10,
                    endTimestamp : Math.floor(Date.now()/1000)+1000,
                    maxClaimableSupply : 100,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "1",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                },
                {
                    startTimestamp : Math.floor(Date.now()/1000)+1005,
                    endTimestamp : Math.floor(Date.now()/1000)+1050,
                    maxClaimableSupply : 900,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "2",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC721A.setClaimConditions( claimConditions, true, {from: brand_Account})
        });

        it('SUCCESS : claim token 10 tokens id 0 with brand_client_account_2', async function () {
            console.log("wait 11 sec")
            await timeout(11000);
            await KANJIDROPERC721A.claim(
                brand_client_account,
                10,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                1,
                [],
                0,
                {from: brand_client_account,value:10}
            )
        })

        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-10,
                    endTimestamp : Math.floor(Date.now()/1000)+1000,
                    maxClaimableSupply : 100,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "3",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                },
                {
                    startTimestamp : Math.floor(Date.now()/1000)+1005,
                    endTimestamp : Math.floor(Date.now()/1000)+1050,
                    maxClaimableSupply : 900,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "4",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC721A.setClaimConditions( claimConditions, true, {from: brand_Account})
        });

        it('SUCCESS : update claim conditions', async function () {
            
            console.log(await KANJIDROPERC721A.getClaimConditionById( 0, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 1, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 2, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 3, {from: brand_Account}))
        });



        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-10,
                    endTimestamp : Math.floor(Date.now()/1000)+1000,
                    maxClaimableSupply : 100,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "5",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                },
                {
                    startTimestamp : Math.floor(Date.now()/1000)+1005,
                    endTimestamp : Math.floor(Date.now()/1000)+1050,
                    maxClaimableSupply : 900,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "6",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC721A.setClaimConditions( claimConditions, false, {from: brand_Account})
        });

        it('SUCCESS : update claim conditions', async function () {
            
            console.log(await KANJIDROPERC721A.getClaimConditionById( 0, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 1, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 2, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 3, {from: brand_Account}))
        });




        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-10,
                    endTimestamp : Math.floor(Date.now()/1000)+1000,
                    maxClaimableSupply : 100,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "5",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                },
                {
                    startTimestamp : Math.floor(Date.now()/1000)+1005,
                    endTimestamp : Math.floor(Date.now()/1000)+1050,
                    maxClaimableSupply : 900,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "6",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC721A.setClaimConditions( claimConditions, true, {from: brand_Account})
        });

        it('SUCCESS : update claim conditions', async function () {
            
            console.log(await KANJIDROPERC721A.getClaimConditionById( 0, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 1, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 2, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 3, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 4, {from: brand_Account}))
            console.log(await KANJIDROPERC721A.getClaimConditionById( 5, {from: brand_Account}))
        });


    });


});
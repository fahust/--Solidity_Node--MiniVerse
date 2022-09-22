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
                    pricePerToken : "100000000000000000",
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
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC721A.setClaimConditions( claimConditions, false, {from: brand_Account})
        });

        it('ERROR : claim 1000 token brand_Account for good price', async function () {
            analytics["ethSendForBuyError"] += 100000000000000000000;
            await truffleAssert.reverts(
                KANJIDROPERC721A.claim(
                    brand_client_account,
                    1000,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                    10,
                    [],
                    0,
                    {from: brand_client_account,value:"100000000000000000000"}
                )
            )
        });

        it('ERROR : claim 100 token brand_Account for bad price', async function () {
            analytics["ethSendForBuyError"] += 10;
            await truffleAssert.reverts(
                KANJIDROPERC721A.claim(
                    brand_client_account2,
                    100,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    10,
                    [],
                    0,
                    {from: brand_client_account2,value:10}
                )
            )
        });

        it('ERROR : claim 100 token brand_Account for not corresponding price', async function () {
            analytics["ethSendForBuyError"] += 10;
            await truffleAssert.reverts(
                KANJIDROPERC721A.claim(
                    brand_client_account,
                    100,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    10,
                    [],
                    0,
                    {from: brand_client_account,value:10}
                )
            )
        });

        it('SUCCESS : claim 100 token brand_Account for good price ', async function () {
            analytics["ethSendForBuySuccess"] += 10000000000000000000;
            analytics["tokenBuyed"] += 100;
            await KANJIDROPERC721A.claim(
                brand_client_account,
                100,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                [],
                0,
                {from: brand_client_account,value:"10000000000000000000"}
            )
        });

        it('ERROR : claim brand_Account 1 for good price but already claim in this phase', async function () {
            analytics["ethSendForBuyError"] += 10;
            await truffleAssert.reverts(
                KANJIDROPERC721A.claim(
                    brand_client_account,
                    1,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    10,
                    [],
                    0,
                    {from: brand_client_account,value:10}
                )
            )
        });

        

    });

    
    describe('Mint revealable and reveal ERC721A', async function () {
        it('SUCCESS : lazy mint 2', async function () {
            let tokenToMint = 1000;
            let indexEncrypt = await KANJIDROPERC721A.nextTokenIdToMint({from: brand_Account});
            console.log(parseInt(indexEncrypt+"")+tokenToMint)
            let hash = await hashDelayRevealPasword(parseInt(indexEncrypt+"")+tokenToMint,"password",KANJIDROPERC721A.address);
            console.log("first hash : ",hash)
            const encryptedBaseUri =
            await KANJIDROPERC721A.encryptDecrypt(
                ethers.utils.toUtf8Bytes(
                    "ipfs://ipfsHash/mybaseuri/",
                ),
                hash
            );
            await KANJIDROPERC721A.lazyMint(
                tokenToMint,
                "ipfs://ipfsHash/",
                encryptedBaseUri,
                {from: brand_Account}
            )
        });

        it(' SUCCESS : get token uri 1002 before reveal', async function () {
            console.log("get token uri 1002 before reveal",await KANJIDROPERC721A.tokenURI(1002,{from: brand_Account}))
        });

        it('ERROR : reveal', async function () {
            try {
                let baseURIIndex = 1;
                
                let indexEncrypt = await KANJIDROPERC721A.baseURIIndices(baseURIIndex,{from: brand_Account});
                console.log(indexEncrypt+"")
                let encryptedBaseURI = await KANJIDROPERC721A.encryptedBaseURI(indexEncrypt+"",{from: brand_Account});
                console.log(encryptedBaseURI)
                let hash = await hashDelayRevealPasword(indexEncrypt+"","falsePassword",KANJIDROPERC721A.address);
                console.log(hash)
                let decryptedUri = await KANJIDROPERC721A.encryptDecrypt(
                    encryptedBaseURI,
                    hash,
                );
                decryptedUri =  web3.utils.hexToAscii(decryptedUri)
                console.log(decryptedUri)
                if (!decryptedUri.includes("://") || !decryptedUri.endsWith("/")) {
                    throw new Error("invalid password");
                }
                await KANJIDROPERC721A.reveal(
                    1,
                    hash,
                    {from: brand_Account}
                )
            } catch(error) {
                console.log(error)
            }
        });

        it('SUCCESS : reveal', async function () {
            let baseURIIndex = 1;
            
            let indexEncrypt = await KANJIDROPERC721A.baseURIIndices(baseURIIndex,{from: brand_Account});
            console.log(indexEncrypt+"")
            let encryptedBaseURI = await KANJIDROPERC721A.encryptedBaseURI(indexEncrypt+"",{from: brand_Account});
            console.log(encryptedBaseURI)
            let hash = await hashDelayRevealPasword(indexEncrypt+"","password",KANJIDROPERC721A.address);
            console.log(hash)
            let decryptedUri = await KANJIDROPERC721A.encryptDecrypt(
                encryptedBaseURI,
                hash,
            );
            console.log(decryptedUri)
            decryptedUri =  web3.utils.hexToAscii(decryptedUri)
            console.log(decryptedUri)
            if (!decryptedUri.includes("://") || !decryptedUri.endsWith("/")) {
                throw new Error("invalid password");
            }
            await KANJIDROPERC721A.reveal(
                1,
                hash,
                {from: brand_Account}
            )
        });

        it('SUCCESS : get token uri 1002 after reveal', async function () {
            console.log("get token uri 1002 after reveal",await KANJIDROPERC721A.tokenURI(1002,{from: brand_Account}))
        });
    })

    describe('Phase 2 whitelist', async function () {

        const hashedLeafs = [brand_client_account].map((i) =>
            hashLeafNode(
            i,
            0,//ethers.utils.parseUnits(maxClaimable, tokenDecimals),
            )
        );
        this.tree = new MerkleTree(hashedLeafs, keccak256, {
            sort: true,
        });

        it('SUCCESS : get claim 0', async function () {
            console.log("Condition : ",await KANJIDROPERC721A.getClaimConditionById(0, {from: brand_Account}))
        })


        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-5,
                    endTimestamp : Math.floor(Date.now()/1000)+1000,
                    maxClaimableSupply : 200,//bigger than last 
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : this.tree.getHexRoot(),
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                },
                {
                    startTimestamp : Math.floor(Date.now()/1000)+50,
                    endTimestamp : Math.floor(Date.now()/1000)+1200,
                    maxClaimableSupply : 750,//bigger than last 
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : this.tree.getHexRoot(),
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC721A.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('SUCCESS : claim 1 token brand_Account for good price ', async function () {
            console.log("await 10 seconds")
            await timeout(10000);
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["ethSendForBuySuccess"] += 100000000000000000;
            analytics["tokenBuyed"] += 1;

            await KANJIDROPERC721A.claim(
                brand_client_account,
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                expectedProof,
                0,
                {from: brand_client_account,value:"100000000000000000"}
            )
        });

        it('ERROR : claim kanji_account not in whitelist', async function () {
            const expectedProof = ethers.utils.formatBytes32String("");
            analytics["ethSendForBuyError"] += 100000000000000000;

            await KANJIDROPERC721A.claim(
                kanji_account,
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                expectedProof,
                0,
                {from: kanji_account,value:"100000000000000000"}
            ).catch(() => {
                console.log("whitelist not approved")
            });
        });
        
    });

    describe('Phase 3 free nft', async function () {

        it('SUCCESS : update claim conditions', async function () {
            
            let condition1 = await KANJIDROPERC721A.getClaimConditionById(0, {from: brand_Account})

            const claimConditions = [
                condition1,
                {
                    startTimestamp : Math.floor(Date.now()/1000)-10,
                    endTimestamp : Math.floor(Date.now()/1000)+1000,
                    maxClaimableSupply : 200,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : this.tree.getHexRoot(),
                    pricePerToken : 0,
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC721A.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('SUCCESS : claim 1 token brand_Account for good price ', async function () {
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["tokenBuyed"] += 1;
            await KANJIDROPERC721A.claim(
                brand_client_account,
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                0,
                expectedProof,
                0,
                {from: brand_client_account,value:0}
            )
        });

    })

    describe('Max count', async function () {

        it('SUCCESS : setMaxWalletClaimCount ', async function () {
            await KANJIDROPERC721A.setMaxWalletClaimCount( 1000, {from: brand_Account,value:0})
        });

        it('SUCCESS : claim 1 token brand_client_account for good price ', async function () {
            console.log("await 11 seconds")
            await timeout(11000);

            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            
            analytics["tokenBuyed"] += 1;

            await KANJIDROPERC721A.claim(
                brand_client_account,
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                0,
                expectedProof,
                0,
                {from: brand_client_account,value:0}
            )
        });

        it('SUCCESS : setMaxWalletClaimCount ', async function () {
            await KANJIDROPERC721A.setMaxWalletClaimCount( 10, {from: brand_Account,value:0})
        });

        it('ERROR : claim 1 token brand_client_account for good price ', async function () {
            console.log("await 11 seconds")
            await timeout(11000);

            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );

            await truffleAssert.reverts(
                KANJIDROPERC721A.claim(
                    brand_client_account,
                    1,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    0,
                    expectedProof,
                    0,
                    {from: brand_client_account,value:0}
                )
            )
        });

        it('SUCCESS : setMaxWalletClaimCount ', async function () {
            await KANJIDROPERC721A.setMaxWalletClaimCount( 1000, {from: brand_Account,value:0})
        });
        
    })

    describe('GETTER', async function () {
        it('SUCCESS : getActiveClaimConditionId ', async function () {
            console.log("getActiveClaimConditionId : ",
                await KANJIDROPERC721A.getActiveClaimConditionId({from: brand_Account,value:0})+""
            )
        });
        it('SUCCESS : getClaimTimestamp ', async function () {
            console.log("getClaimTimestamp : ",
                await KANJIDROPERC721A.getClaimTimestamp(0, brand_Account,{from: brand_Account,value:0})
            )
        });
        it('SUCCESS : getClaimConditionById ', async function () {
            console.log("getClaimConditionById : ",
                await KANJIDROPERC721A.getClaimConditionById(0,{from: brand_Account,value:0})
            )
        });
    })



    
    /// REVEAL ERC1155
    
    
    before(async function() {

        const hashedLeafs = [brand_client_account].map((i) =>
            hashLeafNode(
            i,
            0,//ethers.utils.parseUnits(maxClaimable, tokenDecimals),
            )
        );
        this.tree = new MerkleTree(hashedLeafs, keccak256, {
            sort: true,
        });

        const accountsFees = [accountBeneficiaries1,accountBeneficiaries2].filter(function(x) {
            return x !== undefined;
        });
        let accountsFeesValue = [];

        for (let index = 0; index < accountsFees.length; index++) {
            accountsFeesValue[index] = ((10000-500)/accountsFees.length)
        }
        KANJIDROPERC1155 = await ArtifactKANJIDROPERC1155.new(
            500,//Fees royalties for superrare
            kanjiAddressFeesBeneficiaries,//Address of Arkania fees
            500,//5% fees of arkania
            cloneAccountsfiltered,//accounts royalties for fees open sea (by payment splitter)
            cloneAccountsValue,//% royalties for fees open sea (by payment splitter)
            accountsFees,//accounts beneficiaries
            accountsFeesValue,//%  fees beneficiaries
            "contracturi",
            1000,
            1000,
            {from: brand_Account}
        );// we deploy contract

        console.log(KANJIDROPERC1155.address)// and see if address is same of precalculate
    });

    describe('simulate send splitter open sea', async function () {
        it('SUCCESS : send transaction', async function () {
            let arrayBalance = [];
            let actualBalance = 0;

            let senderbalance = await web3.eth.getBalance(brand_Account);
            console.log("sender of eth before paiement : ",senderbalance)
            
            for (let index = 0; index < countRoyalties; index++) {
                actualBalance = await web3.eth.getBalance(cloneAccountsfiltered[index]);
                arrayBalance[index] = actualBalance;
                console.log("account balance WEI receiver "+index+" : ",actualBalance)
            }

            await KANJIDROPERC1155.sendTransaction({from:brand_Account,value:"100000000000000000"})

            await KANJIDROPERC1155.releaseAll({from:brand_Account})

            for (let index = 0; index < countRoyalties; index++) {
                actualBalance = await web3.eth.getBalance(cloneAccountsfiltered[index]);
                
                console.log("account balance WEI receiver : "+index,actualBalance)
            }

            let senderbalance2 = await web3.eth.getBalance(brand_Account);
            console.log("sender of eth after paiement : ",senderbalance2)
            console.log("difference : ",parseInt(senderbalance)-parseInt(senderbalance2))

        });

        it('SUCCESS : deploy hack contract and add address hack contract to new reveal contract', async function () {
            this.hackContract = await HackContract.new();

            console.log("accounts in royalties : ",cloneAccountsfiltered)
            
            cloneAccountsfiltered[cloneAccountsfiltered.length+1] = this.hackContract.address;
            cloneAccountsValue[cloneAccountsValue.length+1] = 100;

            const accountsFees = [accountBeneficiaries1,accountBeneficiaries2].filter(function(x) {
                return x !== undefined;
            });
            let accountsFeesValue = [];
    
            for (let index = 0; index < accountsFees.length; index++) {
                accountsFeesValue[index] = ((10000-500)/accountsFees.length)
            }

            KANJIDROPERC1155 = await ArtifactKANJIDROPERC1155.new(
                500,//Fees royalties for superrare
                kanjiAddressFeesBeneficiaries,//Address of Arkania fees
                500,//5% fees of arkania
                cloneAccountsfiltered,//accounts royalties for fees open sea (by payment splitter)
                cloneAccountsValue,//% royalties for fees open sea (by payment splitter)
                accountsFees,//accounts beneficiaries
                accountsFeesValue,//% fees beneficiaries
                "contracturi",
                1000,
                1000,
                {from: brand_Account}
            );// we deploy contract
            console.log("accounts in royalties : ",cloneAccountsfiltered)
        })
    })

    describe('Phase 1 not in whitelist', async function () {


        it('SUCCESS : lazy mint', async function () {
            await KANJIDROPERC1155.lazyMint( 1000, "ipfs://ipfsHash/0",ethers.utils.toUtf8Bytes(""), {from: brand_Account})
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
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC1155.setClaimConditions(0,claimConditions,false, {from: brand_Account})
        });

        it('ERROR : claim 1000 token brand_client_account for good price', async function () {
                analytics["ethSendForBuyError"] += 100000000000000000;
            await truffleAssert.reverts(
                KANJIDROPERC1155.claim(
                    brand_client_account,
                    0,
                    "100000000000000000",
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    1,
                    [],
                    0,
                    {from: brand_client_account,value:"100000000000000000"}
                )
            )
        });

        it('ERROR : claim 100 token brand_client_account for bad price', async function () {
            analytics["ethSendForBuyError"] += 1000000000000000;
            await truffleAssert.reverts(
                KANJIDROPERC1155.claim(
                    brand_client_account,
                    0,
                    "100000000000000000",
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    "100000000000000000",
                    [],
                    0,
                    {from: brand_client_account,value:"1000000000000000"}
                )
            )
        });

        it('ERROR : claim 100 token brand_Account for not corresponding price', async function () {
            analytics["ethSendForBuyError"] += 10000000000000000;
            await truffleAssert.reverts(
                KANJIDROPERC1155.claim(
                    brand_client_account,
                    0,
                    100,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    10,
                    [],
                    0,
                    {from: brand_client_account,value:"10000000000000000"}
                )
            )
        });

        it('SUCCESS : claim 10 token brand_client_account for good price ', async function () {
            analytics["ethSendForBuySuccess"] += 10000000000000000000;
            analytics["tokenBuyed"] += 10;
            await KANJIDROPERC1155.claim(
                brand_client_account,
                0,
                10,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                [],
                0,
                {from: brand_client_account,value:"1000000000000000000"}
            )
        });

        it('ERROR : claim 10000 token brand_client_account for good price ', async function () {
            await truffleAssert.reverts(
                KANJIDROPERC1155.claim(
                    brand_client_account,
                    0,
                    10000,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    "100000000000000000",
                    [],
                    0,
                    {from: brand_client_account,value:"1000000000000000000000"}
                )
            )
        });

        it('ERROR : claim brand_client_account 1 for good price but already claim in this phase', async function () {
            analytics["ethSendForBuyError"] += 10;
            await truffleAssert.reverts(
                KANJIDROPERC1155.claim(
                    brand_client_account,
                    0,
                    1,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    10,
                    [],
                    0,
                    {from: brand_client_account,value:10}
                )
            )
        });

        

    });

    
    describe('Phase 2 whitelist', async function () {

        const hashedLeafs = [brand_client_account].map((i) =>
            hashLeafNode(
            i,
            0,//ethers.utils.parseUnits(maxClaimable, tokenDecimals),
            )
        );
        this.tree = new MerkleTree(hashedLeafs, keccak256, {
            sort: true,
        });

        it('SUCCESS : get claim 1', async function () {
            condition = await KANJIDROPERC1155.getClaimConditionById(0,0, {from: brand_Account})
            console.log(condition)
        })


        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-5,
                    endTimestamp : Math.floor(Date.now()/1000)+1000,
                    maxClaimableSupply : 200,//bigger than last 
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : this.tree.getHexRoot(),
                    pricePerToken : 100,
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC1155.setClaimConditions(0,claimConditions,false, {from: brand_Account})
        });

        it('SUCCESS : claim 100 token brand_client_account for good price ', async function () {
            console.log("await 15 seconds")
            await timeout(15000);
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["ethSendForBuySuccess"] += 100;
            analytics["tokenBuyed"] += 1;

            await KANJIDROPERC1155.claim(
                brand_client_account,
                0,
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                100,
                expectedProof,
                0,
                {from: brand_client_account,value:100}
            )
        });

        it('ERROR : claim kanji_account not in whitelist', async function () {
            const expectedProof = ethers.utils.formatBytes32String("");

            analytics["ethSendForBuyError"] += 10;
            await KANJIDROPERC1155.claim(
                kanji_account,
                0,
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                10,
                expectedProof,
                0,
                {from: kanji_account,value:10}
            ).catch(() => {
                console.log("whitelist not approved")
            });
        });
        
    });

    describe('Phase 3 free nft', async function () {

        it('SUCCESS : update claim conditions', async function () {
            
            let condition1 = await KANJIDROPERC1155.getClaimConditionById(0,0, {from: brand_Account})

            const claimConditions = [
                condition1,
                {
                    startTimestamp : Math.floor(Date.now()/1000)-10,
                    endTimestamp : Math.floor(Date.now()/1000)+1000,
                    maxClaimableSupply : 200,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : this.tree.getHexRoot(), // ethers.utils.formatBytes32String(""),
                    pricePerToken : 0,
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                }
            ]
            await KANJIDROPERC1155.setClaimConditions(0,claimConditions,false, {from: brand_Account})
        });

        it('SUCCESS : claim 1 token brand_Account for good price ', async function () {
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["tokenBuyed"] += 1;
            await KANJIDROPERC1155.claim(
                brand_client_account,
                0,
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                0,
                expectedProof,
                0,
                {from: brand_client_account,value:0}
            )
        });

        it('SUCCESS : claim 1 token brand_client_account for good price ', async function () {
            await timeout(11000);
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["tokenBuyed"] += 10;
            await KANJIDROPERC1155.claim(
                brand_client_account,
                0,
                10,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                0,
                expectedProof,
                0,
                {from: brand_client_account,value:0}
            )
        });

    })

    describe('Max count', async function () {

        it('SUCCESS : setMaxWalletClaimCount ', async function () {
            await KANJIDROPERC1155.setMaxWalletClaimCount( 0, 1000, {from: brand_Account,value:0})
        });

        it('SUCCESS : claim 1 token brand_client_account for good price ', async function () {
            console.log("await 11 seconds")
            await timeout(11000);

            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["tokenBuyed"] += 1;

            await KANJIDROPERC1155.claim(
                brand_client_account,
                0,
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                0,
                expectedProof,
                0,
                {from: brand_client_account,value:0}
            )
        });

        it('SUCCESS : setMaxWalletClaimCount ', async function () {
            await KANJIDROPERC1155.setMaxWalletClaimCount( 0, 10, {from: brand_Account,value:0})
        });

        it('ERROR : claim 1 token brand_client_account for good price ', async function () {
            console.log("await 9 seconds")
            await timeout(9000);

            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );

            await truffleAssert.reverts(
                KANJIDROPERC1155.claim(
                    brand_client_account,
                    0,
                    1,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    0,
                    expectedProof,
                    0,
                    {from: brand_client_account,value:0}
                )
            )
        });

        it('SUCCESS : setMaxWalletClaimCount ', async function () {
            await KANJIDROPERC1155.setMaxWalletClaimCount( 0,1000, {from: brand_Account,value:0})
        });
        
    })

    describe('GETTER', async function () {
        it('SUCCESS : getActiveClaimConditionId ', async function () {
            console.log("getActiveClaimConditionId : ",
                await KANJIDROPERC1155.getActiveClaimConditionId(0,{from: brand_Account,value:0})
            )
        });
        it('SUCCESS : getClaimTimestamp ', async function () {
            console.log("getClaimTimestamp : ",
                await KANJIDROPERC1155.getClaimTimestamp(0,0, brand_Account,{from: brand_Account,value:0})
            )
        });
        it('SUCCESS : getClaimConditionById ', async function () {
            console.log("getClaimConditionById : ",
                await KANJIDROPERC1155.getClaimConditionById(0,0,{from: brand_Account,value:0})
            )
        });
    })


    describe('Mint revealable and reveal ERC1155', async function () {

        it('SUCCESS : lazy mint 2', async function () {
            let tokenToMint = 1000;
            let indexEncrypt = await KANJIDROPERC1155.nextTokenIdToMint({from: brand_Account});
            let hash = await hashDelayRevealPasword(parseInt(indexEncrypt+"")+tokenToMint,"password",KANJIDROPERC1155.address);
            const encryptedBaseUri = await KANJIDROPERC1155.encryptDecrypt(
                ethers.utils.toUtf8Bytes(
                    "ipfs://ipfsHash/mybaseuri/",
                ),
                hash
            );
            await KANJIDROPERC1155.lazyMint(
                tokenToMint,
                "ipfs://ipfsHash/",
                encryptedBaseUri,
                {from: brand_Account}
            )
        });

        it(' SUCCESS : get token uri 1002 before reveal', async function () {
            console.log("get token uri 1002 before reveal",await KANJIDROPERC1155.tokenURI(1002,{from: brand_Account}))
        });

        it('ERROR : reveal', async function () {
            try {
                let indexEncrypt = await KANJIDROPERC1155.baseURIIndices(1,{from: brand_Account});
                let encryptedBaseURI = await KANJIDROPERC1155.encryptedBaseURI(indexEncrypt+"",{from: brand_Account});
                let hash = await hashDelayRevealPasword(indexEncrypt+"","falsePassword",KANJIDROPERC1155.address);
                let decryptedUri = await KANJIDROPERC1155.encryptDecrypt(
                    encryptedBaseURI,
                    hash,
                );
                decryptedUri =  web3.utils.hexToAscii(decryptedUri)
                if (!decryptedUri.includes("://") || !decryptedUri.endsWith("/")) {
                    throw new Error("invalid password");
                }
                await KANJIDROPERC1155.reveal(
                    1,
                    hash,
                    {from: brand_Account}
                )
            } catch(error) {
                console.log(error)
            }
        });

        it('SUCCESS : reveal', async function () {
            let indexEncrypt = await KANJIDROPERC1155.baseURIIndices(1,{from: brand_Account});
            let encryptedBaseURI = await KANJIDROPERC1155.encryptedBaseURI(indexEncrypt+"",{from: brand_Account});
            let hash = await hashDelayRevealPasword(indexEncrypt+"","password",KANJIDROPERC1155.address);
            let decryptedUri = await KANJIDROPERC1155.encryptDecrypt(
                encryptedBaseURI,
                hash,
            );
            decryptedUri =  web3.utils.hexToAscii(decryptedUri)
            if (!decryptedUri.includes("://") || !decryptedUri.endsWith("/")) {
                throw new Error("invalid password");
            }
            await KANJIDROPERC1155.reveal(
                1,
                hash,
                {from: brand_Account}
            )
        });

        it('SUCCESS : get token uri 1002 after reveal', async function () {
            console.log("get token uri 1002 after reveal",await KANJIDROPERC1155.tokenURI(1002,{from: brand_Account}))
        });

        it('Result of analytics', async function () {
            console.log("analytics : ",analytics)
        })

    })

    describe("Analytics", function () {
        it("Get brand current balance", async () =>{
            let balance = await web3.eth.getBalance(brand_Account);
            console.log("Brand current balance WEI : ",balance)
            console.log("Brand current balance ETH : ",web3.utils.fromWei(balance, "ether"))
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand account, wei balance at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        })

        it("Get dropERC1155 contract current balance", async () =>{
            let balance = await web3.eth.getBalance(KANJIDROPERC1155.address);
            console.log("dropERC1155 current balance WEI : ",balance)
            console.log("dropERC1155 current balance ETH : ",web3.utils.fromWei(balance, "ether"))
            assert.ok(balance < 10, "OK");
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nERC1155contract, wei balance at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        })

        it("Get dropERC721A contract current balance", async () =>{
            let balance = await web3.eth.getBalance(KANJIDROPERC721A.address);
            console.log("dropERC721A current balance WEI : ",balance)
            console.log("dropERC721A current balance ETH : ",web3.utils.fromWei(balance, "ether"))
            assert.ok(balance < 10, "OK");
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nERC721A contract, wei balance at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        })

        it("SUCCESS : balance token erc721A of brand client account", async () =>{
            let balance = await KANJIDROPERC721A.balanceOf(brand_client_account,{from:brand_Account});
            console.log("balance token erc721A of brand client account : ",balance+"")
            assert.ok(balance == 103, "OK");
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account, token balance ERC721A at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token erc721A of brand client 2 account", async () =>{
            let balance = await KANJIDROPERC721A.balanceOf(brand_client_account2,{from:brand_Account});
            console.log("balance token erc721A of brand client 2 account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account 2, token balance ERC721A at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token erc1155 of brand client account", async () =>{
            let balance = await KANJIDROPERC1155.balanceOf(brand_client_account,0,{from:brand_client_account});
            console.log("balance token erc1155 id 0 of brand client account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account, token balance ERC1155 at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token erc1155 of brand client 2 account", async () =>{
            let balance = await KANJIDROPERC1155.balanceOf(brand_client_account2,0,{from:brand_client_account})
            console.log("balance token erc1155 id 0 of brand client 2 account : ",+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account 2, token balance ERC1155 at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token of KANJIDROPERC1155", async () =>{
            let balance = await KANJIDROPERC1155.balanceOf(KANJIDROPERC1155.address,0,{from:brand_Account});
            console.log("balance token of KANJIDROPERC1155 : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nERC1155 drop contract, token balance ERC1155 at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token of KANJIDROPERC721A", async () =>{
            let balance = await KANJIDROPERC721A.balanceOf(KANJIDROPERC721A.address,{from:brand_Account})
            console.log("balance token of KANJIDROPERC721A : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nERC721A drop contract, token balance ERC721A at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });
    })

});
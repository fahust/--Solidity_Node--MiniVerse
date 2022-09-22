const {BigNumber, ethers} = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
var RLP = require('rlp');
const ArtifactKANJIDROPERC721R = artifacts.require("KANJIDROPERC721R");
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

    let KANJIDROPERC721R = null;

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
        KANJIDROPERC721R = await ArtifactKANJIDROPERC721R.new(
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

        console.log(KANJIDROPERC721R.address)// and see if address is same of precalculate
    });

    describe('simulate send splitter open sea', async function () {

        it('ERROR : deploy contract with not good max_bps beneficiaries count total', async function () {
            ArtifactKANJIDROPERC721R.new(
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
                fs.writeFile('test/logsTest.txt', data+'\n\n\nRANDOM DROP CONTRACT', function (err) {
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

            await KANJIDROPERC721R.sendTransaction({from:brand_Account,value:"100000000000000000"})

            await KANJIDROPERC721R.releaseAll({from:brand_Account})

            for (let index = 0; index < countRoyalties; index++) {
                actualBalance = await web3.eth.getBalance(web3.utils.toChecksumAddress(cloneAccountsfiltered[index]));
                console.log("account balance WEI receiver : "+index,actualBalance)
            }

            let senderbalance2 = await web3.eth.getBalance(brand_Account);
            console.log("sender of eth after paiement : ",senderbalance2)
            console.log("difference : ",parseInt(senderbalance)-parseInt(senderbalance2))

        });
    })

    describe('Phase 1 not in whitelist', async function () {
        it('SUCCESS : lazy mint', async function () {
            await KANJIDROPERC721R.lazyMint(
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
                }
            ]
            await KANJIDROPERC721R.setClaimConditions( claimConditions, false, {from: brand_Account})
        });

        it('ERROR : claim 1000 token brand_Account for good price', async function () {
            analytics["ethSendForBuyError"] += 100000000000000000000;
            await truffleAssert.reverts(
                KANJIDROPERC721R.claim(
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
                KANJIDROPERC721R.claim(
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
                KANJIDROPERC721R.claim(
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
            await KANJIDROPERC721R.claim(
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
                KANJIDROPERC721R.claim(
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

    
    describe('Mint revealable and reveal ERC721R', async function () {
        it('SUCCESS : lazy mint 2', async function () {
            let tokenToMint = 1000;
            let indexEncrypt = await KANJIDROPERC721R.nextTokenIdToMint({from: brand_Account});
            console.log(parseInt(indexEncrypt+"")+tokenToMint)
            let hash = await hashDelayRevealPasword(parseInt(indexEncrypt+"")+tokenToMint,"password",KANJIDROPERC721R.address);
            console.log("first hash : ",hash)
            const encryptedBaseUri =
            await KANJIDROPERC721R.encryptDecrypt(
                ethers.utils.toUtf8Bytes(
                    "ipfs://ipfsHash/mybaseuri/",
                ),
                hash
            );
            await KANJIDROPERC721R.lazyMint(
                tokenToMint,
                "ipfs://ipfsHash/",
                encryptedBaseUri,
                {from: brand_Account}
            )
        });

        it(' SUCCESS : get token uri 1002 before reveal', async function () {
            console.log("get token uri 1002 before reveal",await KANJIDROPERC721R.tokenURI(1002,{from: brand_Account}))
        });

        it('ERROR : reveal', async function () {
            try {
                let baseURIIndex = 1;
                
                let indexEncrypt = await KANJIDROPERC721R.baseURIIndices(baseURIIndex,{from: brand_Account});
                console.log(indexEncrypt+"")
                let encryptedBaseURI = await KANJIDROPERC721R.encryptedBaseURI(indexEncrypt+"",{from: brand_Account});
                console.log(encryptedBaseURI)
                let hash = await hashDelayRevealPasword(indexEncrypt+"","falsePassword",KANJIDROPERC721R.address);
                console.log(hash)
                let decryptedUri = await KANJIDROPERC721R.encryptDecrypt(
                    encryptedBaseURI,
                    hash,
                );
                decryptedUri =  web3.utils.hexToAscii(decryptedUri)
                console.log(decryptedUri)
                if (!decryptedUri.includes("://") || !decryptedUri.endsWith("/")) {
                    throw new Error("invalid password");
                }
                await KANJIDROPERC721R.reveal(
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
            
            let indexEncrypt = await KANJIDROPERC721R.baseURIIndices(baseURIIndex,{from: brand_Account});
            console.log(indexEncrypt+"")
            let encryptedBaseURI = await KANJIDROPERC721R.encryptedBaseURI(indexEncrypt+"",{from: brand_Account});
            console.log(encryptedBaseURI)
            let hash = await hashDelayRevealPasword(indexEncrypt+"","password",KANJIDROPERC721R.address);
            console.log(hash)
            let decryptedUri = await KANJIDROPERC721R.encryptDecrypt(
                encryptedBaseURI,
                hash,
            );
            console.log(decryptedUri)
            decryptedUri =  web3.utils.hexToAscii(decryptedUri)
            console.log(decryptedUri)
            if (!decryptedUri.includes("://") || !decryptedUri.endsWith("/")) {
                throw new Error("invalid password");
            }
            await KANJIDROPERC721R.reveal(
                1,
                hash,
                {from: brand_Account}
            )
        });

        it('SUCCESS : get token uri 1002 after reveal', async function () {
            console.log("get token uri 1002 after reveal",await KANJIDROPERC721R.tokenURI(1002,{from: brand_Account}))
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
            console.log("Condition : ",await KANJIDROPERC721R.getClaimConditionById(0, {from: brand_Account}))
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
                }
            ]
            await KANJIDROPERC721R.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('SUCCESS : claim 1 token brand_Account for good price ', async function () {
            console.log("await 10 seconds")
            await timeout(10000);
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["ethSendForBuySuccess"] += 100000000000000000;
            analytics["tokenBuyed"] += 1;

            await KANJIDROPERC721R.claim(
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

            await KANJIDROPERC721R.claim(
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
            
            let condition1 = await KANJIDROPERC721R.getClaimConditionById(0, {from: brand_Account})

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
            await KANJIDROPERC721R.setClaimConditions(claimConditions,  false,{from: brand_Account})
        });

        it('SUCCESS : claim 1 token brand_Account for good price ', async function () {
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["tokenBuyed"] += 1;
            await KANJIDROPERC721R.claim(
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
            await KANJIDROPERC721R.setMaxWalletClaimCount( 1000, {from: brand_Account,value:0})
        });

        it('SUCCESS : claim 1 token brand_client_account for good price ', async function () {
            console.log("await 11 seconds")
            await timeout(11000);

            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            
            analytics["tokenBuyed"] += 1;

            await KANJIDROPERC721R.claim(
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
            await KANJIDROPERC721R.setMaxWalletClaimCount( 10, {from: brand_Account,value:0})
        });

        it('ERROR : claim 1 token brand_client_account for good price ', async function () {
            console.log("await 11 seconds")
            await timeout(11000);

            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );

            await truffleAssert.reverts(
                KANJIDROPERC721R.claim(
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
            await KANJIDROPERC721R.setMaxWalletClaimCount( 1000, {from: brand_Account,value:0})
        });
        
    })

    describe('GETTER', async function () {
        it('SUCCESS : getActiveClaimConditionId ', async function () {
            console.log("getActiveClaimConditionId : ",
                await KANJIDROPERC721R.getActiveClaimConditionId({from: brand_Account,value:0})
            )
        });
        it('SUCCESS : getClaimTimestamp ', async function () {
            console.log("getClaimTimestamp : ",
                await KANJIDROPERC721R.getClaimTimestamp(0, brand_Account,{from: brand_Account,value:0})
            )
        });
        it('SUCCESS : getClaimConditionById ', async function () {
            console.log("getClaimConditionById : ",
                await KANJIDROPERC721R.getClaimConditionById(0,{from: brand_Account,value:0})
            )
        });
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

        it("Get dropERC721R contract current balance", async () =>{
            let balance = await web3.eth.getBalance(KANJIDROPERC721R.address);
            console.log("dropERC721R current balance WEI : ",balance)
            console.log("dropERC721R current balance ETH : ",web3.utils.fromWei(balance, "ether"))
            assert.ok(balance < 10, "OK");
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nERC721R contract, wei balance at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        })

        it("SUCCESS : balance token erc721R of brand client account", async () =>{
            let balance = await KANJIDROPERC721R.balanceOf(brand_client_account,{from:brand_Account});
            console.log("balance token erc721R of brand client account : ",balance+"")
            assert.ok(balance == 103, "OK");
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account, token balance ERC721R at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token erc721R of brand client 2 account", async () =>{
            let balance = await KANJIDROPERC721R.balanceOf(brand_client_account2,{from:brand_Account});
            console.log("balance token erc721R of brand client 2 account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account 2, token balance ERC721R at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token of KANJIDROPERC721R", async () =>{
            let balance = await KANJIDROPERC721R.balanceOf(KANJIDROPERC721R.address,{from:brand_Account})
            console.log("balance token of KANJIDROPERC721R : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nERC721R drop contract, token balance ERC721R at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });
    })

});
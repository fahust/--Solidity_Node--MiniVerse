const {BigNumber, ethers} = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
var RLP = require('rlp');
const ArtifactKANJIPHOENIX = artifacts.require("KANJIPHOENIX");
const artifactKANJIERC721A = artifacts.require("KANJIERC721A");
const artifactKANJIERC1155 = artifacts.require("KANJIERC1155");
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

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


contract("PHOENIX", async accounts => {
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
    const accountBrandsRoyalties1 = accounts[4];
    const brand_client_account2 = accounts[3];
    const accountBeneficiaries1 = accounts[7];
    const accountBeneficiaries2 = accounts[8];
    const kanjiAddressFeesBeneficiaries = accounts[6];
    const countRoyalties = 2;
    const cloneAccounts = [];
    const cloneAccountsValue = [];

    let instanceERC721A = null;
    let instanceERC1155 = null;
    let KANJIPHOENIX = null;

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

        it('SUCCESS : Precalculate address of drop phoenix contract', async function () {
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

        const hashedLeafs = [brand_client_account,brand_client_account2].map((i) =>
            hashLeafNode(
            i,
            0,//ethers.utils.parseUnits(maxClaimable, tokenDecimals),
            )
        );
        this.tree = new MerkleTree(hashedLeafs, keccak256, {
            sort: true,
        });
        console.log("clone account filtedred",cloneAccountsfiltered)
        KANJIPHOENIX = await ArtifactKANJIPHOENIX.new(
            500,//Fees royalties for superrare
            kanjiAddressFeesBeneficiaries,//Address of Arkania fees
            500,//5% fees of arkania
            cloneAccountsfiltered,//accounts royalties for fees open sea (by payment splitter)
            cloneAccountsValue,//% royalties for fees open sea (by payment splitter)
            [accountBeneficiaries1,accountBeneficiaries2],//accounts beneficiaries
            [4750,4750],//47.5/47.5% fees beneficiaries
            brand_Account,
            100,
            "contracturi",
            10000,
            {from: brand_Account}
        );// we deploy contract

        console.log(KANJIPHOENIX.address)// and see if address is same of precalculate
    });


    describe('phase 1 not in whitelist', async function () {


        fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
            if (err) throw err;
            fs.writeFile('test/logsTest.txt', data+'\n\n\nPHOENIX CONTRACT', function (err) {
                if (err) throw err;
            });
        });


        it('SUCCESS : lazy mint', async function () {
            await KANJIPHOENIX.lazyMint(
                1000,
                "ipfs://ipfsHash/0",
                {from: brand_Account}
            )
        });

        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-10,
                    endTimestamp : Math.floor(Date.now()/1000)+30,
                    maxClaimableSupply : 100,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token,
                    cardIdToMint : [0],
                    cardIdToRedeem : [],
                    ERC721Required : [],
                    ERC1155Required : "0x0000000000000000000000000000000000000000",
                    ERC1155IdRequired : 0,
                }
            ]
            await KANJIPHOENIX.setClaimConditions( claimConditions, false, {from: brand_Account})
        });

        it('ERROR : claim 1000 token brand_Account for good price', async function () {
            analytics["ethSendForBuyError"] += 100000000000000000000;
            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    1000,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                    10,
                    [],
                    0,
                    0,
                    0,
                    {from: brand_client_account,value:"100000000000000000000"}
                )
            )
        });

        it('ERROR : claim 100 token brand_Account for bad price', async function () {
            analytics["ethSendForBuyError"] += 10;
            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    100,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    10,
                    [],
                    0,
                    0,
                    0,
                    {from: brand_client_account2,value:10}
                )
            )
        });

        it('ERROR : claim 100 token brand_Account for not corresponding price', async function () {
            analytics["ethSendForBuyError"] += 10;
            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    100,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    10,
                    [],
                    0,
                    0,
                    0,
                    {from: brand_client_account,value:10}
                )
            )
        });

        it('SUCCESS : claim 100 token brand_Account for good price ', async function () {
            analytics["ethSendForBuySuccess"] += 10000000000000000000;
            analytics["tokenBuyed"] += 100;
            await KANJIPHOENIX.claim(
                100,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                [],
                0,
                0,
                0,
                {from: brand_client_account,value:"10000000000000000000"}
            )
        });

        it('ERROR : claim brand_Account 1 for good price but already claim in this phase', async function () {
            analytics["ethSendForBuyError"] += 10;
            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    1,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    10,
                    [],
                    0,
                    0,
                    0,
                    {from: brand_client_account,value:10}
                )
            )
        });

        

    });

    
    describe('Mint ERC1155', async function () {
        it('SUCCESS : lazy mint 2', async function () {
            let tokenToMint = 1000;
            await KANJIPHOENIX.lazyMint(
                tokenToMint,
                "ipfs://ipfsHash/",
                {from: brand_Account}
            )
        });

        it(' SUCCESS : get token uri 1002', async function () {
            console.log("get token uri 1002",await KANJIPHOENIX.tokenURI(1002,{from: brand_Account}))
        });

    })

    describe('phase 2 whitelist', async function () {

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
            console.log("Condition : ",await KANJIPHOENIX.getClaimConditionById(0, {from: brand_Account}))
        })


        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-5,
                    endTimestamp : Math.floor(Date.now()/1000)+30,
                    maxClaimableSupply : 200,//bigger than last 
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : this.tree.getHexRoot(),
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    cardIdToMint : [1],
                    cardIdToRedeem : [0],
                    ERC721Required : [],
                    ERC1155Required : "0x0000000000000000000000000000000000000000",
                    ERC1155IdRequired : 0,
                }
            ]
            await KANJIPHOENIX.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('SUCCESS : evolve 1 token brand_Account for good price ', async function () {
            console.log("await 10 seconds")
            await timeout(10000);
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["ethSendForBuySuccess"] += 100000000000000000;
            analytics["tokenBuyed"] += 1;

            await KANJIPHOENIX.claim(
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                expectedProof,
                0,
                0,
                1,
                {from: brand_client_account,value:"100000000000000000"}
            )
        });


        it('ERROR : evolve token with brand_client_account 2 with not token 0 in balance ', async function () {
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account2, 0]),
            );

            KANJIPHOENIX.claim(
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                expectedProof,
                0,
                0,
                1,
                {from: brand_client_account2,value:"100000000000000000"}
            ).catch((err)=>{
                console.log(err)
            })

        })


        it('ERROR : evolve with brand_client_account 2, more quantity then authorized', async function () {
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    1000,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    "100000000000000000",
                    expectedProof,
                    0,
                    0,
                    1,
                    {from: brand_client_account,value:"100000000000000000000"}
                )
            )
        })
    

        it('ERROR : evolve kanji_account not in whitelist', async function () {
            const expectedProof = ethers.utils.formatBytes32String("");
            analytics["ethSendForBuyError"] += 100000000000000000;

            await KANJIPHOENIX.claim(
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                expectedProof,
                0,
                0,
                1,
                {from: kanji_account,value:"100000000000000000"}
            ).catch(() => {
                console.log("whitelist not approved")
            });
        });
        
    });

    describe('phase 3 free nft', async function () {

        it('SUCCESS : update claim conditions', async function () {
            
            let condition1 = await KANJIPHOENIX.getClaimConditionById(0, {from: brand_Account})

            const claimConditions = [
                condition1,
                {
                    startTimestamp : Math.floor(Date.now()/1000)-10,
                    endTimestamp : Math.floor(Date.now()/1000)+30,
                    maxClaimableSupply : 200,
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : this.tree.getHexRoot(),
                    pricePerToken : 0,
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    cardIdToMint : [2],
                    cardIdToRedeem : [1],
                    ERC721Required : [],
                    ERC1155Required : "0x0000000000000000000000000000000000000000",
                    ERC1155IdRequired : 0,
                }
            ]
            await KANJIPHOENIX.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('SUCCESS : evolve 1 token brand_Account for good price ', async function () {
            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["tokenBuyed"] += 1;
            await KANJIPHOENIX.claim(
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                0,
                expectedProof,
                0,
                1,
                2,
                {from: brand_client_account,value:0}
            )
        });

    })

    describe('phase 4 : return to sell token 0',async function () {
        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-5,
                    endTimestamp : Math.floor(Date.now()/1000)+30,
                    maxClaimableSupply : 200,//bigger than last 
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    cardIdToMint : [0,1],
                    cardIdToRedeem : [],
                    ERC721Required : [],
                    ERC1155Required : "0x0000000000000000000000000000000000000000",
                    ERC1155IdRequired : 0,
                }
            ]
            await KANJIPHOENIX.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('SUCCESS : claim token 0 with brand_client_account2', async function () {
            await KANJIPHOENIX.claim(
                10,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                [],
                0,
                0,
                0,
                {from: brand_client_account2,value:"1000000000000000000"}
            )
        })

        it('SUCCESS : claim token 0 with brand_client_account2', async function () {
            console.log("wait 11 sec")
            await timeout(11000);
            await KANJIPHOENIX.claim(
                10,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                [],
                0,
                0,
                1,
                {from: brand_client_account2,value:"1000000000000000000"}
            )
        })
    })

    describe('phase 5 : need erc721A for claim',async function () {
        it("SUCCESS : deploy ERC721A not lazy", async () => {
            instanceERC721A = await artifactKANJIERC721A.new(
                "Name",
                "Symbol",
                10000,//maxmint
                [],//accepted marketplace address for lazy mint
                500,//royalty for superRare
                [accountBrandsRoyalties1],//address royalties
                [9500],//fees royalties
                "contracturi",//contrat uri address for platform
                {from:brand_client_account2}
            );
        })

        it("SUCCESS : 0-110 lazy uri", async () =>{
            await instanceERC721A.setUri(
                111,
                "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                1,
                {from:brand_client_account2}
            )
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand account, mint 111 token', function (err) {
                    if (err) throw err;
                });
            });
        });

        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-5,
                    endTimestamp : Math.floor(Date.now()/1000)+30,
                    maxClaimableSupply : 200,//bigger than last 
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    cardIdToMint : [0],
                    cardIdToRedeem : [],
                    ERC721Required : [instanceERC721A.address],
                    ERC1155Required : "0x0000000000000000000000000000000000000000",
                    ERC1155IdRequired : 0,
                }
            ]
            await KANJIPHOENIX.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('SUCCESS : claim token 10 tokens id 0 with brand_client_account_2', async function () {
            console.log("wait 11 sec")
            await timeout(11000);
            await KANJIPHOENIX.claim(
                10,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                [],
                0,
                0,
                0,
                {from: brand_client_account2,value:"1000000000000000000"}
            )
        })

        it('ERROR : claim token 10 tokens id 0 with brand_client_account but not have erc721A required', async function () {
            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    10,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    "100000000000000000",
                    [],
                    0,
                    0,
                    0,
                    {from: brand_client_account,value:"1000000000000000000"}
                )
            )
        })
    })

    describe('phase 6 : need erc1155 for claim',async function () {
        it("SUCCESS : deploy ERC1155 not lazy", async () => {
            instanceERC1155 = await artifactKANJIERC1155.new(
                10000,//maxmint
                [],//accepted marketplace address for lazy mint
                500,//royalty for superRare
                [accountBrandsRoyalties1],//address royalties
                [9500],//fees royalties
                "contracturi",//contrat uri address for platform
                1000,
                {from:brand_client_account2}
            );
        })

        it("SUCCESS : 0-110 lazy uri", async () =>{
            await instanceERC1155.setUri(
                "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                [111],
                [0],
                1,
                {from:brand_client_account2}
            )
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand account, mint 111 token', function (err) {
                    if (err) throw err;
                });
            });
        });

        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-5,
                    endTimestamp : Math.floor(Date.now()/1000)+90,
                    maxClaimableSupply : 200,//bigger than last 
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    cardIdToMint : [0],
                    cardIdToRedeem : [],
                    ERC721Required : [],
                    ERC1155Required : instanceERC1155.address,
                    ERC1155IdRequired : 1,
                }
            ]
            await KANJIPHOENIX.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('ERROR : claim token 10 tokens id 0 with brand_client_account but not have erc1155 required', async function () {
            console.log("wait 11 sec")
            await timeout(11000);
            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    10,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    "100000000000000000",
                    [],
                    0,
                    0,
                    0,
                    {from: brand_client_account,value:"1000000000000000000"}
                )
            )
        })

        it('ERROR : claim token 10 tokens id 0 with brand_client_account but not have erc1155 id 0 required', async function () {
            console.log("wait 11 sec")
            await timeout(11000);
            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    10,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    "100000000000000000",
                    [],
                    0,
                    0,
                    0,
                    {from: brand_client_account2,value:"1000000000000000000"}
                )
            )
        })

        it("SUCCESS : 0-110 lazy uri", async () =>{
            await instanceERC1155.setUri(
                "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                [111],
                [1],
                1,
                {from:brand_client_account2}
            )
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand account, mint 111 token', function (err) {
                    if (err) throw err;
                });
            });
        });

        it('SUCCESS : claim token 10 tokens id 0 with brand_client_account_2', async function () {
            console.log("wait 11 sec")
            await timeout(11000);
            await KANJIPHOENIX.claim(
                10,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                [],
                0,
                0,
                0,
                {from: brand_client_account2,value:"1000000000000000000"}
            )
        })
    })

    describe('phase 7 : need erc1155 and erc721A for claim',async function () {

        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-5,
                    endTimestamp : Math.floor(Date.now()/1000)+90,
                    maxClaimableSupply : 200,//bigger than last 
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : "100000000000000000",
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    cardIdToMint : [0],
                    cardIdToRedeem : [],
                    ERC721Required : [instanceERC721A.address],
                    ERC1155Required : instanceERC1155.address,
                    ERC1155IdRequired : 0,
                }
            ]
            await KANJIPHOENIX.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('ERROR : claim token 10 tokens id 0 with brand_client_account but not have erc1155 required', async function () {
            console.log("wait 11 sec")
            await timeout(11000);
            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    10,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    "100000000000000000",
                    [],
                    0,
                    0,
                    0,
                    {from: brand_client_account,value:"1000000000000000000"}
                )
            )
        })


        it('SUCCESS : claim token 10 tokens id 0 with brand_client_account_2', async function () {
            console.log("wait 11 sec")
            await timeout(11000);
            await KANJIPHOENIX.claim(
                10,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                "100000000000000000",
                [],
                0,
                0,
                0,
                {from: brand_client_account2,value:"1000000000000000000"}
            )
        })
    })

    describe('Max count', async function () {


        it('SUCCESS : update claim conditions', async function () {
            const claimConditions = [
                {
                    startTimestamp : Math.floor(Date.now()/1000)-5,
                    endTimestamp : Math.floor(Date.now()/1000)+30,
                    maxClaimableSupply : 200,//bigger than last 
                    supplyClaimed : 0,
                    quantityLimitPerTransaction : 100,
                    waitTimeInSecondsBetweenClaims : 10,
                    merkleRoot : ethers.utils.formatBytes32String(""),
                    pricePerToken : 0,
                    currency : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    cardIdToMint : [0],
                    cardIdToRedeem : [],
                    ERC721Required : [],
                    ERC1155Required : "0x0000000000000000000000000000000000000000",
                    ERC1155IdRequired : 0,
                }
            ]
            await KANJIPHOENIX.setClaimConditions(claimConditions, false, {from: brand_Account})
        });

        it('SUCCESS : setMaxWalletClaimCount ', async function () {
            await KANJIPHOENIX.setMaxWalletClaimCount( 1000, {from: brand_Account,value:0})
        });

        it('SUCCESS : evolve 1 token brand_client_account for good price ', async function () {
            console.log("await 11 seconds")
            await timeout(11000);

            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            
            analytics["tokenBuyed"] += 1;

            await KANJIPHOENIX.claim(
                1,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                0,
                expectedProof,
                0,
                0,
                0,
                {from: brand_client_account,value:0}
            )
        });

        it('SUCCESS : setMaxWalletClaimCount ', async function () {
            await KANJIPHOENIX.setMaxWalletClaimCount( 10, {from: brand_Account,value:0})
        });

        it('ERROR : evolve 1 token brand_client_account for good price ', async function () {
            console.log("await 11 seconds")
            await timeout(11000);

            const expectedProof = this.tree.getHexProof(
                ethers.utils.solidityKeccak256(["address", "uint256"], [brand_client_account, 0]),
            );
            analytics["tokenBuyed"] += 1;

            await truffleAssert.reverts(
                KANJIPHOENIX.claim(
                    1,
                    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",//native token
                    0,
                    expectedProof,
                    0,
                    0,
                    0,
                    {from: brand_client_account,value:0}
                )
            )
        });

        it('SUCCESS : setMaxWalletClaimCount ', async function () {
            await KANJIPHOENIX.setMaxWalletClaimCount( 1000, {from: brand_Account,value:0})
        });
        
    })

    describe('GETTER', async function () {
        it('SUCCESS : getActiveClaimConditionId ', async function () {
            console.log("getActiveClaimConditionId : ",
                await KANJIPHOENIX.getActiveClaimConditionId({from: brand_Account,value:0})
            )
        });
        it('SUCCESS : getClaimTimestamp ', async function () {
            console.log("getClaimTimestamp : ",
                await KANJIPHOENIX.getClaimTimestamp(0, brand_Account,{from: brand_Account,value:0})
            )
        });
        it('SUCCESS : getClaimConditionById ', async function () {
            console.log("getClaimConditionById : ",
                await KANJIPHOENIX.getClaimConditionById(0,{from: brand_Account,value:0})
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

        it("Get dropERC1155 contract current balance", async () =>{
            let balance = await web3.eth.getBalance(KANJIPHOENIX.address);
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

        it("SUCCESS : balance token erc1155 of brand client account", async () =>{
            let balance = await KANJIPHOENIX.balanceOf(brand_client_account,0,{from:brand_client_account});
            console.log("balance token erc1155 id 0 of brand client account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account, token balance ERC1155 id 0 at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token erc1155 of brand client account", async () =>{
            let balance = await KANJIPHOENIX.balanceOf(brand_client_account,1,{from:brand_client_account});
            console.log("balance token erc1155 id 1 of brand client account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account, token balance ERC1155 id 1 at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token erc1155 of brand client account", async () =>{
            let balance = await KANJIPHOENIX.balanceOf(brand_client_account,2,{from:brand_client_account});
            console.log("balance token erc1155 id 2 of brand client account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account, token balance ERC1155 id 2 at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token erc1155 of brand client 2 account", async () =>{
            let balance = await KANJIPHOENIX.balanceOf(brand_client_account2,0,{from:brand_client_account})
            console.log("balance token erc1155 id 0 of brand client 2 account : ",+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account 2, token balance ERC1155 at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token of KANJIPHOENIX", async () =>{
            let balance = await KANJIPHOENIX.balanceOf(KANJIPHOENIX.address,0,{from:brand_Account});
            console.log("balance token of KANJIPHOENIX : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nERC1155 drop contract, token balance ERC1155 at the end of drop : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

    })

});
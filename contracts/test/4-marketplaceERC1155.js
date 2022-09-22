const KANJIERC1155 = artifacts.require("KANJIERC1155");
const MarketPlace = artifacts.require("MarketPlace");
const truffleAssert = require('truffle-assertions');
const fs = require('fs');

contract("KANJIERC1155", async accounts => {

    const brand_Account = accounts[1];
    const brand_client_account = accounts[2];
    const brand_client_account2 = accounts[3];
    const accountBrandsRoyalties1 = accounts[4];
    const kanjiAddressFeesBeneficiaries = accounts[6];

    let instanceAuction = null;
    let instanceToken = null;
    
    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    describe('DEPLOY', function () {
        
        it("SUCCESS : deploy market place", async () =>{
            instanceAuction =  await MarketPlace.new(
                kanjiAddressFeesBeneficiaries,
                500,
                500,
                {from:brand_Account}
            );
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\n\n\nMARKETPLACEERC1155', function (err) {
                    if (err) throw err;
                });
            });
        })

        it("SUCCESS : deploy ERC1155 not lazy", async () => {
            instanceToken = await KANJIERC1155.new(
                10000,//maxmint
                [instanceAuction.address],//accepted marketplace address for lazy mint
                500,//royalty for superRare
                [accountBrandsRoyalties1],//address royalties
                [9500],//fees royalties
                "contracturi",//contrat uri address for platform
                1000,
                {from:brand_Account}
            );
        })

        it("SUCCESS : set base uri", async () =>{
            let arrayTokenQuantities = [];
            let arrayTokenIds = [];
            for (let index = 0; index < 111; index++) {
                arrayTokenQuantities.push(10);
                arrayTokenIds.push(index);
            }
            await instanceToken.setUri(
                "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                arrayTokenQuantities,
                arrayTokenIds,
                1,
                {from:brand_Account}
            )
        });
    })

    
    describe('MINT', function () {

        it("SUCCESS : balance token of", async () =>{
            const balance = await instanceToken.balanceOf(brand_Account,0,{from:brand_Account})
            console.log("balance : "+balance)
        });
    })

    describe('APPROVE MARKET PLACE AND TRANSFERT BATCH', function () {

        it("SUCCESS : approve token for  market place", async () => {
            await instanceToken.setApprovalForAll(instanceAuction.address,{from:brand_Account})

        })

    })

    describe('CREATE/UPDATE AUCTION', function () {

        it("SUCCESS : create auction", async () => {
            await instanceAuction.createList(
                {
                    addressContractToken: instanceToken.address,//address of token
                    addressMinter: brand_Account,//address of owner tokens
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    startDate: Math.floor(Date.now()/1000)+10,
                    endDate: 0,
                    direct: false,
                    tokenType: 1
                },
                {from:brand_Account})
        });

        it("SUCCESS : add token to list", async () => {
            let tokenList = [];

            for (let index = 0; index < 1; index++) {
                tokenList.push({
                    lastBidder: "0x0000000000000000000000000000000000000000",
                    lastBid: 0,
                    idToken: index,
                    quantity:1,
                    listingId: 0,
                    minPrice: 10,
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                })
            }

            await instanceAuction.addTokenToList(
                tokenList,
                {from:brand_Account})
        });

        it("ERROR : create auction with brand_client_account", async () => {
            await truffleAssert.reverts(
                instanceAuction.createList(
                    {
                        addressContractToken: instanceToken.address,//address of token
                        addressMinter: brand_Account,//address of owner tokens
                        paused: false,
                        _beneficiariesAddr: [accountBrandsRoyalties1],
                        _beneficiariesPercent: [9500],
                        startDate: 0,
                        endDate: 0,
                        direct: false,
                        tokenType: 1
                    },
                    {from:brand_client_account}
                )
            );
        });

        it("SUCCESS : update list token array", async () => {
            await instanceAuction.updateList(
                {
                    addressContractToken: instanceToken.address,//address of token
                    addressMinter: brand_Account,//address of owner tokens
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    idToken: 1,
                    startDate: Math.floor(Date.now()/1000)+10,
                    endDate: 0,
                    direct: false,
                    tokenType: 1
                },
                0,
                {from:brand_Account})
        });

        it("ERROR : create auction with different length array royalties", async () => {
            await truffleAssert.reverts(
                instanceAuction.createList(
                    {
                        addressContractToken: instanceToken.address,//address of token
                        addressMinter: brand_Account,//address of owner tokens
                        paused: false,
                        _beneficiariesAddr: [accountBrandsRoyalties1],
                        _beneficiariesPercent: [9500,200],
                        startDate: 0,
                        endDate: 0,
                        direct: false,
                        tokenType: 1
                    },
                    {from:brand_Account}
                )
            /*,"Incorrect list"*/);
        });
        // });

    })


    describe('BIDDING', function () {

        it("ERROR : first bidding on first auction before starting", async () => {
            await truffleAssert.reverts(
                instanceAuction.bidding(
                    0,
                    0,
                    0,
                    {from:brand_client_account,value:"110000000000000000"}
                )/*,"Auction not started"*/
            );
        });

        it("SUCCESS : update date auction", async () => {
            await instanceAuction.updateList(
                {
                    addressContractToken: instanceToken.address,//address of token
                    addressMinter: brand_Account,//address of owner tokens
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    idToken: 1,
                    startDate: Math.floor(Date.now()/1000)-10,
                    endDate: Math.floor(Date.now()/1000)+40,//17
                    direct: false,
                    tokenType: 1
                },
                0,
                {from:brand_Account}
            )
        });

        it("SUCCESS : bidding on auction after start auction with brand_client_account with 50000000000000000 wei", async () =>{
            await instanceAuction.bidding(0,0,0,{from:brand_client_account,value:"50000000000000000"})
        });

        it("SUCCESS : bidding on auction after start auction with brand_client_account with 110000000000000000 wei", async () =>{
            await instanceAuction.bidding(0,0,0,{from:brand_client_account,value:"110000000000000000"})
        });

        it("ERROR : bidding on auction after start auction with brand_client_account with 100000000000000000 wei", async () =>{
            await truffleAssert.reverts(
                instanceAuction.bidding(
                    0,
                    0,
                    0,
                    {from:brand_client_account,value:"100000000000000000"}
                )/*,"Not enought money"*/
            );
        });

        it("ERROR : bidding on auction after start auction with brand_client_account with not good id token 1 0", async () =>{
            let actualBalance = await web3.eth.getBalance(brand_Account);
            console.log("My current balance WEI before error: ",actualBalance)
            await truffleAssert.reverts(
                instanceAuction.bidding(
                    0,
                    1,
                    0,
                    {from:brand_client_account,value:"200000000000000000"}
                )/*,"Not good id"*/
            );
            actualBalance = await web3.eth.getBalance(brand_Account);
            console.log("My current balance WEI after error: ",actualBalance)
        }); 

        it("ERROR : bidding on auction after start auction with brand_client_account with not good id token 0 1", async () =>{
            await truffleAssert.reverts(
                instanceAuction.bidding(
                    0,
                    0,
                    1,
                    {from:brand_client_account,value:"200000000000000000"}
                )
            );
        });

        it("SUCCESS : bidding on auction after start auction with brand_client_account with 120000000000000000 wei", async () =>{
            await instanceAuction.bidding(0,0,0,{from:brand_client_account,value:"120000000000000000"})
        });

    })

    describe('END AUCTION', function () {

        it("ERROR : end auction with account one", async () =>{
            await truffleAssert.reverts(
                instanceAuction.endAuction(
                    0,
                    0,
                    0,
                    0,
                    {from:brand_Account}
                )/*,"List not finished"*/
            );
            
        });

        it("ERROR : end auction with account two before end", async () =>{
            await truffleAssert.reverts(
                instanceAuction.endAuction(
                    0,
                    0,
                    0,
                    0,
                    {from:brand_client_account}
                )/*,"List not finished"*/
            );
        });

        it("SUCCESS : end auction with account two", async () =>{
            console.log("await 45 seconds")
            await timeout(45000);
            await instanceAuction.endAuction(0,0,0,0,{from:brand_client_account})
        });

        it("ERROR : end auction with account one with already claimed token", async () =>{
            await truffleAssert.reverts(
                instanceAuction.endAuction(
                    0,
                    0,
                    0,
                    0,
                    {from:brand_Account}
                )
            );
        });

    })

    describe('DIRECT LIST', function () {

        it("SUCCESS : create list (direct) number two with other token of list one", async () => {
            await instanceAuction.createList(
                {
                    addressContractToken: instanceToken.address,//address of token
                    addressMinter: brand_Account,//address of owner tokens
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    startDate: 0,
                    endDate: 0,
                    direct: true,
                    tokenType: 1
                },
                {from:brand_Account})
        });

        it("SUCCESS : add token to list", async () => {
            await instanceAuction.addTokenToList(
                [{
                    lastBidder: "0x0000000000000000000000000000000000000000",
                    lastBid: 0,
                    idToken: 1,
                    quantity:1,
                    listingId: 1,
                    minPrice: 10,
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                }],
                {from:brand_Account})
        });

        it("ERROR : buy list two, token 4 with 5 wei", async () =>{
            await truffleAssert.reverts(
                instanceAuction.buy(
                    1,
                    1,
                    1,
                    {from:brand_client_account,value:5}
                )/*,"Not enought money"*/
            );
        });

        it("SUCCESS : buy list two, token one with 10 wei", async () =>{
            await instanceAuction.buy(1,1,1,{from:brand_client_account,value:10});
        });

    })

    describe('LAZY MINT', function () {

        it("SUCCESS : deploy ERC1155 lazy", async () => {
            this.lazyERC1155 = await KANJIERC1155.new(
                10000,//maxmint
                [instanceAuction.address],//accepted marketplace address for lazy mint
                500,//royalty for superRare
                [accountBrandsRoyalties1],//address royalties
                [9500],//fees royalties
                "contracturi",//contrat uri address for platform
                1000,
                {from:brand_Account}
            );
        })

        it("SUCCESS : set base uri", async () =>{
            await this.lazyERC1155.setUri(
                "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1],
                2,
                {from:brand_Account}
            )
        });

        it("SUCCESS : approve token for  market place", async () => {
            await this.lazyERC1155.setApprovalForAll(instanceAuction.address,{from:brand_Account})

        })
        
        it("SUCCESS : create list (auction) with lazy mint", async () => {
            await instanceAuction.createList(
                {
                    addressContractToken: this.lazyERC1155.address,//address of token
                    addressMinter: brand_Account,//address of owner tokens
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    startDate: Math.floor(Date.now()/1000)-10,
                    endDate: Math.floor(Date.now()/1000)+40,//17
                    direct: false,
                    tokenType: 1
                },
                {from:brand_Account})
        });

        it("SUCCESS : add token to list", async () => {
            await instanceAuction.addTokenToList(
                [{
                    lastBidder: "0x0000000000000000000000000000000000000000",
                    lastBid: 0,
                    idToken: 1,
                    quantity:10,
                    listingId: 2,
                    minPrice: "50000000000000000",
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                }],
                {from:brand_Account})
        });

        it("SUCCESS : bidding on auction after start auction with brand_Account with 500000000000000001 wei", async () =>{
            await instanceAuction.bidding(2,1,2,{from:brand_client_account,value:"500000000000000001"})
        });

        it("SUCCESS : end auction with account one", async () =>{
            console.log("await 45 seconds")
            await timeout(45000);
            await instanceAuction.endAuction(2,1,2,0,{from:brand_client_account})
        });
    });

    describe('TEST GETTER', function () {
        it("SUCCESS : get lists", async () =>{
            console.log("get lists : ",await instanceAuction.getLists({from:brand_Account}))
        });

        it("SUCCESS : get token in list", async () =>{
            console.log("get token in list : ",await instanceAuction.getTokensInList(0,{from:brand_Account}))
        });
    })

    describe("Analytics", function () {
        it("SUCCESS : Get brand current balance", async () =>{
            let balance = await web3.eth.getBalance(brand_Account);
            console.log("Brand current balance WEI : ",balance)
            console.log("Brand current balance ETH : ",web3.utils.fromWei(balance, "ether"))
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand account, wei balance at the end of marketplaceERC1155 : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        })

        it("SUCCESS : Get marketplace contract current balance", async () =>{
            let balance = await web3.eth.getBalance(instanceAuction.address);
            console.log("MarketPlace current balance WEI : ",balance)
            console.log("MarketPlace current balance ETH : ",web3.utils.fromWei(balance, "ether"))
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nMarketplace contract, wei balance at the end of marketplaceERC1155 : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        })

        it("SUCCESS : balance token of brand account", async () =>{
            let balance = await instanceToken.balanceOf(brand_Account,0,{from:brand_Account})
            console.log("balance token of brand account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand account, token balance at the end of marketplaceERC1155 : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token id 0 of brand client account", async () =>{
            let balance = await instanceToken.balanceOf(brand_client_account,0,{from:brand_Account});
            console.log("balance token of brand client account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account, token id 0 balance at the end of marketplaceERC1155 : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token id 0 of brand client 2 account", async () =>{
            let balance = await instanceToken.balanceOf(brand_client_account2,0,{from:brand_Account})
            console.log("balance token of brand client 2 account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account 2, token id 0 balance at the end of marketplaceERC1155 : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token id 1 of brand client account", async () =>{
            let balance = await instanceToken.balanceOf(brand_client_account,1,{from:brand_Account});
            console.log("balance token of brand client account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account, token id 1 balance at the end of marketplaceERC1155 : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token id 1 of brand client 2 account", async () =>{
            let balance = await instanceToken.balanceOf(brand_client_account2,1,{from:brand_Account})
            console.log("balance token of brand client 2 account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account 2, token id 1 balance at the end of marketplaceERC1155 : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token of marketplace", async () =>{
            let balance = await instanceToken.balanceOf(instanceAuction.address,0,{from:brand_Account})
            console.log("balance token of marketplace : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nMarketplace contract, token balance at the end of marketplaceERC1155 : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });
    })
    
})



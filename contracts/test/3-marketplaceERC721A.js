const KANJIERC721A = artifacts.require("KANJIERC721A");
const MarketPlace = artifacts.require("MarketPlace");
const truffleAssert = require("truffle-assertions");
const fs = require('fs');

contract("KANJIERC721A", async accounts => {

    const brand_Account = accounts[1];
    const brand_client_account = accounts[2];
    const brand_client_account2 = accounts[3];
    const accountBrandsRoyalties1 = accounts[4];
    const kanjiAddressFeesBeneficiaries = accounts[6];

    let instanceAuction = null;
    let instanceToken = null;

    let lazyERC721A;
    
    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    describe("DEPLOY", function () {
        
        it("SUCCESS : deploy market place", async () =>{
            fs.writeFile('test/logsTest.txt', "MARKETPLACE ERC721A", function (err) {
                if (err) throw err;
            });
            instanceAuction =  await MarketPlace.new(kanjiAddressFeesBeneficiaries,500,500,{from:brand_Account});
        })

        it("SUCCESS : deploy ERC721A not lazy", async () => {
            instanceToken = await KANJIERC721A.new(
                "Name",
                "Symbol",
                10000,//maxmint
                [instanceAuction.address],//accepted marketplace address for lazy mint
                500,//royalty for superRare
                [accountBrandsRoyalties1],//address royalties
                [9500],//fees royalties
                "contracturi",//contrat uri address for platform
                {from:brand_Account}
            );
        })
    })

    
    describe("MINT", function () {

        it("ERROR : 0-110 lazy uri", async () =>{
            await truffleAssert.reverts(
                instanceToken.setUri(
                    111,
                    "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                    0,
                    {from:brand_Account}
                )
            )
        });

        it("SUCCESS : 0-110 lazy uri", async () =>{
            await instanceToken.setUri(
                111,
                "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                1,
                {from:brand_Account}
            )
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand account, mint 111 token', function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token of", async () =>{
            console.log("balance : ",await instanceToken.balanceOf(brand_Account,{from:brand_Account})+"")
        });
    })

    describe("APPROVE MARKET PLACE AND TRANSFERT BATCH", function () {
        it("SUCCESS : approve token for  market place", async () => {
            await instanceToken.setApprovalForAll(instanceAuction.address,true,{from:brand_Account})
        })

        it("SUCCESS : transfer batch", async () => {
            await instanceToken.batchTransferQuantity(brand_Account,brand_client_account,50,10,{from:brand_Account})//100 max
        })
    })

    describe("CREATE/UPDATE AUCTION", function () {
        it("ERROR : create auction with not 10000 maxbps", async () => {
            await truffleAssert.reverts(
                instanceAuction.createList(
                    {
                        addressContractToken: instanceToken.address,//address of token
                        addressMinter: brand_Account,//address of owner tokens
                        paused: false,
                        _beneficiariesAddr: [accountBrandsRoyalties1],
                        _beneficiariesPercent: [9800],
                        startDate: 0,
                        endDate: 0,
                        direct: false,
                        tokenType: 2
                    },
                    {from:brand_Account}
                )
            )
        });

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
                    tokenType: 2
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
                    minPrice: "1000000000000000000",
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                })
            }

            await instanceAuction.addTokenToList(
                tokenList,
                {from:brand_Account})
        });

        it("SUCCESS : setPriceTokenInList", async () => {
            let tokenList = [];

            for (let index = 0; index < 1; index++) {
                tokenList.push({
                    lastBidder: "0x0000000000000000000000000000000000000000",
                    lastBid: 0,
                    idToken: index,
                    quantity:1,
                    listingId: 0,
                    minPrice: "1000000000000000000",
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                })
            }

            await instanceAuction.setPriceTokenInList(
                tokenList,
                [0],
                {from:brand_Account})
        });

        it("SUCCESS : get token in list", async () =>{
            console.log("get token in list : ",await instanceAuction.getTokensInList(0,{from:brand_Account}))
        });


        

        it("ERROR : create auction with brand_client_account", async () => {
            await truffleAssert.reverts(
            instanceAuction.createList(
                {
                    addressContractToken: instanceToken.address,
                    addressMinter: brand_Account,
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    idToken: 0,
                    startDate: 0,
                    endDate: 0,
                    direct: false,
                    tokenType: 2
                },
                {from:brand_client_account})
            );
        });

        it("SUCCESS : update list token array", async () => {
            await instanceAuction.updateList(
                {
                    addressContractToken: instanceToken.address,
                    addressMinter: brand_Account,
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    idToken: 1,
                    startDate: Math.floor(Date.now()/1000)+10,
                    endDate: Math.floor(Date.now()/1000)+10,
                    direct: false,
                    tokenType: 2
                },
                0,
                {from:brand_Account})
        });

        it("ERROR : create auction with different length array royalties", async () => {
            await truffleAssert.reverts(
                instanceAuction.createList({
                    addressContractToken: instanceToken.address,
                    addressMinter: brand_Account,
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500,0],
                    idToken: 0,
                    startDate: 0,
                    endDate: 0,
                    direct: false,
                    tokenType: 2
                },
                {from:brand_Account})
            );//delete message for rinkeby
        });
    })


    describe("BIDDING", function () {

        it("ERROR : first bidding on first auction before starting", async () => {
            await truffleAssert.reverts(
                instanceAuction.bidding(
                    0,
                    0,
                    0,
                    {from:brand_Account,value:"1000000000000000000"}
                )//delete message for rinkeby
            );
        });

        it("SUCCESS : update date auction", async () => {
            await instanceAuction.updateList(
                {
                    addressContractToken: instanceToken.address,
                    addressMinter: brand_Account,
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    idToken: 1,
                    startDate: Math.floor(Date.now()/1000)-10,
                    endDate: Math.floor(Date.now()/1000)+50,
                    direct: false,
                    tokenType: 2
                },
                0,
                {from:brand_Account})
        });

        it("ERROR : bidding on auction after start auction with brand_client_account with 10000000000000000 wei", async () =>{
            await truffleAssert.reverts(
                instanceAuction.bidding(
                    0,
                    0,
                    0,
                    {from:brand_client_account,value:"10000000000000000"}
                )
            )
        });

        it("SUCCESS : bidding on auction after start auction with brand_client_account with 8000000000000000000 wei", async () =>{
            await instanceAuction.bidding(0,0,0,{from:brand_client_account,value:"8000000000000000000"})
            console.log("eth on contract after bidding ",await web3.eth.getBalance(instanceAuction.address))
        });

        it("SUCCESS : bidding on auction after start auction with brand_client_account with 9000000000000000000 wei", async () =>{
            await instanceAuction.bidding(0,0,0,{from:brand_client_account2,value:"9000000000000000000"})
            console.log("eth on contract after bidding ",await web3.eth.getBalance(instanceAuction.address))
        });

        it("ERROR : bidding on auction after start auction with brand_client_account with 7000000000000000000 wei", async () =>{
            await truffleAssert.reverts(
                instanceAuction.bidding(
                    0,
                    0,
                    0,
                    {from:brand_client_account,value:"7000000000000000000"}
                )//delete message for rinkeby
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
                    {from:brand_client_account,value:"8000000000000000000"}
                )//delete message for rinkeby
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
                    {from:brand_client_account,value:"8000000000000000000"}
                )
            );
        });

        it("SUCCESS : bidding on auction after start auction with brand_client_account with 10000000000000000000 wei", async () =>{
            await instanceAuction.bidding(0,0,0,{from:brand_client_account2,value:"10000000000000000000"})
            console.log("eth on contract after bidding ",await web3.eth.getBalance(instanceAuction.address))
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account 2, bidding', function (err) {
                    if (err) throw err;
                });
            });
        });

    })

    describe("END AUCTION", function () {

        it("ERROR : end auction with account one", async () =>{
            await truffleAssert.reverts(
                instanceAuction.endAuction(
                    0,
                    0,
                    0,
                    0,
                    {from:brand_Account}
                )
            );//delete message for rinkeby
            
        });

        it("ERROR : end auction with account two before end", async () =>{
            await truffleAssert.reverts(
                instanceAuction.endAuction(
                    0,
                    0,
                    0,
                    0,
                    {from:brand_client_account}
                )
            );//delete message for rinkeby
        });

        it("SUCCESS : end auction with account two", async () =>{
            console.log("eth on contract before end auction",await web3.eth.getBalance(instanceAuction.address))
            console.log("await 90 seconds")
            await timeout(90000);
            await instanceAuction.endAuction(0,0,0,0,{from:brand_client_account})
            console.log("await 10 seconds")
            await timeout(10000);
            console.log("eth on contract after end auction",await web3.eth.getBalance(instanceAuction.address))
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

    describe("DIRECT LIST", function () {

        it("SUCCESS : create list (direct) number two with other token of list one", async () => {
            const newAuction = await instanceAuction.createList(
                {
                    addressContractToken: instanceToken.address,
                    addressMinter: brand_Account,
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    startDate: 0,
                    endDate: 0,
                    direct: true,
                    tokenType: 2
                },
                {from:brand_Account})
            console.log(newAuction)
        });

        it("SUCCESS : add token to list", async () => {
            await instanceAuction.addTokenToList(
                [{
                    lastBidder: "0x0000000000000000000000000000000000000000",
                    lastBid: 0,
                    idToken: 1,
                    quantity:1,
                    listingId: 1,
                    minPrice: "1000000000000000000",
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                }],
                {from:brand_Account})
        });

        it("ERROR : buy list two, token 4 with 10000000000000000 wei", async () =>{
            await truffleAssert.reverts(
                instanceAuction.buy(
                    1,
                    1,
                    1,
                    {from:brand_client_account,value:"10000000000000000"}
                )
            );//delete message for rinkeby
        });

        it("SUCCESS : buy list two, token one with 1000000000000000000 wei", async () =>{
            await instanceAuction.buy(1,1,1,{from:brand_client_account,value:"1000000000000000000"});
        });
    })

    describe("AUCTION WITH LAZY MINT", function () {

        it("SUCCESS : deploy ERC721A lazy", async () => {
            lazyERC721A = await KANJIERC721A.new(
                "Name",
                "Symbol",
                10000,//maxmint
                [instanceAuction.address],//accepted marketplace address for lazy mint
                500,//royalty for superRare
                [accountBrandsRoyalties1],//address royalties
                [9500],//fees royalties
                "contracturi",//contrat uri address for platform
                {from:brand_Account}
            );
        })

        it("SUCCESS : 0-99 lazy uri", async () =>{
            await lazyERC721A.setUri(
                100,
                "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                2,
                {from:brand_Account}
            )
        });

        it("SUCCESS : approve token for  market place", async () => {
            await lazyERC721A.setApprovalForAll(instanceAuction.address,{from:brand_Account})

        })
        
        it("SUCCESS : create list (auction) with lazy mint", async () => {
            await instanceAuction.createList(
                {
                    addressContractToken: lazyERC721A.address,
                    addressMinter: brand_Account,
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    startDate: Math.floor(Date.now()/1000)-10,
                    endDate: Math.floor(Date.now()/1000)+10,
                    direct: false,
                    tokenType: 2
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
                    listingId: 2,
                    minPrice: "1000000000000000000",
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                }],
                {from:brand_Account})
        });

        it("SUCCESS : bidding on auction after start auction with brand_Account with 1000000000000000000 wei", async () =>{
            await instanceAuction.bidding(2,1,2,{from:brand_Account,value:"1000000000000000000"})
        });

        it("SUCCESS : end auction with account one", async () =>{
            console.log("await 35 seconds")
            await timeout(35000);
            await instanceAuction.endAuction(2,1,2,0,{from:brand_Account})
        });
    });

    describe("DIRECT SELL WITH LAZY MINT", function () {

        it("SUCCESS : deploy ERC721A lazy", async () => {
            lazyERC721A = await KANJIERC721A.new(
                "Name",
                "Symbol",
                10000,//maxmint
                [instanceAuction.address],//accepted marketplace address for lazy mint
                500,//royalty for superRare
                [accountBrandsRoyalties1],//address royalties
                [9500],//fees royalties
                "contracturi",//contrat uri address for platform
                {from:brand_Account});
        })

        it("SUCCESS : 0-99 lazy uri", async () =>{
            await lazyERC721A.setUri(
                100,
                "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                2,
                {from:brand_Account}
            )
        });

        it("SUCCESS : approve token for  market place", async () => {
            await lazyERC721A.setApprovalForAll(instanceAuction.address,{from:brand_Account})
        })

        it("SUCCESS : create list (auction) with lazy mint", async () => {
            await instanceAuction.createList(
                {
                    addressContractToken: lazyERC721A.address,
                    addressMinter: brand_Account,
                    paused: false,
                    _beneficiariesAddr: [accountBrandsRoyalties1],
                    _beneficiariesPercent: [9500],
                    startDate: Math.floor(Date.now()/1000)-10,
                    endDate: Math.floor(Date.now()/1000)+10,//17
                    direct: false,
                    tokenType: 2
                },
                {from:brand_Account})
        });

        it("SUCCESS : add token to list", async () => {
            await instanceAuction.addTokenToList(
                [{
                    lastBidder: "0x0000000000000000000000000000000000000000",
                    lastBid: 0,
                    idToken: 2,
                    quantity:1,
                    listingId: 3,
                    minPrice: "1000000000000000000",
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                }],
                {from:brand_Account})
        });

        it("SUCCESS : get token in list", async () =>{
            console.log("get token in list : ",await instanceAuction.getTokensInList(3,{from:brand_Account}))
        });

        it("ERROR : buy directly with brand_Account with 1 wei", async () =>{
            await truffleAssert.reverts(
                instanceAuction.buy(
                    3,
                    2,
                    3,
                    {from:brand_Account,value:"10000000000000000"}
                ))
        });

        it("SUCCESS : buy directly with brand_Account with 1000000000000000000 wei", async () =>{
            console.log(await web3.eth.getBalance(instanceAuction.address))
            await instanceAuction.buy(3,2,3,{from:brand_Account,value:"1000000000000000000"})
        });

        it("ERROR : buy directly with brand_Account with  0.05 eth", async () =>{
            await truffleAssert.reverts(
                instanceAuction.buy(
                    3,
                    2,
                    3,
                    {from:brand_Account,value:"1000000000000000000"}
                ))
        });

    })

    describe("TEST GETTER", function () {
        it("SUCCESS : get lists", async () =>{
            console.log("get lists : ",await instanceAuction.getLists({from:brand_client_account}))
        });

        it("SUCCESS : get token in list", async () =>{
            console.log("get token in list : ",await instanceAuction.getTokensInList(0,{from:brand_Account}))
        });
    })

    describe("TEST URI", function () {
        it("SUCCESS : 100-109 lazy uri", async () =>{
            await instanceToken.setUri(10,"first uri/",2,{from:brand_Account})
        });

        it("SUCCESS : 110-119 lazy uri", async () =>{
            await instanceToken.setUri(10,"second uri/",2,{from:brand_Account})
        });

        it("SUCCESS : get token uri 110", async () =>{
            console.log("get token uri id 110 : ",await instanceToken.tokenURI(110,{from:brand_client_account}))
        });

        it("SUCCESS : get token uri 113", async () =>{
            console.log("get token uri id 113 : ",await instanceToken.tokenURI(113,{from:brand_Account}))
        });

        it("SUCCESS : get token uri 121", async () =>{
            console.log("get token uri id 121 : ",await instanceToken.tokenURI(121,{from:brand_client_account}))
        });

        it("SUCCESS : get token uri 140", async () =>{
            console.log("get token uri id 140 : ",await instanceToken.tokenURI(140,{from:brand_Account}))
        });
    })

    describe("TEST MULTIPLE END AUCTION", function () {
        it("ERROR : create auction with not 10000 maxbps", async () => {
            await truffleAssert.reverts(
                instanceAuction.createList(
                    {
                        addressContractToken: instanceToken.address,//address of token
                        addressMinter: brand_Account,//address of owner tokens
                        paused: false,
                        _beneficiariesAddr: [accountBrandsRoyalties1],
                        _beneficiariesPercent: [9800],
                        startDate: 0,
                        endDate: 0,
                        direct: false,
                        tokenType: 2
                    },
                    {from:brand_Account}
                )
            )
        });

        it("SUCCESS : create auction", async () => {
            await instanceAuction.createList(
            {
                addressContractToken: lazyERC721A.address,//address of token
                addressMinter: brand_Account,//address of owner tokens
                paused: false,
                _beneficiariesAddr: [accountBrandsRoyalties1],
                _beneficiariesPercent: [9500],
                startDate: Math.floor(Date.now()/1000)-10,
                endDate: Math.floor(Date.now()/1000)+10,//17
                direct: false,
                tokenType: 2
            },
            {from:brand_Account})
        });

        it("ERROR : add token to list", async () => {
            await truffleAssert.reverts(
                instanceAuction.addTokenToList(
                [{
                    lastBidder: "0x0000000000000000000000000000000000000000",
                    lastBid: 0,
                    idToken: 4,
                    quantity:1,
                    listingId: 4,
                    minPrice: "1000000000000000000",
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                },{
                    lastBidder: "0x0000000000000000000000000000000000000000",
                    lastBid: 0,
                    idToken: 4,
                    quantity:1,
                    listingId: 3,
                    minPrice: "1000000000000000000",
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                }],
                {from:brand_Account})
            )
        });


        it("SUCCESS : add token to list", async () => {
            await instanceAuction.addTokenToList(
                [{
                    lastBidder: "0x0000000000000000000000000000000000000000",
                    lastBid: 0,
                    idToken: 4,
                    quantity:1,
                    listingId: 4,
                    minPrice: "1000000000000000000",
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                }],
                {from:brand_Account})
        });
        
        it("SUCCESS : get lists", async () =>{
            console.log("get lists : ",await instanceAuction.getLists({from:brand_client_account}))
        });

        it("SUCCESS : get token in list", async () =>{
            let tokenInList = await instanceAuction.getTokensInList(4,{from:brand_Account});
            console.log("get token in list 4 : ",tokenInList)
            console.log("get token number 4 in list 4 : ",tokenInList['1'][4]+"")
        });

        it("SUCCESS : bidding directly with brand_Account with 1000000000000000000 wei", async () =>{
            await instanceAuction.bidding(4,4,4,{from:brand_Account,value:"1000000000000000000"})
        });

        it("SUCCESS : end auction with brandclientaccount transfer token", async () =>{
            console.log("eth on contract before end auction",await web3.eth.getBalance(instanceAuction.address))
            await timeout(10000);
            await instanceAuction.endAuction(4,4,4,1,{from:brand_client_account})
            await timeout(2000);
            console.log("eth on contract after end auction",await web3.eth.getBalance(instanceAuction.address))
        });

        it("ERROR : end auction with brandclientaccount already transfer token", async () =>{
            await truffleAssert.reverts(
                instanceAuction.endAuction(
                    4,
                    4,
                    4,
                    1,
                    {from:brand_client_account}
                )
                
            )
        });

        it("ERROR : end auction with brandclientaccount transfer all but already transfer token", async () =>{
            await truffleAssert.reverts(
                instanceAuction.endAuction(
                    4,
                    4,
                    4,
                    0,
                    {from:brand_client_account}
                )
                
            )
        });

        it("SUCCESS : end auction with brandclientaccount transfer eth", async () =>{
            await instanceAuction.endAuction(4,4,4,2,{from:brand_client_account})
        });

        it("SUCCESS : end auction with brandclientaccount already transfer eth but no transfer only refund", async () =>{
            await instanceAuction.endAuction(
                4,
                4,
                4,
                2,
                {from:brand_client_account}
            )
        });
    });

    describe("Analytics", function () {
        it("Get brand current balance", async () =>{
            let balance = await web3.eth.getBalance(brand_Account);
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand account, wei balance at the end of marketplaceERC721A : '+balance, function (err) {
                    if (err) throw err;
                });
            });
            console.log("Brand current balance WEI : ",balance)
            console.log("Brand current balance ETH : ",web3.utils.fromWei(balance, "ether"))
        })

        it("Get marketplace contract current balance", async () =>{
            let balance = await web3.eth.getBalance(instanceAuction.address);
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nMarketplace contract, wei balance at the end of marketplaceERC721A : '+balance, function (err) {
                    if (err) throw err;
                });
            });
            console.log("MarketPlace current balance WEI : ",balance)
            console.log("MarketPlace current balance ETH : ",web3.utils.fromWei(balance, "ether"))
        })

        it("SUCCESS : balance token of brand account", async () =>{
            let balance = await instanceToken.balanceOf(brand_Account,{from:brand_Account})
            console.log("balance token of brand account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand account, token balance at the end of marketplaceERC721A : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token of brand client account", async () =>{
            let balance = await instanceToken.balanceOf(brand_client_account,{from:brand_Account})
            console.log("balance token of brand client account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client account, token balance at the end of marketplaceERC721A : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token of brand client 2 account", async () =>{
            let balance = await instanceToken.balanceOf(brand_client_account,{from:brand_Account})
            console.log("balance token of brand client 2 account : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nBrand client 2 account, token balance at the end of marketplaceERC721A : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });

        it("SUCCESS : balance token of marketplace", async () =>{
            let balance = await instanceToken.balanceOf(instanceAuction.address,{from:brand_Account})
            console.log("balance token of marketplace : ",balance+"")
            fs.readFile('test/logsTest.txt', 'utf8', function(err, data) {
                if (err) throw err;
                fs.writeFile('test/logsTest.txt', data+'\nMarketplace, token balance at the end of marketplaceERC721A : '+balance, function (err) {
                    if (err) throw err;
                });
            });
        });
    })
    
})



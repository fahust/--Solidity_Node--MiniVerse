const KANJIERC721A = artifacts.require("KANJIERC721A");
const MarketPlace = artifacts.require("MarketPlace");
const truffleAssert = require("truffle-assertions");
const HackContract = artifacts.require("HackContract");
const HackContractInfiniteLoop = artifacts.require("HackContractInfiniteLoop");
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
            instanceAuction =  await MarketPlace.new(kanjiAddressFeesBeneficiaries,500,500,{from:brand_Account});
        })

    })



    describe("AUCTION WITH LAZY MINT", function () {

        it("SUCCESS : deploy ERC721A lazy", async () => {
            this.hackContract = await HackContract.new();
            
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
            await lazyERC721A.setAllowedMinters([brand_Account],{from:brand_Account})
        })

        it("SUCCESS : approve token for  market place", async () => {
            await lazyERC721A.setApprovalForAll(brand_Account,{from:brand_Account})
        })

        it("SUCCESS : approve token for  market place", async () => {
            await lazyERC721A.setApprovalForAll(instanceAuction.address,{from:brand_Account})
        })
        
        it("SUCCESS : create list (auction) with lazy mint", async () => {
            await instanceAuction.createList(
                {
                    addressContractToken: lazyERC721A.address,
                    addressMinter: brand_Account,
                    paused: false,
                    _beneficiariesAddr: [brand_Account,this.hackContract.address,accountBrandsRoyalties1],
                    _beneficiariesPercent: [8000,500,1000],
                    startDate: Math.floor(Date.now()/1000)-10,
                    endDate: Math.floor(Date.now()/1000)+5,
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

        it("SUCCESS : bidding on auction after start auction with brand_Account with 1000000000000000000 wei", async () =>{
            await instanceAuction.bidding(0,0,0,{from:brand_client_account,value:"1000000000000000000"})
        });

        it("SUCCESS : 0-99 lazy uri", async () =>{
            await lazyERC721A.setUri(
                100,
                "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
                2,
                {from:brand_Account}
            )
        });

        /*it("SUCCESS : lazy mint with brand account", async () =>{
            await lazyERC721A.lazyMint(
                10,
                brand_Account,
                0,
                {from:brand_Account}
            )
        });*/

        it("SUCCESS : end auction with account one", async () =>{
            console.log("hack contract eth : "+(await web3.eth.getBalance(this.hackContract.address)))
            console.log("contract eth : "+(await web3.eth.getBalance(instanceAuction.address)))
            console.log("brand client eth : "+(await web3.eth.getBalance(brand_client_account)))
            console.log((await lazyERC721A.balanceOf(brand_client_account,{from:brand_client_account}))+"")
            console.log("await 6 seconds")
            await timeout(6000);
            await instanceAuction.endAuction(0,0,0,0,{from:brand_client_account})
            console.log("hack contract eth : "+(await web3.eth.getBalance(this.hackContract.address)))
            console.log((await lazyERC721A.balanceOf(brand_client_account,{from:brand_client_account}))+"")
            console.log("contract eth : "+(await web3.eth.getBalance(instanceAuction.address)))
            console.log("brand client eth : "+(await web3.eth.getBalance(brand_client_account)))
        });
    });

    
})



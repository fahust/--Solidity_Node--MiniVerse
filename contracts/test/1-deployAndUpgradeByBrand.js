const MarketPlace = artifacts.require("MarketPlace");
const MarketPlaceV2 = artifacts.require("MarketPlaceV2");
const MarketPlaceV3 = artifacts.require("MarketPlaceV3");
const KANJIERC721A = artifacts.require("KANJIERC721A");
const truffleAssert = require("truffle-assertions");

const KANJIFACTORY = artifacts.require("KANJIFACTORY");

contract("FACTORY BY BRAND", async accounts => {
    const kanji_Account = accounts[0];
    const brand_Account = accounts[1];
    const brand_client_account = accounts[2];
    const kanjiAddressFeesBeneficiaries = accounts[6];


    describe("TEST PROXY CONTRACT",function () {

        it("SUCCESS : deploy proxy factory", async () =>{
            this.factory = await KANJIFACTORY.new({from:kanji_Account});
        })

        it("SUCCESS : deploy marketplaceV1 with brand_Account", async () =>{
            console.log(kanjiAddressFeesBeneficiaries)
            this.Marketplace = await MarketPlace.new(kanjiAddressFeesBeneficiaries,500,500,{from:brand_Account});
        })

        it("SUCCESS : first set transparent proxy and get proxy", async () =>{
            await this.Marketplace.registerToFactoryProxy(this.factory.address,{from:brand_Account});
        })

        it("SUCCESS : get proxy", async () =>{
            let proxies = await this.factory.proxies(this.Marketplace.address,{from:brand_Account});
            this.MarketplaceDelegate = await MarketPlace.at(proxies);
        })

        it("SUCCESS : deploy kanji erc721A", async () =>{
            this.instanceToken = await KANJIERC721A.new(
                "Name",
                "Symbol",
                10000,//maxmint
                [this.MarketplaceDelegate.address],//accepted marketplace address for lazy mint
                500,//royalty for superRare
                [brand_client_account],//address royalties
                [500],//fees royalties
                "contracturi",//contrat uri address for platform
                {from:brand_Account}
            );
        })

        it("ERROR : get last version", async () =>{
            console.log(await this.MarketplaceDelegate.VERSION.call({from: brand_Account})+"")
        })

        it("SUCCESS : deploy marketplaceV2 with brand_Account", async () =>{
            this.MarketplaceV2 = await MarketPlaceV2.new({from: brand_Account});
        })

        it("ERROR : upgrade proxy with marketplaceV2 with kanji_account", async () =>{
            await truffleAssert.reverts(
                this.MarketplaceDelegate.upgradeTo(
                    this.MarketplaceV2.address,
                    {from:kanji_Account}
                ),"Unauthorized Upgrade"
            );
        })

        it("ERROR : upgrade proxy with marketplaceV2 with kanji_account", async () =>{
            await truffleAssert.reverts(
                this.MarketplaceDelegate.upgradeTo(
                    this.MarketplaceV2.address,
                    {from:brand_client_account}
                ),"Unauthorized Upgrade"
            );
        })

        it("SUCCESS : upgrade proxy with marketplaceV2", async () =>{
            await this.MarketplaceDelegate.upgradeTo(this.MarketplaceV2.address,{from:brand_Account});
        })

        it("ERROR : upgrade proxy with marketplaceV2 with kanji_account", async () =>{
            await truffleAssert.reverts(
                this.MarketplaceDelegate.upgradeTo(
                    this.MarketplaceV2.address,
                    {from:kanji_Account}
                ),"Unauthorized Upgrade"
            );
        })

        it("ERROR : upgrade proxy with marketplaceV2 with kanji_account", async () =>{
            await truffleAssert.reverts(
                this.MarketplaceDelegate.upgradeTo(
                    this.MarketplaceV2.address,
                    {from:brand_client_account}
                ),"Unauthorized Upgrade"
            );
        })

        it("SUCCESS : upgrade proxy with marketplaceV2", async () =>{
            await this.MarketplaceDelegate.upgradeTo(this.MarketplaceV2.address,{from:brand_Account});
        })

        it("ERROR : get last version", async () =>{
            console.log(await this.MarketplaceDelegate.VERSION.call({from: brand_Account})+"")
        })

        it("SUCCESS : createlist with owner account with brand_Account", async () =>{
            await this.MarketplaceDelegate.createList(
                {
                    addressContractToken: this.instanceToken.address,//address of token
                    addressMinter: brand_Account,//address of owner tokens
                    paused: false,
                    _beneficiariesAddr: [kanji_Account],
                    _beneficiariesPercent: [9500],
                    listingId: 0,//autoincrement
                    startDate: 0,
                    endDate: 0,
                    direct: true,
                    tokenType: 2
                },
                {from:brand_Account}
            )
        })

        it("SUCCESS : add token to list with brand_Account", async () => {
            let tokenList = [];

            for (let index = 0; index < 1; index++) {
                tokenList.push({
                    lastBidder: "0x4a9C121080f6D9250Fc0143f41B595fD172E31bf",
                    lastBid: 0,
                    idToken: index,
                    quantity:1,
                    listingId: 0,
                    minPrice: 10,
                    currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                })
            }

            await this.MarketplaceDelegate.addTokenToList(
                tokenList,
                {from:brand_Account}
            )
        });

        it("SUCCESS : createlist with owner account with account_one", async () =>{
            await truffleAssert.reverts(
                this.MarketplaceDelegate.createList(
                {
                    addressContractToken: this.instanceToken.address,//address of token
                    addressMinter: brand_Account,//address of owner tokens
                    paused: false,
                    _beneficiariesAddr: [kanji_Account],
                    _beneficiariesPercent: [500],
                    listingId: 0,//autoincrement
                    startDate: 0,
                    endDate: 0,
                    direct: true,
                    tokenType: 2
                },
                {from:kanji_Account}
                ),"caller is not the owner"
            )
        })
        
        it("SUCCESS : get lists", async () =>{
            console.log("get lists : ",await this.MarketplaceDelegate.getLists({from:brand_client_account}))
        });

        it("SUCCESS : deploy marketplaceV3 with brand_Account", async () =>{
            this.MarketplaceV3 = await MarketPlaceV3.new({from: brand_Account});
        })

        it("ERROR : upgrade proxy with marketplaceV3", async () =>{
            await truffleAssert.reverts(
                this.MarketplaceDelegate.upgradeTo(
                    this.MarketplaceV3.address,
                    {from:kanji_Account}
                ),"Unauthorized Upgrade"
            );
        })

        it("SUCCESS : get last version", async () =>{
            console.log(await this.MarketplaceDelegate.VERSION.call({from: brand_Account})+"")
        })
        
        it("SUCCESS : get lists", async () =>{
            console.log("get lists : ",await this.MarketplaceDelegate.getLists({from:kanji_Account}))
        });
        
        it("SUCCESS : get proxy exist with first marketplace V1 address", async () =>{
            let proxies = await this.factory.proxies(this.Marketplace.address,{from: brand_Account});
            this.MarketplaceDelegate = await MarketPlace.at(proxies);
            console.log(this.MarketplaceDelegate.address)
        });
        
        it("ERROR : get proxy exist with first marketplace V2 address", async () =>{
            let proxies = await this.factory.proxies(this.MarketplaceV2.address,{from: brand_Account});

            await MarketPlace.at(proxies).catch(() => {
                console.log("no proxy at address 0x0000..")
            });;
        });

    })
})
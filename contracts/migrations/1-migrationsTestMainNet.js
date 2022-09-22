const KANJIDROPERC721A = artifacts.require("KANJIDROPERC721A");
//const HelloWorld = artifacts.require("HelloWorld");

/*function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}*/

module.exports = async function (deployer, network, accounts) {

  //const gasPrice = web3.eth.gasPrice.toNumber() * 1.40 


/*
  console.log(accounts[0])
  const MarketPlaceInstance = await deployProxy(MarketPlace, [accounts[2],500],{from:accounts[0]});
  console.log(MarketPlaceInstance.address)
  let MarketPlaceInstanceDeployed = await MarketPlace.deployed();*/

  await deployer.deploy(
    KANJIDROPERC721A,
    "Name",
    "Symbol",
    0,//_ROYALTYFEESINBIPS
    "0x83F6454928763865a81C651cCd3e5D5567871684",//_KANJIADDRESSFEES
    9500,//_KANJIFEESBENEFICIARIES
    ["0x83F6454928763865a81C651cCd3e5D5567871684"],//PAYEES
    [500],//SHARES_
    ["0x83F6454928763865a81C651cCd3e5D5567871684"],//_PAYEESBENEFICIARIES
    [500],//_SHARESBENEFICIARIES
    "",//__CONTRACTURI
    1000,//_MAXSUPPLY
    {from:accounts[0]}
  );
  let KANJIERC721AInstance = await KANJIDROPERC721A.deployed();
  console.log("DROPERC721A",KANJIERC721AInstance.address)

  /*await deployer.deploy(
    KANJIDROPERC721A,
    "Name",
    "Symbol",
    0,//_ROYALTYFEESINBIPS
    "0x83F6454928763865a81C651cCd3e5D5567871684",//_KANJIADDRESSFEES
    9500,//_KANJIFEESBENEFICIARIES
    ["0x83F6454928763865a81C651cCd3e5D5567871684"],//PAYEES
    [500],//SHARES_
    ["0x83F6454928763865a81C651cCd3e5D5567871684"],//_PAYEESBENEFICIARIES
    [500],//_SHARESBENEFICIARIES
    "",//__CONTRACTURI
    1000,//_MAXSUPPLY
    {from:accounts[0]}
  );
  let KANJIERC721AInstance = await KANJIDROPERC721A.deployed();
  console.log("DROPERC721A",KANJIERC721AInstance.address)*/
  
  /*await deployer.deploy(
    KANJIERC721A,
    "Name",
    "Symbol",
    10000,//maxmint
    ["0x12774d6c3a5F2d97eE3e7F2D805275e8e0d0640A"],//accepted marketplace address for lazy mint
    500,//royalty for superRare
    [accounts[0]],//address royalties
    [500],//fees royalties
    "https://ipfs.io/ipfs/QmZv8C7fkazfUKpmwQzNQoLfptwYGdZBExw4NNHj9aVUVM",//contrat uri address for platform
    {from:accounts[0]}
  );
  let KANJIERC721AInstance = await KANJIERC721A.deployed();
  console.log("721A",KANJIERC721AInstance.address)

  await KANJIERC721AInstance.setUri(
    5,
    "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
    1
  );*/

/*
  await deployer.deploy(
    KANJIERC1155,
    10000,//maxmint
    ["0x12774d6c3a5F2d97eE3e7F2D805275e8e0d0640A"],//accepted marketplace address for lazy mint
    500,//royalty for superRare
    [accounts[0]],//address royalties
    [500],//fees royalties
    "https://ipfs.io/ipfs/QmZv8C7fkazfUKpmwQzNQoLfptwYGdZBExw4NNHj9aVUVM",//contrat uri address for platform
    {from:accounts[0]}
  );
  let KANJIERC1155Instance = await KANJIERC1155.deployed();
  console.log("1155 : ",KANJIERC1155Instance.address)

  await KANJIERC1155Instance.setUri(
    "https://ipfs.io/ipfs/QmZgRyC6u66JrtdGYrocDANrDmZFpjikKB36w8SXUg9XDZ/",
    [10,10,10,10],
    [0,1,2,3],
    1
  );
  

  console.log("tokenuri1 : ",await KANJIERC1155Instance.tokenURI(
    1
  ));*/
  

  /*

  await KANJIERC721AInstance.setApprovalForAll("0x12774d6c3a5F2d97eE3e7F2D805275e8e0d0640A",{from:accounts[0]})

  await MarketPlaceInstance.createList(
    {
        addressContractToken: KANJIERC721AInstance.address,//address of token
        addressMinter: accounts[0],//address of owner tokens
        paused: false,
        _beneficiariesAddr: [accounts[0]],
        _beneficiariesPercent: [500],
        listingId: 0,//autoincrement
        startDate: 0,
        endDate: 0,
        direct: false,
        tokenType: 2
    },
    {from:accounts[0]})


    let tokenList = [];

    for (let index = 0; index < 1; index++) {
        tokenList.push({
            lastBidder: "0x4a9C121080f6D9250Fc0143f41B595fD172E31bf",
            lastBid: 0,
            _tokenInAuction: index,
            quantity:1,
            listingId: 0,
            minPrice: 10,
        })
    }

    await MarketPlaceInstance.addTokenToList(
      tokenList,
      {from:accounts[0]}
    )

    await MarketPlaceInstance.updateList(
      {
        addressContractToken: KANJIERC721AInstance.address,
        addressMinter: accounts[0],
        paused: false,
        _beneficiariesAddr: [accounts[0]],
        _beneficiariesPercent: [500],
        _tokenInAuction: 1,
        listingId: 0,
        startDate: Math.floor(Date.now()/1000)-10,
        endDate: Math.floor(Date.now()/1000)+20,
        direct: false,
        tokenType: 2
      },
      {from:accounts[0]})

      await MarketPlaceInstance.bidding(0,0,0,{from:accounts[0],value:11})

      //await MarketPlaceInstance.bidding(0,0,0,{from:accounts[0],value:13})

      await timeout(20000);
      await MarketPlaceInstance.endAuction(0,0,0,{from:accounts[0]})

      await MarketPlaceInstance.createList(
        {
            addressContractToken: KANJIERC721AInstance.address,
            addressMinter: accounts[0],
            paused: false,
            _beneficiariesAddr: [accounts[0]],
            _beneficiariesPercent: [500],
            listingId: 0,
            startDate: 0,
            endDate: 0,
            direct: true,
            tokenType: 2
        },
        {from:accounts[0]})

        await MarketPlaceInstance.addTokenToList(
          [{
              lastBidder: "0x4a9C121080f6D9250Fc0143f41B595fD172E31bf",
              lastBid: 0,
              _tokenInAuction: 1,
              quantity:1,
              listingId: 1,
              minPrice: 10,
          }],
          {from:accounts[0]})

        await MarketPlaceInstance.buy(1,1,1,{from:accounts[0],value:10});
  
*/
};
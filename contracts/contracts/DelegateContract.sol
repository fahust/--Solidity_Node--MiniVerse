// SPDX-License-Identifier: MIT
// Delegation contract
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Hero.sol";
import "./Class.sol";
import "./Items.sol";
import "./MV.sol";

contract DelegateContract is Ownable {
  address addressHero;
  address addressMVToken;
  address addressClassContract;
  address addressItem;
  mapping(string => uint256) paramsContract;
  uint8 countItems;
  uint256 currentpriceMV;

  constructor(
    address _addressHero,
    address _addressMVToken,
    address _addressClassContract,
    address _addressItem
  ) {
    addressHero = _addressHero;
    addressMVToken = _addressMVToken;
    addressClassContract = _addressClassContract;
    addressItem = _addressItem;
    Hero contratHero = Hero(addressHero);
    paramsContract["nextId"] = contratHero.getParamsContract("nextId");
    paramsContract["priceHero"] = 100000000000000000; //dev:100000000000000000000 == 100 eth
    paramsContract["totalPnt"] = 5;
    paramsContract["tokenLimit"] = 10000;
    paramsContract["nonce"] = 0;
    paramsContract["expForLevelUp"] = 100;
  }

  /****************************************
    PARAMS
     ****************************************/

  function setaddressHero(address _addressHero) external onlyOwner {
    addressHero = _addressHero;
  }

  function setParamsContract(string memory keyParams, uint256 valueParams) external onlyOwner {
    paramsContract[keyParams] = valueParams;
  }

  function getParamsContract(string memory keyParams) external view returns (uint256) {
    return paramsContract[keyParams];
  }

  function setParamsDelegate(string memory keyParams, uint256 valueParams) internal {
    Hero contratHero = Hero(addressHero);
    contratHero.setParamsContract(keyParams, valueParams);
  }

  function setAddressItem(address _addressItem) external {
    addressItem = _addressItem;
  }

  function getAddressItem() external view returns (address) {
    return addressItem;
  }

  /****************************************
    ITEMS
     ****************************************/

  function getParamsItem(uint256 id) external view returns (Items.Item memory) {
    Items contratItems = Items(addressItem);
    Items.Item memory itemTemp = contratItems.getItemDetails(id, msg.sender);
    return itemTemp;
  }

  function getBalanceOfItem(uint256 idItem) external view returns (uint256) {
    Items itemContrat = Items(addressItem);
    return itemContrat.balanceOf(msg.sender, idItem);
  }

  function farmItem(
    uint256 idItem,
    uint256 amount,
    address userAddress
  ) public onlyOwner {
    require(MV(addressMVToken).balanceOf(userAddress) > 0, "Not enought MV token");
    Items(addressItem).mint(userAddress, idItem, amount);
    MV(addressMVToken).burn(userAddress, 1);
  }

  function buyItem(
    uint256 idItem,
    uint256 amount,
    address userAddress
  ) public onlyOwner {
    uint256 price = Items(addressItem).getCurrentPrice(idItem) * amount;
    require(MV(addressMVToken).balanceOf(userAddress) > price, "Not enought MV token");
    Items(addressItem).mint(userAddress, idItem, amount);
    MV(addressMVToken).burn(userAddress, price);
  }

  function sellItem(
    uint256 amount,
    uint256 idItem,
    address userAddress
  ) external onlyOwner {
    uint256 price = Items(addressItem).getCurrentPrice(idItem) * amount;
    require(MV(addressMVToken).balanceOf(userAddress) > 1, "Not enought MV token");
    require(Items(addressItem).balanceOf(userAddress, idItem) > amount, "Not enought ITEM token");
    Items(addressMVToken).burn(userAddress, idItem, amount);
    MV(addressMVToken).mint(userAddress, price - 1);
  }

  function depositItem(uint256 id) public payable {
    (bool sent, bytes memory data) = addressItem.call{ value: msg.value }(
      abi.encodeWithSignature("deposit(uint256)", id)
    );
    require(sent, "Failed to send Ether");
  }

  function getCurrentPrice(uint256 idItem) public view returns (uint256) {
    return Items(addressItem).getCurrentPrice(idItem);
  }

  /****************************************
    HERO
     ****************************************/

  function giveHero(
    address to,
    string memory _tokenUri,
    uint8[] memory randomParts,
    uint256[] memory randomParams
  ) external onlyOwner {
    require(paramsContract["tokenLimit"] > 0, "No remaining");
    bool[] memory booleans = new bool[](20);
    paramsContract["nextId"]++;
    Hero contratHero = Hero(addressHero);
    contratHero.mint(to, booleans, randomParts, randomParams, _tokenUri);
  }

  function mintHero(
    address userAddress,
    string memory _tokenUri,
    uint256[] memory params
  ) external onlyOwner {
    require(
      MV(addressMVToken).balanceOf(userAddress) > paramsContract["priceHero"],
      "Not enought MV token"
    );
    MV(addressMVToken).burn(userAddress, paramsContract["priceHero"]);

    require(paramsContract["tokenLimit"] > 0, "No remaining");
    paramsContract["nextId"]++;

    params[6] = 0; //exp
    params[7] = 1; //level
    params[8] = block.timestamp; //date de création
    params[9] = 0; //tempClass.id; //class
    params[10] = paramsContract["priceHero"]; //class
    params[11] = paramsContract["nextId"]; //class

    Hero contratHero = Hero(addressHero);
    contratHero.mint(userAddress, params, _tokenUri);
  }

  function levelUp(
    address userAddress,
    uint8 statToLvlUp,
    uint256 tokenId
  ) public onlyOwner {
    Hero contratHero = Hero(addressHero);
    require(contratHero.getOwnerOf(tokenId) == userAddress, "Not your token");
    Hero.Token memory tokenTemp = contratHero.getTokenDetails(tokenId);
    require(
      tokenTemp.params8[6] > (100 + (paramsContract["expForLevelUp"]**tokenTemp.params8[7])),
      "experience not enought"
    );
    tokenTemp.params8[statToLvlUp]++;
    tokenTemp.params8[6] = 0;
    tokenTemp.params8[7]++;

    contratHero.updateToken(tokenTemp, tokenId, userAddress);
  }

  function transferHero(
    address userAddress,
    address contactAddr,
    uint256 tokenId
  ) external payable {
    Hero contratHero = Hero(addressHero);
    require(contratHero.getOwnerOf(tokenId) != userAddress, "Not your token");
    contratHero.transfer(contactAddr, userAddress, tokenId);
  }

  /*function purchase(address contactAddr, uint256 tokenId) external payable {
        Hero contrat = Hero(addressHero);
        Hero.Token memory token = contrat.getTokenDetails(tokenId);
        require(msg.value >= token.params256[1], "Insufficient fonds sent");
        require(contrat.getOwnerOf(tokenId) != msg.sender, "Already Owned");
        //contrat.updateToken(token,tokenId,msg.sender);
        contrat.transfer(contactAddr, msg.sender, tokenId);
    }*/

  function getAllHeroForUser(address userAddress) external view returns (uint256[] memory) {
    Hero contratHero = Hero(addressHero);
    return contratHero.getAllTokensForUser(userAddress);
  }

  function getHeroDetails(uint256 tokenId) external view returns (Hero.Token memory) {
    Hero contratHero = Hero(addressHero);
    return contratHero.getTokenDetails(tokenId);
  }

  /****************************************
    MV TOKEN
     ****************************************/

  function setCurrentPriceMV(uint256 price) external onlyOwner {
    currentpriceMV = price;
  }

  function buyMV(uint256 value, address sender) external payable {
    if (currentpriceMV != 0) require(msg.value >= (currentpriceMV * value), "More ETH required");
    if (currentpriceMV == 0)
      require(msg.value >= (getDynamicPriceMV() * value), "More ETH required");
    MV(addressMVToken).mint(sender, value * (10 ^ 18));
  }

  function sellMV(uint256 value) external {
    require(MV(addressMVToken).totalSupply() > value + 1, "No more this token");
    require(MV(addressMVToken).balanceOf(msg.sender) >= value * (10 ^ 18), "No more this token");
    if (currentpriceMV != 0) payable(msg.sender).transfer(currentpriceMV * value);
    if (currentpriceMV == 0) payable(msg.sender).transfer(getDynamicPriceMV() * value);
    MV(addressMVToken).burn(msg.sender, value * (10 ^ 18));
  }

  function getDynamicPriceMV() public view returns (uint256) {
    return MV(addressMVToken).getBalanceContract() / MV(addressMVToken).totalSupply();
  }

  /****************************************
    UTILS
     ****************************************/

  function random(uint8 maxNumber) internal returns (uint8) {
    uint256 randomnumber = uint256(
      keccak256(abi.encodePacked(block.timestamp, msg.sender, paramsContract["nonce"]))
    ) % maxNumber;
    paramsContract["nonce"]++;
    return uint8(randomnumber);
  }

  function random256(uint256 maxNumber) internal returns (uint256) {
    uint256 randomnumber = uint256(
      keccak256(abi.encodePacked(block.timestamp, msg.sender, paramsContract["nonce"]))
    ) % maxNumber;
    paramsContract["nonce"]++;
    return randomnumber;
  }

  /*FUNDS OF CONTRACT*/

  function withdraw() public onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }

  function deposit() public payable onlyOwner {}

  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }
}

/*randomParts[0] = stats[0]; //strong
        randomParts[1] = stats[1]; //endurance
        randomParts[2] = stats[2]; //concentration
        randomParts[3] = stats[3]; //agility
        randomParts[4] = stats[4]; //charisma
        randomParts[5] = stats[5]; //stealth
        //randomParts[6] = 0;//exp
        randomParts[7] = 1; //level
        randomParts[8] = peuple; //peuple
        randomParts[9] = tempClass.id; //class

        randomParams[0] = block.timestamp; //date de création
        randomParams[1] = price; //prix d'achat
        randomParams[2] = block.timestamp; //date de la dérnière action (il y a une heure) permettant de participer a des missions
        //randomParams[3] = 0;//Mission choisis (si 0 aucune current mission)
        //randomParams[4] = 0;//seconds pour finir la mission
        //randomParams[5] = 0;//difficulté de la quête (détermine l'exp gagné, et les objets % gagné)
        randomParams[6] = paramsContract["nextId"]; //tokenId
        randomParams[7] = generation; //type*/

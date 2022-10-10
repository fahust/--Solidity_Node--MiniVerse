// SPDX-License-Identifier: MIT
// Items Contract
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
Premier token d'inventaire, disons la money
 */
contract Items is ERC1155, Ownable {
  address adressDelegateContract;
  uint256 pricebase;
  uint256 currentprice;
  mapping(uint256 => uint256) price; //if 0 => price dynamic
  mapping(uint256 => uint256) value;
  mapping(uint256 => string) name;
  mapping(uint256 => uint256) rarity;
  mapping(uint256 => uint256) quantities;

  struct Item {
    string name;
    uint256 rarity;
    uint256 currentPrice;
    uint256 myBalance;
    uint256 allBalance;
  }

  constructor() ERC1155("") {}

  /**
    Foncton très importante que l'ont rajoute sur presque toutes les autres fonctions pour vérifier que l'appel des fonctions ce fais bien depuis le contrat de délégation pour plus de sécuriter
    */
  modifier byDelegate() {
    require(
      (msg.sender == adressDelegateContract || adressDelegateContract == address(0)),
      "Not good delegate contract"
    );
    _;
  }

  /** 
    modifier l'addresse du contrat de délégation pour permettre aux dit contrat d'intéragir avec celui ci
     */
  function setAdressDelegateContract(address _adress) external onlyOwner {
    adressDelegateContract = _adress;
  }

  function mint(
    address to,
    uint256 id,
    uint256 amount
  ) external byDelegate {
    _mint(to, id, amount, "");
    quantities[id] += amount;
    value[id] += amount;
  }

  function burn(
    address to,
    uint256 id,
    uint256 amount
  ) external byDelegate {
    _burn(to, id, amount);
    quantities[id] -= amount;
  }

  function setItem(
    uint256 id,
    string memory _name,
    uint256 _price,
    uint256 _rarity,
    uint256 _quantities
  ) external onlyOwner {
    name[id] = _name;
    price[id] = _price;
    rarity[id] = _rarity;
    quantities[id] = _quantities;
  }

  function getBalanceContract() public view returns (uint256) {
    return address(this).balance;
  }

  function getItemDetails(uint256 id, address myAddress) public view returns (Item memory) {
    return
      Item(
        name[id],
        rarity[id],
        getCurrentPrice(id),
        balanceOf(myAddress, id),
        getBalanceContract()
      );
  }

  /*ECONOMY*/

  /**
    Vente du jeton contre de l'eth/MATIC
     */
  function convertToAnotherToken(uint256 value, address anotherToken) public {
    /*require(totalSupply()>value+1,"No more this token");
        require(balanceOf(msg.sender)>=value,"No more this token");
        _burn(msg.sender,value);
        currentprice = setCurrentPrice();*/
  }

  function getCurrentPrice(uint256 id) public view returns (uint256) {
    if (price[id] == 0) return value[id] / quantities[id];
    if (price[id] != 0) return price[id];
  }

  /*FUNDS OF CONTRACT*/

  function withdraw(uint256 id, uint256 _value) public onlyOwner {
    require(value[id] > _value, "Not enought value in this token id");
    value[id] -= _value;
    payable(msg.sender).transfer(_value);
  }

  function withdrawAll() public onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }

  function deposit(uint256 id) public payable {
    value[id] += msg.value;
  }

  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  //receive() external payable {}
}

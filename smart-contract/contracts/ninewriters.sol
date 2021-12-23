//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NineWriters is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    
    uint public constant MAX_SUPPLY = 9;
    uint public constant PRICE = 0.001 ether; 

    string[] public textsOfTheWall;

    constructor() ERC721("9 writers", "9WRI") {
        textsOfTheWall = new string[](9);
    }

    modifier enoughNFTleft() {
        uint totalMinted = totalSupply();
        require(totalMinted < MAX_SUPPLY, "Not enough NFTs left");
        _;
    }


    modifier nbOfOwnedToken(uint nb) {
        require(balanceOf(msg.sender) == nb, "Operation denied");
        _;
    }

    function reserveNFT() public onlyOwner enoughNFTleft() {
        _mintSingleNFT();
    }

    function mintNFT() public payable enoughNFTleft() nbOfOwnedToken(0) {
        require(msg.value >= PRICE, "Not enough ether to purchase 1 NFT.");
        _mintSingleNFT();
    }

    function _mintSingleNFT() private {
        uint newTokenID = totalSupply();
        _safeMint(msg.sender, newTokenID);
    }


    function setText(string memory newText) external nbOfOwnedToken(1) {
        uint tokenId = tokenOfOwnerByIndex(msg.sender, 0);
        textsOfTheWall[tokenId] = newText;
    }

    function getTexts() external view returns (string[] memory) {
        return textsOfTheWall;
    }

    function withdraw() public payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");
    }

}
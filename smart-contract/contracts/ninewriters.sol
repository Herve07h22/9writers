//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NineWriters is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    event Updatedtext(address indexed from, uint256 indexed tokenId);
    
    Counters.Counter private _tokenIdCounter;
    uint public constant MAX_SUPPLY = 9;
    uint public constant PRICE = 0.001 ether; 

    string[] public textsOfTheWall;

    constructor() ERC721("9 writers", "9WRI") {
        textsOfTheWall = new string[](9);
        // _tokenIdCounter is initialized to 1, since starting at 0 leads to higher gas cost for the first minter
        // _tokenIdCounter.increment();

    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://9writers.com/writers/";
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
        _mintSingleNFT(msg.sender);
    }

    function mintNFT() public payable enoughNFTleft() nbOfOwnedToken(0) {
        require(msg.value >= PRICE, "Not enough ether to purchase 1 NFT.");
        _mintSingleNFT(msg.sender);
    }

    function _mintSingleNFT(address to) private {
        _safeMint(to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
        require(balanceOf(to) == 0, "Cannot transfer the NFT to someone who already owns one");
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function setText(string memory newText) external nbOfOwnedToken(1) {
        uint tokenId = tokenOfOwnerByIndex(msg.sender, 0);
        textsOfTheWall[tokenId] = newText;
        emit Updatedtext(msg.sender, tokenId);
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
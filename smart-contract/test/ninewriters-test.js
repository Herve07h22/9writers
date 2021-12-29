const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

describe("9 Writers", function () {
  let ninewriters;
  let contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    ninewriters = await ethers.getContractFactory("NineWriters");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    contract = await ninewriters.deploy();
    await contract.deployed();
  });

  it("Cannot write on the wall if you do not own a token", async function () {
    await expect(contract.setText("Hello, world!")).to.be.revertedWith(
      "Operation denied"
    );
  });

  it("The owner of the contrat can get a free token and write to the wall", async function () {
    const txn1 = await contract.reserveNFT();
    await txn1.wait();
    const txn2 = await contract.setText("Hello, world!");
    await txn2.wait();
    const texts = await contract.getTexts();
    expect(texts).to.deep.equal([
      "Hello, world!",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  });

  it("You cannot buy a token if you do not have enough money", async function () {
    await expect(
      contract.mintNFT({ value: utils.parseEther("0.0003") })
    ).to.be.revertedWith("Not enough ether to purchase 1 NFT.");
  });

  it("You can buy a token and write on the wall", async function () {
    const txn1 = await contract.mintNFT({ value: utils.parseEther("0.003") });
    await txn1.wait();
    const txn2 = await contract.setText("Bonjour, Monde!");
    await txn2.wait();
    const texts = await contract.getTexts();
    expect(texts).to.deep.equal([
      "Bonjour, Monde!",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  });

  it("2 owners can write on the wall", async function () {
    let txn = await contract
      .connect(addr1)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();
    txn = await contract.connect(addr1).setText("Hello, World!");
    await txn.wait();

    txn = await contract
      .connect(addr2)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();
    txn = await contract.connect(addr2).setText("Bonjour, Monde!");
    await txn.wait();

    const texts = await contract.getTexts();
    expect(texts).to.deep.equal([
      "Hello, World!",
      "Bonjour, Monde!",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const nbOfTokens = await contract.totalSupply();
    expect(nbOfTokens).to.equal(2);
  });

  it("A non owner cannot write on the wall", async function () {
    let txn = await contract
      .connect(addr1)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();
    txn = await contract.connect(addr1).setText("Hello, World!");
    await txn.wait();

    await expect(
      contract.connect(addr2).setText("Bonjour, monde!")
    ).to.be.revertedWith("Operation denied");

    const texts = await contract.getTexts();
    expect(texts).to.deep.equal([
      "Hello, World!",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  });

  it("An owner cannot buy another token", async function () {
    let txn = await contract
      .connect(addr1)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();

    await expect(
      contract.connect(addr1).mintNFT({ value: utils.parseEther("0.003") })
    ).to.be.revertedWith("Operation denied");
  });

  it("It cannot exist more than 9 tokens", async function () {
    for (let i = 0; i < 9; i++) {
      let txn = await contract
        .connect(addrs[i])
        .mintNFT({ value: utils.parseEther("0.003") });
      await txn.wait();
    }

    await expect(
      contract.connect(addr1).mintNFT({ value: utils.parseEther("0.003") })
    ).to.be.revertedWith("Not enough NFTs left");
  });

  it("A token cannot be sold to someone else if you do not own it", async function () {
    let txn = await contract
      .connect(addr1)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();
    txn = await contract
      .connect(addr2)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();
    txn = await contract.connect(addr1).setText("Hello, World!");
    await txn.wait();
    await expect(
      contract.connect(addr1).transferFrom(addr1.address, owner.address, 1)
    ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
  });

  it("A token cannot be sold to someone who already owns a token", async function () {
    let txn = await contract
      .connect(addr1)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();
    txn = await contract
      .connect(addr2)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();
    txn = await contract.connect(addr1).setText("Hello, World!");
    await txn.wait();
    await expect(
      contract.connect(addr1).transferFrom(addr1.address, addr2.address, 0)
    ).to.be.revertedWith(
      "Cannot transfer the NFT to someone who already owns one"
    );
  });

  it("A new text writen on the wall emits an event", async function () {
    let txn = await contract
      .connect(addr1)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();

    await expect(contract.connect(addr1).setText("Hello, World!"))
      .to.emit(contract, "Updatedtext")
      .withArgs(addr1.address, 0);
  });

  it("The amount of sales can be withdrawn", async function () {
    let txn = await contract
      .connect(addr1)
      .mintNFT({ value: utils.parseEther("0.01") });
    await txn.wait();

    txn = await contract.connect(owner).withdraw();
    await txn.wait();
    expect(txn).to.changeEtherBalance(owner, utils.parseEther("0.01"));
  });

  it("A token can be sold to someone else", async function () {
    let txn = await contract
      .connect(addr1)
      .mintNFT({ value: utils.parseEther("0.003") });
    await txn.wait();
    // Transfer the NFT to addr2
    txn = await contract
      .connect(addr1)
      .transferFrom(addr1.address, addr2.address, 0);
    await txn.wait();

    const txn2 = await contract.connect(addr2).setText("Bonjour, Monde!");
    await txn2.wait();
    const texts = await contract.getTexts();
    expect(texts).to.deep.equal([
      "Bonjour, Monde!",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  });
});

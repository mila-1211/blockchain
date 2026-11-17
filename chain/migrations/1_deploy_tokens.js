const MoolahCoin = artifacts.require("MoolahCoin");
const Condos = artifacts.require("Condos");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(MoolahCoin);
  await deployer.deploy(Condos);

  const coin = await MoolahCoin.deployed();
  const condos = await Condos.deployed();

  await coin.mint(accounts[0], "10000000", {
    from: accounts[0]
  });

  await condos.createNFT(accounts[0], "Can ho A101", {
    from: accounts[0]
  });

  console.log("MoolahCoin:", coin.address);
  console.log("Condos:", condos.address);
  console.log("Tai khoan demo:", accounts[0]);
};
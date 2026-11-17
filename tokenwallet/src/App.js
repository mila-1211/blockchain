import React, { Component } from 'react';
import Web3 from 'web3/dist/web3.min.js';
import Tokens20 from './Tokens/all20';
import Tokens721 from './Tokens/all721';
import Nav from './Components/Nav';
import Description from './Components/Description';
import Container from './Components/Container';
import InstallMetamask from './Components/InstallMetamask';

class App extends Component {
    constructor() {
        super();

        this.tokens20 = Tokens20;
        this.tokens721 = Tokens721;
        this.appName = 'TokenWallet';
        this.isWeb3 = true;

        this.newTransfer20 = this.newTransfer20.bind(this);
        this.newTransfer721 = this.newTransfer721.bind(this);
        this.newMint20 = this.newMint20.bind(this);
        this.newMint721 = this.newMint721.bind(this);
        this.newApprove20 = this.newApprove20.bind(this);
        this.newApprove721 = this.newApprove721.bind(this);
        this.closeTransfer = this.closeTransfer.bind(this);
        this.onInputChangeUpdateField = this.onInputChangeUpdateField.bind(this);

        this.state = {
            inProgress: false,
            tx20: null,
            tx721: null,
            network: 'Checking...',
            account: null,
            tokens20: [],
            tokens721: [],
            transferDetail20: {},
            transferDetail721: {},
            mintDetail20: {},
            mintDetail721: {},
            approveDetail20: {},
            approveDetail721: {},
            fields: {
                receiver: null,
                amount: null,
                metadata: null,
                tokenId: null,
                tokenid: null,
                gasPrice: null,
                gasLimit: null,
            },
            defaultGasPrice: null,
            defaultGasLimit: 200000
        };
    }

    setNetwork = async () => {
        try {
            const networkId = await this.web3.eth.net.getId();
            let networkName;
            switch (networkId.toString()) {
                case "1":
                    networkName = "Main";
                    break;
                case "2":
                    networkName = "Morden";
                    break;
                case "3":
                    networkName = "Ropsten";
                    break;
                case "4":
                    networkName = "Rinkeby";
                    break;
                case "42":
                    networkName = "Kovan";
                    break;
                case "11155111":
                    networkName = "Sepolia";
                    break;
                case "5777":
                    networkName = "5777";
                    break;
                default:
                    networkName = networkId.toString();
            }
            this.setState({ network: networkName });
        } catch (err) {
            console.error("Lỗi lấy Network ID:", err);
        }
    };

    setGasPrice = async () => {
        try {
            const price = await this.web3.eth.getGasPrice();
            const Gasprice = this.web3.utils.fromWei(price.toString(), 'gwei');
            this.setState({ defaultGasPrice: Gasprice });
        } catch (err) {
            console.error("Lỗi lấy Gas Price:", err);
        }
    };

    newTransfer20 = (index) => {
        this.setState({
            transferDetail20: this.state.tokens20[index]
        });
    };

    newTransfer721 = (index) => {
        this.setState({
            transferDetail721: this.state.tokens721[index]
        });
    };

    newMint20 = (index) => {
        this.setState({
            mintDetail20: this.state.tokens20[index]
        });
    };

    newMint721 = (index) => {
        this.setState({
            mintDetail721: this.state.tokens721[index]
        });
    };

    newApprove20 = (index) => {
        this.setState({
            approveDetail20: this.state.tokens20[index]
        });
    };

    newApprove721 = (index) => {
        this.setState({
            approveDetail721: this.state.tokens721[index]
        });
    };

    closeTransfer = () => {
        this.setState({
            transferDetail20: {},
            transferDetail721: {},
            mintDetail20: {},
            mintDetail721: {},
            approveDetail20: {},
            approveDetail721: {},
            fields: {},
        });
    };

    resetApp = () => {
        this.setState({
            transferDetail20: {},
            transferDetail721: {},
            fields: {
                receiver: null,
                amount: null,
                gasPrice: null,
                gasLimit: null,
                metadata: null,
                tokenId: null,
                tokenid: null,
            },
            defaultGasPrice: null,
        });
        window.location.reload();
    };

    Transfer = () => {
        this.setState({ inProgress: true });

        const isNFT = Boolean(this.state.transferDetail721.address);
        const contract = isNFT
            ? new this.web3.eth.Contract(this.state.transferDetail721.abi, this.state.transferDetail721.address)
            : new this.web3.eth.Contract(this.state.transferDetail20.abi, this.state.transferDetail20.address);

        const app = this;
        const receiver = this.state.fields.receiver ? this.state.fields.receiver.toString() : "";
        const account = this.state.account;

        if (isNFT) {
            const tokenId = this.state.fields.tokenid || this.state.fields.tokenId || this.state.transferDetail721.tokenid;
            const metadata = this.state.fields.metadata || "";

            contract.methods.transferNFT(account, receiver, tokenId, metadata)
                .send({ from: account })
                .then(function (response) {
                    app.resetApp();
                    app.setState({
                        tx721: response.transactionHash,
                        inProgress: false
                    });
                })
                .catch(function (err) {
                    console.error("Transfer NFT Error:", err);
                    app.setState({ inProgress: false });
                });
        } else {
            const rawAmount = Number(this.state.fields.amount) || 0;
            const decimal = this.state.transferDetail20.decimal || 0;
            const amount = (rawAmount * Math.pow(10, decimal)).toString();

            contract.methods.transfer(receiver, amount)
                .send({ from: account })
                .then(function (response) {
                    app.resetApp();
                    app.setState({
                        tx20: response.transactionHash,
                        inProgress: false
                    });
                })
                .catch(function (err) {
                    console.error("Transfer Token Error:", err);
                    app.setState({ inProgress: false });
                });
        }
    };

    Mint = () => {
        this.setState({ inProgress: true });

        const isNFT = Boolean(this.state.mintDetail721.address);
        const contract = isNFT
            ? new this.web3.eth.Contract(this.state.mintDetail721.abi, this.state.mintDetail721.address)
            : new this.web3.eth.Contract(this.state.mintDetail20.abi, this.state.mintDetail20.address);

        const app = this;
        const receiver = this.state.fields.receiver ? this.state.fields.receiver.toString() : this.state.account;
        const account = this.state.account;

        if (isNFT) {
            const metadata = this.state.fields.metadata || "New Condo";

            contract.methods.createNFT(receiver, metadata)
                .send({ from: account })
                .then(function (response) {
                    app.resetApp();
                    app.setState({
                        tx721: response.transactionHash,
                        inProgress: false
                    });
                })
                .catch(function (err) {
                    console.error("Mint NFT Error:", err);
                    app.setState({ inProgress: false });
                });
        } else {
            const rawAmount = Number(this.state.fields.amount) || 0;
            const decimal = this.state.mintDetail20.decimal || 0;
            const amount = (rawAmount * Math.pow(10, decimal)).toString();

            contract.methods.mint(receiver, amount)
                .send({ from: account })
                .then(function (response) {
                    app.resetApp();
                    app.setState({
                        tx20: response.transactionHash,
                        inProgress: false
                    });
                })
                .catch(function (err) {
                    console.error("Mint Token Error:", err);
                    app.setState({ inProgress: false });
                });
        }
    };

    Approve = () => {
        this.setState({ inProgress: true });

        const isERC20 = Boolean(this.state.approveDetail20.abi);
        const contract = isERC20
            ? new this.web3.eth.Contract(this.state.approveDetail20.abi, this.state.approveDetail20.address)
            : new this.web3.eth.Contract(this.state.approveDetail721.abi, this.state.approveDetail721.address);

        const app = this;
        const receiver = this.state.fields.receiver ? this.state.fields.receiver.toString() : "";
        const account = this.state.account;

        if (isERC20) {
            const rawAmount = Number(this.state.fields.amount) || 0;
            const decimal = this.state.approveDetail20.decimal || 0;
            const amount = (rawAmount * Math.pow(10, decimal)).toString();

            contract.methods.approve(receiver, amount)
                .send({ from: account })
                .then(function (response) {
                    app.resetApp();
                    app.setState({
                        tx20: response.transactionHash,
                        inProgress: false
                    });
                })
                .catch(function (err) {
                    console.error("Approve ERC20 Error:", err);
                    app.setState({ inProgress: false });
                });
        } else {
            const tokenId = this.state.fields.tokenid || this.state.fields.tokenId || this.state.approveDetail721.tokenid;

            contract.methods.approve(receiver, tokenId)
                .send({ from: account })
                .then(function (response) {
                    app.resetApp();
                    app.setState({
                        tx721: response.transactionHash,
                        inProgress: false
                    });
                })
                .catch(function (err) {
                    console.error("Approve NFT Error:", err);
                    app.setState({ inProgress: false });
                });
        }
    };

    onInputChangeUpdateField = (name, value) => {
        const fields = this.state.fields;
        fields[name] = value;
        this.setState({ fields });
    };

    componentDidMount() {
        if (!window.ethereum) {
            this.setState({ isWeb3: false });
            return;
        }

        const ethereum = window.ethereum;
        window.web3 = new Web3(ethereum);
        this.web3 = new Web3(ethereum);

        const requestMethod = ethereum.request
            ? ethereum.request({ method: 'eth_requestAccounts' })
            : ethereum.enable();

        requestMethod.then((accounts) => {
            const account = accounts[0];
            this.web3.eth.defaultAccount = account;
            const app = this;

            this.setState({ account });
            this.setNetwork();
            this.setGasPrice();

            // 1. Tải danh sách ERC20 Tokens (Luôn hiển thị thẻ kể cả khi balance = 0)
            Tokens20.forEach((token) => {
                const erc20Token = new this.web3.eth.Contract(token.abi, token.address);

                erc20Token.methods.balanceOf(account).call().then(function (response) {
                    const decimal = token.decimal || 0;
                    const precision = Math.pow(10, decimal);
                    let balance = (Number(response) || 0) / precision;
                    balance = balance >= 0 ? balance : 0;

                    const tokenData = {
                        decimal,
                        balance,
                        name: token.name,
                        symbol: token.symbol,
                        icon: token.icon,
                        abi: token.abi,
                        address: token.address,
                    };

                    app.setState(prevState => ({
                        tokens20: [...prevState.tokens20.filter(t => t.address !== token.address), tokenData]
                    }));
                }).catch(function (err) {
                    console.error("Lỗi đọc ERC20 balanceOf:", err);
                    // Hiển thị thẻ với số dư 0 nếu hợp đồng chưa triển khai hoặc lỗi đọc
                    const tokenData = {
                        decimal: token.decimal || 0,
                        balance: 0,
                        name: token.name,
                        symbol: token.symbol,
                        icon: token.icon,
                        abi: token.abi,
                        address: token.address,
                    };
                    app.setState(prevState => ({
                        tokens20: [...prevState.tokens20.filter(t => t.address !== token.address), tokenData]
                    }));
                });
            });

            // 2. Tải danh sách ERC721 Tokens (Luôn hiển thị thẻ để có nút Mint)
            Tokens721.forEach((token721) => {
                const erc721Token = new this.web3.eth.Contract(token721.abi, token721.address);

                erc721Token.methods.MDTrack(account).call().then(function (response) {
                    const tokenid = Number(response) || 0;

                    if (tokenid !== 0) {
                        erc721Token.methods.tokenURI(tokenid).call().then(function (uriRes) {
                            const tokenData = {
                                name: token721.name,
                                symbol: token721.symbol,
                                tokenid: tokenid,
                                icon: token721.icon,
                                abi: token721.abi,
                                address: token721.address,
                                metadata: uriRes || "No metadata",
                            };

                            app.setState(prevState => ({
                                tokens721: [...prevState.tokens721.filter(t => t.address !== token721.address), tokenData]
                            }));
                        }).catch(() => {
                            const tokenData = {
                                name: token721.name,
                                symbol: token721.symbol,
                                tokenid: tokenid,
                                icon: token721.icon,
                                abi: token721.abi,
                                address: token721.address,
                                metadata: "New Delhi",
                            };
                            app.setState(prevState => ({
                                tokens721: [...prevState.tokens721.filter(t => t.address !== token721.address), tokenData]
                            }));
                        });
                    } else {
                        // Chưa sở hữu NFT: hiển thị thẻ với tokenid: 0 để hiển thị nút Mint
                        const tokenData = {
                            name: token721.name,
                            symbol: token721.symbol,
                            tokenid: 0,
                            icon: token721.icon,
                            abi: token721.abi,
                            address: token721.address,
                            metadata: "No NFT owned yet",
                        };
                        app.setState(prevState => ({
                            tokens721: [...prevState.tokens721.filter(t => t.address !== token721.address), tokenData]
                        }));
                    }
                }).catch(function (err) {
                    console.error("Lỗi đọc ERC721 MDTrack:", err);
                    const tokenData = {
                        name: token721.name,
                        symbol: token721.symbol,
                        tokenid: 0,
                        icon: token721.icon,
                        abi: token721.abi,
                        address: token721.address,
                        metadata: "No NFT owned yet",
                    };
                    app.setState(prevState => ({
                        tokens721: [...prevState.tokens721.filter(t => t.address !== token721.address), tokenData]
                    }));
                });
            });
        }).catch(err => {
            console.error("Lỗi kết nối ví:", err);
        });
    }

    render() {
        if (this.isWeb3) {
            return (
                <div>
                    <Nav appName={this.appName} network={this.state.network} />
                    <Description />
                    <Container
                        onInputChangeUpdateField={this.onInputChangeUpdateField}
                        transferDetail20={this.state.transferDetail20}
                        transferDetail721={this.state.transferDetail721}
                        mintDetail20={this.state.mintDetail20}
                        mintDetail721={this.state.mintDetail721}
                        approveDetail20={this.state.approveDetail20}
                        approveDetail721={this.state.approveDetail721}
                        closeTransfer={this.closeTransfer}
                        newTransfer20={this.newTransfer20}
                        newTransfer721={this.newTransfer721}
                        newApprove20={this.newApprove20}
                        newApprove721={this.newApprove721}
                        newMint20={this.newMint20}
                        newMint721={this.newMint721}
                        Transfer={this.Transfer}
                        Mint={this.Mint}
                        Approve={this.Approve}
                        account={this.state.account}
                        defaultGasPrice={this.state.defaultGasPrice}
                        defaultGasLimit={this.state.defaultGasLimit}
                        tx20={this.state.tx20}
                        tx721={this.state.tx721}
                        inProgress={this.state.inProgress}
                        fields={this.state.fields}
                        tokens20={this.state.tokens20}
                        tokens721={this.state.tokens721}
                    />
                </div>
            );
        } else {
            return <InstallMetamask />;
        }
    }
}

export default App;
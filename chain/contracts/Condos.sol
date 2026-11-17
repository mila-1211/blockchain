pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol";

contract Condos is ERC721Metadata {
    uint32 public Id;
    mapping(address => uint32) public MDTrack;

    constructor()
        ERC721Metadata("Condos Token", "CONDO")
        payable
        public
    {
        Id = 0;
    }

    function createNFT(
        address receiver,
        string calldata metadata
    ) external returns (uint32) {
        Id++;
        _mint(receiver, Id);
        _setTokenURI(Id, metadata);
        MDTrack[receiver] = Id;
        return Id;
    }

    function transferNFT(
        address sender,
        address receiver,
        uint32 transId,
        string calldata metadata
    ) external {
        transferFrom(sender, receiver, transId);
        _setTokenURI(transId, metadata);

        if (MDTrack[sender] == transId) {
            delete MDTrack[sender];
        }

        MDTrack[receiver] = transId;
    }
}
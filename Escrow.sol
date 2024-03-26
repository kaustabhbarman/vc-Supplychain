// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Escrow{
    
    struct escrow{
        uint amount;
        uint expiryTimeStamp;
        address buyer;
        address seller;
        address agent;
        bool delivered;

    }
    constructor(){
    }
    uint nonce;
    mapping(bytes32 => escrow)public  escrowRegistry;

    function openEscrow(address _seller,address _agent, uint256 secondsTillExpiry ) external payable returns(bytes32 _escrowId){
        address _buyer = msg.sender;
        uint _amount = msg.value;
        _escrowId = keccak256(abi.encodePacked(_buyer,nonce));
        uint _expiryTimeStamp = block.timestamp + secondsTillExpiry;
        escrowRegistry[_escrowId].amount =_amount;
        escrowRegistry[_escrowId].buyer =_buyer;
        escrowRegistry[_escrowId].agent =_agent;
        escrowRegistry[_escrowId].seller =_seller;
        escrowRegistry[_escrowId].expiryTimeStamp =_expiryTimeStamp;
        nonce += 1;
    }

    function withdrawAmount(bytes32 _escrowId) external payable  returns (bool){
        require((escrowRegistry[_escrowId].delivered== true && msg.sender == escrowRegistry[_escrowId].seller)
        ||(escrowRegistry[_escrowId].delivered== false && msg.sender == escrowRegistry[_escrowId].buyer && block.timestamp >= escrowRegistry[_escrowId].expiryTimeStamp));
        payable(msg.sender).transfer(escrowRegistry[_escrowId].amount);
        return (true);
    }

    function delivered(bytes32 _escrowId, bool _delivered) external returns(bool){
        require(msg.sender == escrowRegistry[_escrowId].agent);
        escrowRegistry[_escrowId].delivered = _delivered;
        return (_delivered);
    }

}
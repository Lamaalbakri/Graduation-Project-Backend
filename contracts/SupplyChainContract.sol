// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SupplyChainContract {
    struct Item {
        bytes32 itemName;
        uint quantity;
        string options;
    }

    struct Contract {
        bytes32 purchaseOrderId;
        bytes32 transportOrderId;
        bytes32 sellerShortId;
        bytes32 sellerName;
        bytes32 buyerShortId;
        bytes32 buyerName;
        bytes32 transporterId;
        bytes32 transporterName;
        Item[] items;
        uint transportType;
        uint weight;
        uint totalBuyerPayment;
        uint totalTransportPayment;
        uint[] estimatedDeliveryTimes;
        uint actualDeliveryTime;
        uint purchaseOrderStatus;
        string sellerAddress;
        string buyerAddress;
    }

    mapping(address => mapping(uint => Contract)) public contracts;

    address public companyAddress;

    constructor() {
        companyAddress = msg.sender;
    }

    modifier onlyCompany() {
        require(
            msg.sender == companyAddress,
            "You are not authorized to perform this action"
        );
        _;
    }

    event ContractCreated(
        uint contractId,
        bytes32 purchaseOrderId,
        bytes32 transportOrderId,
        bytes32 sellerShortId,
        bytes32 buyerShortId,
        bytes32 transporterId
    );

    event ContractDelivered(uint contractId, uint actualDeliveryTime);

    uint public contractCounter;

    function createContract(
        bytes32 purchaseOrderId,
        bytes32 transportOrderId,
        bytes32 sellerShortId,
        bytes32 sellerName,
        bytes32 buyerShortId,
        bytes32 buyerName,
        bytes32 transporterId,
        bytes32 transporterName,
        uint totalBuyerPayment,
        uint totalTransportPayment,
        uint[] memory estimatedDeliveryTimes,
        string memory sellerAddress,
        string memory buyerAddress,
        bytes32[] memory itemNames,
        uint[] memory quantities,
        string[] memory options,
        uint transportType,
        uint weight
    ) public onlyCompany returns (uint) {
        uint currentContractId = contractCounter++;
        Contract storage newContract = contracts[msg.sender][currentContractId];
        newContract.purchaseOrderId = purchaseOrderId;
        newContract.transportOrderId = transportOrderId;
        newContract.sellerShortId = sellerShortId;
        newContract.sellerName = sellerName;
        newContract.buyerShortId = buyerShortId;
        newContract.buyerName = buyerName;
        newContract.transporterId = transporterId;
        newContract.transporterName = transporterName;
        newContract.totalBuyerPayment = totalBuyerPayment;
        newContract.totalTransportPayment = totalTransportPayment;
        newContract.estimatedDeliveryTimes = estimatedDeliveryTimes;
        newContract.sellerAddress = sellerAddress;
        newContract.buyerAddress = buyerAddress;
        newContract.purchaseOrderStatus = 0;
        newContract.transportType = transportType;
        newContract.weight = weight;

        for (uint i = 0; i < itemNames.length; i++) {
            Item memory newItem;
            newItem.itemName = itemNames[i];
            newItem.quantity = quantities[i];
            newItem.options = options[i];

            newContract.items.push(newItem);
        }

        emit ContractCreated(
            currentContractId,
            purchaseOrderId,
            transportOrderId,
            sellerShortId,
            buyerShortId,
            transporterId
        );
        return currentContractId;
    }

    function getContract(
        address _companyAddress,
        uint contractId
    ) public view returns (Contract memory) {
        return contracts[_companyAddress][contractId];
    }

    function markContractAsDelivered(
        address contractAddress,
        uint contractId,
        uint actualDeliveryTime
    ) public onlyCompany {
        Contract storage existingContract = contracts[contractAddress][
            contractId
        ];
        existingContract.purchaseOrderStatus = 1;
        existingContract.actualDeliveryTime = actualDeliveryTime;

        emit ContractDelivered(contractId, actualDeliveryTime);
    }

    function getItemFromContract(
        address contractAddress,
        uint contractId,
        uint itemIndex
    ) public view returns (Item memory) {
        return contracts[contractAddress][contractId].items[itemIndex];
    }
}

// SPDX-License-Identifier: MIT
// Struct.sol
pragma solidity ^0.8.6;


library Struct {

    struct List {
        address addressContractToken; // 20 bytes
        bool direct;//false = auction 1 byte
        uint8 tokenType; // 1 byte
        bool paused; // 1 byte
        // = 1 slot, 27 bytes
        address addressMinter; // 20 bytes
        uint48 startDate; // 6bytes // max value 281,474,976,710,656
        uint48 endDate; // 6bytes
        // = 1 slot, 32 bytes
        address[] _beneficiariesAddr; // 1 slot
        uint256[] _beneficiariesPercent; // 1 slot
        // = 4 slots instead of 8 in original.
    }
    struct Token {
        address lastBidder; // 20 bytes
        uint32 idToken; //4 bytes; max value 4,294,967,295
        uint32 quantity; //4 bytes;
        uint32 listingId; //4 bytes
        // = 1 slot, 32 bytes
        uint256 lastBid; // 1 slot
        uint256 minPrice; // 1 slot
        address currency; // 1 slot
    }
// 3 slots instead of 6 in original.

}
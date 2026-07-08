// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IDIDRegistry {
    function didExists(
        string calldata did
    ) external view returns (bool);

    function getOwner(
        string calldata did
    ) external view returns (address);
}
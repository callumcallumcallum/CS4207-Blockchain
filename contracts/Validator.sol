// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AcademicToken.sol";

contract Validator {
    AcademicToken public token;

    mapping(address => uint256) public stakes;
    mapping(address => bool) public isValidator;
    address[] public studentValidators;

    uint256 public circulatingSupply;
    uint256 public minimumStake;

    mapping(address => bool) public facultyValidators;

    address public admin;

    event ValidatorAdded(address indexed validator, uint256 stake);
    event ValidatorRemoved(address indexed validator);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);

    constructor(address tokenAddress) {
        token = AcademicToken(tokenAddress);
        circulatingSupply = token.totalSupply();
        minimumStake = circulatingSupply / 1000000000;
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action");
        _;
    }

    function addFacultyValidator(address faculty) public onlyAdmin {
        require(!facultyValidators[faculty], "Already a faculty validator");
        facultyValidators[faculty] = true;
        emit ValidatorAdded(faculty, 0);
    }

    function removeFacultyValidator(address faculty) public onlyAdmin {
        require(facultyValidators[faculty], "Not a faculty validator");
        facultyValidators[faculty] = false;
        emit ValidatorRemoved(faculty);
    }

    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero");
        admin = newAdmin;
    }

    function stakeTokens(uint256 amount) public {
        require(amount >= minimumStake, "Amount must meet the minimum stake");

        token.transferFrom(msg.sender, address(this), amount);

        stakes[msg.sender] += amount;

        if (!isValidator[msg.sender]) {
            isValidator[msg.sender] = true;
            studentValidators.push(msg.sender);
            emit ValidatorAdded(msg.sender, amount);
        } else {
            emit TokensStaked(msg.sender, amount);
        }
    }

    function unstakeTokens(uint256 amount) public {
        require(stakes[msg.sender] >= amount, "Not enough staked tokens");
        stakes[msg.sender] -= amount;

        if (stakes[msg.sender] < minimumStake && isValidator[msg.sender]) {
            isValidator[msg.sender] = false;
            removeStudentValidator(msg.sender);
            emit ValidatorRemoved(msg.sender);
        } else {
            emit TokensUnstaked(msg.sender, amount);
        }

        token.transfer(msg.sender, amount);
    }

    function updateMinimumStake() public {
        circulatingSupply = token.totalSupply();
        minimumStake = circulatingSupply / 1000;
    }

    function rewardValidator(address validator, uint256 rewardAmount) public onlyAdmin {
        require(isValidator[validator] || facultyValidators[validator], "Not a validator");
        token.transfer(validator, rewardAmount);
    }

    function removeStudentValidator(address validator) internal {
        for (uint256 i = 0; i < studentValidators.length; i++) {
            if (studentValidators[i] == validator) {
                studentValidators[i] = studentValidators[studentValidators.length - 1];
                studentValidators.pop();
                break;
            }
        }
    }

    function getStudentValidators() public view returns (address[] memory) {
        return studentValidators;
    }


    function getFacultyValidators() public view returns (address[] memory) {
        address[] memory result = new address[](studentValidators.length);
        uint256 index = 0;

        for (uint256 i = 0; i < studentValidators.length; i++) {
            if (facultyValidators[studentValidators[i]]) {
                result[index] = studentValidators[i];
                index++;
            }
        }

        return result;    }
}

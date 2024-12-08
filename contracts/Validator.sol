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

    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event TokensStaked(address indexed user);
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
        emit ValidatorAdded(faculty);
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

    function addStudentValidator(address user) public {

        if (!isValidator[user]) {
            isValidator[user] = true;
            studentValidators.push(user);
            emit ValidatorAdded(user);
        } else {
            emit TokensStaked(user);
        }
    }


    function updateMinimumStake() public {
        circulatingSupply = token.totalSupply();
        minimumStake = circulatingSupply / 1000;
    }

    function rewardValidator(address validator, uint256 rewardAmount) public onlyAdmin {
        require(isValidator[validator] || facultyValidators[validator], "Not a validator");
        token.transfer(validator, rewardAmount);
    }

    function removeStudentValidator(address validator) public {
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

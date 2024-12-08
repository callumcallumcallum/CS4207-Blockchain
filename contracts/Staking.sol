// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AcademicToken.sol"; 
import "./Validator.sol";

contract Staking is Ownable{
    AcademicToken public stakingToken;
    AcademicToken public rewardToken;
    Validator public validator;

    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;
    
    mapping(address => uint256) public balance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _stakingToken, uint256 _rewardRate, address _validator){ 
        stakingToken = AcademicToken(_stakingToken);
        rewardToken = AcademicToken(_stakingToken);
        validator = Validator(_validator);
        rewardRate = _rewardRate;
    }

    modifier updateReward(address account){
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if(account != address(0)){
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256){
        if(totalStaked == 0){
            return rewardPerTokenStored;
        }

        return rewardPerTokenStored + ((block.timestamp - lastUpdateTime) * rewardRate * 1e18 / totalStaked);
    }


    function earned(address account) public view returns (uint256){
        return balance[account] * (rewardPerToken() - userRewardPerTokenPaid[account]) / 1e18 + rewards[account];
    }

    function stake(uint256 amount) public updateReward(msg.sender){
        require(amount > 0, "Can't stake a value of zero.");
    
        totalStaked += amount;
        balance[msg.sender] += amount;

        stakingToken.transferFrom(msg.sender, address(this), amount);

        if (balance[msg.sender] >= 1000){
            validator.addStudentValidator(msg.sender);
        }

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) public updateReward(msg.sender){
        require(amount > 0, "Can't withdraw a value of zero.");
        require(balance[msg.sender] >= amount, "Insufficient balance4.");

        totalStaked -= amount;
        balance[msg.sender] -= amount;
        if (balance[msg.sender] < 1000){
            validator.removeStudentValidator(msg.sender);
        }
        stakingToken.transfer(msg.sender, amount);  
        emit Withdrawn(msg.sender, amount);
    }

    function setRewardRate(uint256 _rewardRate) public updateReward(address(0)){
        rewardRate = _rewardRate;
    }

    function payValidatorReward(address valAddr) public updateReward(valAddr){
        uint256 reward = earned(valAddr);
        require(reward > 0, "No reward available :(");

        rewards[valAddr] = 0;
        rewardToken.mint(address(this), reward);
        rewardToken.transfer(valAddr, reward);
        emit RewardPaid(valAddr, reward);

    }

}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AcademicToken.sol";
import "./Staking.sol";
import "./Validator.sol";

contract AcademicResources {
    AcademicToken private tokenContract;
    Validator public validator;
    Staking public staking;

    struct Resource {
        uint256 id;
        string name;
        string url;
        address uploader;
        uint256 upvotes;
        uint256 reports;
        bool validated;
        bool reported;
        address reporter;
    }

    Resource[] private resources;
    Resource[] private pendingResources; //these are resources that haven't been validated yer

    uint256 private nextResourceId = 1;


    // Events (for updating logs)
    event ResourceUploaded(uint256 id, string name, string url, address uploader);
    event ResourceValidated(uint256 id, address validator);
    event ResourceUpvoted(uint256 id, address upvoter, uint256 upvoteCount);
    event ResourceReported(uint256 id, address reporter, uint256 reportCount);
    event ResourceDeleted(uint256 id);
    event TokensRewarded(address indexed user, uint256 amount);

    constructor(address tokenAddress, address validatorAddress, address stakingAddress) {
        tokenContract = AcademicToken(tokenAddress);
        validator = Validator(validatorAddress);
        staking = Staking(stakingAddress); 
    }


    //upload a new resource, added to the pendingResources
    function uploadResource(string memory name, string memory url) public {
        require(bytes(name).length > 0, "Resource name is required");
        require(bytes(url).length > 0, "Resource URL is required");
        
        staking.performActionAndReward(msg.sender);

        pendingResources.push(Resource({
            id: nextResourceId,
            name: name,
            url: url,
            uploader: msg.sender,
            upvotes: 0,
            reports: 0,
            validated: false,
            reported: false,
            reporter: address(0)
        }));
    
        //emit ResourceUploaded(nextResourceId, name, url, msg.sender);

        // uint256 rewardAmount = 10 * (10 ** uint256(tokenContract.decimals()));
        // tokenContract.mint(msg.sender, rewardAmount);

        nextResourceId++;

    }

    function validateResource(uint256 id) public {
        require(validator.isValidator(msg.sender), "Only validators can validate resources");

        for (uint256 i = 0; i < pendingResources.length; i++) {
            if (pendingResources[i].id == id) {

                require(!pendingResources[i].validated, "Resource is already validated");
                require(pendingResources[i].uploader != msg.sender, "Uploader cannot validate their own resource");

                pendingResources[i].validated = true;
                resources.push(pendingResources[i]); // push the block to the blockchain
                
               
                
                uint256 reward = calculateUploadReward();
                //tokenContract.transfer(pendingResources[i].uploader, reward);
                //staking.rewardToken();
                staking.performActionAndReward(msg.sender);
                emit TokensRewarded(pendingResources[i].uploader, reward);
                emit ResourceValidated(id, msg.sender);
                emit ResourceUploaded(nextResourceId, pendingResources[i].name, pendingResources[i].url, msg.sender);
                pendingResources[i] = pendingResources[pendingResources.length - 1];
                pendingResources.pop();
                return;
            }
        }
        revert("Resource not found");
    }

    // //helper function to remove resource from pending
    // function removePendingResource(uint256 index) internal{
    //     require(index <= pendingResources.length, "Index out of bounds");

    // }

    function upvoteResource(uint256 id) public {
        for (uint256 i = 0; i < resources.length; i++) {
            if (resources[i].id == id) {
                require(resources[i].validated, "Resource must be validated to receive upvotes");
                resources[i].upvotes++;
                staking.performActionAndReward(msg.sender);

                emit ResourceUpvoted(id, msg.sender, resources[i].upvotes);

                uint256 reward = calculateUpvoteReward(resources[i].upvotes);
                tokenContract.transfer(resources[i].uploader, reward);
                emit TokensRewarded(resources[i].uploader, reward);

                return;
            }
        }
        revert("Resource not found");
    }

    function reportResource(uint256 id) public {
        for (uint256 i = 0; i < resources.length; i++) {
            if (resources[i].id == id) {
                resources[i].reports++;

                if (!resources[i].reported) {
                    resources[i].reported = true;
                    resources[i].reporter = msg.sender;
                }
                emit ResourceReported(id, msg.sender, resources[i].reports);
                return;
            }
        }
        revert("Resource not found");
    }

    function getReportedResources() public view returns (Resource[] memory) {
        uint256 reportedCount =0;
        for (uint256 i = 0; i < resources.length; i++) {
            if (resources[i].reports > 0) {
                reportedCount++;
            }
        }
        Resource[] memory reportedResources = new Resource[](reportedCount);
        uint256 index = 0;
        for (uint256 j = 0; j < resources.length; j++) {
            if (resources[j].reports > 0) {
                reportedResources[index] = resources[j];
                index++;
            }
        }
        return reportedResources;
    }

    function deleteResource(uint256 id) public {
        require(
            validator.isValidator(msg.sender) || 
            validator.facultyValidators(msg.sender) || 
            msg.sender == validator.admin() ||
            isInFacultyValidators(msg.sender),
            "Only validators, faculty, or admins can delete resources"
        );

        for (uint256 i = 0; i < resources.length; i++) {
            if (resources[i].id == id) {
                address reporter = resources[i].reporter;
                uint256 reward = calculateDeleteReward();
                tokenContract.transfer(reporter, reward);
                emit TokensRewarded(reporter, reward);

                // Remove the resource from the array
                resources[i] = resources[resources.length - 1];
                resources.pop();
                emit ResourceDeleted(id);
                return;
            }
        }
        revert("Resource not found");
    }

    function calculateDeleteReward() internal view returns (uint256) {
        uint256 circulation = tokenContract.totalSupply();
        return circulation / 85000;
    }

    function calculateUploadReward() internal view returns (uint256) {
        uint256 circulation = tokenContract.totalSupply();
        return circulation / 10000;
    }

    function calculateUpvoteReward(uint256 upvotes) internal view returns (uint256) {
        uint256 circulation = tokenContract.totalSupply();
        return (circulation / 100000) * upvotes;
    }

    function getResource(uint256 id) public view returns (Resource memory) {
        for (uint256 i = 0; i < resources.length; i++) {
            if (resources[i].id == id) {
                return resources[i];
            }
        }
        revert("Resource not found");
    }

    function getResourceCount() public view returns (uint256) {
        return nextResourceId - 1;
    }

    function isInFacultyValidators(address user) internal view returns (bool) {
        address[] memory facultyValidators = validator.getFacultyValidators();
        for (uint256 i = 0; i < facultyValidators.length; i++) {
            if (facultyValidators[i] == user) {
                return true;
            }
        }
        return false;
    }
    
    function getValidatedResources() public view returns (Resource[] memory) {
        return resources;
    }
    function getPendingResources() public view returns (Resource[] memory){
        return pendingResources;

    }
}

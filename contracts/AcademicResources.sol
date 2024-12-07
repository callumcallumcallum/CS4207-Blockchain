pragma solidity ^0.8.0;

contract AcademicResources {
    struct Resource {
        uint256 id;
        string name;
        string url;
        address uploader;
        uint256 votesFor;
        uint256 votesAgainst;
        bool approved;
    }

    mapping(address => bool) public validators;
    uint256 private requiredApprovals;

    Resource[] private resources;

    event ResourceUploaded(uint256 id, string name, string url, address uploader);
    event ResourceVoted(uint256 id, address voter, bool voteFor);
    event ResourceApproved(uint256 id, string name, bool approved);

    modifier onlyValidator() {
        require(validators[msg.sender], "Not a validator");
        _;
    }

    uint256 private nextResourceId = 1;

    constructor(address[] memory initialValidators, uint256 approvalsNeeded) {
        for (uint256 i = 0; i < initialValidators.length; i++) {
            validators[initialValidators[i]] = true;
        }
        requiredApprovals = approvalsNeeded;
    }

    function uploadResource(string memory name, string memory url) public {
        require(bytes(name).length > 0, "Resource name is required");
        require(bytes(url).length > 0, "Resource URL is required");

        resources.push(Resource({
            id: nextResourceId,
            name: name,
            url: url,
            uploader: msg.sender,
            votesFor: 0,
            votesAgainst: 0,
            approved: false
        }));

        emit ResourceUploaded(nextResourceId, name, url, msg.sender);
        nextResourceId++;
    }

    function voteOnResource(uint256 id, bool voteFor) public onlyValidator {
        require(id > 0 && id < nextResourceId, "Invalid resource ID");
        require(validators[msg.sender], "Not a validator");

        // Add debug logs
        emit ResourceVoted(id, msg.sender, voteFor);

        Resource storage resource = resources[id - 1];

        if (voteFor) {
            resource.votesFor++;
        } else {
            resource.votesAgainst++;
        }

        if (resource.votesFor >= requiredApprovals) {
            resource.approved = true;
            emit ResourceApproved(id, resource.name, true);
        } else if (resource.votesAgainst >= requiredApprovals) {
            resource.approved = false;
            emit ResourceApproved(id, resource.name, false);
        }
    }

    function getResource(uint256 id) public view returns (string memory, string memory, address, uint256, uint256, bool) {
        require(id > 0 && id < nextResourceId, "Invalid resource ID");
        Resource memory resource = resources[id - 1];
        return (resource.name, resource.url, resource.uploader, resource.votesFor, resource.votesAgainst, resource.approved);
    }

    function getNextResourceId() public view returns (uint256) {
        return nextResourceId;
    }
}

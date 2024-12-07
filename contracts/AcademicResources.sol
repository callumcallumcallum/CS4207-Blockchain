// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

contract AcademicResources {
    // Resource structure
    struct Resource {
        uint256 id;
        string name;
        string url;
        address uploader;
    }

    // List of resources
    Resource[] private resources;

    // Mapping to track reports for resources (key = resource ID)
    mapping(uint256 => uint256) public reports;
    mapping(uint256 => uint256) public upvotes;

    // Resource ID tracker
    uint256 private nextResourceId = 1;

    // Events (for updating logs)
    event ResourceUploaded(uint256 id, string name, string url, address uploader);
    event ResourceReported(uint256 id, address reporter, uint256 reportCount);
    event ResourceUpvoted(uint256 id, address upvoter, uint256 upvoteCount);

    // Upload a new resource
    function uploadResource(string memory name, string memory url) public {

        //checks if they're empty
        require(bytes(name).length > 0, "Resource name is required");
        require(bytes(url).length > 0, "Resource URL is required");

        // create an instance of resource and add it to the array
        resources.push(Resource({
            id: nextResourceId,
            name: name,
            url: url,
            uploader: msg.sender //the ETH address of the user calling the func
        }));

        emit ResourceUploaded(nextResourceId, name, url, msg.sender);
        nextResourceId++;
    }

    // Get the total number of resources
    function getResourceCount() public view returns (uint256) {
        return resources.length;
    }

    // Get a specific resource by ID
    function getResource(uint256 id) public view returns (string memory, string memory, address) {
        for (uint256 i = 0; i < resources.length; i++) {
            if (resources[i].id == id) {
                return (resources[i].name, resources[i].url, resources[i].uploader);
            }
        }
        revert("Resource not found");
    }

    //function for faculty to return a resource along with how many reports it has
    function getResourceWithReports(uint256 id) public view returns (string memory, string memory, address, uint256) {
    for (uint256 i = 0; i < resources.length; i++) {
        if (resources[i].id == id) {
            Resource memory resource = resources[i];
            return (
                resource.name,
                resource.url,
                resource.uploader,
                reports[id] // Return the report count from the mapping
            );
        }
    }
    revert("Resource not found");
    }


    // Report a resource
    function reportResource(uint256 id) public {
        bool resourceExists = false;

        // Check if the resource exists and increment its report count
        for (uint256 i = 0; i < resources.length; i++) {
            if (resources[i].id == id) {
                resourceExists = true;
                reports[id]++;
                emit ResourceReported(id, msg.sender, reports[id]);
                break;
            }
        }

        require(resourceExists, "Resource not found");
    }

    function upvoteResource(uint256 id) public {
        bool resourceExists = false;

        // Check if the resource exists and increment its report count
        for (uint256 i = 0; i < resources.length; i++) {
            if (resources[i].id == id) {
                resourceExists = true;
                upvotes[id]++;
                emit ResourceUpvoted(id, msg.sender, upvotes[id]);
                break;
            }
        }

        require(resourceExists, "Resource not found");
    }
}

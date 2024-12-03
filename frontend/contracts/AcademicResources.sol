// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract AcademicResources {
    // Resource structure
    struct Resource {
        uint256 id;
        string name;
        string url;
        address uploader;
    }

    // List of resources
    Resource[] public resources;

    // Resource ID tracker
    uint256 private nextResourceId = 1;

    // Events
    event ResourceUploaded(uint256 id, string name, string url, address uploader);

    // Upload a new resource
    function uploadResource(string memory name, string memory url) public {
        require(bytes(name).length > 0, "Resource name is required");
        require(bytes(url).length > 0, "Resource URL is required");

        resources.push(Resource({
            id: nextResourceId,
            name: name,
            url: url,
            uploader: msg.sender
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
                Resource memory resource = resources[i];
                return (resource.name, resource.url, resource.uploader);
            }
        }
        revert("Resource not found");
    }
}

const AcademicToken = artifacts.require("AcademicToken");
const Validator = artifacts.require("Validator");
const AcademicResources = artifacts.require("AcademicResources");

contract("AcademicToken, Validator, and AcademicResources", (accounts) => {
  let token, validator, resources;
  const [admin, student1, student2, faculty, other] = accounts;

  beforeEach(async () => {
    const initialSupply = web3.utils.toWei("10000", "ether");
    token = await AcademicToken.new(initialSupply, { from: admin });

    validator = await Validator.new(token.address, { from: admin });

    resources = await AcademicResources.new(token.address, validator.address, {
      from: admin,
    });

    await token.transferOwnership(resources.address, { from: admin });

    await token.transfer(resources.address, web3.utils.toWei("1500", "ether"), {
      from: admin,
    });
    await token.transfer(validator.address, web3.utils.toWei("1000", "ether"), {
      from: admin,
    });

    await token.transfer(student1, web3.utils.toWei("1000", "ether"), {
      from: admin,
    });
    await token.transfer(student2, web3.utils.toWei("1000", "ether"), {
      from: admin,
    });
  });

  it("should correctly deploy AcademicToken with the initial supply", async () => {
    const supply = await token.totalSupply();
    assert.equal(
      supply.toString(),
      web3.utils.toWei("10000", "ether"),
      "Total supply should match the initial supply"
    );
  });

  it("should allow token transfers between accounts", async () => {
    await token.transfer(student1, web3.utils.toWei("100", "ether"), {
      from: admin,
    });
    const student1Balance = await token.balanceOf(student1);
    assert.equal(student1Balance.toString(), web3.utils.toWei("1100", "ether"));
  });

  it("should allow the AcademicResources contract to mint new tokens", async () => {
    const mintAmount = web3.utils.toWei("500", "ether");

    await resources.uploadResource("Test Resource", "http://example.com", {
      from: student1,
    });

    const newSupply = await token.totalSupply();
    const student1Balance = await token.balanceOf(student1);

    assert.equal(
      newSupply.toString(),
      web3.utils.toWei("10010", "ether"),
      "Total supply should increase by 10 tokens for the resource reward"
    );
    assert.equal(
      student1Balance.toString(),
      web3.utils.toWei("1010", "ether"),
      "Student1 should receive the minted tokens"
    );
  });

  it("should allow burning tokens", async () => {
    const burnAmount = web3.utils.toWei("200", "ether");
    await token.burn(burnAmount, { from: admin });
    const newSupply = await token.totalSupply();
    assert.equal(
      newSupply.toString(),
      web3.utils.toWei("9800", "ether"),
      "Total supply should decrease after burning"
    );
  });

  it("should allow staking and becoming a validator", async () => {
    const minimumStake = await validator.minimumStake();
    await token.approve(validator.address, minimumStake, { from: student1 });
    await validator.stakeTokens(minimumStake, { from: student1 });
    const isValidator = await validator.isValidator(student1);
    assert.isTrue(isValidator, "Student1 should become a validator");
  });

  it("should allow unstaking tokens and losing validator status", async () => {
    const minimumStake = await validator.minimumStake();
    await token.approve(validator.address, minimumStake, { from: student1 });
    await validator.stakeTokens(minimumStake, { from: student1 });
    await validator.unstakeTokens(minimumStake, { from: student1 });
    const isValidator = await validator.isValidator(student1);
    assert.isFalse(isValidator, "Student1 should lose validator status");
  });

  it("should allow adding and removing faculty validators", async () => {
    await validator.addFacultyValidator(faculty, { from: admin });
    let isFaculty = await validator.facultyValidators(faculty);
    assert.isTrue(isFaculty, "Faculty should be added as a validator");

    await validator.removeFacultyValidator(faculty, { from: admin });
    isFaculty = await validator.facultyValidators(faculty);
    assert.isFalse(isFaculty, "Faculty should be removed as a validator");
  });

  it("should allow uploading resources and minting tokens", async () => {
    const resourceName = "Resource 1";
    const resourceURL = "http://example.com/resource1";
    await resources.uploadResource(resourceName, resourceURL, {
      from: student1,
    });

    const resource = await resources.getResource(1);
    assert.equal(resource.name, resourceName);
    assert.equal(resource.uploader, student1);
  });

  it("should allow validating a resource", async () => {
    const resourceName = "Resource 1";
    const resourceURL = "http://example.com/resource1";
    await resources.uploadResource(resourceName, resourceURL, {
      from: student1,
    });

    const minimumStake = await validator.minimumStake();
    await token.approve(validator.address, minimumStake, { from: student1 });
    await validator.stakeTokens(minimumStake, { from: student1 });

    await resources.validateResource(1, { from: student1 });

    const resource = await resources.getResource(1);
    assert.isTrue(resource.validated, "Resource should be validated");
  });

  it("should allow upvoting a validated resource", async () => {
    const resourceName = "Resource 1";
    const resourceURL = "http://example.com/resource1";
    await resources.uploadResource(resourceName, resourceURL, {
      from: student1,
    });

    const minimumStake = await validator.minimumStake();
    await token.approve(validator.address, minimumStake, { from: student1 });
    await validator.stakeTokens(minimumStake, { from: student1 });

    await resources.validateResource(1, { from: student1 });
    await resources.upvoteResource(1, { from: student2 });

    const resource = await resources.getResource(1);
    assert.equal(resource.upvotes, 1, "Resource should have one upvote");
  });

  it("should allow reporting a resource", async () => {
    const resourceName = "Resource 1";
    const resourceURL = "http://example.com/resource1";
    await resources.uploadResource(resourceName, resourceURL, {
      from: student1,
    });

    await resources.reportResource(1, { from: student2 });

    const resource = await resources.getResource(1);
    assert.equal(resource.reports, 1, "Resource should have one report");
  });
});

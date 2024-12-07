const AcademicToken = artifacts.require("AcademicToken");
const Validator = artifacts.require("Validator");
const AcademicResources = artifacts.require("AcademicResources");

contract("AcademicResources", (accounts) => {
  let token, validator, resources;
  const [admin, student1, student2, validator1] = accounts;

  beforeEach(async () => {
    token = await AcademicToken.new();
    validator = await Validator.new(token.address);

    resources = await AcademicResources.new(token.address, validator.address);

    const fundingAmount = web3.utils.toWei("100000", "ether");
    await token.transfer(resources.address, fundingAmount);

    await token.transfer(student1, web3.utils.toWei("1000", "ether"));
    await token.transfer(student2, web3.utils.toWei("1000", "ether"));

    const minimumStake = await validator.minimumStake();
    await token.approve(validator.address, minimumStake, { from: student1 });
    await validator.stakeTokens(minimumStake, { from: student1 });
  });

  it("should fund the AcademicResources contract with tokens", async () => {
    const resourcesBalance = await token.balanceOf(resources.address);
    assert(
      resourcesBalance.gt(web3.utils.toBN(0)),
      "AcademicResources contract should be funded with tokens"
    );
  });

  it("should allow a validator to validate a resource and reward the uploader", async () => {
    await resources.uploadResource(
      "Resource 1",
      "https://example.com/resource1",
      { from: student2 }
    );

    const initialBalance = await token.balanceOf(student2);

    await resources.validateResource(1, { from: student1 });

    const uploadReward = (await token.totalSupply()).div(web3.utils.toBN(1000));
    const finalBalance = await token.balanceOf(student2);

    assert.equal(
      finalBalance.toString(),
      initialBalance.add(uploadReward).toString(),
      "Uploader should receive the upload reward after validation"
    );
  });

  it("should prevent non-validators from validating a resource", async () => {
    await resources.uploadResource(
      "Resource 1",
      "https://example.com/resource1",
      { from: student2 }
    );

    try {
      await resources.validateResource(1, { from: student2 });
      assert.fail("Non-validators should not be able to validate resources");
    } catch (err) {
      assert.include(err.message, "Only validators can validate resources");
    }
  });

  it("should prevent upvotes for unvalidated resources", async () => {
    await resources.uploadResource(
      "Resource 1",
      "https://example.com/resource1",
      { from: student2 }
    );

    try {
      await resources.upvoteResource(1, { from: student1 });
      assert.fail("Upvotes for unvalidated resources should fail");
    } catch (err) {
      assert.include(
        err.message,
        "Resource must be validated to receive upvotes"
      );
    }
  });

  it("should allow upvotes for validated resources", async () => {
    await resources.uploadResource(
      "Resource 1",
      "https://example.com/resource1",
      { from: student2 }
    );

    await resources.validateResource(1, { from: student1 });

    await resources.upvoteResource(1, { from: student1 });

    const resource = await resources.getResource(1);
    assert.equal(
      resource.upvotes.toString(),
      "1",
      "Resource upvote count should increase"
    );
  });

  it("should reward the uploader for upvotes on a validated resource", async () => {
    await resources.uploadResource(
      "Resource 1",
      "https://example.com/resource1",
      { from: student2 }
    );

    await resources.validateResource(1, { from: student1 });

    const initialUploaderBalance = await token.balanceOf(student2);

    await resources.upvoteResource(1, { from: student1 });

    const upvoteReward = (await token.totalSupply()).div(
      web3.utils.toBN(10000)
    );
    const finalUploaderBalance = await token.balanceOf(student2);

    assert.equal(
      finalUploaderBalance.toString(),
      initialUploaderBalance.add(upvoteReward).toString(),
      "Uploader should receive the upvote reward"
    );
  });

  it("should increment the report count for a resource", async () => {
    await resources.uploadResource(
      "Resource 1",
      "https://example.com/resource1",
      { from: student2 }
    );

    await resources.reportResource(1, { from: student1 });

    const resource = await resources.getResource(1);
    assert.equal(
      resource.reports.toString(),
      "1",
      "Resource report count should increase"
    );
  });

  it("should revert if trying to report a non-existent resource", async () => {
    try {
      await resources.reportResource(1, { from: student1 });
      assert.fail("Reporting a non-existent resource should fail");
    } catch (err) {
      assert.include(err.message, "Resource not found");
    }
  });

  it("should retrieve a resource by its ID", async () => {
    await resources.uploadResource(
      "Resource 1",
      "https://example.com/resource1",
      { from: student2 }
    );

    const resource = await resources.getResource(1);
    assert.equal(resource.name, "Resource 1", "Resource name should match");
    assert.equal(
      resource.url,
      "https://example.com/resource1",
      "Resource URL should match"
    );
    assert.equal(resource.uploader, student2, "Uploader address should match");
  });
});

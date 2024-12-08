const AcademicToken = artifacts.require("AcademicToken");
const Validator = artifacts.require("Validator");
const Staking = artifacts.require("Staking");
const AcademicResources = artifacts.require("AcademicResources");

contract("Performance Tests", (accounts) => {
  const [deployer, user1, user2, user3, validator1] = accounts;
  let token, validator, staking, resources;

  before(async () => {
    token = await AcademicToken.new(web3.utils.toWei("1000000", "ether"), {
      from: deployer,
    });
    validator = await Validator.new(token.address, { from: deployer });
    staking = await Staking.new(token.address, 100, validator.address, {
      from: deployer,
    });
    resources = await AcademicResources.new(
      token.address,
      validator.address,
      staking.address,
      { from: deployer }
    );

    const initialAllowance = web3.utils.toWei("1000", "ether");

    for (const user of [user1, user2, user3, validator1]) {
      await token.transfer(user, web3.utils.toWei("1000", "ether"), {
        from: deployer,
      });
      await token.approve(staking.address, initialAllowance, { from: user });
    }

    await staking.stake(web3.utils.toWei("10", "ether"), { from: validator1 });
    await validator.addFacultyValidator(validator1, { from: deployer });

    await token.mint(resources.address, web3.utils.toWei("100000", "ether"), {
      from: deployer,
    });
    await token.mint(staking.address, web3.utils.toWei("10000", "ether"), {
      from: deployer,
    });
  });

  describe("Resource Workflow Tests", () => {
    it("should handle uploading and validating a resource", async () => {
      await resources.uploadResource(
        "Test Resource",
        "https://example.com/resource",
        { from: user1 }
      );

      const tx = await resources.validateResource(1, { from: validator1 });

      assert(
        tx.logs.some((log) => log.event === "ResourceValidated"),
        "ResourceValidated event not emitted"
      );
    });

    it("should handle upvoting a validated resource", async () => {
      await resources.uploadResource(
        "Upvote Test Resource",
        "https://example.com/upvote",
        { from: user2 }
      );
      await resources.validateResource(2, { from: validator1 });

      const tx = await resources.upvoteResource(2, { from: user3 });

      assert(
        tx.logs.some((log) => log.event === "ResourceUpvoted"),
        "ResourceUpvoted event not emitted"
      );
    });

    it("should handle reporting a resource", async () => {
      const tx = await resources.reportResource(2, { from: user3 });

      assert(
        tx.logs.some((log) => log.event === "ResourceReported"),
        "ResourceReported event not emitted"
      );
    });

    it("should reward the reporter after deleting a resource", async () => {
      const reporterInitialBalance = await token.balanceOf(user3);
      const tx = await resources.deleteResource(2, { from: validator1 });

      assert(
        tx.logs.some((log) => log.event === "ResourceDeleted"),
        "ResourceDeleted event not emitted"
      );

      const reporterFinalBalance = await token.balanceOf(user3);
      assert(
        reporterFinalBalance.gt(reporterInitialBalance),
        "Reporter did not receive reward for deleted resource"
      );
    });

    it("should handle staking and becoming a validator", async () => {
      const tx = await staking.stake(web3.utils.toWei("10", "ether"), {
        from: user1,
      });

      const isValidator = await validator.isValidator(user1);
      assert(isValidator, "User1 did not become a validator");
    });
  });
});

const AcademicToken = artifacts.require("AcademicToken");
const Validator = artifacts.require("Validator");
const AcademicResources = artifacts.require("AcademicResources");

contract("Performance Tests", (accounts) => {
  const [deployer, user1, user2, user3, validator1] = accounts;
  let token, validator, resources;

  before(async () => {
    token = await AcademicToken.new(web3.utils.toWei("1000000", "ether"));
    validator = await Validator.new(token.address);
    resources = await AcademicResources.new(token.address, validator.address);

    await token.transfer(user1, web3.utils.toWei("1000", "ether"), {
      from: deployer,
    });
    await token.transfer(user2, web3.utils.toWei("1000", "ether"), {
      from: deployer,
    });
    await token.transfer(user3, web3.utils.toWei("1000", "ether"), {
      from: deployer,
    });
    await token.transfer(validator1, web3.utils.toWei("1000", "ether"), {
      from: deployer,
    });

    await token.approve(validator.address, web3.utils.toWei("500", "ether"), {
      from: user1,
    });
    await token.approve(validator.address, web3.utils.toWei("500", "ether"), {
      from: user2,
    });
    await token.approve(validator.address, web3.utils.toWei("500", "ether"), {
      from: user3,
    });
    await token.approve(validator.address, web3.utils.toWei("500", "ether"), {
      from: validator1,
    });

    await validator.stakeTokens(web3.utils.toWei("1", "ether"), {
      from: validator1,
    });

    await validator.addFacultyValidator(validator1, { from: deployer });

    await token.mint(resources.address, web3.utils.toWei("100000", "ether"), {
      from: deployer,
    });
  });

  describe("Transaction Cost Tests", () => {
    it("should measure gas cost for resource validation", async () => {
      await resources.uploadResource(
        "Gas Test Validation Resource",
        "https://gastestvalidation.com",
        { from: user1 }
      );
      const tx = await resources.validateResource(1, { from: validator1 });
      console.log(`Gas used for resource validation: ${tx.receipt.gasUsed}`);
    });

    it("should measure gas cost for upvoting a resource", async () => {
      await resources.uploadResource(
        "Gas Test Upvote Resource",
        "https://gastestupvote.com",
        { from: user2 }
      );
      await resources.validateResource(2, { from: validator1 });
      const tx = await resources.upvoteResource(2, { from: user3 });
      console.log(`Gas used for upvoting: ${tx.receipt.gasUsed}`);
    });
  });

  describe("Latency Tests", () => {
    it("should measure latency for resource upload", async () => {
      const start = Date.now();
      await resources.uploadResource(
        "Latency Test Resource",
        "https://latencytest.com",
        { from: user1 }
      );
      const end = Date.now();
      console.log(`Resource upload latency: ${end - start} ms`);
    });

    it("should measure latency for resource validation", async () => {
      await resources.uploadResource(
        "Latency Test Validation Resource",
        "https://latencytestvalidation.com",
        { from: user2 }
      );
      const start = Date.now();
      await resources.validateResource(3, { from: validator1 });
      const end = Date.now();
      console.log(`Resource validation latency: ${end - start} ms`);
    });

    it("should measure latency for upvoting", async () => {
      const start = Date.now();
      await resources.upvoteResource(3, { from: user3 });
      const end = Date.now();
      console.log(`Resource upvote latency: ${end - start} ms`);
    });

    it("should measure latency for reporting", async () => {
      const start = Date.now();
      await resources.reportResource(3, { from: user3 });
      const end = Date.now();
      console.log(`Resource reporting latency: ${end - start} ms`);
    });
  });

  describe("Scalability Tests", () => {
    it("should handle high volume of resource uploads", async () => {
      const numResources = 500;
      const start = Date.now();

      for (let i = 0; i < numResources; i++) {
        const uploader = i % 3 === 0 ? user1 : i % 3 === 1 ? user2 : user3;
        await resources.uploadResource(
          `Resource ${i}`,
          `https://resource${i}.com`,
          { from: uploader }
        );
      }

      const end = Date.now();
      const elapsedTime = (end - start) / 1000;

      console.log(
        `Uploaded ${numResources} resources in ${elapsedTime} seconds`
      );
      console.log(
        `Throughput: ${(numResources / elapsedTime).toFixed(
          2
        )} resources per second`
      );
    });

    it("should handle high volume of staking transactions", async () => {
      const transactions = 500;
      const stakeAmount = web3.utils.toWei("1", "ether");

      const start = Date.now();

      for (let i = 0; i < transactions; i++) {
        const staker = i % 3 === 0 ? user1 : i % 3 === 1 ? user2 : user3;
        await validator.stakeTokens(stakeAmount, { from: staker });
      }

      const end = Date.now();
      const elapsedTime = (end - start) / 1000;

      console.log(
        `Processed ${transactions} staking transactions in ${elapsedTime} seconds`
      );
      console.log(
        `Throughput: ${(transactions / elapsedTime).toFixed(
          2
        )} transactions per second`
      );
    });

    it("should handle high volume of resource validations", async () => {
      const numValidations = 100;
      for (let i = 4; i <= 103; i++) {
        await resources.uploadResource(
          `Validation Resource ${i}`,
          `https://validation${i}.com`,
          { from: user1 }
        );
      }

      const start = Date.now();

      for (let i = 4; i <= 103; i++) {
        await resources.validateResource(i, { from: validator1 });
      }

      const end = Date.now();
      const elapsedTime = (end - start) / 1000;

      console.log(
        `Validated ${numValidations} resources in ${elapsedTime} seconds`
      );
      console.log(
        `Throughput: ${(numValidations / elapsedTime).toFixed(
          2
        )} validations per second`
      );
    });
  });
});

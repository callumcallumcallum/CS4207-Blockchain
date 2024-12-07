const AcademicToken = artifacts.require("AcademicToken");
const Validator = artifacts.require("Validator");

contract("Validator", (accounts) => {
  let token, validator;
  const [admin, student1, student2, faculty, other] = accounts;

  beforeEach(async () => {
    // Deploy contracts
    token = await AcademicToken.new();
    validator = await Validator.new(token.address);

    // Transfer tokens to students
    await token.transfer(student1, web3.utils.toWei("1000", "ether"));
    await token.transfer(student2, web3.utils.toWei("1000", "ether"));
  });

  it("should set the deployer as admin", async () => {
    const contractAdmin = await validator.admin();
    assert.equal(contractAdmin, admin, "Admin should be the deployer");
  });

  it("should allow admin to add a faculty validator", async () => {
    await validator.addFacultyValidator(faculty, { from: admin });
    const isFaculty = await validator.facultyValidators(faculty);
    assert.isTrue(isFaculty, "Faculty should be added as a validator");
  });

  it("should prevent non-admin from adding a faculty validator", async () => {
    try {
      await validator.addFacultyValidator(faculty, { from: student1 });
      assert.fail("Non-admin should not be able to add a faculty validator");
    } catch (err) {
      assert.include(err.message, "Only the admin can perform this action");
    }
  });

  it("should transfer admin rights", async () => {
    // Transfer admin rights to student1
    await validator.transferAdmin(student1, { from: admin });

    // Verify new admin
    const newAdmin = await validator.admin();
    assert.equal(
      newAdmin,
      student1,
      "Admin rights should transfer to student1"
    );
  });

  it("should allow students to stake tokens and become validators", async () => {
    const minimumStake = await validator.minimumStake();
    await token.approve(validator.address, minimumStake, { from: student1 });
    await validator.stakeTokens(minimumStake, { from: student1 });

    const isValidator = await validator.isValidator(student1);
    assert.isTrue(isValidator, "Student1 should become a validator");
  });

  it("should fail if stake is below minimum", async () => {
    const minimumStake = await validator.minimumStake();
    const belowMinimum = web3.utils.toBN(minimumStake).sub(web3.utils.toBN(1)); // 1 less than minimum
    await token.approve(validator.address, belowMinimum, { from: student1 });

    try {
      await validator.stakeTokens(belowMinimum, { from: student1 });
      assert.fail("Staking below minimum should fail");
    } catch (err) {
      assert.include(err.message, "Amount must meet the minimum stake");
    }
  });

  it("should remove validator status when tokens are unstaked below the minimum", async () => {
    const minimumStake = await validator.minimumStake();
    await token.approve(validator.address, minimumStake, { from: student1 });
    await validator.stakeTokens(minimumStake, { from: student1 });

    // Unstake all tokens
    await validator.unstakeTokens(minimumStake, { from: student1 });

    const isValidator = await validator.isValidator(student1);
    assert.isFalse(isValidator, "Student1 should lose validator status");
  });

  it("should update minimum stake dynamically", async () => {
    await validator.updateMinimumStake({ from: admin });

    const circulatingSupply = await token.totalSupply();
    const minimumStake = await validator.minimumStake();

    assert.equal(
      minimumStake.toString(),
      circulatingSupply.div(web3.utils.toBN(1000)).toString(),
      "Minimum stake should be 0.1% of total supply"
    );
  });

  it("should reward a validator", async () => {
    const minimumStake = await validator.minimumStake();
    const rewardAmount = web3.utils.toWei("10", "ether");

    // Stake tokens and become a validator
    await token.approve(validator.address, minimumStake, { from: student1 });
    await validator.stakeTokens(minimumStake, { from: student1 });

    // Get initial balance
    const initialBalance = await token.balanceOf(student1);

    // Reward the validator
    await validator.rewardValidator(student1, rewardAmount, { from: admin });

    // Get updated balance
    const finalBalance = await token.balanceOf(student1);

    // Verify balance change
    const expectedBalance = web3.utils
      .toBN(initialBalance)
      .add(web3.utils.toBN(rewardAmount));
    assert.equal(
      finalBalance.toString(),
      expectedBalance.toString(),
      "Validator should receive the reward"
    );
  });

  it("should prevent non-admin from rewarding a validator", async () => {
    const minimumStake = await validator.minimumStake();
    const rewardAmount = web3.utils.toWei("10", "ether");

    // Stake tokens and become a validator
    await token.approve(validator.address, minimumStake, { from: student1 });
    await validator.stakeTokens(minimumStake, { from: student1 });

    try {
      await validator.rewardValidator(student1, rewardAmount, {
        from: student2,
      });
      assert.fail("Non-admin should not be able to reward validators");
    } catch (err) {
      assert.include(err.message, "Only the admin can perform this action");
    }
  });
});

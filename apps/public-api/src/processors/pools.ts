import { poxAddressToPool } from "../constants";

export function getPoolsInfoForCycle(
  cycleNumber: number,
  stackers: any,
  rewards: any,
  stxPrice: number,
  btcPrice: number
) {
  const pools: any[] = [];
  for (const poxAddress of Object.keys(poxAddressToPool)) {
    let stackedAmount = 0.0;
    let rewardAmount = 0.0;
    let stackersCount = 0;
    stackers
      .filter((stacker: any) => stacker.poxAddress === poxAddress)
      .forEach((stacker: any) => {
        stackedAmount += stacker.stackedAmount;
        stackersCount += 1;
      });
    rewards
      .filter((reward: any) => reward.rewardRecipient === poxAddress)
      .forEach((reward: any) => {
        rewardAmount += reward.rewardAmount;
      });

    if (poxAddressToPool[poxAddress as string]) {
      const rewardFeeMult = 1 - poxAddressToPool[poxAddress as string].fee;

      const previousStackedValue = stackedAmount * stxPrice;
      const previousRewardsValue = rewardAmount * rewardFeeMult * btcPrice;
      // 26 cycles per year
      const apr = (previousRewardsValue / previousStackedValue) * 26;
      const apy = (Math.pow(1 + apr / 26, 26) - 1) * 100.0;

      pools.push({
        name: poxAddressToPool[poxAddress as string].name,
        stackers_count: stackersCount,
        pox_address: poxAddress,
        stacked_amount: stackedAmount,
        rewards_amount: rewardAmount,
        apr: apr * 100.0,
        apy: apy ? apy : 0.0,
      });
    }
  }

  pools.sort((a, b) => b.stacked_amount - a.stacked_amount);

  let stackedAmount = 0.0;
  let rewardAmount = 0.0;
  pools.forEach((pool: any) => {
    stackedAmount += pool.stacked_amount;
    rewardAmount += pool.rewards_amount;
  });

  return {
    cycle_number: cycleNumber,
    pools: pools,
    stacked_amount: stackedAmount,
    rewards_amount: rewardAmount,
  };
}

export function getAggregatedPoolsInfo(
  cyclesInfo: any[],
  stxPrice: number,
  btcPrice: number
) {
  const aggregatedCyclesInfo: any[] = [];
  for (const cycle of cyclesInfo) {
    let otherStackersCount = 0;
    let otherStackedAmount = 0.0;
    let otherRewardsAmount = 0.0;
    const aggregatedPools: any[] = [];
    for (const pool of cycle.pools) {
      if (pool.stacked_amount < 1_000_000) {
        otherStackersCount += pool.stackers_count;
        otherStackedAmount += pool.stacked_amount;
        otherRewardsAmount += pool.rewards_amount;
      } else {
        aggregatedPools.push(pool);
      }
    }
    aggregatedPools.push({
      name: "Other",
      stackers_count: otherStackersCount,
      stacked_amount: otherStackedAmount,
      rewards_amount: otherRewardsAmount,
      stacked_amount_usd: otherStackedAmount * stxPrice,
      rewards_amount_usd: otherRewardsAmount * btcPrice,
    });

    aggregatedCyclesInfo.push({
      cycle_number: cycle.cycle_number,
      stacked_amount: cycle.stacked_amount,
      rewards_amount: cycle.rewards_amount,
      stacked_amount_usd: cycle.stacked_amount * stxPrice,
      rewards_amount_usd: cycle.rewards_amount * btcPrice,
      pools: aggregatedPools,
    });
  }
  return aggregatedCyclesInfo;
}

export function getPoolEntities(
  cyclesInfo: any,
  stxPrice: number,
  btcPrice: number
) {
  const entities: any[] = [];
  for (const poxAddress of Object.keys(poxAddressToPool)) {
    const lastCycleInfo = cyclesInfo[0].pools.filter(
      (pool: any) => pool.pox_address === poxAddress
    )[0];

    const cycleInfoAddress = [];
    cyclesInfo.forEach((info: any) => {
      const filteredInfo = info.pools.filter(
        (pool: any) => pool.pox_address === poxAddress
      )[0];

      if (filteredInfo) {
        cycleInfoAddress.push(filteredInfo);
      }
    });

    var aprSum = 0.0;
    var apySum = 0.0;

    cycleInfoAddress.slice(1).forEach((info: any) => {
      aprSum += info.apr;
      apySum += info.apy;
    });

    entities.push({
      name: poxAddressToPool[poxAddress].name,
      entity: poxAddressToPool[poxAddress].entity,
      fee: poxAddressToPool[poxAddress].fee,
      feeDisclosed: poxAddressToPool[poxAddress].feeDisclosed,
      logo: poxAddressToPool[poxAddress].logo,
      website: poxAddressToPool[poxAddress].website,
      symbol: poxAddressToPool[poxAddress].symbol,
      slug: poxAddressToPool[poxAddress].slug,
      stackers_count: lastCycleInfo.stackers_count,
      stacked_amount: cycleInfoAddress[0].stacked_amount,
      rewards_amount: cycleInfoAddress[0].rewards_amount,
      stacked_amount_usd: cycleInfoAddress[0].stacked_amount * stxPrice,
      rewards_amount_usd: cycleInfoAddress[0].rewards_amount * btcPrice,
      apr: aprSum / cycleInfoAddress.slice(1).length,
      apy: apySum / cycleInfoAddress.slice(1).length,
    });
  }

  return entities.sort((a, b) => b.apy - a.apy);
}

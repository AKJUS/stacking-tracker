import { Table } from "../components/Table";
import * as api from "../common/public-api";
import { currency, generateMetaData } from "@/app/common/utils";
import ChartBarStacked from "../components/ChartBarStacked";
import { ToolTip } from "../components/Tooltip";
import StxLogo from "../components/Logos/Stx";
import BtcLogo from "../components/Logos/Btc";
import { ButtonLink } from "../components/ButtonLink";

export async function generateMetadata() {
  const poolsInfo = await api.get("/pools");
  const lastCycle = poolsInfo.cycles[poolsInfo.cycles.length - 1];
  const info = {
    title: `Stacking Tracker - Pools`,
    description: `All your data needs on stacking pools on Stacks! In total ${currency.rounded.format(lastCycle.stacked_amount)} STX is stacked in cycle ${lastCycle.cycle_number} by ${poolsInfo.entities.length} stacking pools.`,
  };
  return generateMetaData(info.title, info.description);
}

export default async function Home() {
  const poolsInfo = await api.get("/pools");

  const lastCycleInfo = poolsInfo.cycles[poolsInfo.cycles.length - 1];
  const chartLabels = poolsInfo.cycles.map((info: any) => info.cycle_number);
  const activePools = lastCycleInfo.pools;
  const datasets: any[] = [];

  datasets.push({
    label: "BTC Yield",
    data: poolsInfo.cycles.map(
      (info: any) => info.extrapolated_rewards_amount || info.rewards_amount
    ),
    type: "line",
    yAxisID: "yRight",
    backgroundColor: "rgba(247, 147, 26, 1)",
    borderColor: "rgba(247, 147, 26, 1)",
    highlightLastSegment: true,
  });

  const colors: { [key: string]: string } = {
    "Xverse Pool": "#2E7D59",
    "Fast Pool": "#9B4069",
    "Fast Pool v2": "#9B4069",
    "Planbetter Pool": "#357576",
    "StackingDAO Pool": "#2E7D59",
  };

  for (const activePool of activePools) {
    const data: any[] = [];
    for (const cycleInfo of poolsInfo.cycles) {
      const poolInfo = cycleInfo.pools.filter(
        (pool: any) => pool.name == activePool.name
      )[0];

      data.push(poolInfo ? poolInfo.stacked_amount : 0);
    }

    datasets.push({
      label: activePool.name,
      data: data,
      backgroundColor: colors[activePool.name] ?? "#80341B",
    });
  }

  const chartData = {
    labels: chartLabels,
    datasets: datasets,
  };

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-2xl mb-6 lg:hidden font-semibold">Stacking Pools</h1>

      <div className="p-4 border border-white/10 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="ml-4 font-semibold text-xl">
            Cycle {lastCycleInfo.cycle_number}
          </h2>
          <span className="px-2 py-1 text-green bg-green/10 text-sm rounded-md">
            Current Cycle
          </span>
        </div>

        <div className="mt-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-md bg-gray">
              <dt className="text-sm font-medium leading-6 text-white/50">
                Total Public Pools
              </dt>
              <dd className="text-lg text-white">
                {lastCycleInfo.pools.length}
              </dd>
            </div>

            <div className="p-4 rounded-md bg-gray">
              <dt className="text-sm font-medium leading-6 text-white/50">
                Total Stacked in Stacking Pools
              </dt>
              <dd className="text-lg text-white">
                <div className=" inline-flex items-center w-full text-lg font-medium leading-6 text-white gap-x-1">
                  <StxLogo className="w-[18px] h-[18px] shrink-0" />
                  {currency.rounded.format(lastCycleInfo.stacked_amount)}
                </div>
                <p className="text-sm text-white/[0.35] ">
                  ${currency.rounded.format(lastCycleInfo.stacked_amount_usd)}
                </p>
              </dd>
            </div>

            <div className="p-4 rounded-md bg-gray">
              <dt className="text-sm font-medium leading-6 text-white/50">
                <div className="flex items-center gap-1">
                  Total Rewards So Far
                  <ToolTip
                    id="tooltip_rewards"
                    text={
                      "The cycle is in progress and BTC Rewards are streamed to stackers on a per block basis"
                    }
                  />
                </div>
              </dt>
              <dd className="text-lg text-white">
                <div className=" inline-flex items-center w-full text-lg font-medium leading-6 text-white gap-x-1">
                  <BtcLogo className="w-[18px] h-[18px] shrink-0" />
                  {lastCycleInfo.rewards_amount.toFixed(6)}
                </div>
                <p className="text-sm text-white/[0.35] ">
                  ${currency.rounded.format(lastCycleInfo.rewards_amount_usd)}
                </p>{" "}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="p-4 border border-white/10 rounded-xl mt-8">
        <div className="h-[325px] lg:min-h-[460px]">
          <ChartBarStacked
            chartTitles={{ x: "Cycle", y: "STX Stacked" }}
            chartData={chartData}
          />
        </div>
      </div>

      <div className="p-4 border border-white/10 rounded-xl mt-8">
        <div className="lg:hidden">
          <div className="space-y-4 divide-y divide-white/10 [&>*:first-child]:pt-0">
            {poolsInfo.entities.map((entity: any) => (
              <div key={entity.name} className="pt-4">
                <dl className="grid gap-4 grid-cols-2">
                  <div key={entity.name}>
                    <dt className="text-sm font-medium leading-6 text-white/50">
                      Pool
                    </dt>
                    <dd>
                      <div
                        key={entity.name}
                        className="flex font-semibold items-center"
                      >
                        <img className="w-5 h-5 mr-2" src={entity.logo} />
                        {entity.name}
                      </div>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium leading-6 text-white/50 flex gap-1 items-center">
                      APY
                      <ToolTip
                        id={entity.name + "-fee-tooltip"}
                        text={`Pool fee: ${entity.feeDisclosed ? `${entity.fee * 100.0}%` : "undisclosed"}. APY in BTC that the Pools are generating from stacked STX`}
                      />
                    </dt>
                    <dd>{currency.short.format(entity.apy)}%</dd>
                  </div>
                  <div key={entity.name + "-stacked"}>
                    <dt className="text-sm font-medium leading-6 text-white/50">
                      Stacked
                    </dt>
                    <dd>
                      <div className="flex items-center gap-x-1">
                        {currency.rounded.format(entity.stacked_amount)}
                        <StxLogo className="w-3 h-3 shrink-0" />
                      </div>
                      <div className="text-xs text-white/[0.35]">{`$${currency.rounded.format(entity.stacked_amount_usd)}`}</div>
                    </dd>
                  </div>
                  <div key={entity.name + "-rewards"}>
                    <dt className="text-sm font-medium leading-6 text-white/50 flex gap-1 items-center">
                      BTC Rewards So Far
                      <ToolTip
                        id="tooltip_rewards"
                        text="The cycle is in progress and BTC Rewards are streamed to stackers on a per block basis."
                      />
                    </dt>
                    <dd>
                      <div className="flex items-center gap-x-1">
                        {entity.rewards_amount.toFixed(6)}
                        <BtcLogo className="w-3 h-3 shrink-0" />
                      </div>
                      <div className="text-xs text-white/[0.35]">{`$${currency.rounded.format(entity.rewards_amount_usd)}`}</div>
                    </dd>
                  </div>
                </dl>
                <div key={entity.slug} className="mt-4">
                  <ButtonLink
                    label="View Rewards History"
                    link={`/pools/${entity.slug}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block">
          <Table
            columnHeaders={[
              { title: "Pool" },
              { title: "Stacked" },
              {
                title: "BTC Rewards So Far",
                info: "The cycle is in progress and BTC Rewards are streamed to stackers on a per block basis.",
              },
              {
                title: "APY",
                info: "APY in BTC that the Pools are generating from stacked STX. Fees have been deducted.",
              },
              { title: "" },
            ]}
            rows={poolsInfo.entities.map((entity: any) => [
              <div key={entity.name} className="flex font-semibold">
                <img className="w-5 mr-2" src={entity.logo} /> {entity.name}
              </div>,
              <div key={entity.name + "-stacked"}>
                <div className="flex items-center">
                  {`${currency.rounded.format(entity.stacked_amount)}`}{" "}
                  <StxLogo className="w-3 h-3 ml-1 inline" />
                </div>
                <div className="text-xs text-white/[0.35]">{`$${currency.rounded.format(entity.stacked_amount_usd)}`}</div>
              </div>,
              <div key={entity.name + "-rewards"}>
                <div className="flex items-center">
                  {`${entity.rewards_amount.toFixed(6)}`}
                  <BtcLogo className="w-3 h-3 ml-1 inline" />
                </div>
                <div className="text-xs text-white/[0.35]">{`$${currency.rounded.format(entity.rewards_amount_usd)}`}</div>
              </div>,
              <div
                className="flex gap-2 items-center"
                key={entity.name + "-apy"}
              >
                {currency.short.format(entity.apy)}%
                <ToolTip
                  id={entity.name + "-fee-tooltip"}
                  text={`Pool fee: ${entity.feeDisclosed ? `${entity.fee * 100.0}%` : "undisclosed"}`}
                />
              </div>,
              <div key={entity.slug} className="text-right">
                <ButtonLink
                  label="View Rewards History"
                  link={`/pools/${entity.slug}`}
                />
              </div>,
            ])}
          />
        </div>
      </div>
    </div>
  );
}

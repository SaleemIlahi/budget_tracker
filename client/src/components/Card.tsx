import React from "react";
import S from "../style/card.module.scss";
import Icon from "./Icon";
import CurvedLineChart from "./LineChart";

interface CardValid {
  title: string;
  icon: string;
  percent: number;
  amount: number;
  graph: boolean;
  active: number;
  manualActive: number;
}

const Card: React.FC<CardValid> = (props) => {
  const { title, icon, percent, amount, graph, active, manualActive } = props;
  const expenseTrend = [
    { date: "2025-01-01", value: 1500 },
    { date: "2025-02-01", value: 13400 },
    { date: "2025-03-01", value: 11800 },
    { date: "2025-04-01", value: 14200 },
    { date: "2025-05-01", value: 15000 },
    { date: "2025-06-01", value: 13750 },
    { date: "2025-07-01", value: 14000 },
    { date: "2025-08-01", value: 1000 },
    { date: "2025-09-01", value: 16000 },
    { date: "2025-10-01", value: 6000 },
    { date: "2025-11-01", value: 2000 },
    { date: "2025-12-01", value: 24000 },
  ];
  return (
    <div className={S.cnt}>
      <div className={S.data}>
        <div className={S.title}>
          <div className={S.icon}>
            <Icon n={icon} w={24} h={24} />
          </div>
          <div className={S.name}>{title}</div>
        </div>
        <div className={S.amount}>
          {amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}
        </div>
        <div className={S.compare}>
          <div
            className={S.percent}
            style={{ color: percent > 0 ? "#0FA865" : "#E55A59" }}
          >
            <Icon
              n={percent > 0 ? "up_arrow" : "down_arrow"}
              w={12}
              h={12}
              c={percent > 0 ? "#0FA865" : "#E55A59"}
            />
            {percent.toString().replaceAll("-", "")}%
          </div>
          <div className={S.last_month}>vs last month</div>
        </div>
      </div>
      {graph || active !== manualActive ? (
        <div className={S.chart}>
          <CurvedLineChart
            data={expenseTrend}
            width={800}
            height={400}
            toolTip={false}
          />
        </div>
      ) : (
        <div className={S.addBudget}>
          <div className={S.icon}>
            <Icon n="plus" w={25} h={25} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;

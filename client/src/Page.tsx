import React, { useEffect, useState } from "react";
import Card from "./components/Card";
import S from "./page.module.scss";
import DonutChart from "./components/DonutChart";
import Table from "./components/Table";
import Icon from "./components/Icon";

const Page: React.FC = () => {
  const [month, setMonth] = useState<{
    acitve: number;
    allMonths: string[];
    manualActive: number;
  }>({
    acitve: -1,
    allMonths: [],
    manualActive: -1,
  });
  const SummaryCard = [
    {
      title: "Budget",
      amount: 1000000,
      percent: 10,
      graph: false,
      icon: "income",
    },
    {
      title: "Total Expense",
      amount: 5000000,
      percent: -10,
      graph: true,
      icon: "trending_down",
    },
    {
      title: "Remaining Budget",
      amount: 5000000,
      percent: 10,
      graph: true,
      icon: "bank",
    },
  ];

  const pieData = [
    { label: "Food", value: 300 },
    { label: "Rent", value: 500 },
    { label: "Savings", value: 200 },
  ];

  interface MonthInfo {
    currentMonthIndex: number;
    currentMonthName: string;
    finishedMonths: string[];
  }

  const getMonthInfo = (): MonthInfo => {
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentMonthName = now.toLocaleString("default", { month: "long" });
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "long" })
    );
    const finishedMonths = allMonths.slice(0, currentMonthIndex + 1);

    return { currentMonthName, finishedMonths, currentMonthIndex };
  };

  useEffect(() => {
    const { finishedMonths, currentMonthIndex } = getMonthInfo();
    setMonth({
      acitve: currentMonthIndex + 1,
      allMonths: finishedMonths,
      manualActive: currentMonthIndex + 1,
    });
  }, []);

  const head = [
    { id: "date", name: "Date" },
    { id: "category", name: "Category" },
    { id: "amount", name: "Amount" },
  ];

  const body = [
    {
      date: "01-10-205",
      category: "Grocries",
      amount: "5000",
    },
    {
      date: "02-10-205",
      category: "Transportation",
      amount: "12000",
    },
  ];

  const category = [
    {
      id: "groceries",
      name: "Groceries",
      icon: "cart",
      amount: 10000,
    },
    {
      id: "utilities",
      name: "Utilities",
      icon: "utilities",
      amount: 10000,
    },
    {
      id: "transportation",
      name: "Transportation",
      icon: "transportation",
      amount: 10000,
    },
    {
      id: "entertainment",
      name: "Entertainment",
      icon: "enter",
      amount: 10000,
    },
    {
      id: "health",
      name: "Health",
      icon: "health",
      amount: 10000,
    },
    {
      id: "maintenance",
      name: "Maintenance",
      icon: "tool",
      amount: 10000,
    },
  ];
  return (
    <div className={S.cnt}>
      <div className={S.top}>
        <div className={S.donut_chart}>
          <DonutChart data={pieData} width={400} height={400} svgWidth={65} />
        </div>
        <div className={S.left}>
          <div className={S.months}>
            {month.allMonths.map((o, i) => (
              <div
                className={
                  i + 1 === month.manualActive
                    ? S.month_e + " " + S.active
                    : S.month_e
                }
                key={o}
                onClick={() => {
                  setMonth((m) => ({ ...m, manualActive: i + 1 }));
                }}
              >
                {o}
              </div>
            ))}
          </div>
          <div className={S.summary_card}>
            {SummaryCard.map((o) => (
              <Card
                key={o.title.replaceAll(" ", "_").toLowerCase()}
                active={month.acitve}
                manualActive={month.manualActive}
                {...o}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={S.main}>
        <div className={S.table_cnt}>
          <div className={S.table_top}>
            {/* <div className={S.title}>Transtion Overview</div> */}
            <div className={S.search}>
              <Icon n="search" w={18} h={18} />
              <input type="text" placeholder="Search by category" />
            </div>
            <div className={S.filter}>
              <div>Category Filter</div>
              <div>Date Filter</div>
              <div>Amount Filter</div>
            </div>
          </div>
          <div className={S.table_main}>
            <div className={S.table}>
              <Table head={head} body={body} />
            </div>
            <div className={S.category_wise}>
              <div className={S.title}>Category wise spending</div>
              <div className={S.ct_list}>
                {category.map((o) => (
                  <div key={o.id} className={S.ct_list_item}>
                    <div className={S.ct_item}>
                      <Icon w={16} h={16} n={o.icon} />
                      <div className={S.ct_name}>{o.name}</div>
                      <div className={S.ct_amount}>
                        {o.amount.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </div>
                    </div>
                    <div className={S.badge}>
                      <Icon
                        n={10 > 0 ? "up_arrow" : "down_arrow"}
                        w={12}
                        h={12}
                        c={10 > 0 ? "#0FA865" : "#E55A59"}
                      />
                      <div
                        className={S.percent}
                        style={{ color: 10 > 0 ? "#0FA865" : "#E55A59" }}
                      >
                        10%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

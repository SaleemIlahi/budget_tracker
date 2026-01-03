import React, { useEffect, useState, useMemo } from "react";
import S from "./page.module.scss";
import DonutChart from "./components/DonutChart";
import Table from "./components/Table";
import Icon from "./components/Icon";
import { useApi } from "./hook/useApi";
import { useData } from "./context/DataContext";
import Elements from "./components/Elements";
import LineChart from "./components/LineChart";
import { useDebounce } from "./hook/useDebounce";

const Page: React.FC = () => {
  const { dispatch, activeMonth, activeYear } = useData();
  interface AllData {
    id: number;
    name: string;
    amount: number;
    description: string;
    created_at: Date;
    updated_at: Date;
  }

  interface AllResponse {
    status: number;
    message: string;
    data: AllData[];
  }

  interface TableData {
    date: Date;
    name: string;
    amount: number;
  }

  interface CategoryWiseData {
    name: string;
    total: number;
    distribution: number;
  }

  interface CategoryWiseResponse {
    status: number;
    message: string;
    data: CategoryWiseData[];
  }

  interface CategoryData {
    id: string;
    name: string;
    icon: string;
    amount: number;
    distribution: number;
  }

  interface IncomeExpenseData {
    title: string;
    amount: number;
    percent: number;
    graph: boolean;
    icon: string;
  }

  interface IncomeExpenseResponse {
    status: number;
    message: string;
    data: IncomeExpenseData[];
  }

  interface PieChart {
    label: string;
    value: number;
  }

  interface AllCategoryData {
    id: string;
    name: string;
  }

  interface AllCategoryResponse {
    status: number;
    message: string;
    data: AllCategoryData[];
  }

  interface dateWise {
    date: string;
    amount: number;
  }

  interface dateWaiteResponse {
    status: number;
    message: string;
    data: dateWise[];
    minAmount: number;
    maxAmount: number;
    year: number[];
  }

  type RangeValue = {
    minV: number;
    maxV: number;
  };

  const [tableData, setTableData] = useState<TableData[]>([]);
  const [category, setCategory] = useState<CategoryData[]>([]);
  const [pieChart, setPieChart] = useState<PieChart[]>([]);
  const [lineChartData, setlinChartData] = useState<
    { date: string; value: number }[]
  >([]);
  const [minMaxAmount, setMinMaxAmount] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 10 });
  const [yearsArr, setYearsArr] = useState<number[]>([]);
  const { request } = useApi();
  const [allCategory, setAllCategory] = useState<AllCategoryData[]>([]);
  const [filter, setFilter] = useState<{
    search: string;
    category: string[];
    amount: { minV: number; maxV: number };
  }>({
    search: "",
    category: [],
    amount: { minV: 0, maxV: 0 },
  });

  const allDataApi = async () => {
    const data = await request<AllResponse>(
      "GET",
      `all?monthNumber=${activeMonth + 1}&yearNumber=${activeYear}`
    );
    if (data.status === 200) {
      const td = data.data.map((o) => ({
        date: o.created_at,
        name: o.name,
        amount: o.amount,
      }));
      setTableData(td);
    }
  };

  const categoryWiseData = async () => {
    const data = await request<CategoryWiseResponse>(
      "GET",
      `category_wise?monthNumber=${activeMonth + 1}&yearNumber=${activeYear}`
    );
    const category = [
      "groceries",
      "utilities",
      "transportation",
      "entertainment",
      "health",
      "maintenance",
    ];
    if (data.status === 200) {
      const ctg = data.data.map((o) => ({
        id: o.name,
        name: o.name,
        icon: o.name,
        amount: o.total,
        distribution: o.distribution,
      }));
      const ctg_data = category.map((o) => {
        const c = ctg.find((g) => g.name === o);
        return (
          c || {
            id: o,
            name: o,
            icon: o,
            amount: 0,
            distribution: 0.0,
          }
        );
      });
      setCategory(ctg_data);
    }
  };

  const incomeEpense = async () => {
    const data = await request<IncomeExpenseResponse>(
      "GET",
      `income_expense?monthNumber=${activeMonth + 1}&yearNumber=${activeYear}`
    );
    if (data.status === 200) {
      setPieChart(() =>
        data.data.map((o) => ({ label: o.title, value: o.amount }))
      );
      dispatch({
        type: "INCOME_EXPENSE",
        payload: data.data,
      });
    }
  };

  const allCategoryApi = async () => {
    const data = await request<AllCategoryResponse>("GET", "all_category");
    if (data.status === 200) {
      setAllCategory(data.data);
    }
  };

  const dateWiseApi = async () => {
    const data = await request<dateWaiteResponse>(
      "GET",
      `date_wise?q=&monthNumber=${activeMonth + 1}&yearNumber=${activeYear}`
    );
    if (data.status === 200) {
      if (data.data.length === 0) {
        const year = new Date().getFullYear();
        const date = new Date(year, activeMonth + 1, 1);

        const formatted = date.toISOString().slice(0, 19);
        const lineDt = [
          {
            date: formatted,
            value: 0,
          },
        ];
        setlinChartData(lineDt);
      } else {
        const lineDt = data.data.map((o) => ({
          date: o.date,
          value: o.amount,
        }));
        setlinChartData(lineDt);
      }
      setMinMaxAmount(() => ({
        min: data.minAmount,
        max: data.maxAmount,
      }));
      setYearsArr(data.year);
      setFilter((f) => ({
        ...f,
        amount: { minV: data.minAmount, maxV: data.maxAmount },
      }));
    }
  };

  const filterApi = async () => {
    let query_arr: string[] = [];
    if (filter.category.length > 0) {
      let category_id = filter.category.join(",");
      query_arr.push(`category=${category_id}`);
    }
    if (filter.amount.minV && filter.amount.maxV) {
      query_arr.push(
        `minAmount=${filter.amount.minV}&maxAmount=${filter.amount.maxV}`
      );
    }
    query_arr.push(
      `monthNumber=${(activeMonth + 1).toString()}&yearNumber=${activeYear}`
    );
    let query_str = query_arr.join("&");
    const data = await request<AllResponse>("GET", `all?${query_str}`);
    if (data.status === 200) {
      const td = data.data.map((o) => ({
        date: o.created_at,
        name: o.name,
        amount: o.amount,
      }));
      setTableData(td);
    }
  };

  useEffect(() => {
    allCategoryApi();
  }, []);

  useMemo(() => {
    allDataApi();
    categoryWiseData();
    incomeEpense();
    dateWiseApi();
  }, [activeMonth, activeYear]);

  interface MonthInfo {
    currentMonthIndex: number;
    currentYear: number;
    currentMonthName: string;
    finishedMonths: string[];
  }

  const getMonthInfo = (): MonthInfo => {
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthName = now.toLocaleString("default", { month: "long" });
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "long" })
    );
    const finishedMonths = allMonths.slice(0, currentMonthIndex + 1);

    return {
      currentMonthName,
      finishedMonths,
      currentMonthIndex,
      currentYear,
    };
  };

  useEffect(() => {
    const { finishedMonths, currentMonthIndex, currentYear } = getMonthInfo();
    console.log(currentMonthIndex);
    dispatch({
      type: "ACTIVE_MONTH",
      payload: {
        month: currentMonthIndex,
        year: currentYear,
      },
    });
    dispatch({
      type: "ALL_MONTHS",
      payload: finishedMonths,
    });
  }, []);

  const head = [
    { id: "date", name: "Date" },
    { id: "category", name: "Category" },
    { id: "amount", name: "Amount" },
  ];

  const memoPieChart = useMemo(() => pieChart, [pieChart]);

  const debounceFilter = useDebounce(filter, 500);

  useEffect(() => {
    filterApi();
  }, [debounceFilter]);

  return (
    <div className={S.cnt}>
      <div className={S.top}>
        <div className={S.donut_chart}>
          <DonutChart
            data={memoPieChart}
            width={400}
            height={400}
            svgWidth={65}
          />
        </div>
        <div className={S.left}>
          <div className={S.calendar_header}>
            <Elements
              data={{
                name: "month_year",
                type: "month-year-calendar",
                years: yearsArr,
              }}
              set={(n, v) => {
                function hasMonthYear(
                  value: unknown
                ): value is { month: number; year: number } {
                  return (
                    typeof value === "object" &&
                    value !== null &&
                    "month" in value &&
                    "year" in value &&
                    typeof (value as Record<string, unknown>).month ===
                      "number" &&
                    typeof (value as Record<string, unknown>).year === "number"
                  );
                }
                if (hasMonthYear(v)) {
                  dispatch({
                    type: "ACTIVE_MONTH",
                    payload: {
                      month: v.month,
                      year: v.year,
                    },
                  });
                }
              }}
              get={(n) => ({ month: activeMonth, year: activeYear })}
            />
          </div>
          <div className={S.summary_card}>
            {lineChartData.length > 0 ? (
              <LineChart data={lineChartData} width={1100} height={250} />
            ) : (
              <div>No Data Found</div>
            )}
          </div>
        </div>
      </div>
      <div className={S.main}>
        <div className={S.table_cnt}>
          <div className={S.table_top}>
            <div className={S.filter}>
              {allCategory.length > 0 && (
                <div className={S.fields}>
                  <Elements
                    data={{
                      name: "category",
                      placeholder: "Select Category",
                      type: "multi-select",
                      options: allCategory,
                    }}
                    set={(n, v) => setFilter((f) => ({ ...f, [n]: v }))}
                    get={(n) => filter.category}
                  />
                </div>
              )}
              <div className={S.fields}>
                <Elements
                  key={JSON.stringify(minMaxAmount)}
                  data={{
                    name: "amount",
                    type: "range",
                    ...minMaxAmount,
                  }}
                  set={(n, v) => {
                    if (
                      typeof v === "object" &&
                      v !== null &&
                      "minV" in v &&
                      "maxV" in v
                    ) {
                      const value = v as RangeValue;

                      setFilter((f) => ({
                        ...f,
                        [n]: {
                          minV: Number(value.minV),
                          maxV: Number(value.maxV),
                        },
                      }));
                    }
                  }}
                  get={(n) => filter.amount}
                />
              </div>
            </div>
          </div>
          <div className={S.table_main}>
            <div className={S.table}>
              <Table<TableData> head={head} body={tableData} />
            </div>
            <div className={S.category_wise}>
              <div className={S.title}>
                Category wise spending & Distribution
              </div>
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
                      <div className={S.distribution}>
                        {o.distribution.toFixed(2)}%
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

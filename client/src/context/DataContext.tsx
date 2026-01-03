import React, { createContext, useContext, useReducer } from "react";

type Active = { month: number; year: number };
type Months = string[];

interface IncomeExpense {
  title: string;
  amount: number;
  percent: number;
  graph: boolean;
  icon: string;
}

interface DataState {
  activeMonth: number;
  activeYear: number;
  allMonths: string[];
  budget: IncomeExpense[];
}

type DataAction =
  | { type: "ACTIVE_MONTH"; payload: Active }
  | { type: "ALL_MONTHS"; payload: Months }
  | { type: "INCOME_EXPENSE"; payload: IncomeExpense[] };

interface DataContextType extends DataState {
  dispatch: React.Dispatch<DataAction>;
}
const now = new Date();
const currentMonthIndex = now.getMonth();
const currentYear = now.getFullYear();
const initialState: DataState = {
  activeMonth: currentMonthIndex,
  activeYear: currentYear,
  allMonths: [],
  budget: [],
};

function DataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "ACTIVE_MONTH":
      return {
        ...state,
        activeMonth: action.payload.month,
        activeYear: action.payload.year,
      };
    case "ALL_MONTHS":
      return {
        ...state,
        allMonths: action.payload,
      };
    case "INCOME_EXPENSE":
      return {
        ...state,
        budget: action.payload,
      };
    default:
      return state;
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(DataReducer, initialState);
  return (
    <DataContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within an DataProvider");
  return ctx;
};

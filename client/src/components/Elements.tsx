import React, {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useMemo,
} from "react";
import S from "../style/elements.module.scss";
import Icon from "./Icon";

interface Options {
  id: string;
  name: string;
}

interface Data {
  name: string;
  label?: string;
  placeholder?: string;
  type: string;
  options?: Options[];
  min?: number;
  max?: number;
  years?: number[];
}

interface ElementsData {
  data: Data;
  set: (name: string, value: unknown) => void;
  get: (name: string) => unknown;
}

type RangeValue = {
  minV: number;
  maxV: number;
};

const MultiSelect: React.FC<ElementsData> = (props) => {
  const { data, set, get } = props;
  const [selected, setSelected] = useState<Options[]>([]);
  const [search, setSearch] = useState<string>("");
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const selectRef = useRef(null);
  const handleCheckBox = (v: string, n: string) => {
    const checked = selected.filter((o) => o.id === v);
    if (checked.length > 0) {
      const removeChecked = selected.filter((o) => o.id !== v);
      setSelected(() => removeChecked);
    } else {
      setSelected((s) => [...s, { id: v, name: n }]);
    }
  };

  useEffect(() => {
    let selectedValue = get(data.name);
    setOptions(() => data?.options ?? []);
    if (Array.isArray(selectedValue)) {
      setSelected(() => selectedValue.map((o) => ({ id: o, name: o })));
    }
  }, []);

  useEffect(() => {
    set(
      data.name,
      selected.map((o) => o.id)
    );
  }, [selected]);

  const updateOption = useEffectEvent(() => {
    const filtered =
      data.options?.filter((v) => new RegExp(search, "i").test(v.name)) ?? [];
    setOptions(() => filtered);
  });

  useEffect(() => {
    updateOption();
  }, [search]);

  return (
    <div className={S.multi_select}>
      <div
        className={S.selected}
        ref={selectRef}
        onClick={() => setOpen((o) => !o)}
      >
        {selected.length === 0 ? (
          <div className={S.placeholder}>{data.placeholder}</div>
        ) : selected.length > 1 ? (
          <div className={S.selected_value}>{selected.length} selected</div>
        ) : (
          selected.map((s) => (
            <div className={S.selected_value} key={s.id}>
              {s.name.length > 10 ? s.name.slice(0, 7) + "..." : s.name}
            </div>
          ))
        )}
      </div>

      {open && (
        <div className={S.options}>
          <div className={S.search}>
            <Icon n="search" w={18} h={18} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {options.length === 0 ? (
            <div className={S.items}>No data found</div>
          ) : (
            options?.map((o) => (
              <div
                key={o.id}
                className={S.items}
                onClick={() => handleCheckBox(o.id, o.name)}
              >
                <input
                  type="checkbox"
                  onChange={() => handleCheckBox(o.id, o.name)}
                  onClick={(e) => e.stopPropagation()}
                  checked={selected.some((s) => s.id === o.id)}
                />
                <label>{o.name}</label>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const SingleSelect: React.FC<ElementsData> = (props) => {
  const { data, set, get } = props;

  const [selected, setSelected] = useState<Options | null>(null);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string, name: string) => {
    setSelected({ id, name });
    setOpen(false); // close after select
  };

  useEffect(() => {
    const selectedValue = get(data.name);
    setOptions(data?.options ?? []);

    if (selectedValue) {
      const match = data?.options?.find((o) => o.id === selectedValue);
      if (match) setSelected(match);
    }
  }, []);

  useEffect(() => {
    set(data.name, selected?.id ?? "");
  }, [selected]);

  useEffect(() => {
    const filtered =
      data.options?.filter((v) => new RegExp(search, "i").test(v.name)) ?? [];
    setOptions(filtered);
  }, [search]);

  return (
    <div className={S.multi_select}>
      <div className={S.selected} onClick={() => setOpen((o) => !o)}>
        {selected ? (
          <div className={S.selected_value}>
            {selected.name.length > 10
              ? selected.name.slice(0, 7) + "..."
              : selected.name}
          </div>
        ) : (
          <div className={S.placeholder}>{data.placeholder}</div>
        )}
      </div>

      {open && (
        <div className={S.options}>
          <div className={S.search}>
            <Icon n="search" w={18} h={18} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {options.length === 0 ? (
            <div className={S.items}>No data found</div>
          ) : (
            options.map((o) => (
              <div
                key={o.id}
                className={S.items}
                onClick={() => handleSelect(o.id, o.name)}
              >
                <input type="radio" checked={selected?.id === o.id} readOnly />
                <label>{o.name}</label>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const Calendar: React.FC<ElementsData> = (props) => {
  const [current, setCurrent] = useState(new Date());
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  const today = new Date();
  const month = current.toLocaleString("default", { month: "long" });
  const year = current.getFullYear();

  const firstDay = new Date(year, current.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, current.getMonth() + 1, 0).getDate();

  // Change month
  const prevMonth = () => setCurrent(new Date(year, current.getMonth() - 1, 1));

  const nextMonth = () => setCurrent(new Date(year, current.getMonth() + 1, 1));

  // When selecting a day
  const handleSelect = (day: number) => {
    const date = new Date(year, current.getMonth(), day);

    if (!start) {
      setStart(date);
      setEnd(null);
    } else if (start && !end) {
      if (date < start) {
        // Swap automatically
        setEnd(start);
        setStart(date);
      } else {
        setEnd(date);
      }
    } else {
      // Reset if both selected
      setStart(date);
      setEnd(null);
    }
  };

  const format = (d: Date | null) => (d ? d.toLocaleDateString("en-GB") : "");

  return (
    <div className={S.calendar_cnt}>
      <div className={S.selected_date} onClick={() => setOpen(!open)}>
        <div className={S.date}>
          {start && end
            ? `${format(start)} → ${format(end)}`
            : "Select date range"}
        </div>
        <div className={S.icon}>
          <Icon n="calendar" />
        </div>
      </div>

      {open && (
        <div className={S.calendar}>
          {/* Header */}
          <div className={S.header}>
            <button onClick={prevMonth}>‹</button>
            <div className={S.title}>
              {month} {year}
            </div>
            <button onClick={nextMonth}>›</button>
          </div>

          {/* Week days */}
          <div className={S.week}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className={S.week_day}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className={S.days}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={"e" + i} className={`${S.day} ${S.empty}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, current.getMonth(), day);

              const isToday = today.toDateString() === date.toDateString();

              const isStart =
                start && start.toDateString() === date.toDateString();

              const isEnd = end && end.toDateString() === date.toDateString();

              const inRange = start && end && date >= start && date <= end;

              return (
                <div
                  key={day}
                  className={[
                    S.day,
                    isToday && S.today,
                    isStart && S.start,
                    isEnd && S.end,
                    inRange && S.range,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSelect(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className={S.apply} onClick={() => setOpen(false)}>
            Apply
          </div>
        </div>
      )}
    </div>
  );
};

const MonthYearCalendar: React.FC<ElementsData> = (props) => {
  const { data, set, get } = props;
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [showYearPicker, setShowYearPicker] = useState<boolean>(false);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useMemo(() => {
    set(data.name, { year: selectedYear, month: selectedMonth });
  }, [selectedYear, selectedMonth]);

  // useEffect(() => {
  //   set(data.name, { year: selectedYear, month: selectedMonth });
  // }, [selectedYear, selectedMonth]);

  function hasMonthYear(
    value: unknown
  ): value is { month: number; year: number } {
    return (
      typeof value === "object" &&
      value !== null &&
      "month" in value &&
      "year" in value &&
      typeof (value as Record<string, unknown>).month === "number" &&
      typeof (value as Record<string, unknown>).year === "number"
    );
  }

  useEffect(() => {
    const value = get(data.name);
    if (hasMonthYear(value) && hasMonthYear(value)) {
      setSelectedYear(value?.year || new Date().getFullYear());
      setSelectedMonth(value?.month || new Date().getMonth());
    }
  }, []);

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  return (
    <div className={S.year_month_cnt}>
      <div className={S.calendar_icon}>
        <Icon n="calendar" w={18} h={18} />
      </div>
      <div className={S.month}>
        <div
          className={S.selected}
          onClick={() => {
            setShowMonthPicker(!showMonthPicker);
            setShowYearPicker(false);
          }}
        >
          {months[selectedMonth]}
        </div>
        <div
          aria-hidden={showMonthPicker}
          className={
            showMonthPicker
              ? `${S.picker} ${S.month_picker} ${S.active}`
              : `${S.picker} ${S.month_picker}`
          }
        >
          {months.map((month, index) => (
            <div
              className={
                months[selectedMonth]?.toLowerCase() === month.toLowerCase()
                  ? `${S.month_item} ${S.active}`
                  : S.month_item
              }
              key={month}
              onClick={() => {
                setSelectedMonth(index);
                setShowMonthPicker(false);
              }}
            >
              {month.slice(0, 3)}
            </div>
          ))}
        </div>
      </div>
      <div className={S.year}>
        <div
          className={S.selected}
          onClick={() => {
            setShowYearPicker(!showYearPicker);
            setShowMonthPicker(false);
          }}
        >
          {selectedYear}
        </div>
        <div
          aria-hidden={showYearPicker}
          className={
            showYearPicker
              ? `${S.picker} ${S.year_picker} ${S.active}`
              : `${S.picker} ${S.year_picker}`
          }
        >
          {data.years?.map((year) => (
            <div
              className={
                year === selectedYear
                  ? `${S.year_item} ${S.active}`
                  : S.year_item
              }
              onClick={() => {
                setSelectedYear(year);
                setShowYearPicker(false);
              }}
              key={year}
            >
              {year}
            </div>
          ))}
        </div>
      </div>
      <div className={S.arrow}>
        <div className={S.left_arrow} onClick={handlePreviousMonth}>
          <Icon n="left_arrow" w={15} h={15} />
        </div>
        <div className={S.right_arrow} onClick={handleNextMonth}>
          <Icon n="right_arrow" w={15} h={15} />
        </div>
      </div>
    </div>
  );
};

const Range: React.FC<ElementsData> = (props) => {
  const { data, set, get } = props;
  const minValue = data.min || 0;
  const maxValue = data.max || 10;
  const { minV, maxV } = get(data.name) as
    | RangeValue
    | { minV: number; maxV: number };
  const [min, setMin] = useState(Number(minV));
  const [max, setMax] = useState(Number(maxV));
  const [open, setOpen] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");
  // Ensure thumbs don't cross
  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErr("");
    const val = Number(e.target.value);
    setMin(val);
  };

  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErr("");
    const val = Number(e.target.value);
    setMax(val);
  };

  const handleApply = () => {
    if (min < max) {
      setOpen(false);
      set(data.name, { minV: min, maxV: max });
    } else {
      setErr("Enter a valid amount range");
    }
  };

  return (
    <div
      className={S.range_container}
      style={{
        ["--min-pos" as any]: `${(min / maxValue) * 100}%`,
        ["--max-pos" as any]: `${(max / maxValue) * 100}%`,
      }}
    >
      <div className={S.selected_range} onClick={() => setOpen((o) => !o)}>
        <div className={S.rnge}>
          {min} - {max}
        </div>
        <div className={S.icon}>
          <Icon n="range" w={30} h={30} />
        </div>
      </div>
      {open && (
        <div className={S.range}>
          <div className={S.err_msg}>{err}</div>
          <div className={S.bubble}>
            <div className={S.left}>
              <input type="number" onChange={handleMin} value={min} />
            </div>
            <div className={S.right}>
              <input type="number" onChange={handleMax} value={max} />
            </div>
          </div>

          <div className={S.slider_cnt}>
            <div className={S.slider_track}></div>
            <div
              className={S.slider_range}
              style={{
                left: `${(min / maxValue) * 100}%`,
                width: `${((max - min) / maxValue) * 100}%`,
              }}
            ></div>
            <input
              type="range"
              min={minValue}
              max={maxValue}
              value={min}
              onChange={handleMin}
              className={S.thumb + " " + S.thumb_min}
            />
            <input
              type="range"
              min={minValue}
              max={maxValue}
              value={max}
              onChange={handleMax}
              className={S.thumb + " " + S.thumb_max}
            />
          </div>

          <div onClick={handleApply} className={S.apply}>
            Apply
          </div>
        </div>
      )}
    </div>
  );
};

const Search: React.FC<ElementsData> = (props) => {
  const { data, set, get } = props;
  return (
    <div className={S.search_cnt}>
      <Icon n="search" w={18} h={18} />
      <input
        type="text"
        value={String(get(data.name)) ?? ""}
        onChange={(e) => set(data.name, e.target.value)}
        placeholder={data.placeholder}
      />
    </div>
  );
};

const Elements: React.FC<ElementsData> = (props) => {
  const { data } = props;
  return (
    <div className={S.cnt} key={data.name}>
      {data?.label && <label>{data.label}</label>}
      {(data.type === "multi-select" && <MultiSelect {...props} />) ||
        (data.type === "single-select" && <SingleSelect {...props} />) ||
        (data.type === "calendar" && <Calendar {...props} />) ||
        (data.type === "month-year-calendar" && (
          <MonthYearCalendar {...props} />
        )) ||
        (data.type === "range" && <Range {...props} />) ||
        (data.type === "search" && <Search {...props} />)}
    </div>
  );
};

export default Elements;

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface LineChartPoint {
  date: string; // "2025-10-01" or ISO
  value: number;
}

interface ParsedPoint {
  date: Date;
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 800,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // ---------- Helpers ----------
  const normalizeDate = (d: string) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const buildMonthData = (
    baseDate: string,
    arr: LineChartPoint[]
  ): ParsedPoint[] => {
    const base = new Date(baseDate);
    const year = base.getFullYear();
    const month = base.getMonth();
    const valueMap = new Map<string, number>();
    arr.forEach((d) => valueMap.set(normalizeDate(d.date), d.value));

    const result: ParsedPoint[] = [];
    let curr = new Date(year, month, 1);

    while (curr.getMonth() === month) {
      // if (isCurrentMonth && curr > today) break;
      const key = `${curr.getFullYear()}-${
        curr.getMonth() + 1
      }-${curr.getDate()}`;
      result.push({
        date: new Date(curr),
        value: valueMap.get(key) ?? 0,
      });
      curr.setDate(curr.getDate() + 1);
    }
    return result;
  };

  // ---------- D3 ----------
  useEffect(() => {
    if (!data.length) return;

    const parsedData = buildMonthData(data[0].date, data);

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.value)!])
      .nice()
      .range([innerHeight, 0]);

    // Axes
    const formatDate = d3.timeFormat("%b %d");

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((d) => (d instanceof Date ? formatDate(d) : ""))
      );

    g.append("g").call(d3.axisLeft(y).ticks(4));

    const bisectDate = d3.bisector<ParsedPoint, Date>((d) => d.date).left;
    const tooltipDateFormat = d3.timeFormat("%b %d");

    const focus = g.append("g").style("display", "none");

    focus
      .append("circle")
      .attr("r", 6)
      .attr("fill", "#9333ea")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseenter", () => {
        focus.style("display", null);
        tooltip.style("opacity", 1);
      })
      .on("mouseleave", () => {
        focus.style("display", "none");
        tooltip.style("opacity", 0);
      })
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const xDate = x.invert(mx);

        const i = bisectDate(parsedData, xDate, 1);
        const d0 = parsedData[i - 1];
        const d1 = parsedData[i];
        const d =
          !d1 ||
          xDate.getTime() - d0.date.getTime() <
            d1.date.getTime() - xDate.getTime()
            ? d0
            : d1;

        focus.attr("transform", `translate(${x(d.date)},${y(d.value)})`);
        tooltip
          .html(
            `<strong>${tooltipDateFormat(
              d.date
            )}</strong><br/>Value: ${d.value.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}`
          )
          .style("background", "rgba(255,255,255,0.98)")
          .style("color", "#000")
          .style("padding", "6px 10px")
          .style("border-radius", "6px")
          .style("font-size", "13px")
          .style("box-shadow", "0 1px 2px rgba(0,0,0,0.5)")
          .style("pointer-events", "none")
          .style("font-family", "'Roboto', sans-serif")
          .style("left", event.offsetX + 10 + "px")
          .style("top", event.offsetY - 30 + "px");
      });

    // Area
    const area = d3
      .area<ParsedPoint>()
      .x((d) => x(d.date))
      .y0(innerHeight)
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(parsedData)
      .attr("fill", "#a855f7")
      .attr("opacity", 0.2)
      .attr("d", area);

    // Line
    const line = d3
      .line<ParsedPoint>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const linePath = g
      .append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#9333ea")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Animate line draw
    const length = linePath.node()!.getTotalLength();
    linePath
      .attr("stroke-dasharray", length)
      .attr("stroke-dashoffset", length)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    // Dots
    const dots = g
      .selectAll("circle")
      .data(parsedData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.date))
      .attr("cy", innerHeight)
      .attr("r", 4)
      .attr("fill", "#9333ea");

    dots
      .transition()
      .delay((_, i) => i * 10)
      .duration(600)
      .attr("cy", (d) => y(d.value));

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    dots
      .on("mouseenter", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d3.timeFormat("%b %d")(d.date)}</strong><br/>Value: ${
              d.value
            }`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });
  }, [data, width, height]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width={width} height={height} />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          background: "#111",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          pointerEvents: "none",
          opacity: 0,
        }}
      />
    </div>
  );
};

export default LineChart;

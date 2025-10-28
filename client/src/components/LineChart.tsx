// CurvedLineChart.tsx
// React + TypeScript component for a responsive curved line chart using D3 without dots or axis lines.

import React, { useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";

interface DataPoint {
  date: string | Date;
  value: number;
}

interface CurvedLineChartProps {
  data?: DataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAccessor?: (d: DataPoint) => string | Date;
  yAccessor?: (d: DataPoint) => number;
  toolTip?: boolean;
}

const CurvedLineChart: React.FC<CurvedLineChartProps> = ({
  data = null,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 50 },
  xAccessor = (d) => d.date,
  yAccessor = (d) => d.value,
  toolTip = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sample = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }).map((_, i) => ({
      date: d3.timeMonth.offset(now, -11 + i),
      value: Math.round(20 + Math.sin(i / 2) * 10 + Math.random() * 8),
    }));
  }, []);

  const dataset = data && data.length > 0 ? data : sample;

  useEffect(() => {
    if (!dataset || dataset.length === 0) return;

    const parsed = dataset.map((d) => {
      const x = xAccessor(d);
      const date = typeof x === "string" ? new Date(x) : x;
      return { ...d, __date: date, __value: +yAccessor(d) };
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsed, (d) => d.__date) as [Date, Date])
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(parsed, (d) => d.__value)! * 1.1])
      .range([innerHeight, 0])
      .nice();

    const defs = svg.append("defs");
    const gradId = `grad-${Math.floor(Math.random() * 1e6)}`;
    const gradient = defs
      .append("linearGradient")
      .attr("id", gradId)
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-opacity", 0.35)
      .attr("stop-color", "#d473fe");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-opacity", 0)
      .attr("stop-color", "#d473fe");

    const line = d3
      .line<{ __date: Date; __value: number }>()
      .x((d) => xScale(d.__date))
      .y((d) => yScale(d.__value))
      .curve(d3.curveBasis);

    const area = d3
      .area<{ __date: Date; __value: number }>()
      .x((d) => xScale(d.__date))
      .y0(innerHeight)
      .y1((d) => yScale(d.__value))
      .curve(d3.curveBasis);

    g.append("path")
      .datum(parsed)
      .attr("fill", `url(#${gradId})`)
      .attr("d", area)
      .attr("opacity", 0)
      .transition()
      .duration(700)
      .attr("opacity", 1);

    const path = g
      .append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    const totalLength = path.node()!.getTotalLength();
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubic)
      .attr("stroke-dashoffset", 0);

    const container = d3.select<HTMLDivElement, unknown>(containerRef.current!);

    let tooltip = container
      .selectAll<HTMLDivElement, null>(".tooltip-d3")
      .data([null]);

    const tip = tooltip
      .enter()
      .append("div")
      .attr(
        "class",
        "tooltip-d3 absolute pointer-events-none bg-white/95 border p-2 rounded shadow-lg text-sm"
      )
      .style("display", "none");

    if (toolTip) {
      tooltip = tip.merge(
        tooltip as d3.Selection<HTMLDivElement, null, HTMLDivElement, unknown>
      );
    }

    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, this);
        const date = xScale.invert(mx);
        const bisect = d3.bisector((d: { __date: Date }) => d.__date).left;
        const idx = bisect(parsed, date);
        const a = parsed[idx - 1];
        const b = parsed[idx];
        const nearest = !a
          ? b
          : !b
          ? a
          : date.getTime() - a.__date.getTime() >
            b.__date.getTime() - date.getTime()
          ? b
          : a;

        const mouseX = xScale(nearest.__date) + margin.left;
        const mouseY = yScale(nearest.__value) + margin.top;

        tooltip
          .style("display", "block")
          .style("left", `${mouseX + 12}px`)
          .style("top", `${mouseY - 12}px`).html(`
            <div><strong>${d3.timeFormat("%b %d, %Y")(
              nearest.__date
            )}</strong></div>
            <div>Value: <strong>${nearest.__value}</strong></div>
          `);
      })
      .on("mouseleave", function () {
        tooltip.style("display", "none");
      });
  }, [dataset, width, height, margin, xAccessor, yAccessor]);

  return (
    <div ref={containerRef} className="w-full max-w-full relative p-2">
      <svg ref={svgRef} style={{ width: "100%", height: "auto" }} />
    </div>
  );
};

export default CurvedLineChart;

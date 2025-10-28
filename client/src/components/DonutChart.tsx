import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface DonutData {
  label: string;
  value: number;
}

interface DonutChartProps {
  data: DonutData[];
  width?: number;
  height?: number;
  innerRadiusRatio?: number;
  colors?: string[];
  svgWidth?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = 400,
  height = 400,
  innerRadiusRatio = 0.85,
  colors = ["#a06ed6", "#c78be7", "#e6c1f7"],
  svgWidth = 65,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * innerRadiusRatio;

    const colorScale = d3.scaleOrdinal<string>().range(colors);

    const pie = d3
      .pie<DonutData>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<DonutData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(20);

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const imageSize = innerRadius * 1.4; // adjust multiplier to fit nicely
    g.append("image")
      .attr(
        "xlink:href",
        "https://res.cloudinary.com/do63p55lo/image/upload/v1760718435/budget_tracker/logo_yaajil.png"
      ) // <-- update image path
      .attr("width", imageSize)
      .attr("height", imageSize)
      .attr("x", -imageSize / 2)
      .attr("y", -imageSize / 2)
      .attr("clip-path", "circle(50%)");

    // 🟣 Tooltip setup
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(255,255,255)")
      .style("color", "#000")
      .style("padding", "6px 10px")
      .style("border-radius", "6px")
      .style("font-size", "13px")
      .style("box-shadow", "0 1px 2px rgba(0,0,0,0.5)")
      .style("pointer-events", "none")
      .style("font-family", "'Roboto', sans-serif")
      .style("opacity", 0);

    g.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("fill", (d) => colorScale(d.data.label))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("cursor", "pointer");
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip
          .html(
            `<strong>${d.data.label}</strong><br/>${d.data.value.toLocaleString(
              "en-IN",
              {
                style: "currency",
                currency: "INR",
              }
            )}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200);
        tooltip.transition().duration(300).style("opacity", 0);
      })
      .transition()
      .duration(800)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(i(t))!;
      });

    // 🟡 Labels
    // g.selectAll("text")
    //   .data(pie(data))
    //   .enter()
    //   .append("text")
    //   .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    //   .attr("text-anchor", "middle")
    //   .attr("dy", "0.35em")
    //   .style("font-size", "14px")
    //   .style("fill", "#333")
    //   .text((d) => d.data.label);

    // 🧹 Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, width, height, innerRadiusRatio, colors]);

  return <svg ref={ref} style={{ width: svgWidth + "%", height: "auto" }} />;
};

export default DonutChart;

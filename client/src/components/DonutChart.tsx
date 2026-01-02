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
  minAngleDeg?: number; // minimum angle per slice in degrees
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = 400,
  height = 400,
  innerRadiusRatio = 0.85,
  colors = ["#a06ed6", "#c78be7", "#e6c1f7"],
  svgWidth = 65,
  minAngleDeg = 45,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Keep original data immutable for tooltip / debugging
    const originalData = data.map((d) => ({ ...d }));

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * innerRadiusRatio;
    const colorScale = d3.scaleOrdinal<string>().range(colors);

    // ---------- compute adjusted values (without mutating originalData) ----------
    const n = originalData.length;
    const totalOriginal = d3.sum(originalData, (d) => d.value);
    const TWO_PI = Math.PI * 2;
    const minAngleRad = (minAngleDeg * Math.PI) / 180;

    // Edge: impossible to satisfy if minAngle * n >= 360 => fallback to equal angles
    let adjustedValues: number[] = [];

    if (minAngleDeg * n >= 360 || totalOriginal <= 0) {
      // equal distribution fallback
      const eq = totalOriginal > 0 ? totalOriginal / n : 1;
      adjustedValues = originalData.map(() => eq);
    } else {
      // value equivalent of minAngle
      const minValueEquivalent = (minAngleRad / TWO_PI) * totalOriginal;

      // classify small (< minValueEquivalent) and large values
      const originalValues = originalData.map((d) => d.value);
      const smallMask = originalValues.map((v) => v < minValueEquivalent);
      const smallCount = smallMask.filter(Boolean).length;

      const reservedForSmall = smallCount * minValueEquivalent;
      const largeSum = d3.sum(originalValues.filter((v, i) => !smallMask[i]));

      // If reservedForSmall uses all the total (degenerate), fallback to equal
      if (reservedForSmall >= totalOriginal - 1e-12) {
        const eq = totalOriginal / n;
        adjustedValues = originalValues.map(() => eq);
      } else {
        // Scale large values so that total stays the same:
        // (scaledLargeSum) + reservedForSmall = totalOriginal
        const scaleForLarge =
          largeSum > 0 ? (totalOriginal - reservedForSmall) / largeSum : 0;

        adjustedValues = originalValues.map((v, i) =>
          smallMask[i] ? minValueEquivalent : v * scaleForLarge
        );
      }
    }

    // ---------- Build adjusted data objects for pie (but preserve original values for tooltip) ----------
    const adjustedData = originalData.map((d, i) => ({
      label: d.label,
      value: adjustedValues[i],
      originalValue: d.value, // keep original for tooltip
    }));

    // ---------- D3 pie & arc ----------
    const pie = d3
      .pie<{ label: string; value: number; originalValue: number }>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<
        d3.PieArcDatum<{ label: string; value: number; originalValue: number }>
      >()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(20);

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const imageSize = innerRadius * 1.4;
    g.append("image")
      .attr(
        "xlink:href",
        "https://res.cloudinary.com/do63p55lo/image/upload/v1760718435/budget_tracker/logo_yaajil.png"
      )
      .attr("width", imageSize)
      .attr("height", imageSize)
      .attr("x", -imageSize / 2)
      .attr("y", -imageSize / 2)
      .attr("clip-path", "circle(50%)");

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(255,255,255,0.98)")
      .style("color", "#000")
      .style("padding", "6px 10px")
      .style("border-radius", "6px")
      .style("font-size", "13px")
      .style("box-shadow", "0 1px 2px rgba(0,0,0,0.5)")
      .style("pointer-events", "none")
      .style("font-family", "'Roboto', sans-serif")
      .style("opacity", 0);

    // Draw slices
    const pieData = pie(adjustedData);

    g.selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("fill", (d) => colorScale(d.data.label))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(150).attr("cursor", "pointer");
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip
          .html(
            `<strong>${
              d.data.label
            }</strong><br/>${d.data.originalValue.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}`
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
        d3.select(this).transition().duration(150);
        tooltip.transition().duration(200).style("opacity", 0);
      })
      .transition()
      .duration(800)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(i(t))!;
      });

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [data, width, height, innerRadiusRatio, colors, minAngleDeg, svgWidth]);

  return <svg ref={ref} style={{ width: svgWidth + "%", height: "auto" }} />;
};

export default React.memo(DonutChart);

/* eslint-disable */
"use client";

import { useEffect, useRef, useState } from "react";
import { csv } from "d3-fetch";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";

type DietType = "carnivore" | "herbivore" | "omnivore";

interface AnimalDatum {
  name: string;
  speed: number;
  diet: DietType;
}

const VALID_DIETS: DietType[] = ["carnivore", "herbivore", "omnivore"];

const DIET_COLORS: Record<DietType, string> = {
  carnivore: "#e74c3c",
  herbivore: "#27ae60",
  omnivore: "#f39c12",
};

export default function AnimalSpeedGraph() {
  const graphRef = useRef<HTMLDivElement>(null);
  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    csv("/sample_animals.csv")
      .then((rows) => {
        const parsed: AnimalDatum[] = rows
          .map((row) => {
            const speed = parseFloat(row.speed ?? "");
            const diet = (row.diet ?? "").trim().toLowerCase();
            if (
              !row.name?.trim() ||
              isNaN(speed) ||
              speed <= 0 ||
              !VALID_DIETS.includes(diet as DietType)
            ) {
              return null;
            }
            return {
              name: row.name.trim(),
              speed,
              diet: diet as DietType,
            };
          })
          .filter((d): d is AnimalDatum => d !== null);

        // Sort by speed descending for clearer bar chart
        parsed.sort((a, b) => b.speed - a.speed);

        // Limit to top 25 for readability (use best judgment per instructions)
        setAnimalData(parsed.slice(0, 25));
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!graphRef.current || animalData.length === 0) return;

    const container = graphRef.current;
    container.innerHTML = "";

    const containerWidth = container.clientWidth ?? 800;
    const containerHeight = container.clientHeight ?? 500;
    const width = Math.max(containerWidth, 600);
    const height = Math.max(containerHeight, 400);
    const margin = { top: 70, right: 140, bottom: 100, left: 90 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxSpeed = max(animalData, (d) => d.speed) ?? 100;

    const xScale = scaleBand()
      .domain(animalData.map((d) => d.name))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = scaleLinear()
      .domain([0, maxSpeed * 1.05])
      .range([chartHeight, 0]);

    const colorScale = scaleOrdinal<DietType, string>()
      .domain(VALID_DIETS)
      .range([DIET_COLORS.carnivore, DIET_COLORS.herbivore, DIET_COLORS.omnivore]);

    g.selectAll(".bar")
      .data(animalData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.name) ?? 0)
      .attr("y", (d) => yScale(d.speed))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => chartHeight - yScale(d.speed))
      .attr("fill", (d) => colorScale(d.diet))
      .attr("rx", 2)
      .attr("ry", 2);

    const xAxis = axisBottom(xScale).tickFormat((d) => {
      const label = String(d);
      return label.length > 12 ? label.slice(0, 10) + "…" : label;
    });

    const xAxisG = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis);

    xAxisG.selectAll("text").attr("transform", "rotate(-45)").style("text-anchor", "end");

    const yAxis = axisLeft(yScale);
    g.append("g").attr("class", "y-axis").call(yAxis);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "currentColor")
      .text("Animal");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "currentColor")
      .text("Speed (km/h)");

    const legendData: { diet: DietType; label: string }[] = [
      { diet: "carnivore", label: "Carnivore" },
      { diet: "herbivore", label: "Herbivore" },
      { diet: "omnivore", label: "Omnivore" },
    ];

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - margin.right + 10},${margin.top})`);

    legendData.forEach((item, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0,${i * 22})`);
      legendRow
        .append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", colorScale(item.diet))
        .attr("rx", 2);
      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .style("fill", "currentColor")
        .text(item.label);
    });
  }, [animalData]);

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[500px] items-center justify-center text-destructive">
        {error}
      </div>
    );
  }

  if (animalData.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center text-muted-foreground">
        No valid data to display. Ensure sample_animals.csv exists with name, speed, and diet columns.
      </div>
    );
  }

  return (
    <div
      ref={graphRef}
      className="min-h-[500px] w-full rounded-lg border bg-card p-4"
      style={{ height: 550 }}
    />
  );
}

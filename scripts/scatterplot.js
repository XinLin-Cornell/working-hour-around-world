// Setting the width, height and margin of the scatter plot
const scatter = d3.select("svg#scatter_plot");
const height2 = scatter.attr("height");
const width2 = scatter.attr("width");
const margin2 = { top: 20, right: 10, bottom: 50, left: 60 };
const chartWidth2 = width2 - margin2.left - margin2.right;
const chartHeight2 = height2 - margin2.top - margin2.bottom;

// legend for the scatter plot
const legend = d3.select("div#legend");

// Setting the width, height and margin of the Working Hour - Year line chart
const line_working_hour = d3.select("svg#line_working_hour");
const lineHeight1 = line_working_hour.attr("height");
const lineWidth1 = line_working_hour.attr("width");
const lineMargin1 = { top: 15, right: 5, bottom: 30, left: 55 };
const lineChartWidth1 = lineWidth1 - lineMargin1.left - lineMargin1.right;
const lineChartHeight1 = lineHeight1 - lineMargin1.top - lineMargin1.bottom;

// Setting the width, height and margin of the GDP per Cap - Year line chart
const line_gdp = d3.select("svg#line_gdp");
const lineHeight2 = line_gdp.attr("height");
const lineWidth2 = line_gdp.attr("width");
const lineMargin2 = { top: 15, right: 5, bottom: 30, left: 55 };
const lineChartWidth2 = lineWidth2 - lineMargin2.left - lineMargin2.right;
const lineChartHeight2 = lineHeight2 - lineMargin2.top - lineMargin2.bottom;

// Moving bubble on the slider
const year_bubble = d3.select("svg#year_bubble");

const loadData = async function () {
  // Original Source: https://www.rug.nl/ggdc/productivity/pwt/
  const working_hour = await d3.csv("dataset/cleaned_working_hour.csv");

  // Source: manually made
  const country_to_continent = await d3.csv(
    "dataset/country_to_continent1.csv"
  );

  // The list of countries initially visible
  const countries = [
    "United States",
    "Mexico",
    "Canada",
    "China",
    "Hong Kong",
    "Singapore",
    "Taiwan",
    "Myanmar",
    "India",
    "South Korea",
    "Japan",
    "Israel",
    "France",
    "United Kingdom",
    "Norway",
    "Russia",
    "Germany",
    "Denmark",
    "Switzerland",
    "Brazil",
    "Argentina",
    "Nigeria",
    "South Africa",
    "Australia",
    "New Zealand",
  ];

  const continents = [
    "South America",
    "Oceania",
    "Europe",
    "Asia",
    "North America",
    "Africa",
  ];

  const countryCodes = d3.map(country_to_continent, (d) => d.Code);

  let country_visibility = {};

  countryCodes.forEach((d, i) => {
    country_visibility[d] = true;
  });

  // Initialize visibility for countries
  working_hour.forEach((d, i) => {
    d["GDP"] = Number(d["GDP"]);
    d["Population"] = Number(d["Population"]);
    d["Working_Hours"] = Number(d["Working_Hours"]) / (365 / 7);

    var entity = d["Entity"];
    var matchedData = country_to_continent.filter(
      (country_to_continent) => country_to_continent["Entity"] == entity
    );
    var continent = matchedData[0].Continent;
    d["Continent"] = continent;

    if (countries.includes(entity)) {
      d["Text_Visibility"] = true;
    } else {
      d["Text_Visibility"] = false;
    }
  });

  // Reformatting the data to be grouped by Year
  var dataByYear = [];
  for (let y = 1950; y <= 2017; y++) {
    var year = y;
    var dict = { Year: year };
    var values = [];

    working_hour.forEach((d, i) => {
      if (d.Year == year) {
        values.push(d);
      }
    });

    dict["Values"] = values;

    // Getting average Working Hours by Continents
    continents.forEach((continent) => {
      let count = 0;

      values.forEach((d) => {
        if (d["Continent"] === continent) {
          count += 1;
        }
      });

      if (Number(count) > 0) {
        dict[continent + " Working Hours"] = 0;
        values.forEach((d) => {
          if (d["Continent"] === continent) {
            dict[continent + " Working Hours"] += d["Working_Hours"];
          }
        });
      }

      dict[continent + " Working Hours"] /= count;
    });

    // Getting average GDP per capita by Continents
    continents.forEach((continent) => {
      let count = 0;

      values.forEach((d) => {
        if (d["Continent"] === continent) {
          count += 1;
        }
      });

      if (count > 0) {
        dict[continent + " GDP"] = 0;
        values.forEach((d) => {
          if (d["Continent"] === continent) {
            dict[continent + " GDP"] += d["GDP"];
          }
        });
      }

      dict[continent + " GDP"] /= count;
    });

    dataByYear.push(dict);
  }

  // Separate annotations and chart area for the scatter plot
  let annotations = scatter.append("g").attr("id", "annotations");
  let chartArea = scatter
    .append("g")
    .attr("id", "points")
    .attr("transform", `translate(${margin2.left},${margin2.top})`);

  // Y Axis and Gridlines for the scatter plot
  let yAxis = d3.axisLeft().tickFormat((x) => `$${x}`);
  let yGridlines = d3
    .axisLeft()
    .tickSize(-chartWidth2 - 10)
    .tickFormat("");
  let yAxisG = annotations
    .append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin2.left - 12},${margin2.top})`);
  let yGridlinesG = annotations
    .append("g")
    .attr("class", "y gridlines")
    .attr("transform", `translate(${margin2.left - 12},${margin2.top})`);

  // X Axis and Gridlines for the scatter plot
  let xAxis = d3.axisBottom().tickFormat((x) => `${x}h`);
  let xGridlines = d3
    .axisBottom()
    .tickSize(-chartHeight2 - 10)
    .tickFormat("");
  let xAxisG = annotations
    .append("g")
    .attr("class", "x axis")
    .attr(
      "transform",
      `translate(${margin2.left},${chartHeight2 + margin2.top + 20})`
    );
  let xGridlinesG = annotations
    .append("g")
    .attr("class", "x gridlines")
    .attr(
      "transform",
      `translate(${margin2.left},${chartHeight2 + margin2.top + 20})`
    );

  // Color scale for the continents
  const continentScale = d3
    .scaleOrdinal()
    .domain(continents)
    .range([
      "rgb(136, 72, 132)",
      "rgb(41, 131, 254)",
      "rgb(11, 43, 79)",
      "rgb(208, 0, 47)",
      "rgb(77, 141, 141)",
      "rgb(150, 79, 46)",
    ]);

  // Separate annotations and chart area for the working hour line chart
  let workingHourAnnotations = line_working_hour
    .append("g")
    .attr("id", "workingHourAnnotations");
  let workingHourChartArea = line_working_hour
    .append("g")
    .attr("id", "points")
    .attr("transform", `translate(${lineMargin1.left},${lineMargin1.top})`);

  // Set Year and Working Hour Scale for the working hour line chart
  const workingHourYearScale = d3
    .scaleLinear()
    .domain([1950, 2017])
    .range([0, lineChartWidth1]);

  const workingHourScale = d3
    .scaleLinear()
    .domain([30, 47])
    .range([lineChartHeight1, 0]);

  // Y axis and Gridlines for the working hour line chart
  let workingHourAxis = d3
    .axisLeft(workingHourScale)
    .tickFormat((x) => `${x}h`);
  let workingHourGridlines = d3
    .axisLeft(workingHourScale)
    .tickSize(-lineChartWidth1 - 5)
    .tickFormat("");
  workingHourAnnotations
    .append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${lineMargin1.left - 5},${lineMargin1.top})`)
    .call(workingHourAxis);
  workingHourAnnotations
    .append("g")
    .attr("class", "y gridlines")
    .attr("transform", `translate(${lineMargin1.left - 5},${lineMargin1.top})`)
    .call(workingHourGridlines);

  // X axis and Gridlines for the working hour line chart
  let workingHourYearAxis = d3
    .axisBottom(workingHourYearScale)
    .tickFormat((x) => `${x}`);
  let workingHourYearGridlines = d3
    .axisBottom(workingHourYearScale)
    .tickSize(-lineChartHeight1 - 5)
    .tickFormat("");
  workingHourAnnotations
    .append("g")
    .attr("class", "x axis")
    .attr(
      "transform",
      `translate(${lineMargin1.left},${lineChartHeight1 + lineMargin1.top + 5})`
    )
    .call(workingHourYearAxis);
  workingHourAnnotations
    .append("g")
    .attr("class", "x gridlines")
    .attr(
      "transform",
      `translate(${lineMargin1.left},${lineChartHeight1 + lineMargin1.top + 5})`
    )
    .call(workingHourYearGridlines);

  // Continents without NA values
  const continentsNotNA = [
    "South America",
    "Oceania",
    "Europe",
    "Asia",
    "North America",
  ];

  // Make line generator for year 1950 - 2001
  continentsNotNA.forEach((c) => {
    var lineGen = d3
      .line()
      .x((d) => Number(workingHourYearScale(d["Year"])))
      .y((d) => Number(workingHourScale(d[c + " Working Hours"])))
      .curve(d3.curveMonotoneX);

    for (let y = 1950; y <= 2001; y++) {
      workingHourChartArea
        .append("path")
        .datum(
          dataByYear.filter(
            (dataByYear) =>
              (y <= dataByYear["Year"]) & (dataByYear["Year"] <= y + 1)
          )
        )
        .attr("year", y)
        .attr("class", "working-hours-line")
        .attr("fill", "none")
        .attr("stroke", (d) => continentScale(c))
        .attr("stroke-width", 2)
        .attr("d", lineGen)
        .attr("opacity", 0.7);
    }
  });

  // Make line generator for year 2001 - 2017
  continents.forEach((c) => {
    var lineGen = d3
      .line()
      .x((d) => Number(workingHourYearScale(d["Year"])))
      .y((d) => Number(workingHourScale(d[c + " Working Hours"])))
      .curve(d3.curveMonotoneX);

    for (let y = 2001; y <= 2016; y++) {
      workingHourChartArea
        .append("path")
        .datum(
          dataByYear.filter(
            (dataByYear) =>
              (y <= dataByYear["Year"]) & (dataByYear["Year"] <= y + 1)
          )
        )
        .attr("year", y)
        .attr("class", "working-hours-line")
        .attr("fill", "none")
        .attr("stroke", (d) => continentScale(c))
        .attr("stroke-width", 2)
        .attr("d", lineGen)
        .attr("opacity", 0.7);
    }
  });

  // Separate annotations and chart area for the GDP per Cap line chart
  let GDPAnnotations = line_gdp.append("g").attr("id", "gdpAnnotations");
  let GDPChartArea = line_gdp
    .append("g")
    .attr("id", "points")
    .attr("transform", `translate(${lineMargin1.left},${lineMargin1.top})`);

  // Set Year and GDP per capita Scale for the working hour line chart
  const GDPYearScale = d3
    .scaleLinear()
    .domain([1950, 2017])
    .range([0, lineChartWidth2]);

  const GDPperCapScale = d3
    .scaleLinear()
    .domain([1900, 42000])
    .range([lineChartHeight2, 0]);

  // Y axis and Gridlines for the GDP per Cap line chart
  let GDPAxis = d3.axisLeft(GDPperCapScale).tickFormat((x) => `$${x}`);
  let GDPGridlines = d3
    .axisLeft(GDPperCapScale)
    .tickSize(-lineChartWidth2 - 5)
    .tickFormat("");
  GDPAnnotations.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${lineMargin2.left - 5},${lineMargin2.top})`)
    .call(GDPAxis);
  GDPAnnotations.append("g")
    .attr("class", "y gridlines")
    .attr("transform", `translate(${lineMargin2.left - 5},${lineMargin2.top})`)
    .call(GDPGridlines);

  // X axis and Gridlines for the GDP per Cap line chart
  let GDPearAxis = d3.axisBottom(GDPYearScale).tickFormat((x) => `${x}`);
  let GDPYearGridlines = d3
    .axisBottom(GDPYearScale)
    .tickSize(-lineChartHeight2 - 5)
    .tickFormat("");
  GDPAnnotations.append("g")
    .attr("class", "x axis")
    .attr(
      "transform",
      `translate(${lineMargin2.left},${lineChartHeight2 + lineMargin2.top + 5})`
    )
    .call(GDPearAxis);
  GDPAnnotations.append("g")
    .attr("class", "x gridlines")
    .attr(
      "transform",
      `translate(${lineMargin2.left},${lineChartHeight2 + lineMargin2.top + 5})`
    )
    .call(GDPYearGridlines);

  // Make line generator for year 1950 - 2001
  continentsNotNA.forEach((c) => {
    var lineGen = d3
      .line()
      .x((d) => Number(GDPYearScale(d["Year"])))
      .y((d) => Number(GDPperCapScale(d[c + " GDP"])))
      .curve(d3.curveMonotoneX);

    for (let y = 1950; y <= 2001; y++) {
      GDPChartArea.append("path")
        .datum(
          dataByYear.filter(
            (dataByYear) =>
              (y <= dataByYear["Year"]) & (dataByYear["Year"] <= y + 1)
          )
        )
        .attr("year", y)
        .attr("class", "gdp-line")
        .attr("fill", "none")
        .attr("stroke", (d) => continentScale(c))
        .attr("stroke-width", 2)
        .attr("d", lineGen)
        .attr("opacity", 0.7);
    }
  });

  // Make line generator for year 2001 - 2017
  continents.forEach((c) => {
    var lineGen = d3
      .line()
      .x((d) => Number(GDPYearScale(d["Year"])))
      .y((d) => Number(GDPperCapScale(d[c + " GDP"])))
      .curve(d3.curveMonotoneX);

    for (let y = 2001; y <= 2016; y++) {
      GDPChartArea.append("path")
        .datum(
          dataByYear.filter(
            (dataByYear) =>
              (y <= dataByYear["Year"]) & (dataByYear["Year"] <= y + 1)
          )
        )
        .attr("year", y)
        .attr("class", "gdp-line")
        .attr("fill", "none")
        .attr("stroke", (d) => continentScale(c))
        .attr("stroke-width", 2)
        .attr("d", lineGen)
        .attr("opacity", 0.7);
    }
  });

  // Arrange the order of markers on the working hour line chart
  var workingHourPosMap = {};
  [
    "Africa",
    "Asia",
    "South America",
    "North America",
    "Oceania",
    "Europe",
  ].forEach((c, i) => {
    workingHourPosMap[c] = i;
  });

  // Arrange the order of markers on the GDP per Cap line chart
  var gdpPosMap = {};
  [
    "Oceania",
    "Europe",
    "North America",
    "Asia",
    "South America",
    "Africa",
  ].forEach((c, i) => {
    gdpPosMap[c] = i;
  });

  // Working Hour line chart mouse over
  let workingHourMouseGroup = workingHourChartArea.append("g");

  if (sliderYear < 2001) {
    continentsNotNA.forEach((c) => {
      workingHourMouseGroup
        .append("circle")
        .attr("class", "working-hour-marker")
        .attr("id", c.replace(/ /g, "_") + "WorkingHourMarker")
        .attr("fill", continentScale(c))
        .attr("r", 5)
        .attr("visibility", "hidden")
        .attr("opacity", 0.8);

      workingHourMouseGroup
        .append("text")
        .attr("class", "working-hour-label")
        .attr("id", c.replace(/ /g, "_") + "WorkingHourLabel")
        .attr("visibility", "hidden");
    });
  } else {
    continents.forEach((c) => {
      workingHourMouseGroup
        .append("circle")
        .attr("class", "working-hour-marker")
        .attr("id", c.replace(/ /g, "_") + "WorkingHourMarker")
        .attr("fill", continentScale(c))
        .attr("r", 5)
        .attr("visibility", "hidden")
        .attr("opacity", 0.8);

      workingHourMouseGroup
        .append("text")
        .attr("class", "working-hour-label")
        .attr("id", c.replace(/ /g, "_") + "WorkingHourLabel")
        .attr("visibility", "hidden");
    });
  }

  let workingHourActiveRegion = workingHourMouseGroup
    .append("rect")
    .attr("id", "workingHourActiveRegion")
    .attr("width", lineChartWidth1 - lineMargin1.right)
    .attr("height", lineChartHeight1)
    .attr("fill", "none")
    .attr("pointer-events", "all");

  workingHourActiveRegion.on("mouseover", function () {
    d3.selectAll(".working-hour-marker").attr("visibility", "");
    d3.selectAll(".working-hour-label").attr("visibility", "");
  });

  workingHourActiveRegion.on("mouseout", function () {
    d3.selectAll(".working-hour-marker").attr("visibility", "hidden");
    d3.selectAll(".working-hour-label").attr("visibility", "hidden");
  });

  // GDP line chart mouse over
  let gdpMouseGroup = GDPChartArea.append("g");

  if (sliderYear < 2001) {
    continentsNotNA.forEach((c) => {
      gdpMouseGroup
        .append("circle")
        .attr("class", "gdp-marker")
        .attr("id", c.replace(/ /g, "_") + "GDPMarker")
        .attr("fill", continentScale(c))
        .attr("r", 5)
        .attr("visibility", "hidden")
        .attr("opacity", 0.8);

      gdpMouseGroup
        .append("text")
        .attr("class", "gdp-label")
        .attr("id", c.replace(/ /g, "_") + "GDPLabel")
        .attr("visibility", "hidden");
    });
  } else {
    continents.forEach((c) => {
      gdpMouseGroup
        .append("circle")
        .attr("class", "gdp-marker")
        .attr("id", c.replace(/ /g, "_") + "GDPMarker")
        .attr("fill", continentScale(c))
        .attr("r", 5)
        .attr("visibility", "hidden")
        .attr("opacity", 0.8);

      gdpMouseGroup
        .append("text")
        .attr("class", "gdp-label")
        .attr("id", c.replace(/ /g, "_") + "GDPLabel")
        .attr("visibility", "hidden");
    });
  }

  let gdpActiveRegion = gdpMouseGroup
    .append("rect")
    .attr("id", "GDPActiveRegion")
    .attr("width", lineChartWidth2 - lineMargin2.right)
    .attr("height", lineChartHeight2)
    .attr("fill", "none")
    .attr("pointer-events", "all");

  gdpActiveRegion.on("mouseover", function () {
    d3.selectAll(".gdp-marker").attr("visibility", "");
    d3.selectAll(".gdp-label").attr("visibility", "");
  });

  gdpActiveRegion.on("mouseout", function () {
    d3.selectAll(".gdp-marker").attr("visibility", "hidden");
    d3.selectAll(".gdp-label").attr("visibility", "hidden");
  });

  let findYear = d3.bisector((d) => d.Year).right;

  // Working Hour line chart mousemove
  workingHourActiveRegion.on("mousemove", function (evt) {
    let location = d3.pointer(evt);
    let x = location[0];
    let xYear = workingHourYearScale.invert(x);
    let index = findYear(dataByYear, xYear);
    let d = dataByYear[index];

    continentsNotNA.forEach((c) => {
      let xPos = workingHourYearScale(d["Year"]);
      let yPos = workingHourScale(d[c + " Working Hours"]);

      d3.select("#" + c.replace(/ /g, "_") + "WorkingHourMarker")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("visibility", xYear <= sliderYear ? "" : "hidden");

      let txt = c + " : " + d[c + " Working Hours"].toFixed(2);

      d3.select("#" + c.replace(/ /g, "_") + "WorkingHourLabel")
        .text(txt)
        .attr("x", xPos < lineChartWidth1 / 2 ? xPos + 10 : xPos - 10)
        .attr("y", 20 + workingHourPosMap[c] * 25)
        .attr("visibility", xYear <= sliderYear ? "" : "hidden")
        .attr("text-anchor", xPos < lineChartWidth1 / 2 ? "start" : "end")
        .style("fill", continentScale(c))
        .style("font-weight", "bold")
        .style("font-family", "Arial")
        .style("font-size", "12px");
    });

    // Special case for Africa
    if (sliderYear < 2001) {
      d3.select("#AfricaWorkingHourMarker").attr("visibility", "hidden");
      d3.select("#AfricaWorkingHourLabel").attr("visibility", "hidden");
    } else {
      let xPos = workingHourYearScale(d["Year"]);
      let yPos = workingHourScale(d["Africa Working Hours"]);

      d3.select("#AfricaWorkingHourMarker")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr(
          "visibility",
          (xYear >= 2001) & (xYear <= sliderYear) ? "" : "hidden"
        );

      let txt = "Africa : " + d["Africa Working Hours"].toFixed(2);

      d3.select("#AfricaWorkingHourLabel")
        .text(txt)
        .attr("x", xPos < lineChartWidth1 / 2 ? xPos + 10 : xPos - 10)
        .attr("y", 20 + workingHourPosMap["Africa"] * 25)
        .attr(
          "visibility",
          (xYear >= 2001) & (xYear <= sliderYear) ? "" : "hidden"
        )
        .attr("text-anchor", xPos < lineChartWidth1 / 2 ? "start" : "end")
        .style("fill", continentScale("Africa"))
        .style("font-weight", "bold")
        .style("font-family", "Arial")
        .style("font-size", "12px");
    }
  });

  // GDP per Cap line chart mousemove
  gdpActiveRegion.on("mousemove", function (evt) {
    let location = d3.pointer(evt);
    let x = location[0];
    let xYear = GDPYearScale.invert(x);
    let index = findYear(dataByYear, xYear);
    let d = dataByYear[index];

    continentsNotNA.forEach((c) => {
      let xPos = GDPYearScale(d["Year"]);
      let yPos = GDPperCapScale(d[c + " GDP"]);

      d3.select("#" + c.replace(/ /g, "_") + "GDPMarker")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("visibility", xYear <= sliderYear ? "" : "hidden");

      let txt = c + " : " + d[c + " GDP"].toFixed(2);

      d3.select("#" + c.replace(/ /g, "_") + "GDPLabel")
        .text(txt)
        .attr("x", xPos < lineChartWidth2 / 2 ? xPos + 10 : xPos - 10)
        .attr("y", 20 + gdpPosMap[c] * 25)
        .attr("visibility", xYear <= sliderYear ? "" : "hidden")
        .attr("text-anchor", xPos < lineChartWidth2 / 2 ? "start" : "end")
        .style("fill", continentScale(c))
        .style("font-weight", "bold")
        .style("font-family", "Arial")
        .style("font-size", "12px");
    });

    // Special case for Africa
    if (sliderYear < 2001) {
      d3.select("#AfricaGDPMarker").attr("visibility", "hidden");
      d3.select("#AfricaGDPLabel").attr("visibility", "hidden");
    } else {
      let xPos = GDPYearScale(d["Year"]);
      let yPos = GDPperCapScale(d["Africa GDP"]);

      d3.select("#AfricaGDPMarker")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr(
          "visibility",
          (xYear >= 2001) & (xYear <= sliderYear) ? "" : "hidden"
        );

      let txt = "Africa : " + d["Africa GDP"].toFixed(2);

      d3.select("#AfricaGDPLabel")
        .text(txt)
        .attr("x", xPos < lineChartWidth2 / 2 ? xPos + 10 : xPos - 10)
        .attr("y", 20 + gdpPosMap["Africa"] * 25)
        .attr(
          "visibility",
          (xYear >= 2001) & (xYear <= sliderYear) ? "" : "hidden"
        )
        .attr("text-anchor", xPos < lineChartWidth2 / 2 ? "start" : "end")
        .style("fill", continentScale("Africa"))
        .style("font-weight", "bold")
        .style("font-family", "Arial")
        .style("font-size", "12px");
    }
  });

  // Default slider year
  var sliderYear = 1980;

  // Scale for year slider
  const sliderYearScale = d3
    .scaleLinear()
    .domain([1950, 2017])
    .range([40, 760]);

  // Helper function for Loading data for each slider year
  function loadYear(year) {
    let currentYear = year;

    // Update year bubble and track position
    year_bubble
      .selectAll("text")
      .join("text")
      .text(currentYear)
      .attr("x", (d) => sliderYearScale(currentYear))
      .attr("y", 20)
      .style("font-family", "Arial")
      .style("font-weight", "bold")
      .style("text-anchor", "middle");

    // filter data for the slider year
    let yearData = dataByYear.filter(
      (dataByYear) => dataByYear["Year"] == currentYear
    );
    let data = yearData[0].Values;

    // working hour scale for the slider year
    const hourExtent = d3.extent(data, (d) => d["Working_Hours"]);
    const hourScale = d3
      .scaleLinear()
      .domain(hourExtent)
      .range([0, chartWidth2]);

    // GDP per Cap scale for the slider year
    const gdpExtent = d3.extent(data, (d) => d["GDP"]);
    const gdpScale = d3
      .scaleLinear()
      .domain(gdpExtent)
      .range([chartHeight2, 0]);

    // Population scale for the slider year
    const populationExtent = d3.extent(working_hour, (d) =>
      Math.sqrt(d["Population"])
    );
    const populationScale = d3
      .scaleLinear()
      .domain(populationExtent)
      .range([3, 22]);

    // Call y axis and gridlines for the slider year
    yAxis.scale(gdpScale);
    yAxisG.transition().call(yAxis);

    yGridlines.scale(gdpScale);
    yGridlinesG.transition().call(yGridlines);

    // Call x axis and gridlines for the slider year
    xAxis.scale(hourScale);
    xAxisG.transition().call(xAxis);

    xGridlines.scale(hourScale);
    xGridlinesG.transition().call(xGridlines);

    // Append circle markers for the slider year
    let circles = chartArea
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("id", (d) => d["Code"])
      .attr("class", "country-circle")
      .attr("cx", (d) => hourScale(d["Working_Hours"]))
      .attr("cy", (d) => gdpScale(d["GDP"]))
      .attr("r", (d) => populationScale(Math.sqrt(d["Population"])))
      .attr("continent", (d) => d["Continent"])
      .style("fill", (d) => continentScale(d["Continent"]))
      .style("stroke", "black")
      .style("stroke-width", 0.6)
      .attr("opacity", 0.6)
      .attr("visibility", (d) =>
        country_visibility[d["Code"]] ? "" : "hidden"
      );

    // Append country name labels for the slider year
    chartArea
      .selectAll("text")
      .data(data)
      .join("text")
      .text((d) => d["Entity"])
      .attr("id", (d) => d["Code"])
      .attr("class", "country-text")
      .attr("x", (d) =>
        hourScale(d["Working_Hours"]) < 600
          ? hourScale(d["Working_Hours"]) +
            0.75 * populationScale(Math.sqrt(d["Population"]))
          : hourScale(d["Working_Hours"]) -
            0.75 * populationScale(Math.sqrt(d["Population"]))
      )
      .attr(
        "y",
        (d) =>
          gdpScale(d["GDP"]) -
          0.75 * populationScale(Math.sqrt(d["Population"]))
      )
      .attr("continent", (d) => d["Continent"])
      .style("fill", (d) => continentScale(d["Continent"]))
      .style("font-family", "Arial")
      .style("font-size", "12px")
      .style("text-anchor", (d) =>
        hourScale(d["Working_Hours"]) < 600 ? "start" : "end"
      )
      .attr("visibility", (d) =>
        d["Text_Visibility"] && country_visibility[d["Code"]] ? "" : "hidden"
      );

    // Mouseover circles
    circles.on("mouseover", function () {
      let countryId = d3.select(this).attr("id");

      // blur out other circles
      d3.selectAll(".country-circle").attr("opacity", 0.1);

      // expand this circle
      d3.select(this)
        .attr("opacity", 0.6)
        .attr("r", (d) => populationScale(Math.sqrt(d["Population"])) + 5);

      // hid label of other circles
      d3.selectAll(".country-text").attr("visibility", "hidden");

      // expand label of this circle
      d3.select("text#" + countryId)
        .attr(
          "x",
          (d) =>
            hourScale(d["Working_Hours"]) +
            0.75 * populationScale(Math.sqrt(d["Population"])) +
            5
        )
        .attr(
          "y",
          (d) =>
            gdpScale(d["GDP"]) -
            0.75 * populationScale(Math.sqrt(d["Population"])) -
            5
        )
        .style("font-size", "14px")
        .attr("visibility", "");

      // show country facts on the table below the legend
      let countryFact = d3.select(this).datum()["Entity"];
      let yearFact = d3.select(this).datum()["Year"];
      let Continent = d3.select(this).datum()["Continent"];
      let WorkingHourFact = d3.select(this).datum()["Working_Hours"].toFixed(2);
      let GDPFact = d3.select(this).datum()["GDP"].toFixed(2);
      let PopulationFact = d3.select(this).datum()["Population"].toFixed(2);

      d3.select("#countryLabel")
        .text(countryFact)
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "15px");

      d3.select("#yearLabel")
        .text(yearFact)
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "15px");

      d3.select("#continentLabel")
        .text("Continent: ")
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "13px");

      d3.select("#continentFact")
        .text(Continent)
        .style("font-family", "Arial")
        .style("font-size", "12px");

      d3.select("#workingHourLabel")
        .text("Working Hours: ")
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "13px");

      d3.select("#workingHourFact")
        .text(WorkingHourFact)
        .style("font-family", "Arial")
        .style("font-size", "13px");

      d3.select("#GDPLabel")
        .text("GDP per Capita: ")
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "13px");

      d3.select("#GDPFact")
        .text(GDPFact)
        .style("font-family", "Arial")
        .style("font-size", "13px");

      d3.select("#PopulationLabel")
        .text("Population: ")
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "13px");

      d3.select("#PopulationFact")
        .text(PopulationFact)
        .style("font-family", "Arial")
        .style("font-size", "13px");
    });

    // mouseout circle
    circles.on("mouseout", function () {
      // recover opacity of all circles
      d3.selectAll(".country-circle").attr("opacity", 0.6);

      // recover radius of this circle
      d3.select(this).attr("r", (d) =>
        populationScale(Math.sqrt(d["Population"]))
      );

      let countryId = d3.select(this).attr("id");
      let defaultVisibility = d3.select(this).datum()["Text_Visibility"];

      // recover text position
      d3.select("text#" + countryId)
        .attr(
          "x",
          (d) =>
            hourScale(d["Working_Hours"]) +
            0.75 * populationScale(Math.sqrt(d["Population"]))
        )
        .attr(
          "y",
          (d) =>
            gdpScale(d["GDP"]) -
            0.75 * populationScale(Math.sqrt(d["Population"]))
        )
        .style("font-size", "12px");

      // recover default text visibility
      d3.selectAll(".country-text").each(function () {
        let target = d3.select(this);
        let visibility = target.datum()["Text_Visibility"];
        let id = target.attr("id");
        target.attr(
          "visibility",
          visibility && country_visibility[id] ? "" : "hidden"
        );
      });

      // hide country fact on the right side
      d3.select("#countryLabel").text("");

      d3.select("#yearLabel").text("");

      d3.select("#continentLabel").text("");

      d3.select("#continentFact").text("");

      d3.select("#workingHourLabel").text("");

      d3.select("#workingHourFact").text("");

      d3.select("#GDPLabel").text("");

      d3.select("#GDPFact").text("");

      d3.select("#PopulationLabel").text("");

      d3.select("#PopulationFact").text("");
    });

    // only present working hour lines up to the current slider year
    d3.selectAll(".working-hours-line").each(function () {
      let target = d3.select(this);
      let year = target.attr("year");

      target.attr("visibility", (d) => (year < currentYear ? "" : "hidden"));
    });

    // only present gdp per cap lines up to the current slider year
    d3.selectAll(".gdp-line").each(function () {
      let target = d3.select(this);
      let year = target.attr("year");

      target.attr("visibility", (d) => (year < currentYear ? "" : "hidden"));
    });

    sliderYear = currentYear;
  }

  // set all continents to be selected by default
  var all_selected = true;

  // helper function check and updating the status of whether all circles are selected
  // recover the status to all selected when none of the continents are selected
  function updateAllSelected() {
    // check the number of continents selected
    let numSelected = 0;
    d3.selectAll(".legend-circle").each(function () {
      let selected = d3.select(this).attr("selected");
      if (selected === "true") {
        numSelected += 1;
      }
    });

    // update the status of all selected
    all_selected = numSelected === 6 || numSelected === 0;

    // recover the status to all selected if none of the continents are selected
    if (numSelected === 0) {
      d3.selectAll(".legend-svg").each(function () {
        let target = d3.select(this);
        target.attr("selected", true);
      });

      d3.selectAll(".legend-circle").each(function () {
        let target = d3.select(this);
        let continent = d3.select(this).attr("continent");

        target.attr("selected", true);
        target.style("fill", continentScale(continent));
      });

      d3.selectAll(".legend-text").each(function () {
        let target = d3.select(this);
        let continent = d3.select(this).attr("continent");

        target.attr("selected", true);
        target.style("fill", continentScale(continent));
      });

      d3.selectAll(".country-circle").each(function () {
        let target = d3.select(this);
        target.attr("visibility", "");
      });

      // recover the visibility of countries
      for (const [code, value] of Object.entries(country_visibility)) {
        country_visibility[code] = true;
      }
    }
  }

  // make the legend on the right
  continents.forEach((d, i) => {
    // append an svg for each continent
    let legendSVG = legend
      .append("svg")
      .attr("class", "legend-svg")
      .attr("height", 25)
      .attr("width", 120)
      .attr("continent", d)
      .attr("selected", true)
      .attr("continent", d);

    // append circle marker for each svg
    legendSVG
      .append("circle")
      .attr("class", "legend-circle")
      .attr("continent", d)
      .attr("selected", true)
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 6)
      .style("fill", continentScale(d))
      .style("stroke", "black")
      .style("stroke-width", 0.6)
      .attr("opacity", 0.6);

    // append text marker for each svg
    legendSVG
      .append("text")
      .text(d)
      .attr("class", "legend-text")
      .attr("continent", d)
      .attr("selected", true)
      .attr("x", 25)
      .attr("y", 10)
      .style("fill", continentScale(d))
      .style("alignment-baseline", "middle")
      .style("font-weight", "bold")
      .style("font-family", "Arial")
      .style("font-size", "13px");

    // mouseover a continent
    legendSVG
      .on("mouseover", function () {
        // case when all of the continents are selected
        if (all_selected) {
          // display only the circles matching the continent and blur the other continents
          d3.selectAll(".country-circle").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            let id = target.attr("id");

            if (continent === d) {
              target.attr("opacity", 0.6);
              target.attr("visibility", "");
            } else {
              target.attr("opacity", 0.1);
            }
          });

          // display all texts of the countries matching the continent and hide the other continents
          d3.selectAll(".country-text").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            let id = target.attr("id");

            if (continent === d) {
              target.attr("visibility", "");
            } else {
              target.attr("visibility", "hidden");
            }
          });
          // case when only a few continents are selected
        } else {
          // don't blur out the selected continents
          d3.selectAll(".country-circle").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            let id = target.attr("id");

            if (continent === d) {
              target.attr("opacity", 0.6);
              target.attr("visibility", "");
            }
          });

          // don't hide the selected continents
          d3.selectAll(".country-text").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            let id = target.attr("id");

            if (continent === d) {
              target.attr("visibility", "");
            }
          });
        }
      })

      // mouseout a continent
      .on("mouseout", function () {
        // recover opacity of selected countries
        d3.selectAll(".country-circle").each(function () {
          let target = d3.select(this);
          let id = target.attr("id");

          if (country_visibility[id] === false) {
            target.attr("visibility", "hidden");
          } else {
            target.attr("opacity", 0.6);
          }
        });

        // recover visibility of text of selected countries
        d3.selectAll(".country-text").each(function () {
          let target = d3.select(this);
          let visibility = target.datum()["Text_Visibility"];
          let id = target.attr("id");
          target
            .attr("opacity", 1)
            .attr(
              "visibility",
              visibility && country_visibility[id] ? "" : "hidden"
            );
        });
      })

      // when clicking a continent
      .on("click", function () {
        // case when all continents are selected
        if (all_selected) {
          // set svg of selected continent to true, all others to false
          d3.selectAll(".legend-svg").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            if (continent === d) {
              target.attr("selected", true);
            } else {
              target.attr("selected", false);
            }
          });

          // set circle of selected continent to true, all others to false
          // grey out the other circles
          d3.selectAll(".legend-circle").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            if (continent === d) {
              target.attr("selected", true);
            } else {
              target.attr("selected", false);
              target.style("fill", "grey");
            }
          });

          // set text of selected continent to true, all others to false
          // grey out the other texts
          d3.selectAll(".legend-text").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            if (continent === d) {
              target.attr("selected", true);
            } else {
              target.attr("selected", false);
              target.style("fill", "grey");
            }
          });

          // only keep the circles of the selected continent visible
          d3.selectAll(".country-circle").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            if (continent !== d) {
              target.attr("visibility", "hidden");
            }
          });

          // update consistent visibility for circles in other years
          country_to_continent.forEach((entry, i) => {
            let continent = entry["Continent"];
            let code = entry["Code"];
            if (continent === d) {
              country_visibility[code] = true;
            } else {
              country_visibility[code] = false;
            }
          });

          updateAllSelected();

          // case when only a number of continents are selected
        } else {
          let target = d3.select(this);
          let selected = target.attr("selected") === "true";

          // if clicking a new continent to select it
          if (!selected) {
            // update the selected status of the svg to be true
            d3.selectAll(".legend-svg").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", true);
              }
            });

            // recover the color of the circle on the legend
            d3.selectAll(".legend-circle").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", true);
                target.style("fill", continentScale(continent));
              }
            });

            // recover the color of the text on the legend
            d3.selectAll(".legend-text").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", true);
                target.style("fill", continentScale(continent));
              }
            });

            // recover the color of the circles
            d3.selectAll(".country-circle").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");

              if (continent === d) {
                target.attr("visibility", "");
              }
            });

            // update consistent visibility for circles in other years
            country_to_continent.forEach((entry, i) => {
              let continent = entry["Continent"];
              let code = entry["Code"];
              if (continent === d) {
                country_visibility[code] = true;
              }
            });

            updateAllSelected();
            // if clicking to unselect a continents
          } else {
            // update the selected status of the svg to be false
            d3.selectAll(".legend-svg").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", false);
              }
            });

            // grey out the circle on the legend
            d3.selectAll(".legend-circle").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", false);
                target.style("fill", "grey");
              }
            });

            // grey out the text on the legend
            d3.selectAll(".legend-text").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", false);
                target.style("fill", "grey");
              }
            });

            // blur out the circles
            d3.selectAll(".country-circle").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");

              if (continent === d) {
                target.attr("visibility", "hidden");
              }
            });

            // update consistent visibility for circles in other years
            country_to_continent.forEach((entry, i) => {
              let continent = entry["Continent"];
              let code = entry["Code"];
              if (continent === d) {
                country_visibility[code] = false;
              }
            });

            updateAllSelected();
          }
        }
      });
  });

  // Send values from the slider to the helper function
  d3.select("input#slider").on("input", function () {
    loadYear(this.value);
  });

  // Display the default year 1980 when view first load the page
  loadYear(1980);
};

loadData();

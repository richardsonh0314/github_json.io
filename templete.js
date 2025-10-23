// Load the data
const socialMedia = d3.csv("socialMedia.csv");
// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });
    
    // ============== FIRST CHART: BOX PLOT ==============
    // Define the dimensions and margins for the SVG
    const margin1 = {top: 50, right: 50, bottom: 70, left: 70};
    const width1 = 600 - margin1.left - margin1.right;
    const height1 = 400 - margin1.top - margin1.bottom;
    
    // Create the SVG container
    const svg1 = d3.select("#boxplot")
        .append("svg")
        .attr("width", width1 + margin1.left + margin1.right)
        .attr("height", height1 + margin1.top + margin1.bottom)
        .append("g")
        .attr("transform", `translate(${margin1.left},${margin1.top})`);
    
    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all three age groups or use
    // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.AgeGroup))])
        .range([0, width1])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([height1, 0]);
    
    // Add scales     
    svg1.append("g")
        .attr("transform", `translate(0,${height1})`)
        .call(d3.axisBottom(xScale));
    
    svg1.append("g")
        .call(d3.axisLeft(yScale));
    
    // Add x-axis label
    svg1.append("text")
        .attr("transform", `translate(${width1/2},${height1 + margin1.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Age Group");
    
    // Add y-axis label
    svg1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin1.left + 15)
        .attr("x", 0 - (height1 / 2))
        .style("text-anchor", "middle")
        .text("Number of Likes");
    
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return {min, q1, median, q3, max};
    };
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);
    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();
        // Draw vertical lines
        svg1.append("line")
            .attr("x1", x + boxWidth/2)
            .attr("y1", yScale(quantiles.min))
            .attr("x2", x + boxWidth/2)
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");
        
        // Draw box
        svg1.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("fill", "lightblue")
            .attr("stroke", "black");
        
        // Draw median line
        svg1.append("line")
            .attr("x1", x)
            .attr("y1", yScale(quantiles.median))
            .attr("x2", x + boxWidth)
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });
});
// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMedia.csv");
socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });
    
    // Calculate average likes per age group since we only have one CSV
    const avgByGroup = d3.rollup(
        data,
        v => d3.mean(v, d => d.Likes),
        d => d.AgeGroup
    );
    
    // Convert to array format similar to what would come from socialMediaAvg.csv
    const avgData = Array.from(avgByGroup, ([key, value]) => ({
        Platform: key,  // Using AgeGroup as Platform for visualization
        PostType: "Average",
        AvgLikes: value
    }));
    
    // Define the dimensions and margins for the SVG
    const margin = {top: 50, right: 150, bottom: 70, left: 70};
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create the SVG container
    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type
    const x0 = d3.scaleBand()
        .domain(avgData.map(d => d.Platform))
        .range([0, width])
        .padding(0.1);
      
    const x1 = d3.scaleBand()
        .domain(["Average"])
        .range([0, x0.bandwidth()])
        .padding(0.05);
      
    const y = d3.scaleLinear()
        .domain([0, d3.max(avgData, d => d.AvgLikes)])
        .range([height, 0]);
      
    const color = d3.scaleOrdinal()
        .domain([...new Set(avgData.map(d => d.Platform))])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y     
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));
    
    svg.append("g")
        .call(d3.axisLeft(y));
    
    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${width/2},${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Age Group");
    
    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height / 2))
        .style("text-anchor", "middle")
        .text("Average Number of Likes");
    
  // Group container for bars
    const barGroups = svg.selectAll("bar")
      .data(avgData)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);
  // Draw bars
    barGroups.append("rect")
        .attr("x", x1.bandwidth() * 0.1)
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth() * 0.8)
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.Platform));
      
    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, ${margin.top})`);
    const types = [...new Set(avgData.map(d => d.Platform))];
 
    types.forEach((type, i) => {
    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", color(type));
          
      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
  });
});
// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 
const socialMediaTime = d3.csv("socialMedia.csv");
socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });
    
    // Since we don't have date data, create a percentile distribution instead
    // Sort data and create percentile points
    const sortedData = data.sort((a, b) => a.Likes - b.Likes);
    const percentileData = [];
    const percentiles = ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];
    
    percentiles.forEach((p, i) => {
        const index = Math.floor((i / 10) * (sortedData.length - 1));
        percentileData.push({
            Date: p,
            AvgLikes: sortedData[Math.min(index, sortedData.length - 1)].Likes
        });
    });
    
    // Define the dimensions and margins for the SVG
    const margin = {top: 50, right: 50, bottom: 70, left: 70};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create the SVG container
    const svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales for x and y axes  
    const xScale = d3.scaleBand()
        .domain(percentileData.map(d => d.Date))
        .range([0, width])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(percentileData, d => d.AvgLikes)])
        .range([height, 0]);
    
    // Draw the axis, you can rotate the text in the x-axis here
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
    
    svg.append("g")
        .call(d3.axisLeft(yScale));
    
    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${width/2},${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Percentile");
    
    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height / 2))
        .style("text-anchor", "middle")
        .text("Number of Likes");
    
    // Draw the line and path. Remember to use curveNatural. 
    const line = d3.line()
        .x(d => xScale(d.Date) + xScale.bandwidth()/2)
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural);
    
    svg.append("path")
        .datum(percentileData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);
    
    // Add dots for each data point
    svg.selectAll(".dot")
        .data(percentileData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.Date) + xScale.bandwidth()/2)
        .attr("cy", d => yScale(d.AvgLikes))
        .attr("r", 4)
        .attr("fill", "steelblue");
});

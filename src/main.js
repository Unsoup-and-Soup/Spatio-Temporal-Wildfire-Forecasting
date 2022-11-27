const width = 900;
const height = 500;

var svg = d3.select("body")
  .append("svg")
  .attr("id", "main")
  .attr("width", width)
  .attr("height", height);

var projection = d3.geoMercator();
var path = d3.geoPath().projection(projection);
var allGrids;

// load the grid data
Promise.all([d3.json("../data/California_Gridded.geojson")])
    .then(function(data) {
        ready(data[0]);
    });

function ready(data) {
    // adjust the projection to the features
    projection.fitSize([width, height], data); 

    // draw the features
    allGrids = svg.selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "grid")

      // on hovering over an area, highlight it
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);
}

function mouseover() {
    svg.selectAll("path").style("opacity", "0.5");
    d3.select(this).style("opacity", "1.0");
}

function mouseout() {
    svg.selectAll("path").style("opacity", "1.0");
}
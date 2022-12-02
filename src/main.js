const width = 900;
const height = 500;

var svg = d3.select("body")
  .append("svg")
  .attr("id", "main")
  .attr("width", width)
  .attr("height", height);

var projection = d3.geoMercator();
var path = d3.geoPath().projection(projection);

// flag for if a square is clicked
var squareClicked = false;

// stores the ID of the selected square
var squareID = 0;

// load the grid data
Promise.all([d3.json("../data/California_Gridded.geojson")])
    .then(function(data) {
        ready(data[0]);
    });

function ready(data) {
    // adjust the projection to the features
    projection.fitSize([width, height], data); 

    // draw the features
    svg.selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "grid")

      // on hovering over an area, highlight it
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)

      // upon clicking a square, that square is frozen until it is re-clicked
      .on("click", click);
}

function mouseover() {
    if (squareClicked === false) {
        svg.selectAll("path").style("opacity", 0.5);
        d3.select(this).style("opacity", 1.0);
    }
}

function mouseout() {
    if (squareClicked === false) {
        svg.selectAll("path").style("opacity", 1.0);
    }
}

function click(d) {
    if (squareClicked === false) {
        squareClicked = true;
        squareID = d.properties.id;
        svg.selectAll("path").style("opacity", 0.1);
        d3.select(this).style("opacity", 1.0);

        // zoom into clicked square and display to the right of the map
    } else {
        // reclick the square to unfreeze and select another square
        if (squareID === d.properties.id) {
            squareClicked = false;
            svg.selectAll("path").style("opacity", 1.0);
        }
    }
}
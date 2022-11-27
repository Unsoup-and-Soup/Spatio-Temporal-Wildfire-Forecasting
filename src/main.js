const width = 900;
const height = 500;

var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var projection = d3.geoMercator();
var path = d3.geoPath().projection(projection);

// load the grid data
Promise.all([d3.json("../data/California_Gridded.geojson")])
    .then(function(data) {
        ready(data[0]);
    })

function ready(error, data) {
    if (error) console.log(error);
    console.log(data);
    // adjust the projection to the features
    projection.fitSize([width,height], data); 

    // draw the features
    svg.append("path").attr("d", path(data));

}
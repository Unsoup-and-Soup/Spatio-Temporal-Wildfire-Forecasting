const mapWidth = 500;
const mapHeight = 500;
const gridWidth = 450;
const gridHeight = 450;
const cellWidth = 20;
const cellHeight = 20;
var selectAll = false;
var count = 0

// initialize svg
var svg = d3.select("body")
  .append("svg")
  .attr("id", "main")
  .attr("width", mapWidth)
  .attr("height", mapHeight);
var projection = d3.geoMercator();
var path = d3.geoPath().projection(projection);

// flag for if a square is clicked
var squareClicked = false;

// stores the ID of the selected square
var squareID = 0;

// store the selected square
var selectedSquare;

// load the map data
Promise.all([d3.json("../data/California_Gridded.geojson")])
    .then(function(data) {
        ready(data[0]);
    });

function ready(data) {
    // adjust the projection to the features
    projection.fitSize([mapWidth, mapHeight], data); 

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
    if (!squareClicked) {
        svg.selectAll("path").style("opacity", 0.5);
        d3.select(this).style("opacity", 1.0);
    }
}

function mouseout() {
    if (!squareClicked) {
        svg.selectAll("path").style("opacity", 1.0);
    }
}

function click(d) {
    if (!squareClicked) {
        squareClicked = true;
        squareID = d.properties.id;
        svg.selectAll("path").style("opacity", 0.1);
        d3.select(this).style("opacity", 1.0);

        // add a display window to the right of the map
        displayGrid(d);
    } else {
        // reclick the square to unfreeze and select another square
        if (squareID === d.properties.id) {
            squareClicked = false;
            svg.selectAll("path").style("opacity", 1.0);

            // remove the display window after unfreezing the grid square
            d3.select("#displayWindow").remove();
        }
    }
}

function displayGrid(squareData) {
    selectedSquare = squareData; // in case we need the location data
    var gridData = new Array();
    var cellX = 1;
    var cellY = 1;
    var outputData = new Array();
    var submitted = false
    
    // initialize each cell with its attributes
    for (var row = 0; row < 20; row++) {
        gridData.push(new Array());
        for (var col = 0; col < 20; col++) {
            gridData[row].push({
                x: cellX,
                y: cellY,
                cellWidth: cellWidth,
                cellHeight: cellHeight,
                selected: false
            })
            cellX += cellWidth;
        }
        cellX = 1;
        cellY += cellHeight; 
    }
    console.log(gridData)
    // draw the 20x20 grid
    var grid = d3.select("body")
        .append("svg")
        .attr("id", "displayWindow")
        .attr("width", gridWidth)
        .attr("height", gridHeight+100);
    var rows = grid.selectAll(".row")
        .data(gridData)
        .enter()
        .append("g")
        .attr("class", "row");
    rows.selectAll(".cell")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.cellWidth; })
        .attr("height", function(d) { return d.cellHeight; })
        // .style("fill", function(d) {if(submitted == true) {d.fill = "red"}})
        .on('click', onClickCell)
        .on('mouseover', onMouseOver);
    
    var rect = grid.append("rect")
        // .enter()
        // .data(gridData)
        // .enter()
        .attr("class", "submit")
        .attr("type", "button")
        // .attr("width", 100)
        // .attr("height", 30)
        .attr("x", 0)
        .attr("y", gridHeight-20)
        .on("click", function(d) {
            // console.log(gridData)
            for (var i=0; i<20; i++) {
                outputData.push(new Array());
                for (var j=0; j<20; j++) {
                    var temp = gridData[i][j]["selected"]
                    outputData[i].push(temp)
                    // console.log(temp)
                }
            }
            // console.log(outputData);
            // SEND IT OFF TO BALARAM
            // OUTPUT FROM BALARAM AS A 20x20 GRID
            // Below is a pseudo-output
            var output = new Array();
            for (var i=0; i<20; i++) { 
                output.push(new Array());
                for (var j=0; j<20; j++) {
                    random = Math.random()
                    if (random >= 0.5) {
                        selected = true
                    } else {
                        selected = false
                    }
                    output[i].push(selected)
                }
            }

            // Update gridData with the output true/false values
            for (var i=0; i<20; i++) {
                for (var j=0; j<20; j++) {
                    gridData[i][j]["selected"] = output[i][j]
                    if (output[i][j]) {
                        d3.selectAll(".cell").style("fill", function (d){if(d.selected == true){return "red"}})
                    } else {
                        // d3.select(this).style("fill", "transparent")
                    }
                }
            }
        })

        var txt = grid.append("text")
            .attr("class", "txt")
            .text("Submit")
            .attr("y", gridHeight-6)
            .attr("x", 31)
            .on("click", function(d) {
                // console.log(gridData)
                for (var i=0; i<20; i++) {
                    outputData.push(new Array());
                    for (var j=0; j<20; j++) {
                        var temp = gridData[i][j]["selected"]
                        outputData[i].push(temp)
                        // console.log(temp)
                    }
                }
                // console.log(outputData);
                // SEND IT OFF TO BALARAM
                // OUTPUT FROM BALARAM AS A 20x20 GRID
                // Below is a pseudo-output
                var output = new Array();
                for (var i=0; i<20; i++) { 
                    output.push(new Array());
                    for (var j=0; j<20; j++) {
                        random = Math.random()
                        if (random >= 0.5) {
                            selected = true
                        } else {
                            selected = false
                        }
                        output[i].push(selected)
                    }
                }

                // Update gridData with the output true/false values
                for (var i=0; i<20; i++) {
                    for (var j=0; j<20; j++) {
                        gridData[i][j]["selected"] = output[i][j]
                        if (output[i][j]) {
                            d3.selectAll(".cell").style("fill", function (d){if(d.selected == true){return "red"}})
                        } else {
                            // d3.select(this).style("fill", "transparent")
                        }
                    }
                }
            })

        var rect = grid.append("rect")
            .attr("class", "reset")
            .attr("type", "button")
            .attr("x", 120)
            .attr("y", gridHeight-20)
            .on("click", function(d) {
                for (var i=0; i<20; i++) {
                    for (var j=0; j<20; j++) {
                        gridData[i][j]["selected"] = false
                        d3.selectAll(".cell").style("fill", "transparent")
                    }
                }
            })

        var txt = grid.append("text")
            .attr("class", "txt")
            .text("Reset")
            .attr("y", gridHeight-6)
            .attr("x", 155)
            .on("click", function(d) {
                for (var i=0; i<20; i++) {
                    for (var j=0; j<20; j++) {
                        gridData[i][j]["selected"] = false
                        d3.selectAll(".cell").style("fill", "transparent")
                    }
                }
            })
}

// function onClickCell(d) {
//     // turns cell red if clicked, and transparent if clicked again
//     if (d.selected) {
//         d3.select(this).style("fill", "transparent");
//         d.selected = false;
//     } else {
//         d3.select(this).style("fill", "red");
//         d.selected = true;
//     }
// }
function onClickCell(d) {
    count++;

    if (selectAll == true) {
        selectAll = false
    } else {
        selectAll = true
    }

    // turns cell red if clicked, and transparent if clicked again
    if (d.selected) {
        // d3.select(this).style("fill", "transparent");
        // d.selected = false;
    } else {
        d3.select(this).style("fill", "#DFF1CD");
        d.selected = true;
    }
}

function onMouseOver(d) {
    if (selectAll == true && d.selected == false) {
        d3.select(this).style("fill", "#DFF1CD")
        d.selected = true
    }
    //  else if (selectAll == true && d.selected == true) {
    //     d3.select(this).style("fill", "transparent")
    //     d.selected = false
    // }
}

// function buttonClick(d) {
//     console.log(d.gridData);
// }
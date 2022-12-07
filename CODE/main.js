const mapWidth = 500;
const mapHeight = 500;
const gridWidth = 400;
const gridHeight = 500;
const numCells = 40;
const cellWidth = (gridWidth - 50) / numCells;
const cellHeight = (gridHeight - 150) / numCells;
var selectAll = false;
var firstRun = true;
var count = 0

// initialize svg
var svg = d3.select("#map")
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
Promise.all([d3.json("./data/california_tiger/California_Gridded_40x40.geojson")])
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

// when mouse is over the california map
function mouseover() {
    if (!squareClicked) {
        svg.selectAll("path").style("opacity", 0.2);
        d3.select(this).style("opacity", 1.0);
    }
}

// when mouse leaves the california map
function mouseout() {
    if (!squareClicked) {
        svg.selectAll("path").style("opacity", 1.0);
    }
}

// when mouse clicks on square on california map
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

// deployment of machine learning algorithm
async function predictFire(gridData) {
    input = gridData.map(row => row.map(d => d.selected ? 1 : 0))

    tensor_input = tf.tensor([input, input, input]).reshape([1, 3, numCells, numCells])

    model = await tf.loadLayersModel('./data/model/model.json')

    predict = model.predict(tensor_input)
    predict = predict.dataSync()
    predict = Array.from(predict).map(d => +d)

    day0 = gridData.map(row => row.map(d => d.selected))

    day2 = []
    while(predict.length > (numCells ** 2) * 2) day2.push(predict.splice(0, numCells))

    day4 = []
    while(predict.length > numCells ** 2) day4.push(predict.splice(0, numCells))

    day6 = []
    while(predict.length > 0) day6.push(predict.splice(0, numCells))
    

    output = []
    for (i = 0; i < numCells; i++) {
        row = []
        for (j = 0; j < numCells; j++) {
            row.push({
                day0: day0[i][j],
                day2: day2[i][j] > 0.5,
                day4: day4[i][j] > 0.5,
                day6:  day6[i][j] > 0.5
            })
        }
        output.push(row)
    }

    return output
}


// renders prediction data to the output grid
function renderPredictedFires(gridData) {
    predictFire(gridData)
        .then((output) => {
            // Update gridData with the output true/false values
            for (var i=0; i<numCells; i++) {
                for (var j=0; j<numCells; j++) {
                    if (output[i][j]["day0"]) {
                        // Dark Red
                        gridData[i][j]["selected"] = output[i][j]["day0"]
                    } else if (output[i][j]["day2"]) {
                        // Red
                        gridData[i][j]["day2"] = output[i][j]["day2"]
                    } else if (output[i][j]["day4"]) {
                        // Salmon Color
                        gridData[i][j]["day4"] = output[i][j]["day4"]
                    } else if (output[i][j]["day6"]) {
                        // Light pink
                        gridData[i][j]["day6"] = output[i][j]["day6"]
                    } else {
                        gridData[i][j]["selected"] = false
                        gridData[i][j]["day2"] = false
                        gridData[i][j]["day4"] = false
                        gridData[i][j]["day6"] = false
                    }
                }
            }
            
            d3.selectAll(".cell").style("fill", function (d){
                if(d.selected == true) {
                    return "#a50f15"
                } else if (d.day2 == true) {
                    return "#de2d26"
                } else if (d.day4 == true) {
                    return "#fb6a4a"
                } else if (d.day6 == true) {
                    return "#fcae91"
                } else {
                    return "transparent"
                }
            });
        })

    firstRun = false
}

// displays the fire perimeter zoomed grid for predicting fires
function displayGrid(squareData) {
    selectedSquare = squareData
    var gridData = new Array();
    var cellX = 1;
    var cellY = 1;
    var outputData = new Array();
    var submitted = false
    
    // initialize each cell with its attributes
    for (var row = 0; row < numCells; row++) {
        gridData.push(new Array());
        for (var col = 0; col < numCells; col++) {
            gridData[row].push({
                x: cellX,
                y: cellY,
                cellWidth: cellWidth,
                cellHeight: cellHeight,
                selected: false,
                day2: false,
                day4: false,
                day6: false
            })
            cellX += cellWidth;
        }
        cellX = 1;
        cellY += cellHeight; 
    }

    // draw the 40x40 grid
    var grid = d3.select("#grid-map")
        .append("svg")
        .attr('class', 'displayWindow')
        .attr("id", "displayWindow")
        .attr("width", gridWidth)
        .attr("height", gridHeight+100)
        .on("mousedown", function() {
            // tracks all the mousemovements on the grid to provide drag drawing features

            var svg = d3.select(this)
                .classed("active", true);

            // updates perimeter to latest predicted perimeter (on redraw)
            if (!firstRun) {
                for (var i=0; i<numCells; i++) {
                    for (var j=0; j<numCells; j++) {
                        gridData[i][j]["selected"] = gridData[i][j]["selected"] || gridData[i][j]["day2"] || gridData[i][j]["day4"] || gridData[i][j]["day6"]
                    }
                }
                firstRun = true
            }

            [x, y] = d3.mouse(svg.node())
            rooti = Math.floor(x / cellWidth)
            rootj = Math.floor(y / cellHeight)

            if (rooti >= numCells || rootj >= numCells) {
                svg.classed("active", false);
                return
            }

            gridData[rootj][rooti].selected = !gridData[rootj][rooti].selected
          
            var w = d3.select(window)
                .on("mousemove", mousemove)
                .on("mouseup", mouseup);
          
            d3.event.preventDefault()
          
            // is the mouse move function for the drag (colors in neighboring cells)
            function mousemove() {
              [x, y] = d3.mouse(svg.node())
              i = Math.floor(x / cellWidth)
              j = Math.floor(y / cellHeight)
              k = 2
              for (ii = Math.max(i - k, 0); ii < Math.min(i + k, numCells); ii++) {
                for (jj = Math.max(j - k, 0); jj < Math.min(j + k, numCells); jj++) {
                    if (ii != rooti || jj != rootj) {
                        gridData[jj][ii].selected = gridData[rootj][rooti].selected
                    }
                }
              }

              cells.style('fill', d => { return d.selected ? '#a50f15' : 'transparent' })
            }
          
            function mouseup() {
              svg.classed("active", false);
              w.on("mousemove", null).on("mouseup", null);
            }
          })
          .on("touchstart", function() {
            // tracks all the mousemovements on the grid to provide drag drawing features

            var svg = d3.select(this)
                .classed("active", true);

            // updates perimeter to latest predicted perimeter (on redraw)
            if (!firstRun) {
                for (var i=0; i<numCells; i++) {
                    for (var j=0; j<numCells; j++) {
                        gridData[i][j]["selected"] = gridData[i][j]["selected"] || gridData[i][j]["day2"] || gridData[i][j]["day4"] || gridData[i][j]["day6"]
                    }
                }
                firstRun = true
            }

            [x, y] = d3.mouse(svg.node())
            rooti = Math.floor(x / cellWidth)
            rootj = Math.floor(y / cellHeight)

            if (rooti >= numCells || rootj >= numCells) {
                svg.classed("active", false);
                return
            }

            gridData[rootj][rooti].selected = !gridData[rootj][rooti].selected
          
            var w = d3.select(window)
                .on("touchmove", mousemove)
                .on("touchend", mouseup);
          
            d3.event.preventDefault()
          
            // is the mouse move function for the drag (colors in neighboring cells)
            function mousemove() {
              [x, y] = d3.mouse(svg.node())
              i = Math.floor(x / cellWidth)
              j = Math.floor(y / cellHeight)
              k = 2
              for (ii = Math.max(i - k, 0); ii < Math.min(i + k, numCells); ii++) {
                for (jj = Math.max(j - k, 0); jj < Math.min(j + k, numCells); jj++) {
                    if (ii != rooti || jj != rootj) {
                        gridData[jj][ii].selected = gridData[rootj][rooti].selected
                    }
                }
              }

              cells.style('fill', d => { return d.selected ? '#a50f15' : 'transparent' })
            }
          
            function mouseup() {
              svg.classed("active", false);
              w.on("mousemove", null).on("mouseup", null);
            }
          })

    // rendering of the grid cells
    var rows = grid.selectAll(".row")
        .data(gridData)
        .enter()
        .append("g")
        .attr("class", "row");
    cells = rows.selectAll(".cell")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.cellWidth; })
        .attr("height", function(d) { return d.cellHeight; })
    
    // the submit button adn text
    grid.append("rect")
        .attr("class", "submit")
        .attr("x", 5)
        .attr("y", gridHeight-120)
        .attr("width", 100)
        .attr("height", 40)
        .attr("rx", 6)
        .attr("ry", 6)
        .on("click", function(d) {
                for (var i=0; i<numCells; i++) {
                    outputData.push(new Array());
                    for (var j=0; j<numCells; j++) {
                        outputData[i].push(gridData[i][j]["selected"])
                    }
                }

                renderPredictedFires(gridData)
            })
    grid.append("text")
        .attr("class", "txt")
        .text("Submit")
        .attr("y", gridHeight-95)
        .attr("x", 28)
        .on("click", function(d) {
            for (var i=0; i<numCells; i++) {
                outputData.push(new Array());
                for (var j=0; j<numCells; j++) {
                    outputData[i].push(gridData[i][j]["selected"])
                }
            }

            renderPredictedFires(gridData)
        })

    // the reset button and text
    grid.append("rect")
        .attr("class", "reset")
        .attr("x", 120)
        .attr("y", gridHeight-120)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr('width', 100)
        .attr('height', 40)
        .on("click", function(d) {
            for (var i=0; i<numCells; i++) {
                for (var j=0; j<numCells; j++) {
                    gridData[i][j]["selected"] = false
                }
            }
            d3.selectAll(".cell").style("fill", "transparent")
            firstRun = true
        })
    grid.append("text")
        .attr("class", "txt")
        .text("Reset")
        .attr("y", gridHeight-95)
        .attr("x", 147)
        .on("click", function(d) {
            for (var i=0; i<numCells; i++) {
                for (var j=0; j<numCells; j++) {
                    gridData[i][j]["selected"] = false
                }
            }
            d3.selectAll(".cell").style("fill", "transparent")
            firstRun = true
        })

    // legend entries
    grid.selectAll('.legend-rect')
        .data(["#a50f15", "#de2d26", "#fb6a4a", "#fcae91"])
        .enter()
        .append('rect')
        .attr('class', 'legend-rect')
        .attr('x', gridWidth - 100)
        .attr('y', (d, i) => gridHeight - 30 * (4 - i))
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => d)
    grid.selectAll('.legend-txt')
        .data(['Day 0', 'Day 2', 'Day 4', 'Day 6'])
        .enter()
        .append('text')
        .attr('class', 'legend-txt')
        .attr('x', gridWidth - 77)
        .attr('y', (d, i) => gridHeight - 30 * (4 - i) + 11)
        .text(d => d)
        .style('font-size', '10pt')
}
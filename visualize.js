var width = 2000;
var height = 500;

//Create SVG element
var svg = d3.select("body")
.append("svg")
.attr("width", width)
.attr("height", height);


// generate lines for nodes/ processes
function drawProcessLines (numNodesVal) {
    d3.selectAll("line").remove();
    d3.selectAll("text").remove();

    for (i = 1; i <= numNodesVal; i++) {
        svg.append("line")
        .attr("x1", 150*i)
        .attr("x2", 150*i)
        .attr("y1", 50)
        .attr("y2", 400)
        .attr("stroke", "black")

        svg.append("text")
        .attr("x", 150*i)
        .attr("y", 30)
        .text("p" + i);
    }
}

circlePositions = []

function drawEventCircles (numEventsVal) {
    d3.selectAll("circle").remove();
    d3.selectAll(".messageLine").remove();

    for (i = 1; i <= numEventsVal; i++) {

        numProcesses = $('#nodesNumSlider').val()
        processesLocation = Math.floor(Math.random() * numProcesses) + 1

        xPos = 150*processesLocation
        yPos = 50+(350/numEventsVal)*i

        svg.append('circle')
        .attr('cx', xPos)
        .attr('cy', yPos)
        .attr('r', 5)
        .style('fill', 'green');

        circlePositions.push([xPos, yPos])
    }

    drawMessages()
}

function drawMessages() {
    possibleMessagesCount = circlePositions.length - 1

    for (i = 0; i < possibleMessagesCount; i++) {
        loc1 = Math.floor(Math.random() * circlePositions.length)
        x1 = circlePositions[loc1][0]
        y1 = circlePositions[loc1][1]

        loc2 = Math.floor(Math.random() * circlePositions.length)
        x2 = circlePositions[loc2][0]
        y2 = circlePositions[loc2][1]

        svg.append("line")
        .attr("x1", x1)
        .attr("x2", x2)
        .attr("y1", y1)
        .attr("y2", y2)
        .attr("stroke", "blue")
        .attr("class", "messageLine")
    }

    circlePositions = []
}
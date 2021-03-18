var width = 2000;
var height = 500;

//Create SVG element
var svg = d3.select("body")
.append("svg")
.attr("width", width)
.attr("height", height);

circlePositions = []

// generate lines for nodes/ processes
function drawProcessLines () {
    d3.selectAll("line").remove();
    d3.selectAll("text").remove();
    d3.selectAll("circle").remove();
    d3.selectAll(".messageLine").remove();

    numProcesses = $('#nodesNumSlider').val()
    $('#nodesNumVal').html(numProcesses)

    for (i = 1; i <= numProcesses; i++) {
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

    circlePositions = drawEventCircles()
    drawEventChains(circlePositions)
}

// http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
function handleMouseOver(d, i) {  // Add interactivity
    // Use D3 to select element, change color and size
    console.log("hello")
    d3.select(this).attr({
        fill: "orange",
        r: this.r * 2
    });

    // Specify where to put label of text
    svg.append("text").attr({
        id: "t" + d.cx + "-" + d.cy + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
        x: function() { return xScale(d.x) - 30; },
        y: function() { return yScale(d.y) - 15; }
    })
    .text(function() {
        return [d.cx, d.cy];  // Value of the text
    });
}

function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    d3.select(this).attr({
        fill: "black",
        r: this.r
    });

    // Select text by id and then remove
    d3.select("#t" + d.cx + "-" + d.cy + "-" + i).remove();  // Remove text location
}

function drawEventCircles () {
    numEventsVal = $('#eventsNUm').val()

    circlePositions = []
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
            .style('fill', 'green')
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

        circlePositions.push([xPos, yPos])
    }
    return circlePositions
}

messages = []

function createEventChain(eventNode) {
    var eventChain = {
        events: [],
        addEvent: function(e) {
            if (this.length() === 0) {
                this.events.push(e)
                return true
            } else {
                lastE = this.events[this.length()-1]
                if (lastE.y > e.y) {
                    return false
                } else {
                    this.events.push(e)
                    return true
                }
            }
        },
        length: function() {
            return this.events.length
        },
        print: function() {
            for(i = 0; i < this.length(); i++) {
                this.events[i].print()
            }
        }
    }
    eventChain.addEvent(eventNode)
    eventsAddedCount = 0
    for (i = 0; i < circlePositions.length; i++) {
        var event2 = {
            x: circlePositions[i][0],
            y: circlePositions[i][1],
            print: function() {
                console.log("x: " + this.x + " y: " +  this.y)
            }
        }
        if (eventChain.addEvent(event2)) {
            eventsAddedCount++
        }
    }

    // draw the event chain
    len = eventChain.length()-1
    for (i = 0; i < len; i++) {
        x1 = eventChain.events[i].x
        y1 = eventChain.events[i].y

        x2 = eventChain.events[i+1].x
        y2 = eventChain.events[i+1].y

        svg.append("line")
        .attr("x1", x1)
        .attr("x2", x2)
        .attr("y1", y1)
        .attr("y2", y2)
        .attr("stroke", "blue")
        .attr("class", "messageLine")
    }

    // eventChain.print()
}

function drawEventChains(circlePositions) {

    for (i = 0; i < circlePositions.length; i++) {
        xPos = circlePositions[i][0]
        yPos = circlePositions[i][1]

        var eventNode = {
            x: xPos,
            y: yPos,
            print: function() {
                console.log("x: " + this.x + " y: " +  this.y)
            }
        }
        createEventChain(eventNode)
    }

    circlePositions = []
}
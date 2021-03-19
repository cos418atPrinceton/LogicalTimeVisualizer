var width = document.getElementById('mainContainer').offsetWidth*0.6;
var height = 500;
processLineWidthSpacing = 0
processLineMargin = 30
processLineStart = 60

//Create SVG element
var svg = d3.select("#vizDiv")
.append("svg")
.attr("width", width)
.attr("height", height)

circlePositions = []

// generate lines for nodes/ processes
function drawProcessLines () {
    d3.selectAll("line").remove();
    d3.selectAll("text").remove();
    d3.selectAll("circle").remove();
    d3.selectAll("#messagePath").remove();
    d3.selectAll("#arrow").remove();

    numProcesses = $('#nodesNumSlider').val()
    $('#nodesNumVal').html(numProcesses)

    processLineWidthSpacing = width/10 - 5

    for (i = 0; i < numProcesses; i++) {
        svg.append("line")
        .attr("x1", processLineWidthSpacing*i+processLineMargin)
        .attr("x2", processLineWidthSpacing*i+processLineMargin)
        .attr("y1", processLineStart)
        .attr("y2", 400)
        .attr("stroke", "black")

        svg.append("text")
        .attr("x", processLineWidthSpacing*i+processLineMargin)
        .attr("y", 30)
        .text("p" + (i+1));

        svg.append("text")
        .attr("x", processLineWidthSpacing*i+processLineMargin)
        .attr("y", 50)
        .text("C: " + 0);
    }

    circlePositions = drawEventCircles()
    drawEventChains(circlePositions)
}

// http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
function handleMouseOver() {
    // Use D3 to select element, change color and size
    node = d3.select(this)
             .style('fill', 'orange')
             .attr('r', 10)

    console.log(node.attr("id"))
    svg.append('text')
        .attr("dx", parseInt(node.attr("cx"))+15)
        .attr("dy", parseInt(node.attr("cy"))+15)
        .attr("id", "eventDetails")
        .text("hello");
}

function handleMouseOut() {
    // Use D3 to select element, change color back to normal
    node = d3.select(this)
            .style('fill', 'green')
            .attr('r', 7)

    d3.selectAll("#eventDetails").remove();
}

function drawEventCircles () {
    numEventsVal = $('#eventsNum').val()

    circlePositions = []
    d3.selectAll("circle").remove();
    d3.selectAll("#messagePath").remove();
    d3.selectAll("#arrow").remove();

    for (i = 0; i < numEventsVal; i++) {

        numProcesses = $('#nodesNumSlider').val()
        processesLocation = Math.floor(Math.random() * numProcesses)

        xPos = processLineWidthSpacing*processesLocation+processLineMargin
        yPos = (processLineStart)+(350/numEventsVal)*i

        svg.append('circle')
            .attr('cx', xPos)
            .attr('cy', yPos)
            .attr('r', 7)
            .attr('id', i)
            .attr('processNum', processesLocation)
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

        if ((x1 == x2) && (y1 == y2)) continue

        svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 20])
        .attr('refX', 10)
        .attr('refY', 10)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()([[0, 0], [0, 20], [20, 10]]))
        .attr('stroke', 'black');

        // create the path
        points = []
        if (x2 > x1) {
            m = (y2-y1)/(x2-x1)
            x1_ = x1 + 5
            y1_ = y1 + m*5
            x2_ = x2 - 10
            y2_ = y2 - (m*10)
            points = [[x1_, y1_], [x2_, y2_]]
        } else if (x1 > x2) {
            m = (y2-y1)/(x2-x1)
            x1_ = x1 - 5
            y1_ = y1 - m*5
            x2_ = x2 + 10
            y2_ = y2 + (m*10)
            points = [[x1_, y1_], [x2_, y2_]]
        } else {
            x1_ = x1
            y1_ = y1 + 5
            x2_ = x2
            y2_ = y2 - 10
            points = [[x1_, y1_], [x2_, y2_]]
        }

    
        svg
        .append('path')
        .attr('id', 'messagePath')
        .attr('d', d3.line()(points))
        .attr('stroke', 'black')
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none');
    }
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
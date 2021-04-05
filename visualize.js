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

    for (var i = 0; i < numProcesses; i++) {
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
        .attr("id", "timeStamp")
        .text("C: " + 0);
    }

    circlePositions = drawEventCircles()
    drawEventChains(circlePositions)
}

// http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
function handleMouseOverNode() {
    // Use D3 to select element, change color and size
    node = d3.select(this)
             .style('fill', 'orange')
             .attr('r', 10)
}

function handleMouseOutNode() {
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
    d3.selectAll(".messagePath").remove();
    d3.selectAll("#arrow").remove();

    for (var i = 0; i < numEventsVal; i++) {

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
            .on("mouseover", handleMouseOverNode)
            .on("mouseout", handleMouseOutNode);

        circlePositions.push([xPos, yPos])
    }
    return circlePositions
}

messages = []
messageNum = 0

function handleMouseOverMessage() {
    message = d3.select(this)
    messageNum = message.attr("id")

    d3.selectAll(".messagePath")
        .style("stroke-opacity", 0.3)
        .style("stroke-width", "1px")
        .attr('stroke', 'blue')
    
    d3.selectAll("#" + messageNum)
        .style("stroke-opacity", 1.0)
        .style("stroke-width", "2px")
        .attr('stroke', 'red')

    getTimeStamps(message)
}


function getTimeStamps(message) {
    messageNum = message.attr("id").
    messageNum = messageNum.substring("messagePath".length, messageNum.length)
    console.log(timeStampsArray[messageNum])

    var j = 0
    d3.selectAll("#timeStamp")
        .each(function(d, i){
            d3.select(this).text("C: " + timeStampsArray[messageNum][j++])
        })

    numProcesses = $('#nodesNumSlider').val()

}

const eventLinks = new Set()
const timeStampsArray = []

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

    var timeStamps = []
    numProcesses = $('#nodesNumSlider').val()
    for (var i = 0; i < numProcesses; i++) {
        timeStamps.push(0)
    }

    eventChain.addEvent(eventNode)
    eventsAddedCount = 0
    currEvent = eventNode
    for (var i = 0; i < circlePositions.length; i++) {

        // add to event chain with probability 0.5
        addProbability = Math.random()
        if (addProbability < 0.5) continue

        var event2 = {
            x: circlePositions[i][0],
            y: circlePositions[i][1],
            processNum: function() {
                return Math.round((circlePositions[i][0]-processLineMargin)/processLineWidthSpacing)
            },
            print: function() {
                console.log("x: " + this.x + " y: " +  this.y)
            }
        }
        if (eventChain.addEvent(event2)) {
            processNumCurrEvent = currEvent.processNum()
            processNumEvent2 = event2.processNum()

            timeStamps[processNumCurrEvent] = timeStamps[processNumCurrEvent] + 1

            if (processNumCurrEvent == processNumEvent2) continue

            timeStamps[processNumEvent2] = 1+Math.max(timeStamps[processNumCurrEvent], timeStamps[processNumEvent2])
            eventsAddedCount++
        }
        currEvent = event2

    }

    // draw the event chain
    len = eventChain.length()-1
    for (var i = 0; i < len; i++) {
        x1 = eventChain.events[i].x
        y1 = eventChain.events[i].y

        x2 = eventChain.events[i+1].x
        y2 = eventChain.events[i+1].y

        if ((x1 == x2) || (y1 == y2)) continue

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
        .attr('stroke', 'black')

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
        .attr('class', 'messagePath')
        .attr('id', 'messagePath' + messageNum)
        .attr('d', d3.line()(points))
        .attr('stroke', 'blue')
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none')
        .style("stroke-opacity", 0.1)
        .style("stroke-width", "1px")
        .style("display", function() {
            if (eventLinks.has([x1, y1, x2, y2])) {
                return "none"
            }
        })
        .on("mouseover", handleMouseOverMessage)
    }

    eventLinks.add([x1, y1, x2, y2])
    timeStampsArray.push(timeStamps)
    messageNum++
    console.log()

}

function drawEventChains(circlePositions) {

    for (var i = 0; i < circlePositions.length; i++) {
        xPos = circlePositions[i][0]
        yPos = circlePositions[i][1]

        var eventNode = {
            x: xPos,
            y: yPos,
            processNum: function() {
                return Math.round((xPos-processLineMargin)/processLineWidthSpacing)
            },
            print: function() {
                console.log("x: " + this.x + " y: " +  this.y)
            }
        }

        createEventChain(eventNode)
    }

    circlePositions = []
}
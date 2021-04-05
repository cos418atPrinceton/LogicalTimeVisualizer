var width = document.getElementById('mainContainer').offsetWidth*0.6;
var height = 500;
processLineWidthSpacing = 0
processLineMargin = 30
processLineStart = 60
processLineEnd = 400

circleRadius = 7

processLineLength = processLineEnd-processLineStart

//Create SVG element
var svg = d3.select("#vizDiv")
.append("svg")
.attr("width", width)
.attr("height", height)

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
            .attr("y2", processLineEnd)
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

    events = drawEventCircles()
}


function handleCircleDragged() {
    node = d3.select(this)
    newY = d3.event.y

    if (newY <= processLineStart || newY >= processLineEnd) return

    circleId = node.attr('id')
    circleId = circleId.substr(2, circleId.length).split('c')
    processesLocation = circleId[0]
    eventPositionInProcess = circleId[1]

    id1 = "id" + processesLocation + 'c' + (parseInt(eventPositionInProcess)-1)
    eventAbove = svg.select("#" + id1)
    if (eventAbove.empty()) {
        eventAbove = node
        yLimitAbove = processLineStart
    } else {
        yLimitAbove = parseInt(eventAbove.attr('cy')) + circleRadius
    }

    id2 = "id" + processesLocation + 'c' + (parseInt(eventPositionInProcess)+1)
    eventBelow = d3.select("#" + id2)
    if (eventBelow.empty()) {
        eventBelow = node
        yLimitBelow = processLineEnd
    } else {
        yLimitBelow = parseInt(eventBelow.attr('cy')) - circleRadius
    }

    if (node.attr('eventType') == 'sendEvent') {

        messageNum = node.attr('messageNum')

        arrow = d3.select("#messagePath"+messageNum)
        x1 = arrow.attr('x1')
        y1 = arrow.attr('y1')
        x2 = arrow.attr('x2')
        y2 = arrow.attr('y2')

        if ((newY < y2) && (newY >= yLimitAbove) && (newY <= yLimitBelow)) {
            node.attr("cy", newY)
            points = [[x1, newY], [x2, y2]]
            arrow.attr('d', d3.line()(points))
                .attr('x1', points[0][0])
                .attr('y1', points[0][1])
                .attr('x2', points[1][0])
                .attr('y2', points[1][1])
        }
    } 
    else if (node.attr('eventType') == 'receiveEvent') {

        messageNum = node.attr('messageNum')

        arrow = d3.select("#messagePath"+messageNum)
        x1 = arrow.attr('x1')
        y1 = arrow.attr('y1')
        x2 = arrow.attr('x2')
        y2 = arrow.attr('y2')

        if ((newY > y1) && (newY >= yLimitAbove) && (newY <= yLimitBelow)) {
            console.log("if!")
            node.attr("cy", newY)
            points = [[x1, y1], [x2, newY]]
            arrow.attr('d', d3.line()(points))
                .attr('x1', points[0][0])
                .attr('y1', points[0][1])
                .attr('x2', points[1][0])
                .attr('y2', points[1][1])
        } else {
            console.log("else!")
        }
    } else {
        if ((newY >= yLimitAbove) && (newY <= yLimitBelow)) {
            node.attr("cy", newY)
        }
    }
}

function drawEventCircle (xPos, yPos, circleId, messageNum, eventType, senderRecipientPos) {
    svg.append('circle')
        .attr('id', circleId)
        .attr('messageNum', messageNum)
        .attr('eventType', eventType)
        .attr('cx', xPos)
        .attr('cy', yPos)
        .attr('senderRecipientPos', senderRecipientPos)
        .attr('r', circleRadius)
        .attr('processNum', processesLocation)
        .style('fill', 'green')
        .call(d3.drag().on("drag", handleCircleDragged))
}

timeClockValues = []
eventsPerProcess = []

circleId = 0
messageNum = 0
function drawEventCircles () {
    numEventsVal = $('#eventsNum').val()
    numProcesses = $('#nodesNumSlider').val()

    d3.selectAll("circle").remove();
    d3.selectAll(".messagePath").remove();
    d3.selectAll("#arrow").remove();

    for (var i = 0; i < numProcesses; i++) {
        timeClockValues.push(0)
        eventsPerProcess.push(0)
    }

    i = 0
    while (i < numEventsVal-1) {

        processesLocation = Math.floor(Math.random() * numProcesses)

        xPos = Math.round(processLineWidthSpacing*processesLocation+processLineMargin)
        yPos = Math.round(processLineStart + i*(processLineLength/numEventsVal))

        eventType = Math.random()
        // send event
        if (Math.random() > 0.5) {

            processesLocation2 = Math.floor(Math.random() * numProcesses)
            xPos2 = Math.round(processLineWidthSpacing*processesLocation2+processLineMargin)
            yPos2 = Math.round(processLineStart + (i+1)*(processLineLength/numEventsVal))

            if ((xPos == xPos2) || (yPos == yPos2)) 
            {
                eventsPerProcess[processesLocation]++
                drawEventCircle(xPos, yPos, "id" + (processesLocation+1) + 'c' + eventsPerProcess[processesLocation], -1, 'internalEvent', -1)
                continue
            }

            timeClockValues[processesLocation]++
            timeClockValues[processesLocation2] = 1+Math.max(timeClockValues[processesLocation2], timeClockValues[processesLocation])

            eventsPerProcess[processesLocation]++
            eventsPerProcess[processesLocation2]++

            drawEventCircle(xPos, yPos, "id" + (processesLocation+1) + 'c' + eventsPerProcess[processesLocation], messageNum, 'sendEvent',yPos2)

            drawEventCircle(xPos2, yPos2, "id" + (processesLocation2+1) + 'c' + eventsPerProcess[processesLocation2], messageNum, 'receiveEvent', yPos)

            drawMessage(xPos, yPos, xPos2, yPos2, messageNum++)

            i = i + 2
        } else {
            eventsPerProcess[processesLocation]++
            drawEventCircle(xPos, yPos, "id" + (processesLocation+1) + 'c' + eventsPerProcess[processesLocation], -1, 'internalEvent', -1)
            i++
        }
    }

    showTimeStamps(timeClockValues)
    timeClockValues = []
    eventsPerProcess = []
}

function drawMessage(x1, y1, x2, y2, messageNum) {
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

    svg.append('defs')
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

    svg.append('path')
        .attr('class', 'messagePath')
        .attr('id', 'messagePath' + messageNum)
        .attr('d', d3.line()(points))
        .attr('stroke', 'blue')
        .attr('x1', points[0][0])
        .attr('y1', points[0][1])
        .attr('x2', points[1][0])
        .attr('y2', points[1][1])
        .attr('marker-end', 'url(#arrow)')
        .attr('fill', 'none')
        .style("stroke-opacity", 1)
        .style("stroke-width", "1px")
}

function showTimeStamps(timeClockValues) {
    var j = 0
    d3.selectAll("#timeStamp")
        .each(function(d, i){
            d3.select(this).text("C: " + (parseInt(i)+1) + "." + timeClockValues[j++])
        })

}
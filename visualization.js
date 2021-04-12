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
            .attr("id", "lamportTimeStamp")
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
            node.attr("cy", newY)
            points = [[x1, y1], [x2, newY]]
            arrow.attr('d', d3.line()(points))
                .attr('x1', points[0][0])
                .attr('y1', points[0][1])
                .attr('x2', points[1][0])
                .attr('y2', points[1][1])
        }
    } else {
        if ((newY >= yLimitAbove) && (newY <= yLimitBelow)) {
            node.attr("cy", newY)
        }
    }

    d3.selectAll("#cvText" + node.attr('id')).remove();
}

function drawEventCircle (xPos, yPos, circleId, messageNum, eventType, senderRecipientPos, clockValues) {
    svg.append('circle')
        .attr('id', circleId)
        .attr('messageNum', messageNum)
        .attr('eventType', eventType)
        .attr('cx', xPos)
        .attr('cy', yPos)
        .attr('senderRecipientPos', senderRecipientPos)
        .attr('r', circleRadius)
        .attr('processNum', processesLocation)
        .attr('clockValues', clockValues)
        .attr('clockValuesVisible', 0)
        .style('fill', 'green')
        .on("mouseover", handleMouseOverNode)
        .on("mouseout", handleMouseOutNode)
        .on("click", handleMouseClickNode)
        .call(d3.drag().on("drag", handleCircleDragged));
}

// http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
function handleMouseOverNode() {

    val = $('input[name="timestamp-type"]:checked').val() 
    if (val == 'lamport-timestamps') return;

    // Use D3 to select element, change color and size
    node = d3.select(this)
             .style('fill', 'red')
             .attr('r', 10)

    xPos = parseInt(node.attr('cx'))+10
    yPos = parseInt(node.attr('cy'))+10

    clockValues = node.attr('clockValues')

    svg.append('text')
        .attr('id', 'cvText' + node.attr('id'))
        .text(clockValues)
        .attr('x', xPos)
        .attr('y', yPos)
}

function handleMouseOutNode() {

    val = $('input[name="timestamp-type"]:checked').val() 
    if (val == 'lamport-timestamps') return;

    // Use D3 to select element, change color back to normal
    node = d3.select(this)
            .style('fill', 'green')
            .attr('r', 7)      

    if (node.attr('clockValuesVisible') == false) {
        d3.selectAll("#cvText" + node.attr('id')).remove();
    }
}

function handleMouseClickNode() {
    node = d3.select(this)
    clockValues = node.attr('clockValues')

    xPos = parseInt(node.attr('cx'))+10
    yPos = parseInt(node.attr('cy'))+10

    if (node.attr('clockValuesVisible') == true) {
        d3.selectAll("#cvText").remove();

        node.attr('clockValuesVisible', 0)
    } else {
        svg.append('text')
            .attr('id', 'cvText')
            .text(clockValues)
            .attr('x', xPos)
            .attr('y', yPos)

        node.attr('clockValuesVisible', 1)
    } 
}

lamportTimeClockValues = []
vectorTimeClockValues = []
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

        lamportTimeClockValues.push(0)

        vectorClockEntry = []
        for (var j = 0; j < numProcesses; j++) {
            vectorClockEntry.push(0)
        }
        vectorTimeClockValues.push(vectorClockEntry)

        eventsPerProcess.push(0)
    }

    var randomizeSeed = $('#randomSeedSwitch').prop('checked')

    // https://github.com/davidbau/seedrandom

    var seed = 0
    if (randomizeSeed) {
        seed = Math.floor(Math.random()*1000000)
        $('#seedValue').val(seed)
    } else {
        seed = $('#seedValue').val()
        if (seed === null || seed === '') {
            seed = 0
            $('#seedValue').val(seed)
        }
    }

    var rand = new Math.seedrandom(seed)

    i = 0
    while (i < numEventsVal-1) {

        randNo = rand.quick()
        processesLocation = Math.floor(randNo * numProcesses)

        lamportTimeClockValues[processesLocation]++

        xPos = Math.round(processLineWidthSpacing*processesLocation+processLineMargin)
        yPos = Math.round(processLineStart + i*(processLineLength/numEventsVal))
        
        // inter-process message
        if (rand.quick() > 0.5) {

            processesLocation2 = Math.floor(rand.quick() * numProcesses)
            xPos2 = Math.round(processLineWidthSpacing*processesLocation2+processLineMargin)
            yPos2 = Math.round(processLineStart + (i+1)*(processLineLength/numEventsVal))

            eventsPerProcess[processesLocation]++
            eventsPerProcess[processesLocation2]++

            vectorTimeClockValues[processesLocation][processesLocation]++

            if ((xPos == xPos2) || (yPos == yPos2)) 
            {
                drawEventCircle(xPos, yPos, "id" + (processesLocation+1) + 'c' + eventsPerProcess[processesLocation], -1, 'internalEvent', -1, vectorTimeClockValues[processesLocation])
                continue
            }

            for (var j = 0; j < numProcesses; j++) {
                vectorTimeClockValues[processesLocation2][j] = Math.max(vectorTimeClockValues[processesLocation2][j], vectorTimeClockValues[processesLocation][j])
            }
            vectorTimeClockValues[processesLocation2][processesLocation2]++

            lamportTimeClockValues[processesLocation2] = 1+Math.max(lamportTimeClockValues[processesLocation2], lamportTimeClockValues[processesLocation])


            drawEventCircle(xPos, yPos, "id" + (processesLocation+1) + 'c' + eventsPerProcess[processesLocation], messageNum, 'sendEvent', yPos2, vectorTimeClockValues[processesLocation])

            drawEventCircle(xPos2, yPos2, "id" + (processesLocation2+1) + 'c' + eventsPerProcess[processesLocation2], messageNum, 'receiveEvent', yPos, vectorTimeClockValues[processesLocation2])

            drawMessage(xPos, yPos, xPos2, yPos2, messageNum++)

            i = i + 2
        } else {
            eventsPerProcess[processesLocation]++
            vectorTimeClockValues[processesLocation][processesLocation]++
            drawEventCircle(xPos, yPos, "id" + (processesLocation+1) + 'c' + eventsPerProcess[processesLocation], -1, 'internalEvent', -1, vectorTimeClockValues[processesLocation])
            i++
        }
    }

    showTimeStamps(lamportTimeClockValues)
    lamportTimeClockValues = []
    vectorTimeClockValues = []
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

function showTimeStamps() {
    val = $('input[name="timestamp-type"]:checked').val()

    if (val == 'lamport-timestamps') {

        document.getElementById("vectorClockInfo").style.display = "none"

        var j = 0
        timeStamps = d3.selectAll("#lamportTimeStamp")

        if (timeStamps.empty()) {
            svg.append("text")
            .attr("x", processLineWidthSpacing*i+processLineMargin)
            .attr("y", 50)
            .attr("id", "lamportTimeStamp")
            .text("C: " + 0);
        } else {
            timeStamps.each(function(d, i){
                d3.select(this).text("C: " + (parseInt(i)+1) + "." + lamportTimeClockValues[j++])
            })
        }

    } else {

        document.getElementById("vectorClockInfo").style.display = "block"

        for (var i = 0; i < vectorTimeClockValues.length; i++) {
            $('ol').append( '<li>' + vectorTimeClockValues[i] + '</li>' );
            d3.selectAll("#lamportTimeStamp").remove()
        }
    }

}

function handleLamportClicked(){
    document.getElementById("vectorClockInfo").style.display = "none"
}

function handleVectorClicked(){
    document.getElementById("vectorClockInfo").style.display = "block"
}

function fetchParamFromURL(param) {
    var urlQuery = window.location.search.substring(1)
    var urlQueryvariables = urlQuery.split('&')

    for (i = 0; i < urlQueryvariables.length; i++) {
        pName = urlQueryvariables[i].split('=');

        if (pName[0] === param) {
            return typeof pName[1] === undefined ? true : decodeURIComponent(pName[1]);
        }
    }
}
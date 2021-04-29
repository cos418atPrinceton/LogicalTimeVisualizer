var width = document.getElementById('mainContainer').offsetWidth*0.6;
var height = 400;
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

    d3.selectAll('#lamportValueText' + node.attr('id')).remove();
    d3.selectAll('#vcText' + node.attr('id')).remove();

    newY = d3.event.y

    if (newY <= processLineStart || newY >= processLineEnd) return

    circleId = node.attr('id')
    circleId = circleId.substr(2).split('c')
    eventPositionInProcess = circleId[0]
    processesLocation = circleId[1]

    id1 = "id" + (parseInt(eventPositionInProcess)-1) + 'c' + processesLocation
    eventAbove = svg.select("#" + id1)
    if (eventAbove.empty()) {
        eventAbove = node
        yLimitAbove = processLineStart
    } else {
        yLimitAbove = parseInt(eventAbove.attr('cy')) + circleRadius*2
    }

    id2 = "id" + (parseInt(eventPositionInProcess)+1) + 'c' + processesLocation
    eventBelow = d3.select("#" + id2)
    if (eventBelow.empty()) {
        eventBelow = node
        yLimitBelow = processLineEnd
    } else {
        yLimitBelow = parseInt(eventBelow.attr('cy')) - circleRadius*2
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

    removeClockValueFromNode(node, 'lamportValueText')
    removeClockValueFromNode(node, 'vcValuesText')
}

function drawEventCircle (xPos, yPos, circleId, messageNum, eventType, senderRecipientPos, vcValues) {

    var processLocation = (circleId.substr(2).split('c'))[1]

    svg.append('circle')
        .attr('id', circleId)
        .attr('class', 'eventCircle')
        .attr('messageNum', messageNum)
        .attr('eventType', eventType)
        .attr('cx', xPos)
        .attr('cy', yPos)
        .attr('senderRecipientPos', senderRecipientPos)
        .attr('r', circleRadius)
        .attr('processNum', processLocation)
        .attr('lamportValue', circleId.substr(2).replace('c', '.'))
        .attr('lamportValueVisible', 0)
        .attr('vcValues', vcValues)
        .attr('vcValuesVisible', 0)
        .style('fill', 'green')
        .on("mouseover", handleMouseOverNode)
        .on("mouseout", handleMouseOutNode)
        .on("click", handleMouseClickNode)
        .call(d3.drag().on("drag", handleCircleDragged));

    var node = d3.select('#' + String(circleId))

    addClockValueToNode(node, 'vcValues', 'none', false)
    addClockValueToNode(node, 'lamportValue', 'none', false)
}

// http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
function handleMouseOverNode() {
    node = d3.select(this)
    .style('fill', 'red')
    .attr('r', 10)

    val = $('input[name="timestamp-type"]:checked').val() 
    if (val == 'lamport-timestamps') {
        if (node.attr('lamportValueVisible') == false) {
            d3.selectAll('#' + 'lamportValueText' + node.attr('id')).remove()
            addClockValueToNode(node, 'lamportValue', 'block', false)
        }
    } else if (val == 'vector-clocks') {
        if (node.attr('vcValuesVisible') == false) {
            d3.selectAll('#' + 'vcValuesText' + node.attr('id')).remove()
            addClockValueToNode(node, 'vcValues', 'block', false)
        }
    }
}

function handleMouseOutNode() {
    node = d3.select(this)
        .style('fill', 'green')
        .attr('r', 7)  
    
    val = $('input[name="timestamp-type"]:checked').val() 
    if (val == 'lamport-timestamps') {
        if (node.attr('lamportValueVisible') == false) {
            removeClockValueFromNode(node, 'lamportValueText')
        }
    } else if (val == 'vector-clocks') {
        if (node.attr('vcValuesVisible') == false) {
            removeClockValueFromNode(node, 'vcValuesText')
        }
    }    
}

function addClockValueToNode(node, valueType, display, visibile) {
    var xPos = parseInt(node.attr('cx'))+10
    var yPos = parseInt(node.attr('cy'))+10

    value = node.attr(valueType)

    text = svg.append('text')
    .attr('class', valueType + 'Text')
    .attr('id', valueType + 'Text' + node.attr('id'))
    .attr('x', xPos)
    .attr('y', yPos)
    .style('display', display)

    if (valueType == 'vcValues') {
        text.text('[' + value + ']')
    } else {
        text.text(value)
    }

    if (visibile) {
        node.attr(valueType + 'Visible', 1)
    } else {
        node.attr(valueType + 'Visible', 0)
    }
}

function removeClockValueFromNode(node, value) {
    d3.selectAll('#' + value + node.attr('id')).style('display', 'none');
    node.attr('lamportValueVisible', 0)
    node.attr('vcValuesVisible', 0)
}

function handleMouseClickNode() {
    var node = d3.select(this)

    var val = $('input[name="timestamp-type"]:checked').val() 

    if (val == 'lamport-timestamps') {
        if (node.attr('lamportValueVisible') == true) {
            removeClockValueFromNode(node, 'lamportValueText')
        } else {
            addClockValueToNode(node, 'lamportValue', 'block', true)
        }
    } else if (val == 'vector-clocks') {
        if (node.attr('vcValuesVisible') == true) {
            removeClockValueFromNode(node, 'vcValuesText')
        } else {
            addClockValueToNode(node, 'vcValues', 'block', true)
        }
    }
}

eventClockLamportTimeClockValues = []
lamportTimeClockValues = []
vectorTimeClockValues = []

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
    }

    var randomizeSeed = $('#randomSeedSwitch').prop('checked')

    // https://github.com/davidbau/seedrandom
    var seed = 0
    if (randomizeSeed) {
        seed = Math.floor(Math.random()*1000000)
    } else {
        seed = $('#seedValue').val()
        if (seed === null || seed === '') {
            seed = 0
        }
    }
    $('#seedValue').val(seed)

    var rand = new Math.seedrandom(seed)

    i = 0
    while (i < numEventsVal) {

        randNo = rand.quick()
        processesLocation = Math.floor(randNo * numProcesses)

        xPos = Math.round(processLineWidthSpacing*processesLocation+processLineMargin)
        yPos = Math.round(processLineStart + i*(processLineLength/numEventsVal))
        
        // inter-process message
        if ((rand.quick() > 0.5) && (numEventsVal-i >= 2)) {

            processesLocation2 = Math.floor(rand.quick() * numProcesses)
            xPos2 = Math.round(processLineWidthSpacing*processesLocation2+processLineMargin)
            yPos2 = Math.round(processLineStart + (i+1)*(processLineLength/numEventsVal))

            vectorTimeClockValues[processesLocation][processesLocation]++

            if (processesLocation != processesLocation2) {
                drawEventCircle(xPos, yPos, 'id' + ++lamportTimeClockValues[processesLocation] + 'c' + (processesLocation+1), messageNum, 'sendEvent', yPos2, vectorTimeClockValues[processesLocation])
                i++

                for (var j = 0; j < numProcesses; j++) {
                    vectorTimeClockValues[processesLocation2][j] = Math.max(vectorTimeClockValues[processesLocation2][j], vectorTimeClockValues[processesLocation][j])
                }
                
                lamportTimeClockValues[processesLocation2] = 1+Math.max(lamportTimeClockValues[processesLocation2], lamportTimeClockValues[processesLocation])
                vectorTimeClockValues[processesLocation2][processesLocation2]++
                drawEventCircle(xPos2, yPos2, 'id' + lamportTimeClockValues[processesLocation2] + 'c' + (processesLocation2+1), messageNum, 'receiveEvent', yPos, vectorTimeClockValues[processesLocation2])
                i++

                drawMessage(xPos, yPos, xPos2, yPos2, messageNum++)
            } else {
                drawEventCircle(xPos, yPos, 'id' + ++lamportTimeClockValues[processesLocation] + 'c' + (processesLocation+1), messageNum, 'internalEvent', -1, vectorTimeClockValues[processesLocation])
                i++

                lamportTimeClockValues[processesLocation2] = 1+Math.max(lamportTimeClockValues[processesLocation2], lamportTimeClockValues[processesLocation])
                vectorTimeClockValues[processesLocation2][processesLocation2]++
                drawEventCircle(xPos2, yPos2, 'id' + lamportTimeClockValues[processesLocation2] + 'c' + (processesLocation2+1), messageNum, 'internalEvent', -1, vectorTimeClockValues[processesLocation2])
                i++
            }

        } else {
            vectorTimeClockValues[processesLocation][processesLocation]++
            drawEventCircle(xPos, yPos, 'id' + ++lamportTimeClockValues[processesLocation] + 'c' + (processesLocation+1), -1, 'internalEvent', -1, vectorTimeClockValues[processesLocation])
            i++
        }
    }
    if (i < numEventsVal) {
        randNo = rand.quick()
        processesLocation = Math.floor(randNo * numProcesses)
        console.log(processesLocation)
        xPos = Math.round(processLineWidthSpacing*processesLocation+processLineMargin)
        yPos = Math.round(processLineStart + i*(processLineLength/numEventsVal))
        vectorTimeClockValues[processesLocation][processesLocation]++
        drawEventCircle(xPos, yPos, 'id' + ++lamportTimeClockValues[processesLocation] + '.' + (processesLocation+1), -1, 'internalEvent', -1, vectorTimeClockValues[processesLocation])
        i++
    }

    showAllClockValues()

    showTimeStamps(lamportTimeClockValues)
    lamportTimeClockValues = []
    vectorTimeClockValues = []
    eventsPerProcess = []
    eventClockLamportTimeClockValues = []
    updateURL(numProcesses, numEventsVal, seed)

    drawLCDAG()
    drawVCDAG()
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
        document.getElementById("lamportClockInfo").style.display = "block"

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
                d3.select(this).text("C: " + lamportTimeClockValues[j++] + "." + (parseInt(i)+1))
            })
        }

    } else if (val == 'vector-clocks') {

        document.getElementById("vectorClockInfo").style.display = "block"
        document.getElementById("lamportClockInfo").style.display = "none"

        for (var i = 0; i < vectorTimeClockValues.length; i++) {
            d3.selectAll("#lamportTimeStamp").remove()
        }
    }

}

function handleLamportClicked(){
    document.getElementById("vectorClockInfo").style.display = "none"
    document.getElementById("lamportClockInfo").style.display = "block"

    d3.selectAll(".vcText").remove();

    if (clockValuesShown) {
        hideAllClockValues()
        showAllClockValues()
    }
}

function handleVectorClicked(){
    document.getElementById("vectorClockInfo").style.display = "block"
    document.getElementById("lamportClockInfo").style.display = "none"

    if (clockValuesShown) {
        hideAllClockValues()
        showAllClockValues()
    }
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

function updateURL(numprocesses, numevents, seed) {
    const url = new URL(window.location);
    url.searchParams.set('numprocesses', numprocesses);
    url.searchParams.set('numevents', numevents);
    url.searchParams.set('seed', seed);

    window.history.pushState({}, '', url);
}

var clockValuesShown = false
function showHideAllClockValues(){
    if (clockValuesShown) {
        hideAllClockValues()
    } else {
        showAllClockValues()
    }
}

function showAllClockValues() {
    val = $('input[name="timestamp-type"]:checked').val()

    if (val == 'lamport-timestamps') {
        $('.lamportValueText').show()
        d3.selectAll('.eventCircle').each(function() {
            d3.select(this).attr('lamportValueVisible', 1)
        })
    } else if (val == 'vector-clocks') {
        $('.vcValuesText').show()
        d3.selectAll('.eventCircle').each(function() {
            d3.select(this).attr('vcValuesVisible', 1)
        })
    }
    clockValuesShown = true
    $('#showButton').html("Hide all Clock Values")
}

function hideAllClockValues() {
    $('.lamportValueText').hide()
    d3.selectAll('.eventCircle').each(function() {
        d3.select(this).attr('lamportValueVisible', 0)
    })

    $('.vcValuesText').hide()
    d3.selectAll('.eventCircle').each(function() {
        d3.select(this).attr('vcValuesVisible', 0)
    })
    clockValuesShown = false
    $('#showButton').html("Show all Clock Values")
}


// ordering visualization

function findLCTotalOrdering() {
    var lcValues = []

    nodes = d3.selectAll('circle').each(function(d, i){
        lcValue = d3.select(this).attr('lamportValue').split('.')
        lcValues.push({value: lcValue[0], process: lcValue[1]})
    })

    lcValues.sort(function (x, y) {
        var n = x.value - y.value;
        if (n !== 0) {
            return n;
        }
    
        return x.process - y.process;
    });

    return lcValues
}

var lcOrderingSVG = d3.select("#lamportClocksOrderingDiv")
    .append("svg")
    .attr("width", width)
    .attr("height", 100)
    .classed("svg-content-responsive", true)


// DAG showing the Lamport Clocks total ordering
function drawLCDAG() {

    var lcValues = findLCTotalOrdering()
    startXpos = 20
    distanceBtwnNodes = 75

    yPos = 50

    for (var i = 0; i < lcValues.length; i++) {
        lcOrderingSVG.append('circle')
        .attr('cx', startXpos + i*distanceBtwnNodes)
        .attr('cy', yPos)
        .attr('r', circleRadius)
        .style('fill', 'red')

        xPos = (startXpos + i*distanceBtwnNodes)

        lcOrderingSVG.append('text')
        .attr('x', xPos-circleRadius)
        .attr('y', yPos+25)
        .text(lcValues[i].value + '.' + lcValues[i].process)

        if (i == lcValues.length-1) break

        points = [[xPos+circleRadius, yPos], [(startXpos + (i+1)*distanceBtwnNodes)-(circleRadius*1.75), yPos]]

        lcOrderingSVG.append('defs')
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

        lcOrderingSVG.append('path')
        .attr('class', 'messagePath')
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
}


// compare vector clock values of 2 events

const before = -1
const after = 1
const concurrent = 0

function compareVCValues(node1, node2) {
    vcValues1 = node1.getAttribute('vcValues').replaceAll(',', '')
    vcValues2 = node2.getAttribute('vcValues').replaceAll(',', '')

    diff = []
    for (var i = 0; i < vcValues1.length; i++) {
        diff.push(parseInt(vcValues1[i])-parseInt(vcValues2[i]))
    }

    var greater  = false
    var smaller = false

    for (var i = 0; i < vcValues1.length; i++) {
        if (diff[i] > 0) {
            greater = true
            if (greater && smaller) return concurrent
        } 
        else if (diff[i] < 0){
            smaller = true
            if (greater && smaller) return concurrent
        }
    }

    if (greater) return after
    if (smaller) return before
}

function findIntersectBetweenPaths(a,b){
    for(var i = 0; i < a.length; i++) {
        for (var j = 0; j < b.length; j++) {
            if (a[i].includes(b[j][0])) return [i, j]
        }
    }
    return -1
}

function intersectPaths(vcPartialOrders) {
    for (var i = 0; i < vcPartialOrders.length-1; i++) {
        for (var j = i+1; j < vcPartialOrders.length; j++) {
            console.log(vcPartialOrders[i])
            console.log(vcPartialOrders[j])
            const intersectingValues = findIntersectBetweenPaths(vcPartialOrders[i], vcPartialOrders[j]);

            if (intersectingValues != -1) {
                indexI = intersectingValues[0]
                indexJ = intersectingValues[1]
            } else {
                continue
            }

            console.log(indexI)
            console.log(indexJ)

            if (indexI > indexJ) {
                for(var k = indexJ; k > 0; k--) {
                    vcPartialOrders[i][indexI-k].push(vcPartialOrders[j][indexJ-k][0])
                }
                vcPartialOrders.splice(indexJ, 1)
            } else {
                for(var k = indexI; k > 0; k--) {
                    vcPartialOrders[j][indexJ-k].push(vcPartialOrders[i][indexI-k][0])
                }
                vcPartialOrders.splice(indexI, 1)
            }
        }
    }
    return vcPartialOrders
}

function findVCPartialOrdering() {

    nodes = d3.selectAll('.eventCircle')._groups[0]

    var vcPartialOrder = []
    var vcPartialOrders = []
    const eventSet = new Set()
    for (var i = 0; i < nodes.length; i++) {
        firstInPartialOrder = nodes[i]
        var currProcess = firstInPartialOrder.getAttribute('processNum')
        if (eventSet.has(firstInPartialOrder.getAttribute('id'))) continue
        vcPartialOrder = [[firstInPartialOrder.getAttribute('vcValues')]]
        eventSet.add(firstInPartialOrder.getAttribute('id'))
        for (var j = i+1; j < nodes.length; j++) {
            if (after === compareVCValues(nodes[j], firstInPartialOrder))
            {
                if (nodes[j].getAttribute('eventType') === 'receiveEvent') {
                    vcPartialOrder.push([nodes[j].getAttribute('vcValues')])
                    currProcess = nodes[j].getAttribute('processNum')
                    console.log(j)
                    console.log(currProcess)
                    eventSet.add(nodes[j].getAttribute('id')) 
                } else if (nodes[j].getAttribute('processNum') === currProcess) {
                    vcPartialOrder.push([nodes[j].getAttribute('vcValues')])
                    currProcess = nodes[j].getAttribute('processNum')
                    eventSet.add(nodes[j].getAttribute('id')) 
                }
                else if (firstInPartialOrder.getAttribute('processNum') == nodes[j].getAttribute('processNum')) {
                    vcPartialOrders.push(vcPartialOrder)

                    vcPartialOrder = [[firstInPartialOrder.getAttribute('vcValues')]]
                    vcPartialOrder.push([nodes[j].getAttribute('vcValues')])
                    eventSet.add(nodes[j].getAttribute('id'))
                }
            }
        }
        vcPartialOrders.push(vcPartialOrder)
    }

    // vcPartialOrders = intersectPaths(vcPartialOrders)
    // console.log(vcPartialOrders)

    return vcPartialOrders
}

// DAG showing the Vector Clocks partial ordering
function drawVCDAG() {

    var vcPartialOrders = findVCPartialOrdering()
    startXpos = 20
    distanceBtwnNodes = 75

    startYPos = 50
    distanceBetweenGraphs = 100

    d3.select("#vectorClocksOrderingSVG").remove()
    var vcOrderingSVG = d3.select("#vectorClocksOrderingDiv")
        .append("svg")
        .attr("width", width)
        .attr("id", "vectorClocksOrderingSVG")
        .attr("height", (vcPartialOrders.length)*distanceBtwnNodes+100)
        .classed("svg-content-responsive", true)

    for (var j = 0; j < vcPartialOrders.length; j++) {
        vcPartialOrder = vcPartialOrders[j]
        startYPos = 50
        for (var i = 0; i < vcPartialOrder.length; i++) {

            for (var k = 0; k < vcPartialOrder[i].length; k++) {

                yPos = startYPos + (j*distanceBetweenGraphs) + (k*50)

                vcOrderingSVG.append('circle')
                .attr('cx', startXpos + i*distanceBtwnNodes)
                .attr('cy', yPos)
                .attr('r', circleRadius)
                .style('fill', 'red')
        
                xPos = startXpos + i*distanceBtwnNodes

                if (k === 0) {
                    yPos2 = yPos
                } else {
                    yPos = startYPos + (j*distanceBetweenGraphs) + 40 + circleRadius
                    yPos2 = startYPos + (j*distanceBetweenGraphs) + ((k-1)*40) + circleRadius
                }
        
                vcOrderingSVG.append('text')
                .attr('x', xPos-circleRadius)
                .attr('y', yPos+25)
                .text('[' + vcPartialOrder[i][k] + ']')
        
                if (i == vcPartialOrder.length-1) break
        
                points = [[xPos+circleRadius, yPos], [(startXpos + (i+1)*distanceBtwnNodes)-(circleRadius*1.75), yPos2]]
        
                vcOrderingSVG.append('defs')
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
        
                vcOrderingSVG.append('path')
                .attr('class', 'messagePath')
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
        }
    }
}
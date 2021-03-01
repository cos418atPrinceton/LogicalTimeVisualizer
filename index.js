function updateNodeCount() {
    nodeSliderVal = $('#nodesNumSlider').val()
    $('#nodesNumVal').html(nodeSliderVal)

    drawProcessLines(nodeSliderVal)
}

function updateEventCircles() {
    numEventsVal = $('#eventsNUm').val()

    drawEventCircles(numEventsVal)
}

function setUp() {
    $('#nodesNumSlider').on('change', updateNodeCount);

    $(document).on('submit', '#formDetails', function(event) {
        event.preventDefault()
        updateEventCircles()
    });
}

$('document').ready(setUp)
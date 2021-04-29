function setUp() {

    numProcesses = fetchParamFromURL("numprocesses")
    if (numProcesses === null || numProcesses === undefined) {
        numProcesses = 5
    } else if(numProcesses > 10) {
        numProcesses = 10
    }
    $("#nodesNumSlider").val(numProcesses);
    $('#nodesNumVal').html(numProcesses)

    numEvents = fetchParamFromURL("numevents")
    if (numEvents === null || numEvents === undefined) {
        numEvents = 10
    }
    $('#eventsNum').val(numEvents)


    seed = fetchParamFromURL("seed")
    if (seed === null || seed === undefined) {
        seed = 12345
    }
    $('#seedValue').val(seed)

    $('#nodesNumSlider').on('change', drawProcessLines);

    $(document).on('submit', '#formDetails', function(event) {
        numEventsVal = $('#eventsNum').val()

        if (numEventsVal <= 100) {
            drawProcessLines()
        } else {
            alert("Please input at most 100 events.")
        }

        event.preventDefault()
    });

    drawProcessLines()
    
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
}

$('document').ready(setUp)
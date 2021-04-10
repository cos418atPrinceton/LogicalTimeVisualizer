function setUp() {

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
}

$('document').ready(setUp)
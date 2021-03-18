function setUp() {
    $('#nodesNumSlider').on('change', drawProcessLines);

    $(document).on('submit', '#formDetails', function(event) {
        event.preventDefault()
        drawEventCircles()
    });
}

$('document').ready(setUp)
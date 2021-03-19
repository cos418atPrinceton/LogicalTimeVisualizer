function setUp() {
    $('#nodesNumSlider').on('change', drawProcessLines);

    $(document).on('submit', '#formDetails', function(event) {
        event.preventDefault()
        drawProcessLines()
    });
}

$('document').ready(setUp)
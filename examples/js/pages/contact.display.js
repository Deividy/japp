JA.page('contact').addDisplay({
    id: "contactDisplay",
    container: "#contactContainer",
    templateSelector: "#contactDisplay",
    events: {
        "submit form": function (ev) {
            ev.preventDefault();
            alert("Submit form \nName: " + $("input[name='name']").val());
        }
    }
});

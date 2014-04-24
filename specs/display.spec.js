describe("JA display tests", function () {
    before(function() {
        document.body.innerHTML = __html__['specs/home.html'];
    });  

    it('instantiate', function () {
        $("#homeTest").length.should.be.eql(0);

        var display = new JA.Display({
            id: "JADisplay",
            container: "#homeContainer",
            templateSelector: "#tpl-homePage" 
        });

        display.id.should.eql("JADisplay");

        $("#homeTest").length.should.be.eql(1);
    });
});

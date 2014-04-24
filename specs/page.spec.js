document.body.innerHTML = __html__['specs/home.html'];

var page = null;

describe("JA page tests", function () {
    it('instantiate', function () {
        page = new JA.Page({
            id: "JAPage"
        });

        page.id.should.eql("JAPage");
        page._displays.length.should.eql(0);

    });

    it('add display', function () {
        page._displays.length.should.eql(0);

        page.addDisplay({
            id: "JADisplay",
            container: "#homeContainer",
            templateSelector: "#tpl-homePage"
        });

        page._displays.length.should.eql(1);
    });
});

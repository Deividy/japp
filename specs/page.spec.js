describe("JA page tests", function () {
    before(function() {
        document.body.innerHTML = __html__['specs/home.html'];
    });  

    var page = null;

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

    it('custom methods', function (done) {
        var steps = 1;

        JA.addPage({
            id: "pageTest",
            beforeDeactivate: function (next) {
                steps.should.be.eql(3);
                steps++;
                next();
            },
            afterDeactivate: function () { 
                steps.should.be.eql(4);
                steps++;
            },

            beforeActivate: function (next) {
                steps.should.be.eql(1);
                steps++;
                next();
            },
            afterActivate: function () {
                steps.should.be.eql(2);
                steps++;
            }
        });

        JA.addPage({
            id: 'JAPage',
            beforeActivate: function (next) {
                steps.should.be.eql(5);
                steps++;
                next();
            },
            afterActivate: function () {
                steps.should.be.eql(6);
                done();
            }
        });

        JA.navigate('pageTest');
        JA.navigate('JAPage');
    });
});

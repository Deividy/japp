describe("JA display tests", function () {
    before(function() {
        document.body.innerHTML = __html__['specs/home.html'];
    });  

    beforeEach(function() {
        JA.build();
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

    it('custom methods', function (done) {
        var steps = 0;

        JA.addPage({ id: "pageTest1" }).addDisplay({
            id: 'pageDisplay',
            container: 'pageDisplayContainer',
            beforeActivate: function (next) {
                steps.should.be.eql(1);
                steps++;
                next();
            },
            afterActivate: function () {
                steps.should.be.eql(2);
                steps++;
            },
            beforeDeactivate: function (next) {
                steps.should.be.eql(3);
                steps++;
                next();
            },
            afterDeactivate: function () { 
                steps.should.be.eql(4);
                steps++;
                done();
            },
            render: function () {
                steps.should.be.eql(0);
                steps++;
            }
        });

        JA.navigate('pageTest1');
        JA.activePage().deactivate();
    });

    it('two displays', function (done) {
        var steps = 1, render = 0;

        JA.addPage({ id: "pageTest1" }).addDisplay({
            id: 'pageDisplay',
            container: 'pageDisplayContainer',
            beforeActivate: function (next) {
                steps.should.be.eql(1);
                steps++;
                next();
            },
            afterActivate: function () {
                steps.should.be.eql(2);
                steps++;
            },
            beforeDeactivate: function (next) {
                steps.should.be.eql(3);
                steps++;
                next();
            },
            afterDeactivate: function () { 
                steps.should.be.eql(4);
                steps++;
            },
            render: function () {
                steps.should.be.eql(1);
                render.should.be.eql(0);
                render++;
            }
        });

        JA.addPage({ id: 'jaPage1' }).addDisplay({
            id: 'jaDisplay',
            container: 'jaDisplayContainer',
            beforeActivate: function (next) {
                steps.should.be.eql(5);
                steps++;               
                next();
            },
            afterActivate: function () {
                steps.should.be.eql(6);
                render.should.be.eql(2);
                done();
            },
            render: function () {
                steps.should.be.eql(1);
                render.should.be.eql(1);
                render++;
            }
        });

        JA.navigate('pageTest1');
        JA.navigate('jaPage1');
    });
});

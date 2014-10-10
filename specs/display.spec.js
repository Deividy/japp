describe("JA display tests", function () {
    before(function() {
        document.body.innerHTML = __html__['specs/home.html'];
    });  

    beforeEach(function() {
        JA.build();
    });

    it('instantiate', function () {
        var display = new JA.Display({
            id: "JADisplay",
            container: "#homeContainer"
        });

        display.id.should.eql("JADisplay");
    });

    it('custom methods', function (done) {
        var steps = 1;

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
            }
        });

        JA.navigate('pageTest1');
        JA.activePage().deactivate();
    });

    it('two displays', function (done) {
        var steps = 1;

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
                done();
            }
        });

        JA.navigate('pageTest1');
        JA.navigate('jaPage1');
    });
});

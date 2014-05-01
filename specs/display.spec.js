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

    it('custom methods', function (done) {
        var steps = 1;

        JA.addPage({ id: "pageTest1" }).addDisplay({
            id: 'pageDisplay',
            container: 'pageDisplayContainer',
            beforeActivate: function (next) {
                steps.should.be.eql(3);
                steps++;
                next();
            },
            afterActivate: function () {
                steps.should.be.eql(4);
                steps++;
            },
            render: function () {
                steps.should.be.eql(1);
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
            },
            render: function () {
                steps.should.be.eql(2);
                steps++;
            }
        });

        JA.navigate('pageTest1');
        JA.navigate('jaPage1');
    });
});

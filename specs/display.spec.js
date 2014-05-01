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

    // why are we hiting the activate events twice?
    it('custom methods', function (done) {
        var steps = 1;

        JA.addPage({ id: "pageTest" }).addDisplay({
            id: 'pageDisplay',
            container: 'pageDisplayContainer',
            beforeDeactivate: function (next) {
                if (steps > 5) {
                    steps.should.be.eql(10);
                } else {
                    steps.should.be.eql(5);
                }

                steps++;
                next();
            },
            afterDeactivate: function () { 
                if (steps > 6) {
                    steps.should.be.eql(11);
                } else {
                    steps.should.be.eql(6);
                }

                steps++;
            },

            beforeActivate: function (next) {
                if (steps > 3) {
                    steps.should.be.eql(8);
                } else {
                    steps.should.be.eql(3);
                }

                steps++;
                next();
            },
            afterActivate: function () {
                if (steps > 4) {
                    steps.should.be.eql(9);
                } else {
                    steps.should.be.eql(4);
                }

                steps++;
            },
            render: function () {
                steps.should.be.eql(1);
                steps++;
            }
        });

        JA.addPage({ id: 'JAPage' }).addDisplay({
            id: 'jaDisplay',
            container: 'jaDisplayContainer',
            beforeActivate: function (next) {
                if (steps > 7) {
                    steps.should.be.eql(12);
                } else {
                    steps.should.be.eql(7);
                }
                steps++;
                next();
            },
            afterActivate: function () {
                if (steps > 8) {
                    steps.should.be.eql(13)
                } else {
                    steps.should.be.eql(8);
                }
                done();
            },
            render: function () {
                steps.should.be.eql(2);
                steps++;
            }
        });

        JA.navigate('pageTest');
        JA.navigate('JAPage');
    });
});

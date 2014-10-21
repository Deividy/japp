beforeEach(function() {
    JA.initialized = false;
});

describe("JA app tests", function () {
    before(function() {
        document.body.innerHTML = __html__['specs/home.html'];
    });  

    it("build", function(done) {
        if (JA.get) {
            done(".get() should be undefined at this point");
        }
        if (JA.post) {
            done(".post() should be undefined at this point");
        }

        JA.build({
            errorHandler: function (err) {
                err.should.be.eql("Test");
                done();
            }
        });

        JA.get.should.be.a.Function
        JA.post.should.be.a.Function

        JA.errorHandler("Test");
    });


    // add
    it('add page', function () {
        JA.build();

        var homePage = JA.addPage({
            id: "homePage"
        });

        JA._pages.length.should.eql(1);
        JA.page("homePage").should.be.eql(homePage);
    });


    it('add display', function () {
        var homePage = JA.page('homePage');
        var homeDisplay = homePage.addDisplay({
            id: "homeDisplay",
            container: "#homeContainer"
        });

        homePage._displays.length.should.be.eql(1);
        homePage._displayById['homeDisplay'].should.be.eql(homeDisplay);
        $("#homeTest").length.should.be.eql(1);
    });

    // navigate
    it('navigate', function () {
        $("#homeContainer").css("display").should.be.eql('none');

        JA.navigate('homePage');
        JA.page('homePage').activateAllDisplays();
        $("#homeContainer").css("display").should.be.eql('block');

        var page = JA.page('homePage');
        page.deactivate();

        $("#homeContainer").css("display").should.be.eql('none');
    });


    // ajax
    it("get error", function (done) {
        JA.build({
            errorHandler: function (jqXHR, textStatus, errorThrown) {
                textStatus.should.be.eql('error')
                done();
            }
        });
        JA.get("http://notexists../", function () { });
    });

    it("post error", function (done) {
        JA.build({
            errorHandler: function (jqXHR, textStatus, errorThrown) {
                textStatus.should.be.eql('error')
                done();
            }
        });
        JA.get("http://notexists../", function () { });
    });
    //
});

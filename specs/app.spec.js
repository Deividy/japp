document.body.innerHTML = __html__['specs/home.html']

describe("JA app tests", function () {
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
            id: "homePage",
            beforeActivate: function (next) {
                next("homeDisplay");
            }
        });

        JA._pages.length.should.eql(1);
        JA.page("homePage").should.be.eql(homePage);
    });

    it('add display', function () {
        $("#homeTest").length.should.be.eql(0);

        var homePage = JA.page('homePage');
        homePage._displays.length.should.be.eql(0);

        var homeDisplay = homePage.addDisplay({
            id: "homeDisplay",
            container: "#homeContainer",
            template: "#tpl-homePage"
        });

        homePage._displays.length.should.be.eql(1);
        homePage._displayById['homeDisplay'].should.be.eql(homeDisplay);

        $("#homeTest").length.should.be.eql(1);
    });

    // navigate
    it('navigate', function () {
        $("#homeContainer").css("display").should.be.eql('none');

        JA.navigate('homePage');
        $("#homeContainer").css("display").should.be.eql('block');

        var page = JA.page('homePage');
        page.deactivate();

        $("#homeContainer").css("display").should.be.eql('none');
    });

    // ajax
    it('get', function (done) {
        JA.build();
        JA.get("/", function (data, textStatus, jqXHR) {
            done();
        });
    });

    it('post', function (done) {
        JA.build();
        JA.post("/", function (data, textStatus, jqXHR) {
            done();
        });
    });

    it("get error", function (done) {
        JA.build({
            errorHandler: function (jqXHR, textStatus, errorThrown) {
                textStatus.should.be.eql('error')
                done();
            }
        });
        JA.get("https://google.com/", function () { });
    });

    it("post error", function (done) {
        JA.build({
            errorHandler: function (jqXHR, textStatus, errorThrown) {
                textStatus.should.be.eql('error')
                done();
            }
        });
        JA.post("https://google.com/", function () {});
    });
    //
});

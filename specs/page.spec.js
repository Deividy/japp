describe("JA page tests", function () {
    it('instantiate', function () {
        var page = new JA.Page({
            id: "homePage",
            beforeActivate: function (firstDisplay) {
                firstDisplay("homeDisplay");
            }
        });

    });
});

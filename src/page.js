var pageTemplate = {
    _displays: [ ],
    _displayById: { },

    isRoute: true,

    afterDeactivate: function () { },
    beforeDeactivate: function (next) { next(); },
    afterActivate: function () { },
    beforeActivate: function (next) { next(); }
};

JA.Page = function (options) {
    F.demandGoodObject(options, "options");
    F.demandGoodString(options.id, "options.id");

    this._activeDisplay = null;

    _.extend(this, options);
    _.defaults(this, pageTemplate);
    _.extend(this, Backbone.Events);

    this._displays = [ ];
};

_.extend(JA.Page.prototype, {
    display: function (displayId) {
        F.demandGoodString(displayId, 'displayId');

        var display = this._displayById[displayId];
        if (display) return display;

        throw new Error("Display " + displayId + " not found!");
    },

    addDisplay: function (displayObj) {
        F.demandGoodObject(displayObj, 'displayObj');

        var display = new JA.Display(displayObj)
        this._displays.push(display);
        this._displayById[display.id] = display;

        display.hide();

        return display;
    },

    activeAllDisplays: function () {
        _.each(this._displays, function (display) {
            display.activate();
        });
    },

    deactiveAllDisplays: function () {
        _.each(this._displays, function (display) {
            display.deactivate();
        });
    },

    activate: function () {
        var self = this;

        this.beforeActivate(function () {
            self.activeAllDisplays();
            self.afterActivate();
        });
    },

    deactivate: function () {
        var self = this;

        this.beforeDeactivate(function () {
            self.deactiveAllDisplays();
            self.afterDeactivate();
        });
    }
});

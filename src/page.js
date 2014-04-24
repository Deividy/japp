var pageTemplate = {
    _displays: [ ],
    _displayById: { },

    isRoute: true,

    afterDeactivate: function () { },
    beforeDeactivate: function (next) { next(); },
    afterActivate: function () { },

    beforeActivate: function (firstDisplay) {
        throw new Error("Must implement and pass a display id to firstDisplay()");
    }
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

    navigate: function (displayId) {
        F.demandGoodString(displayId, 'displayId');

        this._activeDisplay = null;
        JA._activeDisplay = null;

        _.each(this._displays, function (display) {
            if (display.id !== displayId) return display.deactivate();
            display.activate();

            this._activeDisplay = display;
            JA._activeDisplay = display;
        }, this);
    },

    activate: function () {
        var self = this;

        this.beforeActivate(function (displayId) {
            F.demandGoodString(displayId, 'displayId');

            self.navigate(displayId);
            self.afterActivate();
        });
    },

    deactivate: function () {
        var self = this;

        this.beforeDeactivate(function () {
            if (self._activeDisplay) {
                self._activeDisplay.deactivate();
            }
            self.afterDeactivate();
        });
    }
});

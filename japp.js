(function() {
    var template = {
        errorHander: function(jqXHR, textStatus, erorThrown) {
            alert(textStatus);
            window.location.reload(true);
        }
    };
    JA = window.JA = {
        initialized: false,
        build: function(options) {
            if (this.initialized) {
                throw new Error("JA is already initialized");
            }
            if (!options) options = {};
            var app = new JApp(options);
            _.extend(this, app);
            this.initialized = true;
        },
        inherit: function(child, superclass) {
            function c() {
                this.constructor = child.constructor;
            }
            c.prototype = superclass.prototype;
            for (var prop in superclass) {
                if (Object.hasOwnProperty.call(superclass, prop)) {
                    child[prop] = superclass[prop];
                }
            }
            child.prototype = new c();
            return child;
        }
    };
    var JApp = function(options) {
        _.extend(this, Backbone.Events);
        _.extend(this, options);
        _.defaults(this, template);
        this._activePage = null;
        this._pages = [];
        this._pageById = {};
        this.routes = {};
    };
    _.extend(JApp.prototype, {
        // routes
        createRoutesForPages: function() {
            var self = this;
            _.each(this._pages, function(page) {
                if (!page.isRoute || self.routes[page.id]) return;
                self.routes[page.id] = function() {
                    self.navigate(page.id);
                };
            });
        },
        startRouter: function() {
            this.createRoutesForPages();
            var Router = Backbone.Router.extend({
                routes: this.routes
            });
            this.router = new Router();
            Backbone.history.start();
        },
        //
        // pages
        addPage: function(pageObj) {
            ArgumentValidator.object(pageObj, "pageObj");
            var page = new JA.Page(pageObj);
            this._pages.push(page);
            this._pageById[page.id] = page;
            return page;
        },
        page: function(pageId) {
            ArgumentValidator.string(pageId, "pageId");
            var page = this._pageById[pageId];
            if (page) return page;
            throw new Error("Page " + pageId + " not found!");
        },
        activePage: function() {
            return this._activePage || {
                id: undefined
            };
        },
        //
        navigate: function(pageId) {
            ArgumentValidator.string(pageId, "pageId");
            if (JA.activePage().id === pageId) return;
            var activePage = null;
            _.each(this._pages, function(page) {
                if (page.id !== pageId && this.activePage().id === page.id) {
                    return page.deactivate();
                }
                if (page.id === pageId) {
                    page.activate();
                    activePage = page;
                }
            }, this);
            if (activePage === null) {
                throw new Error("Page " + pageId + " not found");
            }
            this._activePage = activePage;
        },
        // ajax
        get: function(url, data, callback) {
            if (_.isFunction(data)) {
                callback = data;
                data = {};
            }
            ArgumentValidator.string(url, "url");
            ArgumentValidator.objectOrEmpty(data, "data");
            ArgumentValidator.type("Function", callback, "callback");
            $.ajax({
                type: "GET",
                url: url,
                data: data,
                success: callback,
                error: this.errorHandler,
                cache: false
            });
        },
        post: function(url, data, callback) {
            if (_.isFunction(data)) {
                callback = data;
                data = {};
            }
            ArgumentValidator.string(url, "url");
            ArgumentValidator.objectOrEmpty(data, "data");
            ArgumentValidator.type("Function", callback, "callback");
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                success: callback,
                error: this.errorHandler
            });
        }
    });
    JA.JApp = JApp;
})();

(function() {
    var template = {
        afterDeactivate: function() {},
        beforeDeactivate: function(next) {
            next();
        },
        afterActivate: function() {},
        beforeActivate: function(next) {
            next();
        },
        render: function() {
            this.$container.html(this.template());
            return this;
        },
        template: function() {
            return _.template($(this.templateSelector).html());
        }
    };
    var backboneViewMethods = [ "setElement", "remove", "delegateEvents", "undelegateEvents" ];
    JA.Display = function(options) {
        ArgumentValidator.keysWithString(options, [ "id", "container" ], "options");
        _.extend(this, options);
        _.defaults(this, template);
        if (!this.selector) this.selector = this.container;
        this.$container = $(this.container);
        this.render();
        this.$el = this.$();
        this.delegateEvents(this.events);
    };
    _.extend(JA.Display.prototype, {
        $: function() {
            return $(this.selector);
        },
        activate: function() {
            var self = this;
            this.beforeActivate(function() {
                self.show();
                self.afterActivate();
            });
        },
        deactivate: function() {
            var self = this;
            this.beforeDeactivate(function() {
                self.hide();
                self.afterDeactivate();
            });
        },
        hide: function() {
            this.$().hide();
        },
        show: function() {
            this.$().show();
        }
    });
    _.extend(JA.Display.prototype, _.pick(Backbone.View.prototype, backboneViewMethods));
})();

(function() {
    var template = {
        isRoute: true,
        afterDeactivate: function() {},
        beforeDeactivate: function(next) {
            next();
        },
        afterActivate: function() {},
        beforeActivate: function(next) {
            next();
        }
    };
    JA.Page = function(options) {
        ArgumentValidator.keysWithString(options, [ "id" ], "options");
        _.extend(this, Backbone.Events);
        _.extend(this, options);
        _.defaults(this, template);
        this._activeDisplay = null;
        this._displays = [];
        this._displayById = {};
    };
    _.extend(JA.Page.prototype, {
        display: function(displayId) {
            ArgumentValidator.string(displayId, "displayId");
            var display = this._displayById[displayId];
            if (display) return display;
            throw new Error("Display " + displayId + " not found!");
        },
        addDisplay: function(displayObj) {
            ArgumentValidator.object(displayObj, "displayObj");
            var display = new JA.Display(displayObj);
            this._displays.push(display);
            this._displayById[display.id] = display;
            display.hide();
            return display;
        },
        activateAllDisplays: function() {
            _.each(this._displays, function(display) {
                display.activate();
            });
        },
        deactivateAllDisplays: function() {
            _.each(this._displays, function(display) {
                display.deactivate();
            });
        },
        activate: function() {
            var self = this;
            this.beforeActivate(function() {
                self.activateAllDisplays();
                self.afterActivate();
            });
        },
        deactivate: function() {
            var self = this;
            this.beforeDeactivate(function() {
                self.deactivateAllDisplays();
                self.afterDeactivate();
            });
        }
    });
})();
(function() {
    var template = {
        errorHandler: function(jqXHR, textStatus, erorThrown) {
            alert(textStatus);
            window.location.reload(true);
        },
        loading: {
            show: function() {},
            hide: function() {}
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
            for (var key in app) {
                this[key] = app[key];
            }
            this.errorHandler = _.bind(this.errorHandler, this);
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
        this.routes = {};
        _.extend(this, Backbone.Events);
        _.extend(this, options);
        _.defaults(this, template);
        this._activePage = null;
        this._pages = [];
        this._pageById = {};
        this.runningTasks = [];
    };
    _.extend(JApp.prototype, {
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
        addRunningTask: function(object) {
            ArgumentValidator.object(object, "object");
            var id = new Date().getTime();
            this.runningTasks.push(_.extend(object, {
                id: id
            }));
            return id;
        },
        removeRunningTask: function(id) {
            ArgumentValidator.number(id, "id");
            var idx = this.runningTasks.length;
            while (idx--) {
                if (this.runningTasks[idx].id === id) {
                    this.runningTasks.splice(idx, 1);
                    return true;
                }
            }
            return false;
        },
        get: function(url, data, callback) {
            return this.ajax("get", url, data, callback);
        },
        post: function(url, data, callback) {
            return this.ajax("post", url, data, callback);
        },
        "delete": function(url, data, callback) {
            return this.ajax("delete", url, data, callback);
        },
        ajax: function(method, url, data, callback) {
            if (_.isFunction(data)) {
                callback = data;
                data = {};
            }
            ArgumentValidator.string(url, "url");
            ArgumentValidator.objectOrEmpty(data, "data");
            ArgumentValidator.type("Function", callback, "callback");
            this.loading.show();
            var runningTaskId = this.addRunningTask({
                method: method,
                url: url,
                data: data,
                callback: callback
            });
            return $.ajax({
                type: method.toUpperCase(),
                url: url,
                dataType: "json",
                data: data,
                success: _.bind(function() {
                    this.removeRunningTask(runningTaskId);
                    if (this.runningTasks.length === 0) {
                        this.loading.hide();
                    }
                    callback.apply(this, arguments);
                }, this),
                error: this.errorHandler,
                cache: false
            });
        }
    });
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
        events: {},
        constructor: function() {}
    };
    var backboneViewMethods = [ "setElement", "remove", "delegateEvents", "undelegateEvents" ];
    JA.Display = function(options) {
        ArgumentValidator.keysWithString(options, [ "id", "container" ], "options");
        _.extend(this, options);
        _.defaults(this, template);
        if (!this.selector) this.selector = this.container;
        this.isActive = false;
        for (var eventString in this.events) {
            var s = eventString.split(">");
            var events = s[0];
            var selector = s[1];
            var handler = _.bind(this.events[eventString], this);
            this.$().on(events.trim(), selector.trim(), handler);
        }
        var context = this;
        $(document).ready(function() {
            options.constructor.call(context);
        });
    };
    _.extend(JA.Display.prototype, {
        $: function() {
            return $(this.selector);
        },
        $hide: function() {
            this.$().hide();
        },
        $show: function() {
            this.$().show();
        },
        activate: function() {
            var self = this;
            this.beforeActivate(function() {
                self.isActive = true;
                self.$show();
                self.afterActivate();
            });
        },
        deactivate: function() {
            var self = this;
            this.beforeDeactivate(function() {
                self.isActive = false;
                self.$hide();
                self.afterDeactivate();
            });
        },
        toggle: function() {
            return this.isActive ? this.deactivate() : this.activate();
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
        },
        routes: {}
    };
    JA.Page = function(options) {
        ArgumentValidator.keysWithString(options, [ "id" ], "options");
        _.extend(this, Backbone.Events);
        _.extend(this, options);
        _.defaults(this, template);
        this._activeDisplay = null;
        this._displays = [];
        this._displayById = {};
        for (var route in this.routes) {
            JA.routes[route] = _.bind(this.routes[route], this);
        }
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
            // we do this $hide() here because is handy and we dont need
            // to add display: none to every display, this is always the desired
            // behavior, since we will $show the display when activate it
            display.$hide();
            return display;
        },
        activateAllDisplays: function() {
            _.each(this._displays, function(display) {
                if (!display.isActive) {
                    display.activate();
                }
            });
        },
        deactivateAllDisplays: function() {
            _.each(this._displays, function(display) {
                if (display.isActive) {
                    display.deactivate();
                }
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
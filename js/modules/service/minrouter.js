define(function(require) {
    var win = window, evt ='hashchange', self = {};

    var regexps = [
        /[\-{}\[\]+?.,\\\^$|#\s]/g,
        /\((.*?)\)/g,
        /(\(\?)?:\w+/g,
        /\*\w+/g,
    ],
    getRegExp = function(route) {
        route = route.replace(regexps[0], '\\$&')
            .replace(regexps[1], '(?:$1)?')
            .replace(regexps[2], function(match, optional) {
                return optional ? match : '([^/?]+)'
            }).replace(regexps[3], '([^?]*?)');
        return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },
    extractParams = function(route, fragment) {
        var params = route.exec(fragment).slice(1);
        var results = [], i;
        for(i = 0; i < params.length; i++) {
            results.push(decodeURIComponent(params[i]) || null);
        }
        return results;
    };

    function Router(opts) {
        this.opts = opts;
        this.routes = opts.routes;
        this.sep = opts.sep || '';
        this.go(location.hash, true);
        self = this;
    }
    Router.prototype.exec = function(path) {
        for(var r in this.routes) {
            var route = getRegExp(r);
            if (!route.test(path)) {
                continue;
            }
            if (typeof this.routes[r] === 'function') {
                this.routes[r].apply(this, extractParams(route, path));
            } else {
                var fn = this.opts[this.routes[r]];
                fn ? fn.apply(this, extractParams(route, path)) : void 0;
            }
        }
    };
    Router.prototype.emmit = function(path) {
            path = location.href.split('#')[1] || '';
            self.exec(path);
    };
    Router.prototype.start = function() {
        win.addEventListener ? win.addEventListener(evt, this.emmit, false) : win.attachEvent('on' + evt, this.emmit)
    };
    Router.prototype.stop = function() {
        win.removeEventListener ? win.removeEventListener(evt, this.emmit, false) : win.detachEvent('on' + evt, this.emmit);
    };
    Router.prototype.go = function(path) {
        if(path.indexOf("#")!=-1) {
            path = path.split("#")[1];
        }
        if(path === ""  || path === "/"){
            location.hash = "/stepOne";
            this.tryGoHash=false;
        }
        else{
            location.hash = path;
            if(!this.tryGoHash){
                this.exec(path);
                this.tryGoHash =true;
            }
        }

    };
    Router.prototype.back = function() {
        history.back();
    };

    return Router
})
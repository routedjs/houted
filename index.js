! function() {
    'use strict';

    var his = window.history
    var loc = window.location
    var nativePushState = history.pushState
    var nativeReplaceState = history.replaceState
    var lts = [] // Houted listeners
    var evt = 'popstate'

    var curctx

    var T_MANUAL = 'manual'
    var T_ROUTE = 'route'
    var T_REPLACE = 'replace'
    var T_INIT = 'init'

    /**
     *  private state
     */
    var inited = 0
    /**
     *  Will be called when the first time to call "Houted(observers)"
     */
    function boot() {
        inited = 1
        emit(new Context(T_INIT))
    }
    /**
     *  Houted API Method
     *  @param ob <Function> "ob" will be called when boot or hash has change
     */
    function R(ob) {
        lts.push(ob)
        if (!inited) boot()
    }
    R.route = function (url, state, title) {
        nativePushState.call(his, state, title || '', url)
        emit(new Context(T_ROUTE))
    }
    R.replace = function (url, state, title) {
        nativeReplaceState.call(his, state, title || '', url)
        emit(new Context(T_REPLACE))
    }
    R.current = function () {
        return curctx
    }
    his.pushState = function (state, title, url) {
        nativePushState.apply(his, arguments)
        emit(new Context(T_ROUTE))
    }
    his.replaceState = function (state, title, url) {
        nativeReplaceState.apply(his, arguments)
        emit(new Context(T_REPLACE))
    }
    /**
     *  Emit to all listener when change
     */
    function emit(ctx) {
        curctx = ctx
        lts.forEach(function (item, i) {
            item.call(ctx, ctx)
        })
    }

    /**
     *  Call when hashchange trigger or initial boot
     */
    function dispatch(e) {
        emit(new Context(T_MANUAL))
    }

    function Context (type) {
        this.pathname = location.pathname,
        this.search = location.search,
        this.hash = location.hash,
        this.href = location.href,
        this.action = type,
        this.state = history.state
    }

    /**
     *  Support IE
     */
    window.addEventListener ? window.addEventListener(evt, dispatch, false) : window.attachEvent('on' + evt, dispatch)

    /**
     *  Global namespace is "Houted"
     */
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) module.exports = R
        else exports.Houted = R
    } else window.Houted = R

}();
(function () {

    var tunk = require('tunk');


    // 清理cache问题，cache时机问题，针对动作还是数据

    //opts:{
    // storage:'memory',  // memory  sessionStorage  localStorage
    // }
    var configs = {
        type:false,
    };

    var cache=function cache(opts){
        Object.assign(configs, opts);
    };

    var cached={};

    tunk.hook('callAction', function(origin){
        return function(dispatch, originAction, args, module, moduleName, actionName,  options){
            var result;
            if(options.cache && (result=getFromCache(moduleName, actionName, options.cache))){
                dispatch.call(module, result);
            }else origin(dispatch, originAction, args, module, moduleName, actionName,  options);
        }
    });

    tunk.hook('callWatcher', function(origin){
        return function(dispatch, watcher, newValue, watchingStatePath, watchingModule, fromAction, module, moduleName, watcherName, options){
            var result;
            if(options.cache && (result=getFromCache(moduleName, watcherName, options.cache))){
                dispatch.call(module, result);
            }else origin(dispatch, watcher, newValue, watchingStatePath, watchingModule, fromAction, module, moduleName, watcherName, options);
        }
    });

    tunk.hook('initModule', function(origin){
        return function(module, store, moduleName, opts){
            var obj = origin(module, opts, state);
            if(obj.state) {
                Object.assign(store[moduleName], getFromCache())
            }
        }
    });

    tunk.hook('storeNewState', function(origin){
        return function(obj, moduleName, actionName, options){
            var result;
            if(options.cache && !(result=getFromCache(moduleName, actionName, options.cache))){
                setToCache(moduleName, actionName, obj, options.cache);
            }

            origin(obj, moduleName, actionName, options);
        }
    });

    function getFromCache(moduleName, actionName, type){
        type = type || configs.type;
        switch (type){
            case 'sessionStorage':
                if(window.sessionStorage[key])
                    return JSON.parse(window.sessionStorage[key]);
            case 'localStorage':
                if(window.localStorage[key])
                    return JSON.parse(window.localStorage[key]);
            default:
                return cache[key];
        }
    }

    function setToCache(moduleName, actionName, data, type){
        type = type || configs.type;
        cached[moduleName] = cached[moduleName] || {};

        switch (type){
            case 'sessionStorage':
                window.sessionStorage[key] = JSON.stringify(data);
                break;
            case 'localStorage':
                window.localStorage[key] = JSON.stringify(data);
                break;
            default:
                cache[key] = data;
        }
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = {cache:cache};
    }
    else if (typeof define === 'function' && define.amd) {
        define(function () {
            return {cache:cache};
        })
    }


})();

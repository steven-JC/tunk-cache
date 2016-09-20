(function () {

    var tunk = require('tunk');



    //记录每个动作 更新的 字段，动作启动后，检测是否需要从快照中load数据，load的时候判断指针是否相等，如果相等就不执行动作
    // this.snapshot('increment');

    tunk.hook('initModule', function(origin){
        return function(module, store, moduleName, options){

            module.prototype.snapshot=function(){

            }

            var obj = origin(module, store, moduleName, options);
            if(options.snapshot) {
                if (obj.state) {
                    Object.assign(store[moduleName], wakeFromCache(moduleName, options.snapshot));
                } else obj.state = wakeFromCache(moduleName, options.snapshot);
            }
            return obj;
        }
    });

    tunk.hook('storeNewState', function(origin){
        return function(obj, moduleName, actionName, options){
            if(options.snapshot){
                setToCache(moduleName, obj, options.snapshot);
            }
            origin(obj, moduleName, actionName, options);
        }
    });


    function wakeFromCache(key, type){
        key = 'WAKE-'+key;
        var value;
        switch (type){
            case 'ss':
            case 'sessionStorage':
                return ss.getItem(key);
            case 'ls':
            case 'localStorage':
                return ls.getItem(key);
        }
    }

    function setToCache(key, data, type){
        key = 'WAKE-'+key;
        switch (type){
            case 'ss':
            case 'sessionStorage':
                ss.setItem(key, data);
                break;
            case 'ls':
            case 'localStorage':
                ls.setItem(key, data);
                break;
        }
    }


    function SessionStorage(){
        this.cache={};
    }
    SessionStorage.prototype={
        constructor:SessionStorage,
        setItem:function(key, data){
            this.cache[key]=this.cache[key]||{};
            Object.assign(this.cache[key], data);
            window.sessionStorage[key] = JSON.stringify(this.cache[key]);
        },
        getItem:function(key){
            var value;
            if(value = window.sessionStorage[key]){
                this.cache[key]=JSON.parse(value);
                return this.cache[key];
            }else return this.cache[key]={};
        }
    }

    function LocalStorage(){
        this.cache={};
    }
    LocalStorage.prototype={
        constructor:LocalStorage,
        setItem:function(key, data){
            this.cache[key]=this.cache[key]||{};
            Object.assign(this.cache[key], data);
            window.localStorage[key] = JSON.stringify(this.cache[key]);
        },
        getItem:function(key){
            var value;
            if(value = window.localStorage[key]){
                this.cache[key]=JSON.parse(value);
                return this.cache[key];
            }else return this.cache[key]={};
        }
    }




    var ls=new LocalStorage(),
        ss=new SessionStorage();




})();

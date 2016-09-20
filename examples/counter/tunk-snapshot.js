(function () {

    var tunk = require('tunk');



    //记录每个动作 更新的 字段，动作启动后，检测是否需要从快照中load数据，load的时候判断指针是否相等，如果相等就不执行动作
    //让用户手动决定哪些数据经过缓存，哪些不经过
    //用户自定义存储方式
    
    // this.snapshot('increment'); 第一次：执行动作，缓存数据，，第二次：直接拿数据
    // this.snapshot({count:2}); 第一次：缓存数据
    // this.dispatch('increment'); 强制执行动作，更改缓存数据

    tunk.hook('initModule', function(origin){
        return function(module, store, moduleName, options){
            
            //存数据，取数据，通过缓存快捷存取  snsh
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

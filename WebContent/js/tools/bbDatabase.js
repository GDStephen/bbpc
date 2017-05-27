angular.module('database', [])
    .factory('DBService',[ function() {
//创建接口
var Database_interface = new Interface('Database_interface',['openDB','upgradDB','closeDB','deleteDB']);
var Store_interface = new Interface('Database_interface',['addData','getDataByKey','updateDataByKey','deleteDataByKey','clearObjectStore']);

var addressDB;

//父类
var Database = function(){
    this.db_name = '';
    this.version = 0;
    //设置db指针（需要子类重写）
    function SetDB(db) { throw new Error('Need to subclass rewrite'); };
    //获取db指针（需要子类重写）
    function GetDB() { throw new Error('Need to subclass rewrite'); };
    //更新数据库（需要子类重写）
    function upgradDB(db) { throw new Error('Need to subclass rewrite'); };
    //关闭数据库
    this.closeDB = function() {
        console.log('CloseDB: ' + this.db_name);
        var db = this.GetDB();
        console.log(db);
        db.close();
        this.SetDB(null);
    };

    //打开数据库
    this.openDB = function(callback){
        /*if(this.GetDB() != undefined && this.GetDB() != null) {
            callback(this.GetDB());
        }*/

        console.log('OpenDB: ' + this.db_name + ' version: ' + this.version);
        var request = window.indexedDB.open(this.db_name, this.version);
        var upgradDB = this.upgradDB;
        //var setDB = this.SetDB;
        //var closeDB = this.closeDB;
        request.onerror = function(e){
            console.log('OpenDB error!');
        };
        request.onsuccess = function(e){
            console.log('OpenDB success!');
            var db = e.target.result;
            //setDB(db);
            callback(db);
            db.close();
        };
        request.onupgradeneeded = function(e){
            console.log('OpenDB need upgrade!');
            var db=e.target.result;
            upgradDB(db);
        };
    };

    //删除数据库
    this.deleteDB = function() {
        console.log('DeleteDB: ' + this.db_name);
        var deleteDbRequest = window.indexedDB.deleteDatabase(this.db_name);
        deleteDbRequest.onsuccess = function (event) {
            console.log("database deleted successfully");
        };
        deleteDbRequest.onerror = function (e) {
            console.log("Database error: " + e.target.errorCode);
        };
    };
};

//定义Database为可扩展类
Database.prototype = new extendObject();

var Store = function(){
    this.store_name = '';
    this.db = null;
    //添加记录
    this.addData = function(data, callback) {
        //添加操作
        var store_name = this.store_name;
        this.db.openDB(function(db){
            console.log(store_name + ' addData!');
            var transaction = db.transaction(store_name,'readwrite'); 
            var store=transaction.objectStore(store_name); 
            console.log(data);
            var req =store.add(data);
            req.onsuccess = function() {
                callback(true);
            };
            req.onerror = function() {
                callback(false);
            };
        });
    }

    //根据主键获取记录
    this.getDataByKey = function(key,callback) {
        var store_name = this.store_name;
        this.db.openDB(function(db){
            console.log('GetDataByKey storeName: ' + store_name + 'key: ' + key);
            var transaction = db.transaction(store_name,'readwrite');
            var store = transaction.objectStore(store_name);
            var request = store.get(key);
            request.onsuccess = function() {
                callback(e.target.result);
            };
            request.onerror = function() {
                callback(false);
            };
        });
    };

    //获取所有记录
    this.fetchStroeByCursor = function(callback) {
        var store_name = this.store_name;
        this.db.openDB(function(db) {
            var datas = [];
            console.log('GetAllData storeName: ' + store_name);
            var transaction = db.transaction(store_name,'readwrite');
            var store = transaction.objectStore(store_name);
            var request = store.openCursor();
            request.onsuccess = function(e){
                var cursor = e.target.result;
                if(cursor){
                    console.log(cursor.key);
                    var data = cursor.value;
                    console.log(data);
                    datas.push(data);
                    cursor.continue();
                }
                else{
                    callback(datas);
                }
            };
            request.onerror = function() {

            };
        });
    };

    //按照自己设置的Index获取所有记录
    this.getDataByIndex = function(indexName, key, callback) {
        var store_name = this.store_name;
        this.db.openDB(function(db) {
            var datas = [];
            console.log('GetAllData storeName: ' + store_name);
            var transaction = db.transaction(store_name,'readwrite');
            var store = transaction.objectStore(store_name);
            var index = store.index(indexName);
            var request=index.openCursor(IDBKeyRange.only(key))
            request.onsuccess = function(e){
                var cursor = e.target.result;
                if(cursor){
                    console.log(cursor.key);
                    var data = cursor.value;
                    console.log(data);
                    datas.push(data);
                    cursor.continue();
                }
                else{
                    callback(datas);
                }
            };
            request.onerror = function() {

            };
        });
    };

    //根据主键更新记录
    this.updateDataByKey = function(data,callback) {
        var store_name = this.store_name;
        this.db.openDB(function(db){
            console.log('UpdateDataByKey storeName: ' + store_name);
            var transaction = db.transaction(store_name,'readwrite');
            var store = transaction.objectStore(store_name);
            var request = store.put(data);
            request.onsuccess = function(e){
                callback(true);
            };
            request.onerror = function() {
                callback(false);
            };
        });
    };

    //根据主键删除记录
    this.deleteDataByKey = function(key) {
        var store_name = this.store_name;
        this.db.openDB(function(db){
            console.log('DeleteDataByKey storeName: ' + store_name + 'key: ' + key);
            var transaction = db.transaction(store_name,'readwrite'); 
            var store = transaction.objectStore(store_name); 
            store.delete(key);
        });
    };

    //清空object store
    this.clearObjectStore = function() {
        var store_name = this.store_name;
        this.db.openDB(function(db){
            console.log('ClearObjectStore storeName: ' + store_name);
            var transaction = db.transaction(store_name,'readwrite');
            var store = transaction.objectStore(store_name);
            store.clearObjectStore();
        });
    };
};

//定义Store为可扩展类
Store.prototype = new extendObject();

//通讯录类
var AddressDB = (new Database()).extend({
    //继承Database_interface接口
    implementsInterfaces : ['Database_interface'],
    db_name : 'AddressDB',
    version : 1,
    SetDB : function(db) { addressDB = db; },
    GetDB : function() { return addressDB; },
    upgradDB : function(db){
        //更新操作
        console.log('AddressDB upgradDB!');
        if(!db.objectStoreNames.contains('contact')){
            var store = db.createObjectStore('contact',{keyPath:"jid"});
            store.createIndex('jidIndex','jid',{unique:true}); 
        }
        if(!db.objectStoreNames.contains('groupmember')){
            db.createObjectStore('groupmember',{keyPath:"jid"});
            store.createIndex('jidIndex','jid',{unique:true}); 
        }
    }
});

//好友类
var ContactStore = (new Store()).extend({
    //继承Store_interface接口
    implementsInterfaces : ['Store_interface'],
    store_name : 'contact',
    db : AddressDB
});

//群成员类
var GroupMemberStore = (new Store()).extend({
    //继承Store_interface接口
    implementsInterfaces : ['Store_interface'],
    store_name : 'groupmember',
    db : AddressDB
});

//判断是否实现
Database_interface.ensureImplements([AddressDB]);
Store_interface.ensureImplements([ContactStore, GroupMemberStore]);
return {
            AddressDB,
            ContactStore,
            GroupMemberStore
        };
}]);
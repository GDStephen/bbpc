(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);

    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    }

    // Browser globals
    var bbDataBase = {};
    root.bbDataBase = bbDataBase;
    factory(bbDataBase);

}((typeof window === 'object' && window) || this, function (bbDataBase) {
    var bbAppDB = {
        name: 'bbAppDb',
        version: 6,
        db: null
    };

    var objKeyIndex = {
        memberInfo:'jid',
        groupinfo:'jid',
        friendlist:'jid',
        contactmemberinfo:'jid',
        chatlog:'uuid'

    };
    function InitDbByUserName(loginjid)
    {
        var strIndex = loginjid.indexOf('@');
        bbAppDB.name = 'bbAppDb' + loginjid.substr(0,strIndex);
    }
    /**
     * 打开数据库,
     * 如果不存在创建
     * 数据库
     */
    bbDataBase.openDB = function (strJid,callback) {
        InitDbByUserName(strJid);
        var request = window.indexedDB.open(bbAppDB.name, bbAppDB.version);
        request.onerror = function (e) {
            console.log('OpenDB error!');
            if(callback)
            {
                callback(false, e);
            }
            
        };
        request.onsuccess = function (e) {
            console.log('OpenDB success!');
            bbAppDB.db = e.target.result;
            if(callback)
            {
                callback(true, 'open');
            }
            
            
        };
        request.onupgradeneeded = function (e) {
            var KeyIndex = objKeyIndex.memberInfo;
            var KeyIndexGroup = objKeyIndex.groupinfo;
            console.log('OpenDB need upgrade!');
            bbAppDB.db = e.target.result;
            if (!bbAppDB.db.objectStoreNames.contains('memberInfo')) {
                bbAppDB.db.createObjectStore('memberInfo', {
                    keyPath: KeyIndex
                });
            }
            if (!bbAppDB.db.objectStoreNames.contains('groupinfo')) {
                bbAppDB.db.createObjectStore('groupinfo', {
                    keyPath: KeyIndexGroup
                });
            }
            if (!bbAppDB.db.objectStoreNames.contains('friendlist')) {
                bbAppDB.db.createObjectStore('friendlist', {
                    keyPath: objKeyIndex.friendlist
                });
            }
            if (!bbAppDB.db.objectStoreNames.contains('contactmemberinfo')) {
                bbAppDB.db.createObjectStore('contactmemberinfo', {
                    keyPath: objKeyIndex.contactmemberinfo
                });
            }
            if (!bbAppDB.db.objectStoreNames.contains('chatlog')) {
                bbAppDB.db.createObjectStore('chatlog', {
                    keyPath: objKeyIndex.chatlog
                });
            }
            console.log('DB version changed to ' + bbAppDB.version);
			setTimeout(function(){callback(true, 'updated');} ,200);
        };
    };
    /**
     * 关闭数据库
     */
    bbDataBase.closeDB = function () {
        if (bbAppDB.db) {
            bbAppDB.db.close();
        }
    };
    /**
     * 删除数据库
     */
    bbDataBase.deleteDB = function () {
        indexedDB.deleteDatabase(bbAppDB.name);
    };
    /**
     * 添加数据
     */
    bbDataBase.addDataBath = function (store_name, dataArray, callback) {
        //添加操作
        console.log('添加 storeName: ' + store_name);
        var transaction = bbAppDB.db.transaction(store_name, 'readwrite');
        var KeyIndex = objKeyIndex[store_name];
        var reqArrayFailed = [];
		var nTotalAdd = dataArray.length;
        transaction.oncomplete = function (event) {
            callback(true, event, []);
        }
        transaction.onerror = function (event) {
		   /**
			*这里还是需要添加一个过滤的接口
			*/
			if(nTotalAdd === 0)
			{
				callback(false, event, reqArrayFailed);
			}
            
        }
		function AddDataSingleNotify(request,Key)
		{
			request.onsuccess = function (event) {
				--nTotalAdd;
            };

            request.onerror = function (event) {
                reqArrayFailed.push(Key[KeyIndex]);
				--nTotalAdd;
            };
		}
        var store = transaction.objectStore(store_name);
        for (var i = 0; i < dataArray.length; ++i) {
            var req = store.add(dataArray[i]);
            AddDataSingleNotify(req,dataArray[i]);

        }
    };
    /**
     * 根据主键更新数据库
     */
    bbDataBase.updateDataBath = function (store_name, dataArray, callback) {

        //更新操作
        console.log('UpdateDataByKey storeName: ' + store_name);
        var transaction = bbAppDB.db.transaction(store_name, 'readwrite');
        var reqArrayFailed = [];
		var nTotal = dataArray.length;
        var KeyIndex = objKeyIndex[store_name];
        transaction.oncomplete = function (event) {
            callback(true, event, []);
        }
        transaction.onerror = function (event) {
		   /**
			*这里还是需要添加一个过滤的接口
			*/
			if(nTotal === 0)
			{
				callback(false, event, reqArrayFailed);
			}
            
        }
		function PutDataSingleNotify(request,Key)
		{
			request.onsuccess = function (event) {
				--nTotal;
            };

            request.onerror = function (event) {
                reqArrayFailed.push(Key[KeyIndex]);
				--nTotal;
            };
		}
        var store = transaction.objectStore(store_name);
        for (var i = 0; i < dataArray.length; ++i) {
            var req = store.put(dataArray[i]);
            PutDataSingleNotify(req,dataArray[i]);

        }
    };
    /**
     * 修改数据
     */
    //根据主键更新记录
    bbDataBase.updateDataBathMap = function (store_name, dataMap, callback) {

        //更新操作
        console.log('UpdateDataMap storeName: ' + store_name);
        var KeyIndex = objKeyIndex[store_name];
        var transaction = bbAppDB.db.transaction(store_name, 'readwrite');
        var reqArrayFailed = [];
		var nTotal = dataMap.size();
        transaction.oncomplete = function (event) {
            callback(true, event, []);
        }
        transaction.onerror = function (event) {
		   /**
			*这里还是需要添加一个过滤的接口
			*/
			if(nTotal === 0)
			{
				callback(false, event, reqArrayFailed);
			}
            
        }
		function PutDataSingleNotify(request,Key)
		{
			request.onsuccess = function (event) {
				--nTotal;
            };

            request.onerror = function (event) {
                reqArrayFailed.push(Key[KeyIndex]);
				--nTotal;
            };
		}
        var store = transaction.objectStore(store_name);
        dataMap.each(function(key,value,index){
            var req = store.put(value);
            PutDataSingleNotify(req,value);
        });
    };
    /**
     * 删除数据
     */
    bbDataBase.DeleteItemByKey = function (store_name, KeyArray, callback) {

        //添加操作
        console.log('删除操作 storeName: ' + store_name);
        var transaction = bbAppDB.db.transaction(store_name, 'readwrite');
        var reqArrayFailed = [];
		var nTotal = KeyArray.length;
        transaction.oncomplete = function (event) {
            callback(true, event, []);
        }
        transaction.onerror = function (event) {
		   /**
			*这里还是需要添加一个过滤的接口
			*/
			if(nTotal === 0)
			{
				callback(false, event, reqArrayFailed);
			}
            
        }
		function DeleteDataSingleNotify(request,Key)
		{
			request.onsuccess = function (event) {
				--nTotal;
            };

            request.onerror = function (event) {
                reqArrayFailed.push(Key);
				--nTotal;
            };
		}
        var store = transaction.objectStore(store_name);
        for (var i = 0; i < KeyArray.length; ++i) {
            var req = store.delete(KeyArray[i]);
            DeleteDataSingleNotify(req,KeyArray[i]);

        }


    };
    /**
     * 获取某个数据根据key
     */
    bbDataBase.GetItemByKey = function (store_name, Key, callback) {
        var req = bbAppDB.db.transaction(store_name).objectStore(store_name).get(Key);
        req.onsuccess = function (event) {
            callback(true, event.target.result);
        };
        req.onerror = function (event) {
            callback(false, event.target.result);
        };
    };
    /**
     * 批量获取某组数据
     */
    bbDataBase.GetItemBatch = function (store_name, KeyArray, callback) {
        var transaction = bbAppDB.db.transaction(store_name, 'readonly');
        var reqArrayFailed = [];
        var reqArraySuccess = [];
        transaction.oncomplete = function (event) {
            callback(true, event, reqArraySuccess,reqArrayFailed);
        }
        transaction.onerror = function (event) {
            callback(false, event, [],reqArrayFailed);
        }
        var store = transaction.objectStore(store_name);
		function GetDataSingle(request,Key)
		{
			    request.onsuccess = function (event) {
				var obj = event.target.result;
				if(obj)
				{
					reqArraySuccess.push(obj);
				}
                else
				{
					reqArrayFailed.push(Key);
				}
                /**
                 * 这里待定，在网上有些例子会close掉，有些不会
                 * 不close好像没有影响，close掉时表示不从数据库构造该对象
                 * 需要拷贝一个新的对象返回。
                 */
                //obj.close();

            };

            request.onerror = function (event) {
                reqArrayFailed.push(Key);
            };
		}
        for (var i = 0; i < KeyArray.length; ++i) {
			 
            var req = store.get(KeyArray[i]);
			GetDataSingle(req,KeyArray[i]);
        }
    };
    /**
     * 获取表中的全部信息
     */
    bbDataBase.GetStoreItems = function (store_name, callback) {
        var objectStore = bbAppDB.db.transaction(store_name).objectStore(store_name);
        if (objectStore) {
            var customers = [];
            var Cursors = objectStore.openCursor();

            Cursors.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    customers.push(cursor.value);
                    cursor.continue();
                } else {
                    callback(true, customers);
                }
            };
            Cursors.onerror = function (event) {
                callback(false, []);
            }
        }
        else
        {
            callback(false,[]);
        }

    }
    /**
     * 待完成，使用索引获取数据
     */
    bbDataBase.GetItemsByIndex = function (store_name,keyIndexArray ,callback)
    {

    }
}));
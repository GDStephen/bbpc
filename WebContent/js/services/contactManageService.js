/**
 * Created by xiaozhao on 2017/4/24.
 * 通讯录服务
 */
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
    var contactManageService = {};
    root.contactManageService = contactManageService;
    factory(contactManageService);

}((typeof window === 'object' && window) || this, function (contactManageService) {
    'use strict';

    // ------------------------------------------私有变量------------------------------------------*/
    /** 缓存的通讯录数据*/
    var _contactList = [];
    var _contactMap = null;
    //缓存页面传递的好友列表监听函数
    var _getContactListListener = null;
    // 单个好友资料更新监听函数 目前只有最近联系人服务的监听函数
    var _updateCallback = [];
    /** 预加载并且缓存通讯录数据*/
    var _token = PubSub.subscribe('LoginStateChange', function (msgid, msgData) {
        //loadContact();
        GetFriendListLogin();
    });


    function GetFriendListLogin() {
        //登陆获取好友列表
        //先从本地数据库查找所有的好友信息
        //再从网上查找所有的好友信息如果有更新，版本号不同，则更新
        //对应的好友列表信息（更新规则如下：当从网络中获取了人员信息之后，如果
        //当前的人员信息有修改，则更新相应的人员信息，如果人员信息没有了，说明
        //好友被删除了，这些人员需要被删除。）
        var FriendListArray = [];
        var MapFriendObj = new Map();
        bbDataBase.GetStoreItems('friendlist', function (bSuccess, ArrayFriendList) {
            if (bSuccess) {
                for (var k = 0; k < ArrayFriendList.length; ++k) {
                    FriendListArray.push(ArrayFriendList[k].jid);
                    MapFriendObj.put(ArrayFriendList[k].jid, ArrayFriendList[k]);
                }

            }
            if (FriendListArray.length === 0) {
                PubSub.publish('contactLoadCompleted', {
                    data: new Map()
                });
            }
            if (FriendListArray.length > 0) {
                addressbookService.GetInfoBatch(FriendListArray, function (strFlagEnd, strGetType, userMap, userMapError) {
                    //if (!result) return result;
                    if (strFlagEnd === 'end') {
                        _contactMap = userMap;
                        console.log('get item Local zhengwei ceshi !!!!!!!! %s',_contactList);
                        var data = transformContactData(userMap);
                        
                        PubSub.publish('contactLoadCompleted', {
                            data: userMap
                        });
                        _contactList = data;
                        
                        if (_getContactListListener) {
                            _getContactListListener(_contactList);
                            console.log('1111111111111好友',_contactList)
                        }

                        // 调用头像服务
                        for (var i = 0; i < userMap.size(); i++) {
                            var dataObj = userMap.data[userMap.keys[i]];
                            if (dataObj.avatar) {
                                // 调用头像服务
                                dataObj.avatarPath = avatarService.getAvatar({
                                        path: dataObj.avatar,
                                        jid: dataObj.jid
                                    },
                                    function (pathObj) {
                                        // 更新缓存
                                        _contactMap.data[pathObj.jid].avatarPath = pathObj.path;
                                        for (var i = 0; i < _contactList.length; i++) {
                                            if (_contactList[i].jid == pathObj.jid) {
                                                _contactList[i].avatarPath = pathObj.path;
                                                // 好友（某个）资料更新回调数组
                                                if (_updateCallback) {
                                                    for (var j = 0; j < _updateCallback.length; j++) {
                                                        _updateCallback[j](_contactList[i])
                                                    }
                                                }

                                                // 通知好友列表界面更新数据
                                                if (_getContactListListener) {
                                                    _getContactListListener(_contactList)
                                                    console.log('2222222222头像',_contactList)

                                                }
                                            }
                                        }

                                    });
                            }
                        }
                        // MsgObj.msgtype = 'FriendListLocal';
                        // MsgObj.data = _contactList;
                        // PubSub.publish('FriendListNotify', MsgObj);
                    }
                });
            }

        });

        BBXmpp.loadRoster(function (result, FriendMap) {
            if (result !== BBXmpp.Status.SUCCESS) return result;
            var FriendListArrayNet = [];
            var FriendDeleted = [];
            var FriendNewAdded = [];
            var jsonObj = {};
            for (var m = 0; m < FriendListArray.length; ++m) {
                jsonObj[FriendListArray[m]] = true;
                var obj = FriendMap.get(FriendListArray[m]);
                if (!obj) {
                    FriendDeleted.push(FriendListArray[m]);
                }
            }
            FriendMap.each(function (key, value, index) {
                FriendListArrayNet.push(key);
                // if (!jsonObj[key]) {
                //     FriendNewAdded.push({
                //         jid: key
                //     });
                // }
            });
            ///////////////////////////////
            //這裏需要將其改成登陸獲取人員信息接口
            addressbookService.GetPerInfoOnLogin(FriendListArrayNet, function (strFlagEnd, strGetType, userMap, userMapError) {
                //if (!result) return result;
                if (strFlagEnd === 'end') {
                    _contactMap = userMap;
                    userMap.each(function (key, value, index) {
                        //FriendListArrayNet.push(key);
                        var FriendObj = MapFriendObj.get(key);
                        if (!FriendObj) {
                            FriendNewAdded.push({
                                jid: key,
                                name: value.name,
                                name_sort: value.name_sort,
                                head_name: value.name_sort.substr(0, 1),
                                accountType:value.accountType
                            });
                        } else {
                            if (FriendObj.name !== value.name) {
                                FriendNewAdded.push({
                                    jid: key,
                                    name: value.name,
                                    name_sort: value.name_sort,
                                    head_name: value.name_sort.substr(0, 1),
                                    accountType:value.accountType
                                });
                            }
                        }
                    });
                    if (FriendNewAdded.length > 0) {
                        //在db中增加需要添加的好友信息
                        bbDataBase.updateDataBath('friendlist', FriendNewAdded, function (bSuccess, event, ArrayTest) {});
                    }
                    var data = transformContactData(userMap);
                    // 调用头像服务
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].avatar) {
                            // 调用头像服务
                            data[i].avatarPath = avatarService.getAvatar({
                                    path: data[i].avatar,
                                    jid: data[i].jid
                                },
                                function (pathObj) {
                                    // 更新缓存
                                    _contactMap.data[pathObj.jid].avatarPath = pathObj.path;
                                    for (var i = 0; i < _contactList.length; i++) {
                                        if (_contactList[i].jid == pathObj.jid) {
                                            _contactList[i].avatarPath = pathObj.path;
                                            // 好友（某个）资料更新回调数组
                                            if (_updateCallback) {
                                                for (var j = 0; j < _updateCallback.length; j++) {
                                                    _updateCallback[j](_contactList[i])
                                                }
                                            }

                                            // 通知控制器更新数据
                                            if (_getContactListListener) {
                                                _getContactListListener(_contactList)
                                                console.log('333333333333头像',_contactList)
                                            }
                                            break;
                                        }
                                    }

                                });
                        }
                    }
                   
                    _contactList = data;
                     console.log('Item gengxin zhengwei ceshi !!!!!!!! %s',_contactList);
                    if (_getContactListListener) {
                        console.log('Item gengxin zhengwei ceshi !!!!!!!! %s',_contactList);
                        _getContactListListener(_contactList);
                    }
                    // MsgObj.msgtype = 'FriendListNet';
                    // MsgObj.data = _contactList;
                    // PubSub.publish('FriendListNotify', MsgObj);
                }

            });
            ///////////////////////////////
            if (FriendDeleted.length > 0) {
                ///從db中將刪除的好友的信息刪掉
                console.log('Item delete zhengwei ceshi !!!!!!!!');
                bbDataBase.DeleteItemByKey('friendlist', FriendDeleted, function (bSuccess, event, ArrayFailed) {});
            }



        });
    }

    /**
     * 转换好友通讯录的数据格式
     * @param contactMap
     * @returns {Array}
     */
    function transformContactData(contactMap) {
        var contactArray = [];
        //通讯录好友排序
        var orderMap = new Map();
        for (var i = 0; i < contactMap.size(); i++) {
            var dataObj = contactMap.data[contactMap.keys[i]];
            orderMap.put(dataObj.name_sort + dataObj.jid, dataObj);
        }
        var orderArray = orderMap.keys.sort();
        var headerName = "";
        for (var j = 0; j < orderArray.length; j++) {
            if (headerName == orderArray[j].substr(0, 1)) {
                contactArray[contactArray.length] = orderMap.get(orderArray[j]);
            } else {
                headerName = orderArray[j].substr(0, 1);
                var obj = {};
                obj.type = 'header';
                obj.name = headerName;
                contactArray[contactArray.length] = obj;
                contactArray[contactArray.length] = orderMap.get(orderArray[j]);
            }
        }
        return contactArray;

    }


    /**
     * 加载好友通讯录
     * @param callBack
     */
    function loadContact(callBack) {
        // 缓存回调函数
         console.log('seted callback zhengwei %s',_contactList);
        _getContactListListener = callBack;
        if (_contactList) {
            if (_getContactListListener)
                _getContactListListener(_contactList);
            return;
        }
        // BBXmpp.loadRoster(function (result, contactMap) {
        //     if (result !== BBXmpp.Status.SUCCESS) return result;
        //     console.log('BBXmpp.loadRoster.callback');

        //     var contactArray = new Array();
        //     contactMap.each(function (key, value, index) {
        //         contactArray[index] = key;
        //     });
        //     /**
        //      * 这里写的好像有些问题
        //      * 需要看一下返回错误应该从
        //      * 回调函数中返回。
        //      */
        //     addressbookService.GetInfoBatch(contactArray, function (strFlagEnd, strGetType, userMap, userMapError) {
        //         //if (!result) return result;
        //         if (strFlagEnd === 'end') {
        //             if (callBack) {
        //                 callBack([]);
        //             }
        //             var data = transformContactData(userMap);
        //             // 调用头像服务
        //             for (var i = 0; i < data.length; i++) {
        //                 if (data[i].avatar) {
        //                     // 此处路径和id不一
        //                     data[i].avatarPath = avatarService.getAvatar({
        //                             path: data[i].avatar,
        //                             jid: data[i].jid
        //                         },
        //                         function (pathObj) {
        //                             // 更新缓存
        //                             _contactMap.data[pathObj.jid].avatarPath = pathObj.path;
        //                             for (var i = 0; i < _contactList.length; i++) {
        //                                 if (_contactList[i].jid == pathObj.jid) {
        //                                     _contactList[i].avatarPath = pathObj.path;
        //                                     // 好友（某个）资料更新回调数组
        //                                     if (_updateCallback) {
        //                                         for (var j = 0; j < _updateCallback.length; j++) {
        //                                             _updateCallback[j](_contactList[i])
        //                                         }
        //                                     }

        //                                     // 通知控制器更新数据
        //                                     if (_getContactListListener) {
        //                                         _getContactListListener()
        //                                     }
        //                                     break;
        //                                 }
        //                             }

        //                         });
        //                 }
        //             }
        //             PubSub.publish('contactLoadCompleted', {
        //                 data: userMap
        //             });
        //             _contactList = data;
        //             _contactMap = userMap;
        //             if (callBack) {
        //                 callBack(_contactList);
        //             }
        //         }

        //     });
        // });
    }

    /**
     *  好友通讯录发生变化的监听函数
     */
    function onContactListChange(callBack) {
        //添加BBXmpp的监听
        BBXmpp.addListener(function () {
            var messageType = arguments[0];
            if (messageType === BBXmpp.Listeners.ROSTER_CHANGE) {
                if (callBack)
                    callBack();
            }
        });
    }

    /**
     * 把当前服务缓存的好友字典提供给外界
     * @returns {*}
     */
    function fetchContactMap() {
        return _contactMap;
    }

    /**
     * 查找某个好友，找到则返回，找不到返回null
     * @param jid 被查找好友的jid
     * @returns {null}
     */
    function getContactById(jid) {
        var contact = _contactMap.get(jid);
        if (contact) {
            return contact;
        } else {
            return null;
        }
    }

    /**
     * 更新好友资料接口(某个好友)
     * @param 回调函数
     * @returns {null}
     */
    function updateContactList(callback) {
        _updateCallback.push(callback);
    }

    /** ------------------------------------------暴露接口 ------------------------------------------*/


    /**
     * 加载好友的通讯录，不包括群
     * @type {loadContact}
     */
    contactManageService.loadContact = loadContact;

    //获取好友通讯录的集合
    contactManageService.fetchContactMap = fetchContactMap;

    //好友通讯录发生变化时候的监听
    contactManageService.onContactListChange = onContactListChange;

    // 更新好友资料,目前最近联系人服务在用
    contactManageService.updateContactList = updateContactList;

    /**
     * 在好友中查找某个联系人
     * @type {getContactById}
     */
    contactManageService.getContactById = getContactById;


}));
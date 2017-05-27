/**
 * Created by xiaozhao on 2017/5/18.
 * 最近联系人的服务管理
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
    var chatListService = {};
    root.chatListService = chatListService;
    factory(chatListService);

}((typeof window === 'object' && window) || this, function (chatListService) {
    'use strict';

    //--------------------------------变量声明区----------------------------------------
    //最近会话jid列表
    var _currentTalkJidList = [];
    //页面传递的最近会话列表监听函数
    var _getChatListListener = null;
    //缓存的最近会话列表
    var _recentChatList = [];

    //记录当前正在聊天的对象jid
    var _currentTalkToJid = null;
    //依赖数据是否加载完毕，包括群信息和好友信息
    var _groupsAndContactsFlag = {
        hasGroupData: false, //群列表数据是否返回
        hasContactData: false //好友数据是否返回
    };

    // 调试的时候用
    window._currentTalkJidList = _currentTalkJidList;
    window._recentChatList = _recentChatList;


    // 注册单个好友更新
    contactManageService.updateContactList(function (data) {
        for (var i = 0; i < _recentChatList.length; i++) {
            if (_recentChatList[i].jid == data.jid) {
                _recentChatList[i] = data;
                break;
            }
        }
        // 通知控制器更新最近联系人列表
        // if (_getChatListListener) {
        //     _getChatListListener(_recentChatList);
        // }

    });


    if (utilService.getRunEnv() === 'DesktopApp') {
        var _token = PubSub.subscribe('LoginStateChange', function (msgid, msgData) {
            GetLoginContactList();
        });
    } else {
        //订阅群服务的数据加载完毕通知，数据返回之后准备把数据传递给页面
        var _groupToken = PubSub.subscribe('groupLoadCompleted', function (msgid, msgData) {
            console.log('最近联系人服务接受到群加载完毕............');
            _groupsAndContactsFlag.hasGroupData = true;
            sendRecentList();
        });

        //订阅好友服务的数据加载完毕通知，数据返回之后准备把数据传递给页面
        var _contactToken = PubSub.subscribe('contactLoadCompleted', function (msgid, msgData) {
            console.log('最近联系人服务接受到好友加载完毕............');
            _groupsAndContactsFlag.hasContactData = true;
            sendRecentList();
        });

    }



    //订阅群相关资料更新通知
    // var _contactToken = PubSub.subscribe('contactLoadCompleted', function (msgid, msgData) {
    //     console.log('最近联系人服务接受到好友加载完毕............');
    //     _groupsAndContactsFlag.hasContactData = true;
    //     sendRecentList();
    // });

    // 订阅更新群头像消息
    var groupUpdate = PubSub.subscribe('GroupNetNotify', function (msgid, msgdata) {
        // 群头像更新
        if (msgdata.MsgType === 'GetGroupavatarSuccess') {
            // 更新缓存
            if (_recentChatList) {
                for (var i = 0; i < _recentChatList.length; i++) {
                    if (_recentChatList[i].jid === msgdata.jid) {
                        _recentChatList[i].avatarPath = msgdata.avatar;
                        break;
                    }
                }
                // 更新页面
                if (_getChatListListener) {
                    _getChatListListener(_recentChatList);
                }
            }

        }
    });

    //--------------------------------私有方法----------------------------------------
    /**
     * 获取最近会话列表，注册页面的监听函数
     * @param idArray  最近会话的简单数据列表，只有jid和type
     * @param callBack 页面注册监听函数，这里是新调用会覆盖之前的监听函数
     */
    function getRecentChatList(callBack) {
        console.log('最近联系人页面在服务执行监听函数注册');
        ///////////////這裏寫法不好。
        /**
         * 执行注册
         */
        _getChatListListener = callBack;
        if (utilService.getRunEnv() === 'DesktopApp') {
            //if (_recentChatList && _recentChatList.length > 0) {
            _getChatListListener(_recentChatList);
            //}

        } else {
            if (_groupsAndContactsFlag.hasGroupData && _groupsAndContactsFlag.hasContactData) {
                if (_recentChatList && _recentChatList.length > 0) {
                    if (_getChatListListener) {
                        _getChatListListener(_recentChatList);
                        return;
                    }
                }
                sendRecentList();
            }
        }

    }

    /**
     * 获取缓存的最近会话列表
     * @param null
     * 
     */
    function getChatListCache() {
        return _recentChatList;
    }



    /**
     * 触发页面注册的函数，把最近会话数据返回
     */
    function sendRecentList() {
        if (_groupsAndContactsFlag.hasGroupData && _groupsAndContactsFlag.hasContactData) {
            var list = [];
            if (_currentTalkJidList) {
                console.log('手机返回的最近联系人列表', _currentTalkJidList)
                var groupMap = groupManageService.fetchGroupMap(),
                    contactMap = contactManageService.fetchContactMap();
                for (var i = 0; i < _currentTalkJidList.length; i++) {
                    var jid = _currentTalkJidList[i].jid;
                    if (jid.indexOf('public-number') > 0) {
                        continue;
                    }
                    var item = getChatItemDetail(_currentTalkJidList[i], groupMap, contactMap);
                    // 剔除空的数据
                    if (item.type === 'groupchat' && item.member) {
                        list.push(item);
                    } else if (item.type === 'chat') {
                        list.push(item);
                    }
                }
            }
            _recentChatList = list;
            if (_getChatListListener) {
                _getChatListListener(_recentChatList);
            }
        }
    }

    ///////////////////////////////////////////////
    //新添加模塊最近聯係人緩存
    function GetLoginContactList() {
        _recentChatList = [];
        if (utilService.getRunEnv() === 'DesktopApp') {
            bbDataBase.GetStoreItems('contactmemberinfo', function (bSuccess, ArrayContactInfo) {
                if (bSuccess && ArrayContactInfo.length > 0) {
                    //這裏對ArrayContactInfo排序，然後 
                    ArrayContactInfo.sort(function (a, b) {
                        if (a.msgTopFlag && b.msgTopFlag) {
                            if (a.msgFullTime && b.msgFullTime) {
                                return a.msgFullTime < b.msgFullTime;
                            } else if (a.msgFullTime) {
                                return false;
                            } else {
                                return true;
                            }
                        } else if ((!a.msgTopFlag) && (!b.msgTopFlag)) {
                            if (a.msgFullTime && b.msgFullTime) {
                                return a.msgFullTime < b.msgFullTime;
                            } else if (a.msgFullTime) {
                                return false;
                            } else {
                                return true;
                            }
                        } else if (a.msgdata) {
                            return false;
                        } else {
                            return true;
                        }
                        //return a.msgFullTime < b.msgFullTime;
                    });
                    for (var i = 0; i < ArrayContactInfo.length; ++i) {
                        _recentChatList.push(ArrayContactInfo[i]);
                    }
                    // 触发页面渲染函数
                    if(_getChatListListener){
                        _getChatListListener(_recentChatList);
                    }
                } else {

                }
            });
        } else {
            //sendRecentList();
        }
    }

    function UpdateContactListToDB(ContactItem) {
        var Arraytemp = [];
        Arraytemp.push(ContactItem);
        bbDataBase.updateDataBath('contactmemberinfo', Arraytemp, function (bSuccess, event, ArrayTest) {});
    }

    function UpdateContactListToDBBach(ContactItemArray) {
        bbDataBase.updateDataBath('contactmemberinfo', ContactItemArray, function (bSuccess, event, ArrayTest) {});
    }

    //////////////////////////////////////////////
    /**
     * 赋值方法，生成最近会话列表中的每一项
     * @param item 最近会话列表的某一项的简单信息，只有jid和type
     * @param groupMap  群的数据字典
     * @param contactMap  好友的数据字典
     * @returns {{}} 返回最近会话列表中的某一项，格式如下：
     * {
     *      jid：
     *      type:chat或者groupchat
     *      count:未读消息数
     *      name：好友名称
     *      nickName：暂未用到
     *      accountType：用户类型：2为安邦好友；1位非安邦好友；""为群
     *      isAt：true或者false
     *      avatar：头像
     *      message：消息内容
     *      subject：chat，语音，红包等
     *      msgTime：19:58
     * }
     */
    function getChatItemDetail(item, groupMap, contactMap) {
        var jid = item.jid;
        var chatInfo = {};
        if (jid.indexOf('@circle.ab-insurance.com') > 0) {
            jid = jid.split('@')[0] + '@circle-muc.ab-insurance.com';
        }

        chatInfo.jid = jid;
        chatInfo.type = item.type;
        chatInfo.count = 0;
        chatInfo.msgTime = '';
        chatInfo.subject = 'chat';
        chatInfo.nickName = "";
        chatInfo.isAt = false;
        chatInfo.message = "";
        setAttachInfo(chatInfo, groupMap, contactMap);
        return chatInfo;
    }

    function GetPersionInfoByJid(jidItem, callBack) {
        addressbookService.GetInfoBatch([jidItem], function (strFlagEnd, strGetType, userMap, userMapError) {
            if (strFlagEnd === 'end') {
                var persionData = userMap.get(jidItem);
                callBack(persionData);
            }
        });

    }
    /**
     * 辅助方法，用来生成最近会话列表中的每一项其他数据信息
     * @param chatInfo 最近会话列表中的某一项
     * @param groupMap 群的数据字典
     * @param contactMap    好友的数据字典
     */
    function setAttachInfo(chatInfo, groupMap, contactMap) {
        var avatarPath = '',
            jid = chatInfo.jid;
        if (chatInfo.type === 'chat') {
            if (chatInfo.avatarPath) {
                avatarPath = chatInfo.avatarPath;
            } else {
                avatarPath = 'imgs/nohead.gif';
            }
            chatInfo.avatarPath = avatarPath;
            var contact = contactMap.get(jid);
            if (contact) {
                chatInfo.name = contact.displayName;
                chatInfo.avatarPath = contact.avatarPath;
                chatInfo.accountType = contact.accountType;
            }
        } //群聊头像
        else if (chatInfo.type === 'groupchat') {
            if (chatInfo.avatarPath) {
                avatarPath = chatInfo.avatarPath;
            } else {
                avatarPath = 'imgs/grouphead40.jpg';
            }
            chatInfo.avatarPath = avatarPath;
            var group = groupMap.get(jid);
            if (group) {
                chatInfo.name = group.name;
                chatInfo.avatarPath = group.avatarPath;
                chatInfo.member = group.member;
            }
        }
    }




    /**
     * 更新最近联系人
     * @param toJid 聊天的对象
     */
    function updateRecentChatList(toJid, chatItem, isAt) {
        if (isAt === undefined)
            isAt = false;
        if (isAt === true) {
            chatItem.message = "<span style='color:red'>[有人@我]：</span>" + chatItem.message;
            chatItem.isAt = true;
        }
        // 判断是群还是好友 获取详细信息
        var chatObj = {};
        if (chatItem.type === 'chat') {
            chatObj = contactManageService.fetchContactMap().get(toJid);
        } else if (chatItem.type === 'groupchat') {
            chatObj = groupManageService.fetchGroupMap().get(toJid)
        }

        if (_recentChatList && _recentChatList.length > 0) {
            //如果聊天的对象本身就是第一个，则只是更新部分属性，不更新顺序
            var firstItem = _recentChatList[0];
            var toItem = null;
            if (firstItem.jid === toJid) {
                toItem = firstItem;
                toItem.msgFullTime = chatItem.msgFullTime;
                if(chatItem.message)
                toItem.message = chatItem.message;
                if (chatItem.displayMessage)
                    toItem.displayMessage = chatItem.displayMessage;
                if (chatItem.count > 0)
                    toItem.count += chatItem.count;
                // 消息需要后续再加判断
                if (chatItem.msgTime && chatItem.message)
                    toItem.msgTime = chatItem.msgTime;
                UpdateContactListToDB(toItem);
            } else {
                // 如果在最近联系人列表中已经存在，删除
                for (var i = 0; i < _recentChatList.length; i++) {
                    if (_recentChatList[i].jid === toJid) {
                        toItem = _recentChatList[i];
                        _recentChatList.splice(i, 1);
                        _currentTalkJidList.splice(i, 1)
                        break;
                    }
                }
                //如果在最近联系人列表中已经存在
                if (toItem) {
                    if(chatItem.message)
                        toItem.message = chatItem.message;
                        toItem.msgFullTime = chatItem.msgFullTime;
                    if (chatItem.displayMessage)
                        toItem.displayMessage = chatItem.displayMessage;
                    if (chatItem.count > 0)
                        toItem.count += chatItem.count;
                    if (chatItem.msgTime  && chatItem.message)
                        toItem.msgTime = chatItem.msgTime;
                    _recentChatList.unshift(toItem);
                    UpdateContactListToDB(toItem);
                    // 更新最近联系人jid数组

                    updateCurrentTalkJidList({
                        jid: toItem.jid,
                        type: toItem.type
                    });
                } else { //如果在最近联系人列表中不存在，则添加到列表中
                    var newChat = {
                        jid: toJid,
                        avatar: chatObj.avatar,
                        avatarPath: chatObj.avatarPath,
                        name: chatObj.name,
                        accountType: chatObj.accountType,
                        message: chatItem.message,
                        isAt: isAt,
                        subject: chatObj.subject,
                        type: chatObj.type,
                        msgTime: chatItem.msgTime,
                        msgFullTime: chatItem.msgFullTime
                    };
                    UpdateContactListToDB(newChat);
                    _recentChatList.unshift(newChat);
                    // 更新最近联系人jid数组
                    updateCurrentTalkJidList({
                        jid: newChat.jid,
                        type: newChat.type
                    });
                }
            }
            // 最近联系人数组为空
        } else {
            var newChat = {
                jid: toJid,
                avatar: chatObj.avatar,
                avatarPath: chatObj.avatarPath,
                name: chatObj.name,
                accountType: chatObj.accountType,
                message: chatItem.message,
                isAt: isAt,
                subject: chatObj.subject,
                type: chatObj.type,
                msgTime: chatItem.msgTime,
                msgFullTime: chatItem.msgFullTime
            };

            UpdateContactListToDB(newChat);
            _recentChatList.unshift(newChat);
            // 更新最近联系人jid数组
            updateCurrentTalkJidList({
                jid: newChat.jid,
                type: newChat.type
            });

        }
        // 设置当前聊天人的jid
        setCurrentTalkToJid(toJid);
        // 更新界面
        if (_getChatListListener) {
            _getChatListListener(_recentChatList)
        }
    }



    /**
     * 把最近联系人中的某个人未读消息数设置为0
     * @param jid
     */
    function setUnReadZero(jid) {
        for (var i = 0; i < _recentChatList.length; i++) {
            if (_recentChatList[i].jid === jid) {
                _recentChatList[i].count = 0;
                break;
            }
        }
    }


    /**
     *  删除最近联系人的某个人
     * @param deleteJid 要删除的联系人的jid
     */
    function removeRecentChatItem(deleteJid) {
        if (_recentChatList && _recentChatList.length > 0) {
            for (var i = 0; i < _recentChatList.length; i++) {
                if (_recentChatList[i].jid === deleteJid) {
                    _recentChatList.splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     *  获取当前正在聊天的对象jid
     * @param null
     */
    function getCurrentTalkToJid() {
        return _currentTalkToJid;
    }

    /**
     *  设置当前正在聊天的对象jid
     * @param toJid 正在聊天的对象jid
     */
    function setCurrentTalkToJid(toJid) {
        _currentTalkToJid = toJid;
    }

    /**
     *  获取最近联系人jid数组
     * @param null
     */
    function getCurrentTalkJidList() {
        return _currentTalkJidList;
    }

    /**
     *  更新最近联系人jid数组
     * @param null
     */
    function updateCurrentTalkJidList(jid) {
        _currentTalkJidList.unshift(jid);
    }

    //--------------------------------暴露接口----------------------------------------
    /**
     * 获取最近会话列表
     * @type {getRecentChatList}
     */
    chatListService.getRecentChatList = getRecentChatList;

    //更新最近联系人的列表
    chatListService.updateRecentChatList = updateRecentChatList;

    /**
     * 把未读消息数设置为0
     * @type {setUnReadZero}
     */
    chatListService.setUnReadZero = setUnReadZero;


    //删除最近联系人的某个人
    chatListService.removeRecentChatItem = removeRecentChatItem;

    // 获取缓存的最近会话列表
    chatListService.getChatListCache = getChatListCache;

    //获取当前正在聊天的对象jid
    chatListService.getCurrentTalkToJid = getCurrentTalkToJid;

    //设置当前正在聊天的对象jid
    chatListService.setCurrentTalkToJid = setCurrentTalkToJid;

    // 获取最近联系人jid数组
    chatListService.getCurrentTalkJidList = getCurrentTalkJidList;

    // 更新最近联系人jid数组
    chatListService.updateCurrentTalkJidList = updateCurrentTalkJidList;
    chatListService.GetPersionInfoByJid = GetPersionInfoByJid;

    // 设置最近联系人jid数组 临时用，后期从数据库中取
    chatListService.SetCurrentTalkJidList = function (jidArray) {
        _currentTalkJidList = jidArray;
    };

}));
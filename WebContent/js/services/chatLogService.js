/**
 * Created by xiaozhao on 2017/4/25.
 *
 * 聊天记录管理
 *
 *
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
    var chatLogService = {};
    root.chatLogService = chatLogService;
    factory(chatLogService);

}(( typeof window === 'object' && window ) || this, function (chatLogService) {
    'use strict';

    //--------------------------------变量声明区----------------------------------------

    // 聊天记录字典
    var _chatLogMap = new Map();
    var _storeName = 'chatlog';
    //--------------------------------私有方法----------------------------------------

    /**
     * 添加聊天记录到聊天记录字典中
     * @param jid 聊天对象id
     * @param chatLog 聊天记录详细信息
     * {
     *      uuid
     *      jid
     *      message
     *      subject
     *      from_me
     *      ackflag
     *      msgTime
     *      avatar
     * }
     */
    function addChatLog(jid, chatLog) {
        // var queryChatLog = _chatLogMap.get(jid);
        // if (typeof queryChatLog == 'object') {
        //     var index = queryChatLog.data.length;
        //     queryChatLog.data[index] = chatLog;
        // } else {
        //     var chatLogObj = {};
        //     chatLogObj.data = new Array();
        //     chatLogObj.data[0] = chatLog;
        //     _chatLogMap.put(jid, chatLogObj);
        // }


        /**---------------------------------插入数据库---------------------------------------*/
        var newMessageLog = {
            uuid: chatLog.uuid,
            talkJid: jid,
            fromJid: chatLog.jid,
            from_me: chatLog.from_me,
            message: chatLog.message,
            msgTime: chatLog.msgTime,
            // avatarPath: chatLog.avatarPath,
            // name: chatLog.name,
            msgFullTime: chatLog.msgFullTime,
            createTime: chatLog.createTime,
            subject: chatLog.subject,
            type: chatLog.type,
            ackflag: chatLog.ackflag,
            atArray: chatLog.atArray,
            fileLocalPath: chatLog.fileUrl,
            fileHttpPath: chatLog.link,
            isRecall: 0,
            isRead: 1,
            isFileUploadOk: 1,
            size: chatLog.size,
        };
        //调用数据库
        bbDataBase.updateDataBath(_storeName, [newMessageLog], function () {

        });
    }


    /**
     * 获取聊天记录
     * @param jid 聊天对象id
     * @returns {Array} 返回聊天记录列表
     */
    function getChatLogList(jid, callBack) {
        /* var queryChatLog = _chatLogMap.get(jid);
         var chatLogList = [];
         if (typeof queryChatLog == 'object') {
         for (var i = 0; i < queryChatLog.data.length; i++) {
         chatLogList.push(queryChatLog.data[i]);
         }
         }
         return chatLogList;*/

        bbDataBase.GetStoreItems(_storeName, function (isSuccess, data) {
            var chatLogList = [], userJidArr = [];
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                if (item.talkJid !== jid) continue;
                var chatLog = {
                    uuid: item.uuid,
                    type: item.type,
                    jid: item.fromJid,
                    count: 0,
                    message: item.message,
                    subject: item.subject,
                    from_me: item.from_me,
                    ackflag: item.ackflag,
                    msgTime: formatMsgTime(item),
                    msgFullTime: item.msgFullTime,
                    createTime: item.createTime,
                    // avatarPath: item.avatarPath,
                    // name: item.name,
                    link: item.fileHttpPath,
                    atArray: item.atArray,
                    fileUrl: item.fileLocalPath
                };
                chatLogList.push(chatLog);
                userJidArr.push(item.fromJid);
            }
            chatLogList.sort(function (a, b) {
                return a.createTime - b.createTime;
            });
            if (callBack)
                callBack(chatLogList);
            /* addressbookService.GetInfoBatch(userJidArr, function (strTypeFlag, strGetFlag, UseInfoMap, UseMapErr) {
             if (strTypeFlag === 'end') {
             for(var i=0;i<chatLogList.length;i++){
             var msgLog = chatLogList[i];
             msgLog.avatarPath = UseInfoMap.get(msgLog.jid).avatarPath;
             msgLog.name = UseInfoMap.get(msgLog.jid).name;
             }
             if (callBack)
             callBack(chatLogList);
             }
             });
             */
        });
    }

    /**
     * 处理日志的时间戳，如果是今天就返回 hh:mm，否则返回yyyy年m月d日 hh：mm
     * @param item
     * @returns {*}
     */
    function formatMsgTime(item) {
        if (!item.msgTime) return '';
        var now = new Date();
        var today = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };
        var timeStamp = new Date(item.createTime);
        var msgTimeObj = {
            year: timeStamp.getFullYear(),
            month: timeStamp.getMonth() + 1,
            day: timeStamp.getDate(),
            hour: timeStamp.getHours(),
            min: timeStamp.getMinutes()
        };
        if (msgTimeObj.hour < 10)
            msgTimeObj.hour = '0' + msgTimeObj.hour;
        if (msgTimeObj.min < 10)
            msgTimeObj.min = '0' + msgTimeObj.min;

        if (msgTimeObj.year === today.year
            && msgTimeObj.month === today.month
            && msgTimeObj.day === today.day) {
            return msgTimeObj.hour + ':' + msgTimeObj.min;
        } else
            return msgTimeObj.year + '年' + msgTimeObj.month + '月' + msgTimeObj.day + '日 ' + msgTimeObj.hour + ':' + msgTimeObj.min;


    }

    /**
     * 获取房间或单聊最后一条消息的时间
     * @param jid
     * @returns {Number}
     *
     */
    function getLastMessageTime(jid) {
        var chatLogArray = _chatLogMap.get(jid);
        if (chatLogArray && chatLogArray.data) {
            for (var i = chatLogArray.data.length - 1; i > -1; i--) {
                if (chatLogArray.data[i].msgTime !== '') {
                    return parseInt(chatLogArray.data[i].msgTime.replace(":", ""), 10);
                }
            }
        }
        return 0;
    }

    /**
     * 本地是否已经有聊天记录。用于从客户端在某个群里发了消息只有，服务器推送过来消息的处理，防止在页面生成二份
     * @param chatLog
     */
    function hasLocalChatLog(chatLog) {
        /*  var queryChatLog = _chatLogMap.get(chatLog.jid);
         if (queryChatLog && queryChatLog.data) {
         for (var i = queryChatLog.data.length - 1; i > -1; i--) {
         if (queryChatLog.data[i].uuid === chatLog.uuid) {
         return true;
         }
         }
         }
         return false;*/


    }

    /**
     * 更新聊天记录中的某个聊天消息的消息回执状态值，标示发送成功还是超时
     * @param jid
     * @param uuid
     * @param ackflag
     */
    function updateAckflag(jid, uuid, ackflag) {
        /* var queryChatLogArray = _chatLogMap.get(jid);
         if (queryChatLogArray && queryChatLogArray.data && queryChatLogArray.data.length) {
         for (var i = 0; i < queryChatLogArray.data.length; i++) {
         if (queryChatLogArray.data[i].uuid === uuid)
         queryChatLogArray.data[i].ackflag = ackflag;
         }
         }*/

        bbDataBase.GetItemByKey(_storeName, uuid, function (isSuccess, data) {
            if (isSuccess === true) {
                if (data) {
                    data.ackflag = ackflag;
                    bbDataBase.updateDataBath(_storeName, [data], function () {
                        console.log('聊天记录更新ackflag完成');
                    });
                }
            }
        });
    }

    /**
     * 删除一条聊天记录
     * @param uuid
     * @param jid
     */
    function deleteChatLog(uuid, jid) {
        var queryChatLogArray = _chatLogMap.get(jid);
        var index = -1;
        if (queryChatLogArray && queryChatLogArray.data && queryChatLogArray.data.length) {
            for (var i = 0; i < queryChatLogArray.data.length; i++) {
                if (queryChatLogArray.data[i].uuid === uuid) {
                    index = i;
                    break;
                }
            }
            if (index !== -1)
                queryChatLogArray.data.splice(index, 1);
        }

    }

    function recallChatLog(uuid) {

    }

    //--------------------------------暴露接口----------------------------------------

    //工具方法，获取最后的聊天时间戳
    chatLogService.getLastMessageTime = getLastMessageTime;

    //添加聊天记录
    chatLogService.addChatLog = addChatLog;

    //根据最近联系人获取聊天记录
    chatLogService.getChatLogList = getChatLogList;

    //是否有过本地聊天的记录
    chatLogService.hasLocalChatLog = hasLocalChatLog;

    //更新聊天记录中是否发送成功
    chatLogService.updateAckflag = updateAckflag;

    //删除某一条聊天记录
    chatLogService.deleteChatLog = deleteChatLog;

    //撤回某一条聊天记录
    chatLogService.recallChatLog = recallChatLog;

}));



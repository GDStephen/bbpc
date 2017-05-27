/**
 * 聊天区域的主控制器，包括：
 * 1.聊天记录区域 chatLogController控制器代理部分功能
 * 2.对话框输入区 inputController控制器代理部分功能
 * 3.聊天外框，聊天对象的名字，群的成员面板
 */
indexModule.controller('chatController', ['$scope', '$timeout', function ($scope, $timeout) {

    //----------------------------------------变量------------------------------------------

    //在切换新聊天对象时，上一次聊天的对象
    var _lastChatPerson = {};
    var _lastMsgCreateTime = null;
    var _chatContentContainerId = 'wholeScroll';
    /**
     * 聊天草稿存储字典
     * @type {{}}
     * {
     *      "183450@ab-insurance.com":{
     *          message:'你好',
     *          atArray:[{
     *              "183450@ab-insurance.com":"@波波"
     *          }]
     *      }
     * }
     */
    var _draftDictionary = {};
    var _groupMemberMap = {};

    /**
     * 当前聊天的at成员字典
     * @type {Array}
     * @private
     */
    var _atMemberArray = [];

    //----------------------------------------初始化------------------------------------------
    init();

    //页面初始化
    function init() {
        setNow();
        //表情面板是否显示
        $scope.showEmojPanel = false;
        //at群成员的面板是否显示
        $scope.showAtMemberPanel = false;
        //预览图片是否显示
        $scope.showPreviewImage = false;
        //是否显示群成员面板
        $scope.isShowChatRoomMembers = false;
        //聊天记录数组
        $scope.messageList = [];
        //当前聊天类型对象：单聊还是群聊
        $scope.currentInfo = null;

        //订阅最近联系人的点击事件
        $scope.$on('getCurrentChatData', onRecentChatChange);

        // 注册消息变化监听
        messageManageService.onReceiveMessage(function (data) {
            console.log('控制器----接收到消息');
            $timeout(function () {
                onReceiveMessage(data);
            }, 10);
        });

        // 注册消息回执监听
        messageManageService.onAckflagChange(function (arg) {
            console.log('控制器----消息回执返回');
            $timeout(function () {
                onAckChange(arg);
            }, 10);
        });
    }


    //----------------------------------------页面流程------------------------------------------

    /**
     * 在最近联系人列表中点击某人之后，此方法执行
     */
    function onRecentChatChange(e, chatPerson) {
        //如果聊天对象未发生变化，停止执行
        if (_lastChatPerson.jid === chatPerson.jid)
            return;
        setNow();

        _groupMemberMap = {};
        _groupMemberMap[chatPerson.jid] = {
            name: chatPerson.name,
            avatarPath: chatPerson.avatarPath,
            accountType: chatPerson.accountType
        };
        var current = getAppUserInfo();
        _groupMemberMap[current.userId] = {
            name: current.userName,
            avatarPath: current.userAvatar
        };
        $scope.talkingAvatar = chatPerson.avatarPath;
        $scope.talkingAccountType = chatPerson.accountType;
        $scope.currentInfo = chatPerson;
        $scope.hasChatPerson = true;
        $scope.titleId = chatPerson.jid;
        $scope.titleName = chatPerson.name;
        $scope.titleType = chatPerson.type;
        $scope.currentChat = true;
        $scope.isDisplayName = false;
        $scope.isShowChatRoomMembers = false;
        $scope.groupMemberArray = chatPerson.member;
        setGroupMembersAvatar();
        saveDraft(_lastChatPerson.jid);
        _lastChatPerson = chatPerson;

        //读取草稿
        var draft = _draftDictionary[chatPerson.jid];
        if (draft) {
            angular.element('#editArea').html(draft);
        } else {
            angular.element('#editArea').html('');
        }
        var draftAtArray = _draftDictionary[chatPerson.jid + '-atArray'];
        if (draftAtArray) {
            _atMemberArray = draftAtArray;
        } else {
            _atMemberArray = [];
        }
        getChatLogList(chatPerson.jid);

    }


    //获取群成员的头像信息
    function setGroupMembersAvatar() {
        /*if ($scope.chatMember) {
         for (var i = 0, len = $scope.groupMemberArray.length; i < len; i++) {
         var member = $scope.chatMember[i];
         member.userinfo.avatarPath = avatarService.getAvatar({
         jid: member.jid,
         path: member.userinfo.avatar
         }, function (pathObj) {
         if (pathObj.statusCode === 200) {
         $timeout(function () {
         member.userinfo.avatarPath = pathObj.path;
         }, 0)
         }
         })
         }
         }*/
        if ($scope.groupMemberArray) {
            var jidArray = [];
            for (var i = 0, len = $scope.groupMemberArray.length; i < len; i++) {
                var member = $scope.groupMemberArray[i];
                jidArray.push(member.jid);
            }
            addressbookService.GetInfoBatch(jidArray, function (onOrEndFlag, isLocalFlag, UserInfoMap, ErrorMap) {
                if (onOrEndFlag === 'end') {
                    angular.forEach($scope.groupMemberArray, function (item, index) {
                        item.avatar = UserInfoMap.get(item.jid).avatar;
                        item.avatarPath = avatarService.getAvatar({
                            jid: item.jid,
                            path: item.avatar
                        }, function (pathObj) {
                            if (pathObj.statusCode === 200) {
                                $timeout(function () {
                                    item.avatarPath = pathObj.path;
                                    _groupMemberMap[jid].avatarPath = pathObj.path;
                                }, 0)
                            }
                        });
                        _groupMemberMap[item.jid] = {
                            name: item.name,
                            avatarPath: item.avatarPath
                        };
                    });
                }
            });
        }

    }

    /**
     * 发送消息处理方法
     */
    $scope.sendMessage = function () {

        var messageContent = angular.element('#editArea').html();
        //校验聊天内容的合法性，如果聊天内容为空或者回车，停止执行
        if ($scope.isChatContentEmpty()) {
            return;
        }

        var to = _lastChatPerson.jid;//聊天对象的jid
        var type = _lastChatPerson.type;//聊天类型，单聊还是群聊
        var from = getAppUserInfo().userId; //登录人的jid

        //处理聊天对话框中的内容，返回一个保存于聊天记录的格式和表情格式
        var transformObj = messageManageService.formatChatContent(messageContent);
        messageContent = transformObj.message;
        var msgForSending = transformObj.msgForSending;
        var uuid = Math.uuid();
        var param = {
            uuid: uuid,
            message: msgForSending,
            isGroupChat: type,
            type: type,
            fromJid: from,
            toJid: to,
            atMembers: _atMemberArray//at 成员的数组 需要传值
        };
        //调用消息服务的发送消息接口，发送完毕之后在回调中处理同步页面
        messageManageService.sendMessage(param, function (arg) {
            clearAfterSending();
            //添加聊天记录
            var chatLog = {
                uuid: uuid,
                type: type,
                jid: from,
                count: 0,
                message: messageContent,
                subject: 'chat',
                from_me: true,
                ackflag: 0,
                msgTime: getMsgTime(),
                msgFullTime: +new Date(),
                createTime: +new Date(),
                // avatar: getAppUserInfo().userAvatar,
                avatarPath: getAppUserInfo().userAvatar,
                atArray: _atMemberArray
            };
            if (arg && arg.netError) {
                chatLog.ackflag = 2;
            }
            chatListService.updateRecentChatList(to, chatLog);   //更新最近联系人列表
            chatLogService.addChatLog(to, chatLog);   //添加聊天记录
            $scope.sendUIMessage(to, chatLog);
        });
    };

    /**
     * 接受到服务器推送的消息后的处理函数
     * @param data
     *  {
         *     ackflag:1,
         *     fileType:"pdf",
         *     jid:"17442@ab-insurance.com",
         *     link:
         *     message:"这是一个消息",
         *     msgTime:"13:48",
         *     size:"1.95M",
         *     subject:"document/chat",
         *     uuid:"A8D01BF720FA4B5595F9650B22F5CFA3"
         * }
     */
    function onReceiveMessage(data) {
        console.log('控制器：接受到推送消息');
        var userChatInfo = getAppUserInfo();
        var to = userChatInfo.currentTalkJid;
        var timeStamp = commonService.getTimestamp(data.msgTime);

        //消息内容中的表情字符串转换为html表情
        var chatLog = {
            uuid: data.uuid,
            jid: data.jid,
            type: data.type,
            message: data.message,
            subject: data.subject,
            from_me: false,
            ackflag: data.ackflag,
            msgTime: getMsgTime(timeStamp),
            msgFullTime: timeStamp,
            createTime: +new Date(),
            avatarPath: userChatInfo.userAvatar,
            link: config.url.tfsUrl + data.link,
            isNetMsg: true
        };
        if (data.subject === 'chat')
            chatLog.message = commonService.getStringForExpression(data.message);
        else if (data.subject === 'image') {
            chatLog.displayMessage = '[图片]';
        } else if (data.subject === 'document') {
            chatLog.displayMessage = '[文件]';
        }

        //判断消息是否用当前窗口接收
        var fromJid = data.jid;
        var msgToJid = data.toJid;

        if (data.type === 'chat') {
            chatMessageReceive(userChatInfo, fromJid, to, msgToJid, chatLog, data);
        }
        else {
            groupMessageReceive(userChatInfo, fromJid, to, msgToJid, chatLog, data);
        }
    }

    /**
     * 接收到单聊消息处理
     * @param userChatInfo 当前用户对象信息
     * @param fromJid 返回的消息对象中的fromJid
     * @param to 聊天对象的jid
     * @param msgToJid 返回的消息对象中的toJid
     * @param chatLog 消息内容对象
     */
    function chatMessageReceive(userChatInfo, fromJid, to, msgToJid, chatLog, data) {
        if (userChatInfo.currentTalkJid == fromJid
            || (fromJid == userChatInfo.userId && msgToJid == userChatInfo.currentTalkJid)) {
            receiveMessageInCurrentWindow(to, chatLog, userChatInfo);
        }
        else {
            receiveMessageInRecentChatList(chatLog, msgToJid, userChatInfo);
        }


    }

    //接收群发的消息
    function groupMessageReceive(userChatInfo, fromJid, talkingToJid, msgToJid, chatLog, data) {
        chatLog.groupId = chatLog.jid;
        var memberJid = data.memberJid;
        var isFromMe = false;
        var isAt = false;
        if (data.atJid) {
            var tempArr = data.atJid.split(',');
            if (tempArr && tempArr.length) {
                for (var i = 0; i < tempArr.length; i++) {
                    if (tempArr[i] === userChatInfo.userId) {
                        isAt = true;
                        break;
                    }
                }
            }
        }
        //本人在手机端发的消息。我发给群，群再广播给我。期间会接收到二次消息，其中首次消息不予处理。
        if (fromJid === userChatInfo.userId)return;

        //本人在客户端发消息给群之后，群会再次把消息广播回来。如果是这种情况则停止执行
        if (memberJid === userChatInfo.userId) {
            isFromMe = true;
            chatLog.from_me = isFromMe;
            if (hasLocalChatLog(chatLog)) {
                return;
            }
        }


        //第二次消息判断消息是否为本人所发
        if (isFromMe) {
            chatLog.from_me = true;
            chatLog.name = userChatInfo.userName;
            chatLog.jid = userChatInfo.userId;
        }
        else { //其他人所发的消息
            chatLog.avatarPath = _groupMemberMap[memberJid].avatarPath;
            chatLog.name = _groupMemberMap[memberJid].name;
            // commonService.getUserInfoByJid(memberJid, function (data) {
            //     chatLog.avatarPath = data.avatarPath;
            //     chatLog.avatar = data.avatar;
            //     chatLog.name = data.name;
            // });

            chatLog.jid = memberJid;
        }

        //当前窗口接收
        if (fromJid === userChatInfo.currentTalkJid) {
            showInCurrentWindow();
        }
        else {
            showInRecentChatList();
        }


        function showInCurrentWindow() {
            $scope.sendUIMessage(talkingToJid, chatLog);
            chatLogService.addChatLog(talkingToJid, chatLog);//添加聊天记录
            chatListService.updateRecentChatList(talkingToJid, chatLog, isAt);   //更新最近联系人列表
        }

        function showInRecentChatList() {
            if (isFromMe) {
                chatLog.from_me = true;
            }
            else {
                chatLog.count = 1;
            }
            chatLogService.addChatLog(fromJid, chatLog);//添加聊天记录
            chatListService.updateRecentChatList(fromJid, chatLog);   //更新最近联系人列表
        }
    }

    /**
     * 消息在当前窗口接收
     * @param to
     * @param chatLog
     * @param userChatInfo
     */
    function receiveMessageInCurrentWindow(to, chatLog, userChatInfo) {
        //   $scope.sendUIMessage(to, chatLog);
        if (userChatInfo.userId === chatLog.jid) {
            chatLog.from_me = true;
        } else {
            commonService.getUserInfoByJid(chatLog.jid, function (data) {
                chatLog.avatar = data.avatar;
                chatLog.name = data.name;
                var pathObj = avatarService.getAvatar({
                    path: chatLog.avatar,
                    jid: chatLog.jid
                }, function (data) {
                    chatLog.avatarPath = data.path;
                });
                if (pathObj) {
                    chatLog.avatarPath = pathObj;
                }
            });

        }
        $scope.messageList.push(chatLog);
        chatLogService.addChatLog(to, chatLog);//添加聊天记录
        chatListService.updateRecentChatList(to, chatLog);   //更新最近联系人列表
    }

    /**
     * 不是当前聊天人发送的消息。更新到最近联系人上面，显示未读消息数，消息内容，消息时间
     * @param chatLog
     */
    function receiveMessageInRecentChatList(chatLog, msgToJid, userChatInfo) {
        //消息为本人所发
        var updatedJid = null;
        if (chatLog.jid === userChatInfo.userId) {
            chatLog.from_me = true;
            updatedJid = msgToJid;
        }
        else {
            commonService.getUserInfoByJid(chatLog.jid, function (data) {
                chatLog.avatarPath = data.avatarPath;
                chatLog.avatar = data.avatar;
                chatLog.name = data.name;
            });
            // chatLog.avatarPath = _groupMemberMap[chatLog.jid].avatarPath;
            // chatLog.name = _groupMemberMap[chatLog.jid].name;

            chatLog.count = 1;
            updatedJid = chatLog.jid;
        }
        chatLogService.addChatLog(updatedJid, chatLog);//添加聊天记录
        chatListService.updateRecentChatList(updatedJid, chatLog);   //更新最近联系人列表
    }

    /**
     * 服务的消息回执之后处理函数，消息是否发送成功，是否已读
     * 接收到回执之后更新聊天记录中的ackflag状态值
     * @param arg 一个数组
     *  [{
     *      jid:聊天对象
     *      uuid:消息的uuid
     *      ackflag：消息发送成功还是超时
     *  },
     *  ...
     *  ]
     */
    function onAckChange(arg) {
        var toJid = getAppUserInfo().currentTalkJid;
        for (var i = 0, len = arg.length; i < len; i++) {
            var item = arg[i];
            //更新聊天记录中的标识
            chatLogService.updateAckflag(item.jid, item.uuid, item.ackflag);

            //如果是当前聊天窗口的回执信息，更新UI
            if (item.jid === toJid) {
                updateUIAckFlag(item);
            }
        }
    }

    /**
     * 更新聊天记录区域的消息发送状态
     * @param item
     */
    function updateUIAckFlag(item) {
        for (var i = 0; i < $scope.messageList.length; i++) {
            if ($scope.messageList[i].uuid === item.uuid) {
                $scope.messageList[i].ackflag = item.ackflag;
            }
        }
    }

    /**
     * 控制群成员面版的显示和隐藏，在群成员面板打开之后，点击程序其他区域关闭面板
     */
    $scope.showChatRoomMembers = function () {
        $scope.isShowChatRoomMembers = !$scope.isShowChatRoomMembers;
        angular.element(document).bind("click", function (e) {
            var target = angular.element(e.target);
            if (target.closest('.web_wechat_up_icon').length == 0
                && target.closest('.web_wechat_down_icon').length !== 1
                && target.closest('#mmpop_chatroom_members .members').length < 1) {
                $scope.isShowChatRoomMembers = false;
                $scope.switch.isPersionMs = false;
                $scope.$apply();
                angular.element(document).unbind('click');
            }
            e.stopImmediatePropagation();
        })
    };

    //保存at成员到字典中，供子控制器调用
    $scope.addAtMember = function (jid, atName) {
        var hasExist = _atMemberArray.some(function (currentValue) {
            return currentValue.jid == jid;
        });
        if (!hasExist) {
            _atMemberArray.push({
                jid: jid,
                atName: atName
            });
        }
    };

    //----------------------------------------辅助方法------------------------------------------

    /**
     * 消息发送之后的清理工作
     * @param jid
     */
    function clearAfterSending(jid) {
        //清空聊天对话框
        angular.element('#editArea').html('');
        //清空at数组
        _atMemberArray = [];
        //清空当前聊天的草稿
        delete _draftDictionary[jid];
    }

    //检查对话框内容是否为空，空格，回车符，同时也让子控制器使用
    $scope.isChatContentEmpty = function () {
        var messageContent = angular.element('#editArea').html();
        if (messageContent === '' || messageContent.trim() === '' || messageContent === '<br>')
            return true;
        return false;
    };

    /**
     * 获取登录用户，正在聊天的用户等信息
     * @returns {object}
     */
    function getAppUserInfo() {
        return {
            userId: globalService.GetUserInfo('jid').split('/')[0],//当前登录用户
            userName: globalService.GetUserInfo('loginName'),//当前登录的用户名称
            userAvatar: globalService.GetUserInfo('loginAvatar'),//当前登录用户头像
            currentTalkJid: _lastChatPerson.jid//正在聊天的用户
        };
    }

    //提供给子控制器调用
    $scope.getAppUserInfo = getAppUserInfo;

    /**
     * 获取jid对应的聊天记录的最后时间和当前时间的最大值
     * @param jid
     * @param msgTime
     * @returns {*}
     */
    function getMsgTime(msgTime) {
        /* if (!msgTime)
         msgTime = commonService.getTime();
         var msgTimeInt = parseInt(msgTime.replace(":", ""), 10);
         var lastMsgTimeInt = chatLogService.getLastMessageTime(jid);
         if (msgTimeInt > lastMsgTimeInt) {
         return msgTime;
         } else {
         return '';
         }*/
        if ($scope.messageList.length === 0)
            return getHourMin(new Date());
        if (msgTime === undefined)
            msgTime = +new Date();
        if (msgTime - _lastMsgCreateTime > 60000) {
            _lastMsgCreateTime = msgTime;
            var now = new Date();
            return getHourMin(now);
        }
        return '';

        function getHourMin(time) {
            var hour = time.getHours();
            if (hour < 10) {
                hour = "0" + hour;
            }
            var minute = time.getMinutes();
            if (minute < 10) {
                minute = "0" + minute;
            }
            return hour + ":" + minute;
        }
    }


    /**
     * 滚动聊天区域到底部
     * @param id 聊天对话框在html中的id
     */
    function touchScroll(id) {
        var msgdiv = document.getElementById(id);
        msgdiv.scrollTop = msgdiv.scrollHeight;
        console.log('准备滚动聊天区域');
        console.log(msgdiv.scrollHeight);
    }

    /**
     * 保存聊天对话框中的内容
     * @param jid 聊天对象的jid
     */
    function saveDraft(jid) {
        if (jid) {
            var draft = angular.element('#editArea').html();
            if (draft)
                _draftDictionary[jid] = draft;
            if (_atMemberArray)
                _draftDictionary[jid + '-atArray'] = _atMemberArray;
        }
    }

    /**
     * 根据聊天对象的jid读取聊天记录，放入$timeout为了ng的触发数据刷新
     * @param id 聊天对象的jid
     */
    function getChatLogList(id) {
        chatLogService.getChatLogList(id, function (messageLogList) {
            $timeout(function () {
                angular.forEach(messageLogList, function (item) {
                    var queryInfo = _groupMemberMap[item.jid];
                    if (queryInfo) {
                        item.avatarPath = queryInfo.avatarPath;
                        item.name = queryInfo.name;
                        item.accountType = queryInfo.accountType;
                    }
                });
                $scope.messageList = messageLogList;

                if (messageLogList.length)
                    _lastMsgCreateTime = messageLogList[messageLogList.length - 1].createTime;
                // touchScroll("wholeScroll");
            }, 100);
        });

    }



    function hasLocalChatLog(chatLog) {
        for (var i = 0; i < $scope.messageList.length; i++) {
            if ($scope.messageList[i].uuid === chatLog.uuid) return true;
        }
        return false;
    }

    function setNow() {
        _lastMsgCreateTime = +new Date();
    }

    //刷新聊天记录区域的内容
    $scope.sendUIMessage = function (currentId, messageData) {
        $timeout(function () {
            $scope.messageList.push(messageData);
            // touchScroll("wholeScroll");
        }, 10);
    };


    $scope.endRepeat = function () {
        // var container = document.getElementById(_chatContentContainerId);
        // container.scrollTop = container.scrollHeight;
        $timeout(function () {
            document.getElementById('wholeScroll').scrollTop = document.getElementById('wholeScroll').scrollHeight

        }, 1);
    };

    var isMaxWindow = false;
    $scope.sysMenuClick = function (type) {

        var ipcRenderer = require('electron').ipcRenderer;
        if (type === 0) {
            ipcRenderer.send('window-all-closed');
        } else if (type === 2) {
            if (isMaxWindow) {
                ipcRenderer.send('orignal-window');
            } else {
                ipcRenderer.send('show-window');
            }
            isMaxWindow = !isMaxWindow;
        } else if (type === 1) {
            ipcRenderer.send('hide-window');
        }


    };

}]);
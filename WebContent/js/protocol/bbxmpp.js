/**
 * Created by guoda on 2017/4/25.
 *
 * 封装xmpp底层协议
 */

(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);

    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    }

    // Browser globals
    var BBXmpp = {};
    root.BBXmpp = BBXmpp;
    factory(BBXmpp);

}((typeof window === 'object' && window) || this, function(bbxmpp) {
    'use strict';

    /**
     * @member _username 用户名
     * @member _password 密码
     * @member _connected 是否已连接
     * @member _callbackMap 回调字典
     * @member _listersArray 监听回调函数列表
     * @member _timeout 超时时间/ms
     * @member _isLogout 是否登出
     */
    var _connection = null;
    var _username = '';
    var _password = '';
    var _isConnected = false;
    var _callbackMap = new Map();
    var _listersArray = [];
    var _timeout = 30 * 1000;
    var _isLogout = false;
    var _wait = 20;
    var _hold = 1;

    /**
     * 监听对象格式
     */
    bbxmpp.Listeners = {
        CHAT_MESSAGE: '收到消息的标识',
        REMOVE_CIRCLE_ROOM: '退出群组的标识',
        ADD_CIRCLE_ROOM: '添加群组的标识',
        REMOVE_MEMBER: '群组踢人的标识',
        ADD_MEMBER: '群组加人的标识',
        RESET_MEMBER_NICK: '修改群成员昵称',
        RESET_CIRCLE_NAME: '修改群名称标识',
        ROSTER_CHANGE: '修改群名称标识',
        ADD_ACK: '添加等待回执消息',
        REMOVE_ACK: '收到回执消息',
    };

    /**
     * 返回消息状态
     */
    bbxmpp.Status = {
        SUCCESS : '成功',
        FAILED  : '失败',
        TIMEOUT : '超时',
    };

    /**
     * 遍历监听对象，发送广播消息
     */
    var notify = function() {
        for (var i = 0; i < _listersArray.length; i++) {
            var listener = _listersArray[i];
            listener.apply(bbxmpp, arguments);
        }
    };

    /**
     * 赋值群聊房间详细信息，返回需请求用户信息数组
     * @param circle
     * @param jid
     * @param memberArray
     * @param circleRoomMap
     * @returns {*}
     */
    var setCircleRoomInfo = function(circle, jid, memberArray, circleRoomMap) {
        var dataObj = {};
        dataObj.jid = jid;
        dataObj.type = 'groupchat';
        var circleRoom = circleRoomMap.get(jid);

        dataObj.avatar = '';
        dataObj.avatarPath = '';
        dataObj.avatar100 = '';
        dataObj.avatar200 = '';
        dataObj.roomContact = true;
        dataObj.name = circle.getAttribute('name');
        dataObj.creator = circle.getAttribute('creator');
        dataObj.circletype = circle.getAttribute('circletype');
        dataObj.ver = circle.getAttribute('ver');
        dataObj.createdate = circle.getAttribute('createdate');
        dataObj.modificationdate = circle.getAttribute('modificationdate');
        dataObj.room = circle.getAttribute('jid');
        dataObj.inviteurl = circle.getAttribute('inviteurl');
        dataObj.status = circle.getAttribute('status');
        var members = circle.getElementsByTagName('members')[0].getElementsByTagName('member');
        var memberJsonArr = new Array(); //json体中member数组
        var name = '';
        for (var j = 0; j < members.length; j++) {
            var member = members[j];
            var memberJid = member.getAttribute('jid');
            var memberObj = {};
            memberObj.jid = memberJid;
            memberObj.nickname = member.getAttribute('nickname');
            memberObj.role = member.getAttribute('role');
            memberObj.create = member.getAttribute('create');
            memberJsonArr[memberJsonArr.length] = memberObj;
            if (memberArray.join("").indexOf(memberJid) < 0) {
                memberArray[memberArray.length] = memberJid;
            }
            //如果群聊没有设置群昵称，取前三个成员的昵称作为群昵称
            if (j < 3) {
                if (j == 0) {
                    name = memberObj.nickname;
                } else {
                    name = memberObj.nickname + "、" + name;
                }
            }
        }
        if (dataObj.name == '' || dataObj.name == null) {
            dataObj.name = name;
        }

        dataObj.name_sort = pinyin.getFullChars(dataObj.name).toUpperCase();
        dataObj.name_first_sort = pinyin.getCamelChars(dataObj.name).toUpperCase();
        dataObj.member = memberJsonArr;
        circleRoomMap.put(jid, dataObj);

        return memberArray;
    };

    /**
     * 赋值用户详细信息
     * @param userInfo
     * @param user
     * @param jid
     <iq type="result" id="27A520F6FA754508B158DFF168446054" from="100200@ab-insurance.com" to="27703@ab-insurance.com/Hisuper">
     <query
     xmlns="http://www.nihualao.com/xmpp/userinfo">
     <query
     xmlns='http://www.nihualao.com/xmpp/userinfo'>
     <user jid='10117@ab-insurance.com' ver='140'>
     <phone countrycode='86'>+8613810629361</phone>
     <name>姜义东</name>
     <avatar>T1oaJTB4bT1RCvBVdK</avatar>
     <activated>true</activated>
     <passwordReplaced>true</passwordReplaced>
     <email activated='true'>ab044782jiangyidong@ab-insurance.com</email>
     <secondEmail activated='false'/>
     <source type='BackStage'/>
     <inviteUrl>http://tim.bangcommunity.com:9002/Q10O0D</inviteUrl>
     <accountType>2</accountType>
     <cemployeeCde>AB044782</cemployeeCde>
     <accountName>ab044782</accountName>
     <gender>1</gender>
     <areaId>101101101</areaId>
     <signature>云在青山月在天</signature>
     <bookNme>安邦保险集团</bookNme>
     <agencyNme>安邦保险集团</agencyNme>
     <branchNme>集团研发中心研发四部</branchNme>
     <centerNme>风控中心</centerNme>
     <employeeNme>姜义东</employeeNme>
     <departmentNme/>
     <employeePhone/>
     <publicPhone/>
     <officalPhone/>
     </user>
     </query>
     </iq>
     */
    var setUserInfo = function(userInfo, user, jid) {
        try {
            userInfo.type = 'chat';
            userInfo.roomContact = false;
            userInfo.jid = jid;
            userInfo.ver = user.getAttribute('ver');

            var userAttribute = [
                'phone', 'name', 'employeeNme', 'avatar', 'activated', 'passwordReplaced',
                'email', 'secondEmail', 'source', 'inviteUrl', 'accountType', 'cemployeeCde', 
                'accountName', 'gender', 'areaId', 'signature', 'bookNme', 'agencyNme', 
                'branchNme', 'centerNme', 'departmentNme', 'employeePhone', 'publicPhone', 'officalPhone'];

            for (var index = 0; index < userAttribute.length; index++) {
                userInfo[userAttribute[index]] = Strophe.getText(user.getElementsByTagName(userAttribute[index])[0]);
            }

            userInfo.displayName = (userInfo.employeeNme) ? userInfo.employeeNme : userInfo.name;
            userInfo.name_sort = pinyin.getFullChars(userInfo.displayName).toUpperCase();
            userInfo.name_first_sort = pinyin.getCamelChars(userInfo.name).toUpperCase();

            // FIXME: if avatarID is null? save avatar100 and avatar200? all of config.url.tfsUrl need delete?
            // TODO: avatarPath and avatar100 and avatar200 is the reserved field.
            if (userInfo.avatar) {
                userInfo.avatarPath = '';
                userInfo.avatar100 = '';
                userInfo.avatar200 = '';
            } else {
                userInfo.avatarPath = '';
                userInfo.avatar = 'imgs/nohead.gif';
                userInfo.avatar100 = '';
                userInfo.avatar200 = '';
            }

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    //解析语音消息
    var parseVoice = function(subject, body, dataObj) {
        var textContent = body.textContent;
        var parsedJson = JSON.parse(textContent);
        var voiceSize = parsedJson.time;
        var voiceUrl = parsedJson.link;
        var voiceName = parsedJson.link;

        //组装传递BBUI的JSON
        dataObj.message = voiceName;
        dataObj.link = voiceUrl;
        dataObj.mp3url = "";
        dataObj.voiceSize = voiceSize;
        dataObj.read = false;
        dataObj.play = false;
        return true;
    };

    //解析图片消息
    var parseImage = function(subject, body, dataObj) {
        var textContent = body.textContent;
        var parsedJson = JSON.parse(textContent);

        //组装传递BBUI的JSON
        dataObj.message = parsedJson.data;
        dataObj.link = parsedJson.link + "?name=" + dataObj.uuid + ".jpg";
        return true;
    };

    //解析文件消息
    var parseDocument = function(subject, body, dataObj) {
        var textContent = body.textContent;

        var parsedJson = JSON.parse(textContent);
        var fileName = parsedJson.fileName;
        var fileSize = parsedJson.size;
        var fileType = parsedJson.fileType;
        var fileUrl = parsedJson.link;

        dataObj.message = fileName; //文件名称
        dataObj.fileType = fileType; //文件类型
        dataObj.size = fileSize; //文件大小
        var encodeFileName = encodeURI(fileName);
        dataObj.link = fileUrl + "?name=" + encodeFileName; //文件地址
        return true;
    };

    //解析位置信息
    var parseLocation = function(subject, body, dataObj) {
        var textContent = body.textContent;
        var parsedJson = JSON.parse(textContent);

        //组装传递BBUI的JSON
        dataObj.locationName = parsedJson.locationName;
        dataObj.address = parsedJson.address;
        dataObj.longitude = parsedJson.longitude;
        dataObj.latitude = parsedJson.latitude;
        return true;
    };

    //解析文字消息
    var parseChat = function(subject, body, dataObj) {
        var message = Strophe.getText(body);
        //组装传递BBUI的JSON
        dataObj.message = message;
        return true;
    };

    //解析文章消息
    var parseArticle = function(subject, body, dataObj) {
        var textContent = body.textContent;
        var parsedJson = JSON.parse(textContent);
        //组装传递BBUI的JSON
        dataObj.title = parsedJson.title;
        dataObj.src = parsedJson.src;
        dataObj.abstract = parsedJson.abstract;
        dataObj.coverL = parsedJson.coverL;
        return true;
    };

    //解析未知消息
    var parseCardAndRedpacket = function(subject, body, dataObj) {
        // 未知消息处理
        //组装传递BBUI的JSON
        return true;
    };

    //解析通知消息
    var parseNotice = function(subject, body, dataObj) {
        var message = Strophe.getText(body);
        //组装传递BBUI的JSON
        dataObj.message = message;
        return true;
    };

    //解析特殊消息
    var parseSpecialType = function(specialType, dataObj) {
        if (specialType == "burn" || specialType == "shot") {
            //组装传递BBUI的JSON

        }
    };

    //解析消息
    var parseMessage = function(subject, body, dataObj) {
        var subjectToParseFunction = {
            //接收文本
            chat: parseChat,
            //接收图片
            image: parseImage,
            //接收文件
            document: parseDocument,
            //接收语音
            voice: parseVoice,
            //接收地理位置
            location: parseLocation,
            //接收分享
            article: parseArticle,
            //接收通知消息
            notice: parseNotice,
            //未知消息处理
            card: parseCardAndRedpacket,
            //未知消息处理
            redpacket: parseCardAndRedpacket
        }

        var func = subjectToParseFunction[subject];

        if (typeof(func) === "function") {
            func.apply(bbxmpp, arguments);
            return true;
        }
        
        return false;
    };

    //接收到<message>
    var onMessage = function(msg) {
        console.log('onMessage:');
        console.log(msg);
        if (_listersArray.length == 0) return true; //如果没有监听对象，就没必要做下面的处理。
        
        try {
            // 解析出<message>的from、type属性，以及body子元素
            var from = msg.getAttribute('from');
            var to = msg.getAttribute('to');

            //**发送人JID
            var fromJid = from.split("/")[0];
            
            //**接收人ID
            var msgToJid = to.split("/")[0];
            if (fromJid.indexOf('public-number') > 0 || msgToJid.indexOf('public-number') > 0) {
                return true;
            }
            var uuid = msg.getAttribute('id'); //**消息唯一标识
            var type = msg.getAttribute('type');
            var elems = msg.getElementsByTagName('body');
            var msgTime = msg.getElementsByTagName('delay')[0].getAttribute('stamp'); //**消息发送时间

            //**消息类型
            var subject; 

            //接收消息数据
            var dataObj = {};
            
            if (type == "chat" && elems.length > 0) {
                // 单聊
                subject = Strophe.getText(msg.getElementsByTagName('subject')[0]);
            } else if (type == "groupchat" && elems.length > 0) {
                //群聊
                subject = Strophe.getText(msg.getElementsByTagName('mtype')[0]);
                var memberJid = from.split("/")[1].split("_")[0] + "@ab-insurance.com";
                dataObj.memberJid = memberJid;
            }

            dataObj.uuid = uuid;
            dataObj.jid = fromJid;
            dataObj.toJid = msgToJid;
            dataObj.ackflag = 1;
            dataObj.msgTime = msgTime;
            dataObj.type = type;

            var atElems = msg.getElementsByTagName('jid');

            // 判断是否有人@我
            if (atElems != undefined && atElems.length > 0) {
                for (var n = 0; n < atElems.length; n++) {
                    var atJid = Strophe.getText(atElems[n]);
                    dataObj.atJid = dataObj.atJid + "," + atJid;
                }
            }

            //解析不同消息体的独有内容
            var specialType = Strophe.getText(msg.getElementsByTagName('specialType')[0]);
            if (specialType != undefined) {
                dataObj.subject = specialType;
                parseSpecialType(specialType, dataObj);
            } else {
                dataObj.subject = subject;
                if (!parseMessage(subject, elems[0], dataObj)) return true;
            }

            if (bbxmpp.Listeners.CHAT_MESSAGE != "") {
                notify(bbxmpp.Listeners.CHAT_MESSAGE, dataObj);
            }

            return true;
        } catch (e) {
            console.error(e);
            return true;
        }
    };

    /**
     * 解析好友通讯录IQ包(主被动都可能触发)
     * @param iq
     * @returns {boolean}
     */
    var onRosterIQ = function(iq) {
        console.log('onRosterIQ:' + iq);
        var uuid = iq.getAttribute('id');
        var callback = _callbackMap.get(uuid);
        try {
            var items = iq.getElementsByTagName('query')[0].getElementsByTagName('item');
            var contactMap = new Map();

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var jid = item.getAttribute('jid');
                var dataObj = {};

                dataObj.jid = jid;
                dataObj.name = item.getAttribute('name');
                dataObj.subscription = item.getAttribute('subscription');

                if (dataObj.subscription == 'to') {
                    continue;
                }

                dataObj.group = Strophe.getText(item.getElementsByTagName('group')[0]);
                contactMap.put(jid, dataObj);
            }

            if (typeof(callback) === "function") {
                callback(bbxmpp.Status.SUCCESS, contactMap);
                _callbackMap.remove(uuid);
            } else if (bbxmpp.Listeners.ROSTER_CHANGE != "") {
                notify(bbxmpp.Listeners.ROSTER_CHANGE, contactMap);
            }

            return true;
        } catch (e) {
            console.error(e);
            if (typeof(callback) === "function") {
                callback(bbxmpp.Status.FAILED, null);
                _callbackMap.remove(uuid);
            }

            return true;
        }
    };

    /**
     * 解析群聊房间信息包
     * @param iq
     * @returns {boolean}
     <circle jid='13600@circle.ab-insurance.com' name='测试' creator='10610@ab-insurance.com' circletype='circle' ver='4' createdate='2015-05-08T06:08:29.000Z' modificationdate='2016-03-01T08:29:51.000Z' room='13600@circle-muc.ab-insurance.com' inviteurl='http://tim.bangcommunity.com:9002/MCLYAT' status='1'>
     <members>
     <member jid='10610@ab-insurance.com' nickname='Www123456' role='owner' create='1431065309554'/>
     <member jid='27703@ab-insurance.com' nickname='ab044979lianglizhe' role='member' create='1431065309560'/>
     <member jid='26803@ab-insurance.com' nickname='曹云雷11' role='member' create='1431065324970'/>
     <member jid='28300@ab-insurance.com' nickname='Comen' role='member' create='1431065309560'/>
     </members>
     </circle>
     */
    var onCircleListIQ = function(iq) {
        console.log('onCircleListIQ:' + iq);
        var uuid = iq.getAttribute('id');
        var callback = _callbackMap.get(uuid);
        if (typeof(callback) !== "function") return true;
        try {
            var memberArray = new Array(); //请求userInfo用户详细信息IQ包数组
            var circleRoomMap = new Map(); //群聊房间Map
            var circles = iq.getElementsByTagName('query')[0].getElementsByTagName('circle');
            console.log(circles);

            for (var i = 0; i < circles.length; i++) {
                var circle = circles[i];

                //web版开发方便群聊JID取值room字段，room取值JID
                var jid = circle.getAttribute('room');
                var status = circle.getAttribute('status');
                if (status == 1) {
                    memberArray = setCircleRoomInfo(circle, jid, memberArray, circleRoomMap);
                }
            }

            callback(bbxmpp.Status.SUCCESS, circleRoomMap, memberArray);
            _callbackMap.remove(uuid);

            return true;
        } catch (e) {
            console.error(e);
            callback(bbxmpp.Status.FAILED, null, null);
            _callbackMap.remove(uuid);

            return true;
        }
    };

    /**
     * 解析用户详细信息包
     * @param iq
     * @returns {boolean}
     */
    var onUserinfoIQ = function(iq) {
        console.log('onUserinfoIQ:' + iq);
        var uuid = iq.getAttribute('id');
        var callback = _callbackMap.get(uuid);
        if (typeof(callback) !== "function") return true;
        try {
            var users = iq.getElementsByTagName('query')[0].getElementsByTagName('user');

            //赋值群成员信息Map
            var usersMap = new Map();

            for (var j = 0; j < users.length; j++) {
                var user = users[j];
                var jid = user.getAttribute('jid');
                var userInfo = usersMap.get(jid);
                if (userInfo == undefined) {
                    userInfo = {};
                    usersMap.put(jid, userInfo);
                }
                setUserInfo(userInfo, user, jid);
            }

            callback(bbxmpp.Status.SUCCESS, usersMap);
            _callbackMap.remove(uuid);

            return true;
        } catch (e) {
            console.error(e);
            callback(bbxmpp.Status.FAILED, null);
            _callbackMap.remove(uuid);

            return true;
        }
    };

    /**
     * 群IQ包解析
     * @param iq
     * @returns {boolean}
     */
    var onCircleNotifyIQ = function(iq) {
        console.log('onCircleNotifyIQ:' + iq);

        //如果没有监听对象，就没必要做下面的处理。
        if (_listersArray.length == 0) return true;
        try {
            var circles = iq.getElementsByTagName('query')[0].getElementsByTagName('circle');

            for (var i = 0; i < circles.length; i++) {
                var circle = circles[i];

                //web版开发方便群聊JID取值room字段，room取值JID
                var jid = circle.getAttribute('room');
                var ver = circle.getAttribute('ver');
                var removeGroup = circle.getAttribute('remove');
                var memberArray = new Array();

                if (removeGroup && bbxmpp.Listeners.REMOVE_CIRCLE_ROOM != "") {
                    // 解散并退出群聊
                    notify(bbxmpp.Listeners.REMOVE_CIRCLE_ROOM, jid);
                } else if (ver == 0) {
                    //创建新群聊  1.ver=0  2.circleRoomMap中无数据
                    //群聊房间Map
                    var circleRoomMap = new Map();
                    memberArray = setCircleRoomInfo(circle, jid, memberArray, circleRoomMap);
                    if (bbxmpp.Listeners.ADD_CIRCLE_ROOM != "") {
                        notify(bbxmpp.Listeners.ADD_CIRCLE_ROOM, circleRoomMap.get(jid), memberArray);
                    }
                } else {
                    var membersTag = circle.getElementsByTagName('members')[0];
                    
                    //无members节点 修改群名
                    if (membersTag == undefined) {
                        var member = circle.getElementsByTagName('member')[0];
                        
                        //修改成员昵称
                        if (member != undefined && bbxmpp.Listeners.RESET_MEMBER_NICK != "") {
                            notify(bbxmpp.Listeners.RESET_MEMBER_NICK, jid, ver, member.getAttribute('jid'), member.getAttribute('nickname'));
                        }

                        //修改群名
                        var name = circle.getAttribute('name');
                        if (name != null && name != undefined && name != "" && bbxmpp.Listeners.RESET_CIRCLE_NAME != "") {
                            notify(bbxmpp.Listeners.RESET_CIRCLE_NAME, jid, ver, name);
                        }

                        return true;
                    }

                    var members = membersTag.getElementsByTagName('member');
                    var memberJsonArr = [];
                    for (var j = 0; j < members.length; j++) {
                        var member = members[j];
                        var memberJid = member.getAttribute('jid');
                        var remove = member.getAttribute('remove');
                        
                        //删除群成员
                        if (remove == "true" && bbxmpp.Listeners.REMOVE_MEMBER != "") {
                            notify(bbxmpp.Listeners.REMOVE_MEMBER, jid, ver, memberJid);
                        } else {
                            //添加群成员
                            var memberObj = {};
                            memberObj.jid = memberJid;
                            memberObj.nickname = member.getAttribute('nickname');
                            memberObj.role = member.getAttribute('role');
                            memberObj.create = member.getAttribute('create');
                            if (bbxmpp.Listeners.ADD_MEMBER != "") {
                                notify(bbxmpp.Listeners.ADD_MEMBER, jid, ver, memberObj);
                            }
                        }
                    }
                }
            }

            return true;
        } catch (e) {
            console.error(e);

            return true;
        }
    };

    /**
     * 发送消息前的xml字符串
     */
    var rawOutput = function(data) {
        console.log('SEND: ' + data);
    };

    /**
     * 接收消息后的xml字符串
     */
    var rawInput = function(data) {
        console.log('RECV: ' + data);
    };

    /**
     * 发送消息前的xml对象
     */
    var xmlOutput = function(elem) {
        console.log(elem);
        if (bbxmpp.Listeners.ADD_ACK) {
            Strophe.forEachChild(elem, "message", function(data) {
                var jid = data.getAttribute("to");
                var uuid = data.getAttribute("id");
                var ack = elem.getAttribute("rid");
                var from = data.getAttribute("from");
                var msgtext = data.getElementsByTagName('body')[0];
                msgtext = msgtext.textContent;
                var chatType = data.getAttribute("type");
                var msgType = data.getElementsByTagName('mtype')[0];
                msgType = Strophe.getText(msgType);
                if (msgType == null) {
                    msgType = data.getElementsByTagName('subject')[0];
                    msgType = Strophe.getText(msgType);
                }
                notify(bbxmpp.Listeners.ADD_ACK, jid, uuid, ack);
            });
        }
    };

    /**
     * 接收消息后的xml对象
     */
    var xmlInput = function(elem) {
        console.log(elem);
        var ack = elem.getAttribute("ack");
        if (bbxmpp.Listeners.REMOVE_ACK && elem.tagName == "body" && ack != undefined && ack != null) {
            notify(bbxmpp.Listeners.REMOVE_ACK, ack);
        }
    };

    /**
     * 初始化发送消息
     */
    var initMessage = function(toJid, fromJid, chatType, uuid, messageType) {
        var msg = $msg({
            to: toJid,
            from: fromJid,
            type: chatType,
            id: uuid
        }).c("req", {
            xmlns: "urn:xmpp:receipts",
            id: uuid
        }).up();

        switch (chatType) {
            default:
            case "chat": {
                msg = msg.c("subject").t(messageType).up();
                break;
            }
            case "groupchat": {
                msg = msg.c("mtype", {
                    xmlns: "message:type"
                }).t(messageType).up();
                break;
            }
        }

        return msg;
    };

    /***
     * 初始化BBXmpp
     * @param {string} username 用户名
     * @param {string} password 密码
     * @param {string} boshService 服务器地址
     * @param {number} timeout 访问超时时间
     */
    bbxmpp.init = function(username, password, boshService, timeout) {
        _username = username;
        _password = password;
        _connection = new Strophe.Connection(boshService, {keepalive: true});
        _connection.rawInput = rawInput;
        _connection.rawOutput = rawOutput;
        _connection.xmlInput = xmlInput;
        _connection.xmlOutput = xmlOutput;
        _timeout = timeout || (30 * 1000);

        // _connection.addProtocolErrorHandler('HTTP', 0, err_code => {
        //     bbxmpp.connect(callback);
        // });
    };

    function OnConnected(status) {
        switch (status) {
            case Strophe.Status.CONNTIMEOUT: {
                console.log("网络超时。");
                break;
            }
            case Strophe.Status.ERROR: {
                console.log("网络连接报错");
                _connection.disconnect('logout');
                break;
            }
            case Strophe.Status.CONNFAIL: {
                console.log("网络连接失败");
                _connection.disconnect('logout');
                break;
            }
            case Strophe.Status.AUTHFAIL: {
                console.log("账号登录失败");
                var callback = _callbackMap.get('connect');
                if (typeof(callback) === "function") {
                    callback(bbxmpp.Status.FAILED);
                    _callbackMap.remove('connect');
                }
                break;
            }
            case Strophe.Status.DISCONNECTED: {
                console.log("断开连接");
                _isConnected = false;
                _connection.reset();
                if (!_isLogout) {
                    console.log("正在重连。");
                    _connection.restore(_username, OnConnected, _wait, _hold);
                }
                break;
            }
            case Strophe.Status.CONNECTED: {
                console.log("网络连接成功");
                _isConnected = true;
                _isLogout = false;
                var callback = _callbackMap.get('connect');
                if (typeof(callback) === "function") {
                    callback(bbxmpp.Status.SUCCESS);
                    _callbackMap.remove('connect');
                }

                // 首先要发送一个<presence>给服务器（initial presence）
                _connection.send($pres().tree());
                break;
            }
            case Strophe.Status.CONNECTING: 
            case Strophe.Status.AUTHENTICATING: 
            case Strophe.Status.DISCONNECTING: 
            case Strophe.Status.ATTACHED: 
            case Strophe.Status.REDIRECT: {
                break;
            }
        }
        return true;
    };

    /**
     * 建立链接
     */
    bbxmpp.connect = function(callback) {
        _callbackMap.put('connect', callback);
        
        _connection.connect(_username, _password, OnConnected, _wait, _hold);

        // 当接收到<message>节，调用onMessage回调函数
        _connection.addHandler(onMessage, null, 'message', null, null, null);
        _connection.addHandler(onRosterIQ, "jabber:iq:roster", 'iq', null, null, null);
        _connection.addHandler(onCircleListIQ, "http://www.nihualao.com/xmpp/circle/list", 'iq', null, null, null);
        _connection.addHandler(onUserinfoIQ, "http://www.nihualao.com/xmpp/userinfo", 'iq', null, null, null);
        _connection.addHandler(onCircleNotifyIQ, "http://www.nihualao.com/xmpp/circle/notify", 'iq', null, null, null);

    };

    /**
     * 断开链接
     */
    bbxmpp.disconnect = function() {
        _isLogout = true;
        _connection.disconnect('logout');
    };

    /**
     * 获取网络连接状态
     */
    bbxmpp.isConnected = function() {
        return _isConnected;
    };

    /**
     * 添加监听回调函数
     */
    bbxmpp.addListener = function(func) {
        for (var i = 0; i < _listersArray.length; i++) {
            var listener = _listersArray[i];
            if (listener === func) {
                return true;
            }
        }
        _listersArray[_listersArray.length] = func;
    };

    /**
     * 删除监听回调函数
     */
    bbxmpp.deleteListener = function(func) {
        _listersArray.remove(func);
    };

    /**
     * 请求服务器通讯录好友列表
     */
    bbxmpp.loadRoster = function(callback) {
        var uuid = Math.uuid();
        _callbackMap.put(uuid, callback);
        var iq = $iq({
            type: 'get',
            id: uuid
        }).c("query", {
            xmlns: "jabber:iq:roster"
        });
        _connection.sendIQ(iq, null, iq => {
            var error = iq ? bbxmpp.Status.FAILED : bbxmpp.Status.TIMEOUT;
            callback(error);
        }, _timeout);
    };

    /**
     * 请求服务器群组列表
     */
    bbxmpp.loadCircle = function(callback) {
        var uuid = Math.uuid();
        _callbackMap.put(uuid, callback);
        var iq = $iq({
            type: 'get',
            id: uuid,
            to: 'circle.ab-insurance.com'
        }).c("query", {
            xmlns: "http://www.nihualao.com/xmpp/circle/list"
        });
        _connection.sendIQ(iq, null, iq => {
            var error = iq ? bbxmpp.Status.FAILED : bbxmpp.Status.TIMEOUT;
            callback(error);
        }, _timeout);
    };

    /**
     * 请求服务器获取用户详细信息
     */
    bbxmpp.iqUserInfo = function(userInfoArray, callback) {
        var uuid = Math.uuid();
        _callbackMap.put(uuid, callback);
        var iq = $iq({
            type: 'get',
            id: uuid
        }).c("query", {
            xmlns: "http://www.nihualao.com/xmpp/userinfo"
        })
        for (var i = 0; i < userInfoArray.length; i++) {
            iq = iq.c("user", {jid: userInfoArray[i]}).up();
        }
        _connection.sendIQ(iq.tree(), null, iq => {
            var error = iq ? bbxmpp.Status.FAILED : bbxmpp.Status.TIMEOUT;
            callback(error);
        }, _timeout);
    };

    /**
     * 发送Text文本消息
     */
    bbxmpp.sendText = function(toJid, fromJid, type, uuid, message, atMembersMap) {
        // 创建一个<message>元素并发送
        var msg = initMessage(toJid, fromJid, type, uuid, "chat");
        msg.c("body").t(message).up();

        if(atMembersMap && atMembersMap.length){
            msg = msg.c("at");
            atMembersMap.forEach(function(item) {
                if (message.indexOf(item.atName) > -1) {
                    msg = msg.c("jid").t(item.jid).up();
                }
            });
            msg = msg.up();
        }

        console.log(msg.tree());
        _connection.send(msg.tree());
    };

    /**
     * 发送图片
     */
    bbxmpp.sendImage = function(toJid, fromJid, type, uuid, imgBase64, key) {
        var msg = initMessage(toJid, fromJid, type, uuid, "image");

        var base64 = imgBase64.replace(/[\r\n]/g, ""); //去掉回车换行
        msg.c("body").t("{\"data\":\"" + base64 + "\",\"src\":\"bea62218-b6e3-47f4-9f2e\",\"link\":\"" + key + "\"}").up();

        console.log(msg.tree());
        _connection.send(msg.tree());
    };

    /**
     * 计算文件大小
     * @param {int} charSize
     * @return {string}
     */
    var getFileSize = function(charSize) {
        var size = charSize / 1024;
        if (size > 1024) {
            return (size / 1024).toFixed(2) + "MB";
        } else {
            return size.toFixed(2) + "KB";
        }
    };

    /**
     * 发送文档消息
     */
    bbxmpp.sendDocument = function(toJid, fromJid, type, uuid, fileName, fileSize, fileType, key) {
        var msg = initMessage(toJid, fromJid, type, uuid, "document");
        msg.c("body").t("{\"fileName\":\"" + fileName + "\",\"charSize\":\"" + fileSize + "\",\"fileType\":\"" + fileType + "\",\"size\":\"" + getFileSize(fileSize) + "\",\"link\":\"" + key + "\"}").up();
        _connection.send(msg.tree());
    };

    return bbxmpp;
}));
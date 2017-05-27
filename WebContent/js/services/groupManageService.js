/**
 * Created by xiaozhao on 2017/4/24.
 *
 * 群管理服务，群的增删改查
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
    var groupManageService = {};
    root.groupManageService = groupManageService;
    factory(groupManageService);

}((typeof window === 'object' && window) || this, function (groupManageService) {
    'use strict';

    var _circlesArray = null;
    var _groupMap = null;
    var _dAllGroupMap = null;
    var _dCurrentGroupDetail = null;


    var _token = PubSub.subscribe('LoginStateChange', function (msgid, msgData) {
        // getCircles();
        // 获取群信息
        GetGroupInfoLogin(function (strFlag, strFrom, GroupArray) {
            var MsgObj = {};
            // 全量获取
            if (strFlag === 'end') {
                MsgObj.msgFlag = 'GroupInfoLoginNet';
                MsgObj.data = GroupArray;
                PubSub.publish('GroupNetNotify', MsgObj);
            }
            // 增量获取
            if (strFlag === 'on') {
                MsgObj.msgFlag = 'GroupInfoLoginDB';
                MsgObj.data = GroupArray;
                PubSub.publish('GroupNetNotify', MsgObj);
            }
        });
    });

    //BBXmpp发来的监听消息
    var bbxmppNotify = function () {
        var messageType = arguments[0];

        if (messageType == "") return false;

        switch (messageType) {
            case BBXmpp.Listeners.REMOVE_CIRCLE_ROOM:
                {
                    onRemoveCircleRoom(arguments[1]);
                }
                break;
            case BBXmpp.Listeners.ADD_CIRCLE_ROOM:
                {
                    onAddCircleRoom(arguments[1], arguments[2]);
                }
                break;
            case BBXmpp.Listeners.REMOVE_MEMBER:
                {
                    onRemoveMember(arguments[1], arguments[2], arguments[3]);
                }
                break;
            case BBXmpp.Listeners.ADD_MEMBER:
                {
                    onAddMember(arguments[1], arguments[2], arguments[3]);
                }
                break;
            case BBXmpp.Listeners.RESET_CIRCLE_NAME:
                {
                    onResetCircleName(arguments[1], arguments[2], arguments[3]);
                }
                break;
            case BBXmpp.Listeners.RESET_MEMBER_NICK:
                {
                    onResetMemberNick(arguments[1], arguments[2], arguments[3], arguments[4]);
                }
                break;
            default:
                return false;
        }
        return true;
    }
    BBXmpp.addListener(bbxmppNotify);

    /////////////////////////群数据管理函数//////////////////////////
    function GetGroupInfoBatch(ArrayGroupJid, CallBack) {

    }
    /**
     * 登陆获取群信息
     */
    function GetGroupInfoLogin(CallBack) {
        if (_groupMap) {

        } else {
            _groupMap = new Map();
        }
        // 从数据库获取群信息
        if (utilService.getRunEnv() === 'DesktopApp') {
            bbDataBase.GetStoreItems('groupinfo', function (bSuccess, ArrayGroupInfo) {
                if (bSuccess && ArrayGroupInfo.length > 0) {
                    for (var i = 0; i < ArrayGroupInfo.length; ++i) {
                        _groupMap.put(ArrayGroupInfo[i].jid, ArrayGroupInfo[i]);
                    }
                    _circlesArray = transformData(_groupMap);
                    CallBack('on', 'dbCatche', _circlesArray);
                } else {
                    _circlesArray = [];
                }
            });
        }

        // 从网络获取群信息，然后判断是否有群信息需要刷新
        BBXmpp.loadCircle(function (result, circleRoomMap, memberArray) {
            if( result == '成功'){
                PubSub.publish('groupLoadCompleted', {
                data: circleRoomMap
            });
            var ArrayDBRemove = [];
            var MapDBInsert = new Map();
            _groupMap.each(function(key,value,index)
            {
                if(!circleRoomMap.get(key))
                {
                    
                    ArrayDBRemove.push(key);
                }
                else
                {
                }
            });
            circleRoomMap.each(function(key,value,index)
            {
                var obj = _groupMap.get(key);
                if(obj && (obj.jid === value.jid) )
                {
                }
                else
                {
                    MapDBInsert.put(key,value);
                }         
            });
            _groupMap = circleRoomMap;
            var ArrayNotify = transformData(circleRoomMap);
            ///////////////////////////////////////
   
            ////////////////////////////插入数据库
            bbDataBase.updateDataBathMap('groupinfo', MapDBInsert, function (bSuccess, event, ArrayTest) {});
            if(ArrayDBRemove.length > 0)
            {
                bbDataBase.DeleteItemByKey('groupinfo',ArrayDBRemove,function(bSuccess,event,ArrayFailed){});
            }
            
            /////////////////////////////
            _circlesArray = ArrayNotify;
            CallBack('end', 'netUpdata', _circlesArray);
            addressbookService.GetPerInfoOnLogin(memberArray, function (strTypeFlag, strGetFlag, UseInfoMap, UseMapErr) {
                /**
                 * 这里先补上群成员详细信息接口
                 */
                if (strTypeFlag === 'end') {
                    _groupMap.each(function (key, value, index) {
                        var groupArrayPerson = value.member;
                        for (var i = 0; i < groupArrayPerson.length; ++i) {
                            var jid = groupArrayPerson[i].jid;
                            if (jid) {
                                groupArrayPerson[i].userinfo = UseInfoMap.get(jid);
                            }
                        }
                    });
                    //这里只更新需要刷新的群的头像，需要修改
                    var data2 = circleRoomMap;
                    var dataddd = _groupMap;
                    GetGroupavarUrl([]);
                }
            });
            }         
        });

    }
    /**
     * 强制从网络获取群信息
     */
    function GetGroupInfoDirectNet(ArrayGroupJid, CallBack) {

    }
    ///////////////////////////////////////////////////////////////
    /**
     *获取缺省的群组信息对象 
     */
    function GetDefaultGroupObj() {
        return {
            jid: undefined,
            type: 'groupchat',
            avatar: 'imgs/grouphead40.jpg',
            avatarPath: '',
            avatar100: 'imgs/grouphead100.jpg',
            avatar200: 'imgs/grouphead100.jpg',
            roomContact: true,
            name: undefined,
            creator: undefined,
            name_first_sort: undefined,
            name_sort: undefined,
            ver: '1',
            createdate: undefined,
            modificationdate: undefined,
            room: undefined,
            inviteurl: undefined,
            status: '1',
            member: [],
            dataCached: 0,
            freshData: function () {

            }
        };
    }

    function GetDefaultGroupMemberObj() {
        return {
            jid: undefined,
            nickname: undefined,
            role: undefined,
            create: undefined,
            userinfo: {

            },
            dataCatched: 0,
            freshData: function () {

            }
        };
    }

    function removeByValue(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) {
                arr.splice(i, 1);
                break;
            }
        }
    }

    function onRemoveCircleRoom(roomJid) {
        _groupMap.remove(roomJid);
        var GroupNetMessage = {};
        GroupNetMessage.MsgType = 'RemoveCircleRoom';
        GroupNetMessage.data = roomJid;
        PubSub.publish('GroupNetNotify', GroupNetMessage);
    }

    function onAddCircleRoom(circleRoom, memberArray) {
        var jid = circleRoom.jid;
        if (_groupMap.get(jid)) {

        } else {
            _groupMap.put(jid, circleRoom);
            var GroupNetMessage = {};
            GroupNetMessage.MsgType = 'AddCircleRoomFromNet';
            GroupNetMessage.roomObj = circleRoom;
            PubSub.publish('GroupNetNotify', GroupNetMessage);
            addressbookService.GetInfoBatch(memberArray, function (strTypeFlag, strGetFlag, UseInfoMap, UseMapErr) {
                if (strTypeFlag === 'end') {
                    var groupArrayPerson = circleRoom.member;
                    for (var i = 0; i < groupArrayPerson.length; ++i) {
                        var jid2 = groupArrayPerson[i].jid;
                        if (jid2) {
                            groupArrayPerson[i].userinfo = UseInfoMap.get(jid2);
                        }
                    }
                    var GroupNetMessages = {};
                    GroupNetMessages.MsgType = 'GroupMemberInfoLoaded';
                    GroupNetMessages.data = {};
                    GroupNetMessages.data.jid = jid;
                    GroupNetMessages.data.GroupObj = circleRoom;
                    console.log(GroupNetMessages.data.GroupObj)
                    PubSub.publish('GroupNetNotify', GroupNetMessages);
                    var GroupJidArray = [];
                    GroupJidArray.push(jid);
                    GetGroupavarUrlSingle(GroupJidArray);
                }

            });

        }

    }

    function onRemoveMember(roomJid, roomVersion, memberJid) {
        var GroupObj = _groupMap.get(roomJid);
        var GroupMember = GroupObj.member;
        for (var i = 0; i < GroupMember.length; ++i) {
            if (GroupMember[i].jid === memberJid) {
                GroupMember.splice(i, 1);
            }
        }
        var GroupNetMessage = {};
        GroupNetMessage.MsgType = 'onRemoveMember';
        GroupNetMessage.roomJid = roomJid;
        GroupNetMessage.memberJid = memberJid;
        PubSub.publish('GroupNetNotify', GroupNetMessage);

    }

    function onAddMember(roomJid, roomVersion, member) {
        var GroupObj = _groupMap.get(roomJid);
        var GroupMember = GroupObj.member;
        var bIsExsit = false;
        for (var i = 0; i < GroupMember.length; ++i) {
            if (GroupMember[i].jid === member.jid) {
                bIsExsit = true;
                break;
            }
        }
        if (bIsExsit) {
            return;
        } else {
            GroupMember.push(member);
            var memberArray = [];
            memberArray.push(member.jid);
            addressbookService.GetInfoBatch(memberArray, function (strTypeFlag, strGetFlag, UseInfoMap, UseMapErr) {
                if (strTypeFlag === 'end') {
                    var jid2 = member.jid;
                    if (jid2) {
                        var GroupNetMessage = {};
                        member.userinfo = UseInfoMap.get(jid2);
                        GroupNetMessage.MsgType = 'onAddMember';
                        GroupNetMessage.jid = roomJid;
                        GroupNetMessage.data = member;
                        PubSub.publish('GroupNetNotify', GroupNetMessage);
                    }
                }

            });

        }

    }

    function onResetMemberNick(roomJid, roomVersion, memberJid, memberNickName) {
        var GroupObj = _groupMap.get(roomJid);
        var GroupMember = GroupObj.member;
        for (var i = 0; i < GroupMember.length; ++i) {
            if (GroupMember[i].jid === memberJid) {
                GroupMember[i].nickname = memberNickName;
            }
        }

    }

    function onResetCircleName(roomJid, roomVersion, roomName) {
        var GroupObj = _groupMap.get(roomJid);
        if (GroupObj.name !== roomName){
            GroupObj.name = roomName;
        }
        var GroupNetMessage = {};
        GroupNetMessage.MsgType = 'onResetCircleName';
        GroupNetMessage.roomJid = roomJid;
        GroupNetMessage.roomName = roomName;
        PubSub.publish('GroupNetNotify', GroupNetMessage);
    }

    
    /**
     * zhengwei 2017.05.04
     * 添加一个本地搜人的接口
     * 这个接口
     * @param {*} jid 
     */
    function getUserInfoFromGroup(jid) {
        for (var m = 0; m < _groupMap.size(); m++) {
            var dataObj = _groupMap.data[_groupMap.keys[m]];
            if (Array.isArray(dataObj.member)) {
                for (var j = 0; j < dataObj.member.length; ++j) {
                    if (dataObj.member[j].jid === jid) {
                        return dataObj.member[j].userinfo;
                    }
                }
            }

        }
    }

    // 取前五个群成员头像
    function newQeqArray(ArrayGroupJid) {
        var reqArray = new Array();
        for (var m = 0; m < _groupMap.size(); m++) {
            var obj = {};
            var dataObj = _groupMap.data[_groupMap.keys[m]];
            var arrayJid = dataObj.jid;
            ArrayGroupJid.push(arrayJid);
            obj.jid = dataObj.jid;
            var avatarArray = new Array();
            var memberArray = dataObj.member;
            for (var n = 0; n < memberArray.length; n++) {
                //只获取前5个头像
                if (n == 5) {
                    break;
                }
                var memberJid = memberArray[n].jid;
                if(!memberArray[n].userinfo){
                    // commonService.getUserInfoByJid(arrayJid,function(persionData){
                    //     memberArray[n].userinfo = persionData.member[n].userinfo;
                    //     avatarArray[avatarArray.length] = memberArray[n].userinfo.avatar;
                    // });
                    
                }else{
                    avatarArray[avatarArray.length] = memberArray[n].userinfo.avatar;
                }
            }
            obj.member = avatarArray;
            reqArray[reqArray.length] = JSON.stringify(obj);
        }
        return reqArray;
    }

    function GetGroupavarUrlSingle(ArrayGroupJid) {
        var RequestMaxNum = 0;

        function GetRequestMaxNum() {
            return RequestMaxNum;
        }

        function RequestMaxNumAddSelf() {
            ++RequestMaxNum;
        }

        function RequestAvatar() {
            if (RequestMaxNum < 3) {
                if (ArrayGroupJid.length === 0) {
                    var reqArray = newQeqArray(ArrayGroupJid);
                } else {
                    var reqArray = new Array();
                    for (var i = 0; i < ArrayGroupJid.length; i++) {
                        var obj = {};
                        var jid = ArrayGroupJid[i];
                        var dataObj = _groupMap.get(jid);
                        obj.jid = dataObj.jid;
                        var avatarArray = new Array();
                        var memberArray = dataObj.member;
                        for (var n = 0; n < memberArray.length && n < 5; n++) {
                            var memberJid = memberArray[n].jid;
                            avatarArray[avatarArray.length] = memberArray[n].userinfo.avatar;
                        }
                        obj.member = avatarArray;
                        reqArray[reqArray.length] = JSON.stringify(obj);
                    }
                }
            }
            if (RequestMaxNum >= 3) {
                //请求3次之后直接返回
                return;
            }
            var objJson = {};
            var jid = "";
            var tfsImg = "";
            objJson.param = reqArray;
            var resCount = reqArray.length;
            $.ajax({
                url: 'https://web.bangcommunity.com' + '/headPortrait',
                datatype: 'json',
                type: "post",
                data: {
                    "datas": reqArray
                },
                success: function (data, status) { //服务器响应成功时的处理函数
                    //必须是第一次请求全部失败
                    if (data.list.length === 0 && GetRequestMaxNum() === 0) {
                        RequestMaxNumAddSelf();
                        //再次调用本方法
                        RequestAvatar();
                    } else {
                        for (var i = 0; i < data.list.length; i++) {
                            try {
                                jid = data.list[i].jid;
                                ArrayGroupJid.remove(jid);
                                tfsImg = data.list[i].key;
                                //先写入circleRoomMap
                                var circleRoomJson = _groupMap.get(jid);
                                circleRoomJson.avatar = tfsImg;
                                circleRoomJson.avatar100 =  tfsImg;
                                circleRoomJson.avatar200 =  tfsImg;
                                
                                if (circleRoomJson.avatar) {
                                    circleRoomJson.avatarPath = avatarService.getAvatar({
                                        path: circleRoomJson.avatar,
                                        jid: jid
                                    }, function (pathObj) {
                                        if (pathObj.statusCode === 200) {
                                            _groupMap.data[pathObj.jid].avatarPath = pathObj.path;
                                            var GroupNetMessage = {};
                                            GroupNetMessage.MsgType = 'GetGroupavatarSuccess';
                                            GroupNetMessage.jid = pathObj.jid;
                                            GroupNetMessage.avatar = pathObj.path;
                                            PubSub.publish('GroupNetNotify', GroupNetMessage);
                                        } else {

                                        }

                                    });
                                }



                            } catch (e) {
                                console.warn("circleRoomMap：" + jid);
                                continue;
                            }
                        }
                        //如果返回的和传进去群聊条数的不一致
                        if (resCount != data.list.length) {
                            //如果有没有请求成功的，再次请求
                            RequestMaxNumAddSelf();
                            //再次调用本方法
                            RequestAvatar();
                        }
                    }
                },
                error: function (data, status, e) { //服务器响应失败时的处理函数
                    //如果返回的和传进去群聊条数的不一致
                    if (GetRequestMaxNum() < 3) {
                        RequestMaxNumAddSelf();
                        //再次调用本方法
                        RequestAvatar();
                    }
                }
            });

        }
        RequestAvatar();
    }

    // 根据jid数组获取群头像的路径
    function GetGroupavarUrl(ArrayGroupJid) {
        var RequestMaxNum = 0;

        function GetRequestMaxNum() {
            return RequestMaxNum;
        }

        function RequestMaxNumAddSelf() {
            ++RequestMaxNum;
        }

        function RequestAvatar() {
            if (RequestMaxNum === 0) {
                var reqArray = newQeqArray(ArrayGroupJid);
            }

            if (RequestMaxNum >= 1 && RequestMaxNum < 3) {
                if (ArrayGroupJid.length === 0) {
                    var reqArray = newQeqArray(ArrayGroupJid);
                } else {
                    var reqArray = new Array();
                    for (var i = 0; i < ArrayGroupJid.length; i++) {
                        var obj = {};
                        var jid = ArrayGroupJid[i];
                        var dataObj = _groupMap.get(jid);
                        obj.jid = dataObj.jid;
                        var avatarArray = new Array();
                        var memberArray = dataObj.member;
                        for (var n = 0; n < memberArray.length; n++) {
                            var memberJid = memberArray[n].jid;
                            avatarArray[avatarArray.length] = memberArray[n].userinfo.avatar;
                        }
                        obj.member = avatarArray;
                        reqArray[reqArray.length] = JSON.stringify(obj);
                    }
                }
            }
            if (RequestMaxNum >= 3) {
                //请求3次之后直接返回
                return;
            }
            var objJson = {};
            var jid = "";
            var tfsImg = "";
            objJson.param = reqArray;
            var resCount = reqArray.length;
            $.ajax({
                url: 'https://web.bangcommunity.com' + '/headPortrait',
                datatype: 'json',
                type: "post",
                data: {
                    "datas": reqArray
                },
                success: function (data, status) { //服务器响应成功时的处理函数
                    //必须是第一次请求全部失败
                    if (data.list.length === 0 && GetRequestMaxNum() === 0) {
                        RequestMaxNumAddSelf();
                        ArrayGroupJid = [];
                        //再次调用本方法
                        RequestAvatar();
                    } else {
                        for (var i = 0; i < data.list.length; i++) {
                            try {
                                jid = data.list[i].jid;
                                ArrayGroupJid.remove(jid);
                                tfsImg = data.list[i].key;
                                //先写入circleRoomMap
                                var circleRoomJson = _groupMap.get(jid);
                                circleRoomJson.avatar =  tfsImg;
                                circleRoomJson.avatar100 = tfsImg;
                                circleRoomJson.avatar200 = tfsImg;
                                
                                
                                if (circleRoomJson.avatar) {
                                    circleRoomJson.avatarPath = avatarService.getAvatar({
                                        path: circleRoomJson.avatar,
                                        jid: jid
                                    }, function (pathObj) {
                                        if (pathObj.statusCode === 200) {
                                            // 更新缓存
                                            _groupMap.data[pathObj.jid].avatarPath = pathObj.path;
                                            var GroupNetMessage = {};
                                            GroupNetMessage.MsgType = 'GetGroupavatarSuccess';
                                            GroupNetMessage.jid = pathObj.jid;
                                            GroupNetMessage.avatar = pathObj.path;
                                            PubSub.publish('GroupNetNotify', GroupNetMessage);
                                        } else {

                                        }
                                    });
                                }

                            } catch (e) {
                                console.warn("circleRoomMap：" + jid);
                                continue;
                            }
                        }

                        // 处理没有请求到头像的情况 处目前请求不到头像服务器不会报错
                        _groupMap.each(function(key,value,index){
                            if(!value.avatar){
                                value.avatarPath = 'imgs/grouphead40.jpg'
                                var GroupNetMessage = {};
                                GroupNetMessage.MsgType = 'GetGroupavatarSuccess';
                                GroupNetMessage.jid = value.jid;
                                GroupNetMessage.avatar = value.path;
                                PubSub.publish('GroupNetNotify', GroupNetMessage);
                            }
                        })
                        //如果返回的和传进去群聊条数的不一致
                        if (resCount != data.list.length) {
                            //如果有没有请求成功的，再次请求
                            RequestMaxNumAddSelf();
                            //再次调用本方法
                            RequestAvatar();
                        }
                    }
                },
                error: function (data, status, e) { //服务器响应失败时的处理函数
                    //如果返回的和传进去群聊条数的不一致
                    if (GetRequestMaxNum() < 3) {
                        RequestMaxNumAddSelf();
                        //清空BBGlobal.array
                        ArrayGroupJid = [];
                        //再次调用本方法
                        RequestAvatar();
                    }
                }
            });

        }
        RequestAvatar();
    }
    /**
     * 这里通过数据库访问
     */
    function getGroupData(callBack) {
        //先从数据库访问

        //

    }

    function getCircles(callBack) {
        if (_circlesArray) {
            if (callBack)
                callBack(_circlesArray);
            return;
        }

        BBXmpp.loadCircle(function (result, circleRoomMap, memberArray) {

            if (result !== BBXmpp.Status.SUCCESS) return result;
            var data = transformData(circleRoomMap);
            PubSub.publish('groupLoadCompleted', {
                data: circleRoomMap
            });
            _circlesArray = data;
            _groupMap = circleRoomMap;
            addressbookService.GetInfoBatch(memberArray, function (strTypeFlag, strGetFlag, UseInfoMap, UseMapErr) {
                /**
                 * 这里先补上群成员详细信息接口
                 */

                if (strTypeFlag === 'end') {
                    var groupArray = [];
                    circleRoomMap.each(function (key, value, index) {
                        var groupArrayPerson = value.member;
                        groupArray.push(value.jid);
                        for (var i = 0; i < groupArrayPerson.length; ++i) {
                            var jid = groupArrayPerson[i].jid;
                            if (jid) {
                                groupArrayPerson[i].userinfo = UseInfoMap.get(jid);
                            }
                        }
                    });
                    GetGroupavarUrl(groupArray);
                }

            });

            if (callBack)
                callBack(data);
        });

    }



    function transformData(circleRoomMap) {
        var result = [];
        var orderMap = new Map(); //排序Map
        var orderArray = new Array();
        for (var m = 0; m < circleRoomMap.size(); m++) {
            var dataObj = circleRoomMap.data[circleRoomMap.keys[m]];
            orderMap.put(dataObj.name_sort + dataObj.jid, dataObj);
        }
        orderArray = orderMap.keys.sort();
        for (var n = 0; n < orderArray.length; n++) {
            result[result.length] = orderMap.get(orderArray[n]);
        }
        return result;
    }

    function removeCircleRoom() {

    }

    function addCircleRoom() {

    }

    function removeMember() {

    }

    function addMember() {

    }

    function resetMemberNick() {

    }

    function resetCircleName() {

    }
    /**
     * 獲取某個群的詳細信息
     */
     function GetGroupInfoByGid(jid)
     {
         var obj = undefined;
         if(_groupMap)
         {
             obj = _groupMap.get(jid);
         }
         return obj;
        
     }
    function fetchGroupMap() {
        return _groupMap;
    }
    /** ------------------------------------------暴露接口 ------------------------------------------*/

    /**
     * 获取群
     * @type {getCircles}
     */
    groupManageService.getCircles = getCircles;

    groupManageService.fetchGroupMap = fetchGroupMap;

    groupManageService.removeCircleRoom = removeCircleRoom;
    groupManageService.addCircleRoom = addCircleRoom;

    groupManageService.removeMember = removeMember;
    groupManageService.addMember = addMember;

    groupManageService.resetMemberNick = resetMemberNick;
    groupManageService.resetCircleName = resetCircleName;
    groupManageService.getUserInfoFromGroup = getUserInfoFromGroup;
    groupManageService.GetGroupInfoByGid= GetGroupInfoByGid;
    

}));
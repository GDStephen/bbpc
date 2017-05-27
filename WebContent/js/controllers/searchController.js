/*
* Created by lileilei
* 
* 搜索控制器
*/

'use strict';
indexModule.controller('searchController',['$scope','$state',function($scope,$state){
    // 搜索框输入的内容
    $scope.searchMessage = '';
    // 搜索结果展示开关
    $scope.isSearch = false;
    // 搜索结果
    $scope.searchContacts = null;
    // 从好友列表匹配的结果
    var friendsArray = new Array();
    // 从群列表匹配的结果
    var groupArray = new Array();
    // 根据已匹配好友jid再匹配好友所在群组
    var groupArray2 = new Array();
    
    
    // 好友列表
    var contactList = contactManageService.fetchContactMap();
    // 群列表
    var groupList = groupManageService.fetchGroupMap();
    // 订阅好友加载完毕消息  有时又有列表获取不到，此方法为补充获取好友的方法
    var contactLoad=PubSub.subscribe('contactLoadCompleted',function(msgid,msgdata) {
            contactList = msgdata.data;
    });
    // 键盘抬起搜索好友
	$scope.searchKeydown = function($event) {
	    if ($scope.searchMessage != null && $scope.searchMessage != '') {
            $scope.isSearch = true;
	        $scope.searchContacts = searchFriends($scope.searchMessage,contactList,groupList);
	        console.log($scope.searchContacts);
	    } else {
	        $scope.isSearch = false;
	    }
	};

    // 跳转到聊天人 contactPersion为跳转人的资料
    $scope.transferClick = function(contactPersion){
        // 来源标记
        var flag = "search";
        // persionData为跳转人的资料
        var persionData = {
            source:flag,
            data:{
                jid: contactPersion.jid,
                avatarPath: contactPersion.avatarPath,
                type: contactPersion.type,
                name: contactPersion.name,
                msgFullTime: +new Date(),
                msgTime: commonService.getTime()
            }
        };
        $scope.isSearch = false;
        $scope.searchContacts = null;
        // 跳转去聊天
        $state.go('bangbang.chat', {contatData : JSON.stringify(persionData)});
        $scope.searchMessage = "";
    };

    

    // 订阅更新群头像消息
    var groupMsg=PubSub.subscribe('GroupNetNotify',function(msgid,msgdata) {
        if(msgdata.MsgType==='GetGroupavatarSuccess'){
            var groupList = groupManageService.fetchGroupMap();
        }
    });

    
    // 搜索好友和群
    function searchFriends(inputChar,contactList,groupList) {
        // 匹配前，清空匹配结果数组
        friendsArray = [];
        groupArray = [];
        groupArray2 = [];
        // 去除输入法再输入汉字时加上的'
        inputChar = inputChar.replace(/'/g,'');
        var resInputChar = pinyin.getFullChars(inputChar).toUpperCase();
        var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        var zhflag = false;
        //搜索框有汉字
        if (reg.test(inputChar)) {
            zhflag = true;
        }
        
        var chatObj = {},groupObj = {};
        chatObj.type = 'header';
        groupObj.type = 'header';
        var logo = angular.element('#logo').innerHTML;
        if (logo != null && logo == 'BangBangCommunity') {
            chatObj.name = 'Contacts';
            groupObj.name = 'Group Chats';
        } else if (logo != null && logo == '邦邦社区') {
            chatObj.name = '好友';
            groupObj.name = '群聊';
        }

        // 搜索好友
        friendsArray[friendsArray.length] = chatObj;
        for (var key in contactList.data) {
            var dataObj = contactList.get(key);
            // 只有一个词
            if(resInputChar.length === 1){
                if(dataObj.name_sort.indexOf(resInputChar) ===0){
                    friendsArray[friendsArray.length] = dataObj;
                }
            // 多个词
            }else {
                if(dataObj.name_first_sort.indexOf(resInputChar) ===0 || dataObj.name_sort.indexOf(resInputChar) ===0){
                    friendsArray[friendsArray.length] = dataObj;
                }
            }
        }
        if (friendsArray.length == 1) {
            friendsArray = [];
        }

        // 搜索群组
        groupArray2[groupArray2.length] = groupObj;

        // 只有一个词
        if(resInputChar.length === 1){
            for (var key in groupList.data) {
                var dataObj = groupList.get(key);
                var flag = false;
                for(var i = 0;i<dataObj.member.length;i++){
                    // 跳出循环
                    if(flag){
                        break;
                    }
                    for(var j = 0;j < friendsArray.length;j++){
                        if(dataObj.member[i].jid === friendsArray[j].jid){
                            groupArray2[groupArray2.length] = dataObj;
                            flag = true;
                        }
                        // 跳出循环
                        if(flag){
                            break;
                        }
                    }
                }
                // 跳出循环 优先搜索出群成员中包含好友的群
                if(flag){
                    continue;
                }
                if(dataObj.name_sort.indexOf(resInputChar) ===0){
                    groupArray[groupArray.length] = dataObj;
                }
            }
        // 多个词
        }else {
            for (var key in groupList.data) {
                var dataObj = groupList.get(key);
                var flag = false;
                for(var i = 0;i<dataObj.member.length;i++){
                    // 跳出循环
                    if(flag){
                        break;
                    }
                    for(var j = 0;j < friendsArray.length;j++){
                        if(dataObj.member[i].jid === friendsArray[j].jid){
                            groupArray2[groupArray2.length] = dataObj;
                            flag = true;
                        }
                        // 跳出循环
                        if(flag){
                            break;
                        }
                    }
                }
                // 跳出循环 优先搜索出群成员中包含好友的群
                if(flag){
                    continue;
                }
                if(dataObj.name_first_sort.indexOf(resInputChar) ===0 || dataObj.name_sort.indexOf(resInputChar) ===0){
                    groupArray[groupArray.length] = dataObj;
                }
            }
        }

        // 没有搜索到群
        groupArray2 = groupArray2.concat(groupArray);
        if (groupArray2.length == 1) {
            groupArray2 = [];
        }
        console.log(friendsArray.concat(groupArray2));
        return friendsArray.concat(groupArray2);
    };


}])
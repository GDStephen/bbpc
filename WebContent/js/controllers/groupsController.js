/*
 * Created by shuren 2017/5/12
 *
 * 群组管理控制器
 */
'use strict';
indexModule.controller('groupsController', ['$scope', '$timeout', function ($scope, $timeout) {

     var circles = [];
    // 加载群组到通讯录
    loadGroup();
    var subMsg;
    //订阅消息
    function groupsSub(){
       subMsg= PubSub.subscribe('GroupNetNotify', function (msgid, msgdata) {
        if (msgdata.msgFlag === 'GroupInfoLoginNet') {
            circles = msgdata.data;
            showGroupData();
        } else if (msgdata.msgFlag === 'GroupInfoLoginDB') {
            circles = msgdata.data;
            showGroupData();
        } else if (msgdata.MsgType === 'AddCircleRoomFromNet') {
                circles.unshift(msgdata.roomObj);
                showGroupData();
        } else if (msgdata.MsgType === 'RemoveCircleRoom') {
                var removejid = msgdata.data;
                circles.forEach(function(value,index,arr){
                    if(arr[index].jid === removejid){
                       arr.splice(index,1);
                    }
                });
                showGroupData();
        } else if (msgdata.MsgType === 'onAddMember'){
                var roomJid = msgdata.jid;
                var member = msgdata.data;
                circles.forEach(function(value,index,arr){
                    if(arr[index].jid === roomJid){
                       arr[index].member.push(member);
                    }
                });
                showGroupData();
        } else if (msgdata.MsgType === 'onRemoveMember'){
                var roomJid = msgdata.roomJid;
                var memberJid = msgdata.memberJid;
                circles.forEach(function(value,index,arr){
                    if(arr[index].jid === roomJid){
                        arr[index].member.forEach(function(value,index,array){
                            if(array[index].jid === memberJid){
                                array[index].splice(index,1);
                            }
                        })
                       
                    }
                })
                showGroupData();
        }else if (msgdata.MsgType === 'onResetCircleName'){
            var roomJid = msgdata.roomJid;
            var roomName = msgdata.roomName;
            circles.forEach(function(value,index,arr){
                if(value.jid === roomJid){
                    arr[index].name = roomName;
                }
            })
             showGroupData();
        }

    });
    }
    groupsSub();

    // 取消订阅
    $scope.$on('$destroy', function () {
        PubSub.unsubscribe(subMsg);
    });

    /**--------------------------------- 声明模块 -------------------------------------*/
    // 声明绑定群组数据到界面的函数
    function showGroupData() {
        $timeout(function () {
            $scope.groups = circles;
        }, 0);
    }
    function loadGroup() {
        // 调用群管理服务拿取数据
        groupManageService.getCircles(function (circleList) {
            console.log('获取群数据返回');
            circles = circleList;
            showGroupData();
        });
    }
}])
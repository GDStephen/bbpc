/**
 * Created by lileilei
 *
 * 联系人资料展示控制器
 */
'use strict';

indexModule.controller('contactContentController',['$scope','$state',function($scope,$state){

    // 获取好友资料并展示
	$scope.$on('getDetails',function(e,data){
        $scope.contactDetails = data;
        $scope.currentContact = true;
    })
    // 去和好友聊天
    $scope.transferClick = function(contactPersion){
        // 来源标记
        var flag = "contact";
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
        // 跳转去聊天
        $state.go('bangbang.chat', {contatData : JSON.stringify(persionData)})
    };
}])

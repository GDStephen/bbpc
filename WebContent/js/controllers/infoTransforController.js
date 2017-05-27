/*
* Created by lileilei
* 
* 控制器见消息中转
*/
'use strict';
indexModule.controller('infoTransforController',['$scope',function($scope){

    // 好友详细信息
	$scope.$on('showDetails',function(e,data){
        $scope.$broadcast('getDetails',data);
    });
    // 当前聊天人相关信息
    $scope.$on('currentChatData',function(e,data){
        $scope.$broadcast('getCurrentChatData',data);
    })
}])

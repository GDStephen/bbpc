/*
* Created by lileilei
* 
* 好友列表管理
*/
'use strict';
indexModule.controller('friendListController', ['$scope', '$timeout', function ($scope, $timeout) {

    // 初始化好友列表
    contactManageService.loadContact(function (contactList) {
        console.log('获取好友通讯录数据返回');
        $timeout(function () {
            $scope.friendsList = contactList;
            window.friendsList = contactList
        }, 0);
    });
}])

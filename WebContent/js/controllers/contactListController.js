/*
* Created by lileilei
* 
* 好友列表和群控列表制器，只负责处理联系人被选中状态
*/
'use strict';
indexModule.controller('contactListController', ['$scope', function ($scope) {
    // 向上分发当前好友信息
    $scope.showDetails = function (persionData) {
        $scope.contactId = persionData.jid;   
        $scope.$emit('showDetails', persionData);
    };
}])

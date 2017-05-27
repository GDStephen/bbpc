/**
 * Created by xiaozhao on 2017/5/27.
 */
indexModule.directive('netIndicator', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        replace: true,
        template: '<div ng-if="showNetError" class="connection-indicator">{{netText}}</div>',
        controller: function ($scope) {
            BBCheckNet.addListener(function (netType) {
                $timeout(function () {
                    if (netType === false) {
                        $scope.showNetError = true;
                        $scope.netText = '当前网络不可用，请检查你的网络设置';
                    } else {
                        $scope.showNetError = false;
                    }
                }, 100);
            });

        }
    };
}]);

/**
 * Created by PrincessofUtopia on 2016/1/30.
 */
indexModule.controller('MainController', ['$scope', '$state', '$stateParams',
    function($scope, $state, $stateParams){
        // 获取浏览器可见的宽度
        var wchat = document.documentElement.clientWidth;
        var hchat = document.documentElement.clientHeight ;
        document.getElementById('navContact').style.height = (hchat-220)+"px";
    }
]);

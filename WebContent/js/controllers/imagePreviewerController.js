/**
 * Created by xiaozhao on 2017/5/18.
 *
 * 图片预览控制器
 */

indexModule.controller('ImagePreviewerController', ['$scope', '$timeout', function ($scope, $timeout) {
    var _dataContext ={
        imageUrl:'',//图片的url路径
        showLoading:true,
        imageLoaded:function (sizeObjString) {
            var sizeObj = {};
            if(sizeObjString)
                sizeObj = JSON.parse(sizeObjString);
            onLoaded(sizeObj);
        },
        imageError:function () {
            onError();
        }
    };

    init();
    function init() {
        var httpUrl = $scope.ngDialogData.httpUrl;
        var localPath = $scope.ngDialogData.localPath;
        var base64Code = $scope.ngDialogData.base64Code;
        _dataContext.imageUrl =httpUrl;

    }

    /**
     * 图片加载成功
     * @param sizeObj
     */
    function onLoaded(sizeObj) {
        console.log('预览组件，图片加载完毕,图片尺寸：');
        console.log(sizeObj);
        $timeout(function () {
            _dataContext.showLoading = false;
        },0);
    }

    /**
     * 图片加载失败
     */
    function onError() {
        _dataContext.showLoading = false;
    }

    $scope.pageContext = _dataContext;



    
}]);

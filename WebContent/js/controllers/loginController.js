/**
 * managed by  shuren
 * 
 * 登录控制器 包括扫码界面和确认登录界面
 */ 
indexModule.controller('loginController', ['$translate','LoginStateService', '$rootScope', '$scope','$timeout', function($translate,LoginStateService, $rootScope, $scope,$timeout) {
    
    // 渲染二维码使用的ID
    $scope.qrId='';
    // 当前登录人的用户名
    $scope.userName='';
    // 当前登录人的头像路径
    $scope.userAvatarPath='';
    // 控制扫码界面和确认登录界面的消失隐藏 false时显示的是扫码界面
    $scope.isScan = false;
    // 扫码和确认登录状态文本信息
    $scope.loginState='扫描成功';


    // 返回扫码功能
    $scope.goScan=function(){
        $scope.isScan = false;
    }
    // 二维码渲染函数
    function OnLoginqrCodeSuccuss() {
        $timeout(function(){
             $scope.qrId='{\"type\":\"weblogin_\",\"id\":\"' + qrLoginMgr.qr.id + '\"}';
         }, 0);
    }

    /**------------------------------------ 订阅 + 调用 + 取消订阅-----------------------------*/

    // 消息订阅
    SubcribeMessage();

    // 取消订阅
    $scope.$on('$destroy',function(){
        PubSub.unsubscribe(msgPub,msgPub1);
    })

    // 二维码登录接口调用
    qrLoginMgr.Login();

    /**------------------------------------ 函数块 ------------------------------------------*/
    
    /** 
     *  zhengwei 2017.04.25
     * 
     *  二维码消息回调
     */
    function OnLoginMessage100(realname) {
        // 调用头像服务；
        var avatarPath = avatarService.getAvatar({'path':globalService.GetUserInfo('loginAvatar').slice(-18),'jid':globalService.GetUserInfo('jid')}, function(pathObj) {
            if(pathObj.statusCode === 200){
                $scope.userAvatarPath=avatarPath;
                globalService.SetUserInfo('loginAvatar',pathObj.path);
                $timeout(function(){
                    $scope.userAvatarPath=pathObj.path;
                    $scope.$emit('userAvatarPath', pathObj.path);
                },0)
            }
        });
        globalService.SetUserInfo('loginAvatar',avatarPath)
        PubSub.publish('OnLoginMessagePortraitChanged');
        $scope.$emit('userAvatarPath', avatarPath);
        $timeout(function(){
            $scope.isScan = true;
            $scope.userName=realname;
            $scope.userAvatarPath=avatarPath;
        },0)
    }

    /**
     * zheng wei 2017.04.25
     * 
     * @param {*json} data
     */
    function OnLoginMessage101(data) {
        pathService.setBBDir(data.username);
        LoginStateService.LoginXMPP(data.username, data.pwd);
        // 这里留存DOM操作，后期废除
        angular.element('.success-text').html('正在登陆···');
        angular.element('.success-tip').hide();
        
    }
    function OnLoginMessage900(msg) {
        alert('不好意思，网络链接出了问题，用户体验后期优化');
    }

    /**
     * zheng wei 2017.04.25
     * 
     *  头像变化通知
     */
    function OnLoginMessagePortraitChanged() {
        $timeout(function(){
            $scope.userAvatarPath=avatarPath;
        },1)
    }

    /**
     * 订阅消息
     */
    var msgPub,msgPub1;
    function SubcribeMessage() {
        var MsgListener = MDService.login;
        msgPub=PubSub.subscribe(MsgListener.name, function(msgid, msgData) {
            var msgInfo = msgData.msgtype;
            var msgContant = msgData.data;
            if (msgInfo === MsgListener.LoginGetQrcode) {
                OnLoginqrCodeSuccuss();
            } else if (msgInfo === MsgListener.LoginQRcode100) {
                OnLoginMessage100(msgContant);
            } else if (msgInfo === MsgListener.LoginQRcode101) {
                OnLoginMessage101(msgContant);
            } else if (msgInfo === MsgListener.LoginQRcode900) {
                OnLoginMessage900(msgContant);
            } else {

            }

        });
        msgPub1=PubSub.subscribe('LoginStateChange', function(msgid, msgData) {
            if (LoginStateService.GetLoginState()) {
                $timeout(function(){
                    $scope.switch.isLogin = true;
                    $scope.flag=false;
                    // panshuren 确认登录之后调转大窗操作
                    var ipcRenderer1 = require('electron').ipcRenderer;
                    ipcRenderer1.send('change-main-window');
                },0);
                PubSub.publish('OnlineMessage', 'Online');
            } else {
                // $("#loginStatus").text("登录失败");
            }

        });

        // 当前网络状态，初始为false
        var _netType = false;
        BBCheckNet.addListener(netType => {
            if ($scope.switch.isLogin && _netType === netType) return;

            if (netType) {
                qrLoginMgr.Login();
            } else {
                qrLoginMgr.stop();
            }
            _netType = netType;
        });

    }
    /**------------------------------ 暂时没有使用的函数------------------------------*/
    
    // window刷新的时候
    function RunOnBeforeUnload() {
        // BBGlobal.keyDownF5=false;
        if (false) {
            console.log('刷新web版邦邦社区');
        } else {
            console.log('关闭web版邦邦社区');
        }
    }

    // window加载不出来时候
    function runOnUnLoad() {}

}])
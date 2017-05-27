/**
 * Created by PrincessofUtopia on 2016/2/3.
 */
/*indexModule.service("myService",function($scope){
    this.test1 = function(){
        alert("success");
    };
});*/

indexModule
    .factory('LoginStateService', [function () {
        var UserLoginState = false;
        var _netType = false;
        var UserLoginName;
        var UserLoginSecret;
        /**zhengwei 2017.04.26
         * 宽接口，一次性初始化两个
         * 参数
         * @param {*} userName 
         * @param {*} userSecret 
         */
        function SetLoginInfo(userName, userSecret) {
            UserLoginName = userName;
            UserLoginSecret = userSecret;
        }
        /**
         * zhengwei 2017.04.26
         * 这里使用窄接口
         * 分别返回用户名和密码
         */
        function GetUserName() {
            return UserLoginName;
        }

        function GetUserSecret() {
            return UserLoginSecret;
        }

        function GetLoginState() {
            return UserLoginState === BBXmpp.Status.SUCCESS;
        }

        function OnUserStateChange(bState) {
            if (UserLoginState === bState) return;
            
            UserLoginState = bState;
            /**
             * 把通知消息独立成一个单独的模块
             */
            var msgData = {
                msgFlag: 'LoginState',
                data: UserLoginState
            };
            if (UserLoginState === BBXmpp.Status.SUCCESS) {
                addressbookService.initAllData(UserLoginName, function (bSuccess, strType) {
                    PubSub.publish('LoginStateChange', msgData);
                });
            }
        }

        function LoginXMPP(username, password) {
            SetLoginInfo(username, password);
            BBXmpp.init(username, password, config.url.baseUrl + '/http-bind/', 60000);
            //_netType = BBCheckNet.isConnected();
            _netType = navigator.onLine;
            if (_netType) {
                BBXmpp.connect(OnUserStateChange);
            }

            BBCheckNet.addListener(netType => {
                if (_netType === netType) return;

                if (netType) {
                    console.log('CheckNet onLine!');
                    BBXmpp.connect(function() {});
                } else {
                    console.log('CheckNet offLine!');
                    BBXmpp.disconnect();
                }
                _netType = netType;
            });
        }
        return {
            SetLoginInfo: SetLoginInfo,
            GetUserName: GetUserName,
            GetUserSecret: GetUserSecret,
            OnUserStateChange: OnUserStateChange,
            GetLoginState: GetLoginState,
            LoginXMPP: LoginXMPP
        };

    }]);
/**
 * chatController的子控制器
 * 聊天记录区域的控制器
 */
indexModule.controller('chatLogController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {

    var _recallTimeOut = 120 * 1000; //消息撤回的有效时间为2分钟
    var _isChrome = utilService.getBrowser().indexOf("Chrome");


    init();
    function init() {
        setContextMenu();
    }

    function setContextMenu() {
        var baseContextMuens = [
            ['引用', function ($itemScope, $event, msg) {
                reference(msg);
            }],
            ['转发', function ($itemScope, $event, msg) {

            }],
            ['复制', function ($itemScope, $event, msg) {

            }],
            null,
            ['撤回', function ($itemScope, $event, msg) {

            }, function ($itemScope, $event, msg) {
                var result = {};
                var isHide = msg.from_me === true ? false : true;
                result.hide = isHide;
                var now = +new Date();
                var isTimeout = false;
                if (now - msg.createTime > _recallTimeOut) {
                    isTimeout = true;
                }
                if (isTimeout) {
                    result.newText = '撤回（超过2分钟）';
                    result.isDisable = true;
                }
                return result;

            }],
            ['删除', function ($itemScope, $event, msg) {
                deleteMsg(msg);
            }]
        ];
        //文本消息右键菜单
        // $scope.textMenuOptions = baseContextMuens;

        //图片消息右键菜单
        var imageMenuOptions = baseContextMuens.slice(0);
        imageMenuOptions.push(
            ['存储...', function ($itemScope) {

            }]
        );
        // $scope.imageMenuOptions = imageMenuOptions;


    }

    //引用
    function reference(msg) {
        console.log('引用方法处理');
        console.log(msg);
    }

    //转发
    function transmit(msg) {

    }

    //复制
    function copy(msg) {

    }

    //撤回
    function recall(msg) {

    }

    //删除
    function deleteMsg(msg) {
        var roomJid = $scope.getAppUserInfo().currentTalkJid;
        chatLogService.deleteChatLog(msg.uuid, roomJid);

        var index = -1;
        for (var i = $scope.messageList.length - 1; i > -1; i--) {
            if ($scope.messageList[i].uuid === msg.uuid) {
                index = i;
                break;
            }
        }
        if(index===$scope.messageList.length - 1){
            chatListService.updateRecentChatList(roomJid, $scope.messageList[index-1]);   //更新最近联系人列表
        }
        if (index !== -1)
            $scope.messageList.splice(index, 1);

    }


    /**
     *
     * 消息重发，调用父控制器的发送方法
     * @param message
     */
    $scope.resendMsg = function (message) {
        angular.element('#editArea').html(message.message);
        $scope.sendMessage();
    };


    /**
     * 播放语音
     * @param message 要播放的消息对象体
     */
    $scope.playVoice = function (message) {
        message.play = true;
        message.read = !message.read;
        if (!_isChrome) {
            fetchBlob(message.message, function (blob) {
                convertAmrBlobToWav(blob, message);
                message.read = $scope.msgVoice;
            });
        }
        else {
            if (message.mp3url != '') {
                playIEMp3(message);
                //message.read = $scope.msgVoice;
                return;
            }
            //new Ajax
            var param = {
                message: message.message
            };
            var httpUrl = config.url.baseUrl + '/getMp3Key';
            $http.post(httpUrl, param).then(function (response) {
                var data = response.data;
                if (data.serverCode == "1") {
                    var key = data.key;
                    message.mp3url = key;
                    playIEMp3(message);
                }
                else {
                    message.read = false;
                }

            }, function () {
                message.read = false;
            });

            /*$.ajax({
             type: "POST",
             url: config.url.baseUrl + '/getMp3Key',
             async: false,
             dataType: "json",
             data: {message: message.message},
             success: function (data) {
             if (data.serverCode == "1") {
             var key = data.key;
             message.mp3url = key;
             playIEMp3(message);
             // message.read = $scope.msgVoice;

             } else {
             message.read = false;
             var app = document.body;
             var $scope = angular.element(app).scope();
             $scope.pointDesc = data.serverMsg;
             $scope.$apply();
             document.getElementById('point').style.display = 'block';
             }
             },
             failure: function (result) {
             message.read = false;
             var app = document.body;
             var $scope = angular.element(app).scope();
             $scope.pointDesc = '语音转码异常，请联系管理员';
             $scope.$apply();
             document.getElementById('point').style.display = 'block';
             }
             });*/
        }

    };

    /**
     * 图片预览
     * @param message
     */
    $scope.previewPicture = function (message) {
        var width = 800, height = 600;
        ngDialog.open({
            template: 'templates/imagePreviewer.html',
            className: 'ngdialog-theme-default',
            appendClassName: 'ngdialog-img-preview',
            data: {
                httpUrl: message.link,
                localPath: '',
                base64Code: 'data:image/img;base64,' + message.message,
                width: width,
                height: height
            },
            width: width,
            height: height
        });
    };


}]);
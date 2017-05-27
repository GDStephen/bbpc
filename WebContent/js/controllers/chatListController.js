/**
 * Created by lileilie
 *
 * 最近联系人列表控制器
 */
indexModule.controller('chatListController',['$scope','$timeout','$state','$stateParams',
function ($scope,$timeout,$state,$stateParams) {
    // 开始聊天
    function SendChatNotify(chatPersionInfo)
    {
        $scope.titleId = chatPersionInfo.jid;
        var chatObj = {};
        if(chatPersionInfo.type === 'chat'){
            chatObj = contactManageService.fetchContactMap().get(chatPersionInfo.jid);
        }else if(chatPersionInfo.type === 'groupchat'){
            chatObj = groupManageService.fetchGroupMap().get(chatPersionInfo.jid)
        }
        $scope.$emit('currentChatData', chatObj);
    }
    $scope.chatItemClick = function(chatPerson){
        // 通知聊天控制器聊天人信息
        
        SendChatNotify(chatPerson);
        // 保存当前聊天人jid
        
        chatListService.setCurrentTalkToJid(chatPerson.jid)
        // 设置未读消息数为0
        chatListService.setUnReadZero(chatPerson.jid);
    };

    // 最近联系人jid数组 暂时需要通过界面发送一次 后期改成从数据库取
    // var chatArray = chatListService.getCurrentTalkJidList();
    // if(chatArray.length === 0){
    //     var chatListArray = globalService.GetUserInfo('chatListArray');
    //     chatListService.SetCurrentTalkJidList(chatListArray);
    // }

    // 获取最近联系人
    chatListService.getRecentChatList(function (recentTalkList) {
        console.log('wxz---最近会话控制器............服务数据返回');
        $timeout(function () {
            // 通过去聊天按钮按钮
            if($state.params.contatData){
                // 聊天人信息 通过路由状态传递数据$state.params.contatData
                var persionData = JSON.parse($state.params.contatData);
                chatListService.updateRecentChatList(persionData.data.jid,persionData.data,false)

                // 跳转来源 persionData.source
                console.log('跳转来至',persionData.source);
                //$scope.chatItemClick(persionData.data);
                SendChatNotify(persionData.data);
                $state.params.contatData = null;
            // 通过聊天tab进入
            }else{
                var currentTalkToJid = chatListService.getCurrentTalkToJid()
                // 判断是否有正在聊天的人
                if(currentTalkToJid){
                    for(var i = 0;i< recentTalkList.length; i++ ){
                        if(recentTalkList[i].jid === currentTalkToJid){
                            //這裏需要修改，判斷是否是群的如果是群的走群查詢接口
                            $scope.chatItemClick(recentTalkList[i]);
                            break;
                        }
                    }
                }
            }
            $scope.list = recentTalkList;
            // 调试用
            window.chatList = recentTalkList;
        },10);
    });

}])
// .directive('contextMenu', ['$window', function($window) {
//         return {
//             restrict: 'A',
//             /* replace:'true',*/
//             link: function($scope, element, attrs) {
//                 document.getElementById('contextMenu').style.display = 'none';
//                 var menuElement = angular.element(document.getElementById(attrs.target));

//                 function open(event, element, id) {
//                     document.getElementById('contextMenu').style.display = 'block';
//                     document.getElementById('contextMenu').style.top = event.clientY + 'px';
//                     document.getElementById('contextMenu').style.left = event.clientX + 'px';
//                     document.getElementById('id').value = id;
//                     /*varmenuElement.css('top', event.clientY + 'px');
//                     varmenuElement.css('left', event.clientX + 'px');*/
//                     /* $scope.rightId = document.getElementById('rightJid').value ;
//                      $scope.modelId=[{id:$scope.rightId}];*/
//                 }

//                 function close(element) {
//                     document.getElementById('contextMenu').style.display = 'none';
//                     document.getElementById('contextMenu').style.top = 0 + 'px';
//                     document.getElementById('contextMenu').style.left = 0 + 'px';
//                 }


//                 if (attrs.target == 'chatList') {
//                     $scope.model = [{
//                         name: "关闭聊天"
//                     }];
//                 }


//                 //显示右键菜单
//                 element.bind('contextmenu', function(event) {
//                     console.log(element);
//                     console.log(element.children().val());
//                     $scope.$apply(function() {
//                         var id = element.children().val();
//                         $scope.rightId = id;
//                         event.preventDefault();
//                         open(event, menuElement, id);
//                     });
//                     //窗口绑定点击事件 隐藏右键菜单
//                     angular.element($window).bind('click', function(event) {
//                         if (document.getElementById('contextMenu').style.display == 'block') {
//                             angular.element($window).unbind('click');
//                             $scope.$apply(function() {
//                                 event.preventDefault();
//                                 close(menuElement);
//                             });
//                         }
//                     });
//                 });
                
//             }
//         };
//     }]);
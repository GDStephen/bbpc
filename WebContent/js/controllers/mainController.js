indexModule.controller("mainController", ['$scope', '$rootScope', '$state', '$translate', '$timeout', 'uiTolls', function($scope, $rootScope, $state, $translate, $timeout, uiTolls) {
        
        // 路由状态生效
        $scope.$state=$state;
        $scope.model = [{
            name: "关闭聊天"
        }];

        // 界面切换
        $scope.switch = {};
        $scope.flag = true;
        $scope.langFlag = true;
        $scope.switch.isLogin = false;
        $scope.switch.isGuide = false;
        $scope.switch.isPersionMs = false;

        // 展示状态栏开关 默认关闭
        $scope.isShowStatusMenu = false;

        // 功能列表展示控制开关 默认关闭
        $scope.isShowSystem = false;

        // 在线开关
        $scope.isOnline = false;

        // 点击在线离线时候登录gif控制
        $scope.isLoadingOnline = false;


        // 获取浏览器可见的宽度  暂时不能确定是否有用
        // var w = document.documentElement.clientWidth;
        // var h = document.documentElement.clientHeight;

        /**-------------------------------- 消息订阅 --------------------------- */
        var subMsg=null;
        function SubcribeMessage() {
            subMsg = PubSub.subscribe('OnlineMessage', function(msgid, msgData) {
                if (msgData === 'Online') {
                    $scope.choseOnline = true;
                    $scope.choseOutline = false;
                    $scope.isLoadingOnline = false;
                } else if (msgData === 'Offline') {
                    $scope.choseOnline = false;
                    $scope.choseOutline = true;
                    $scope.$apply();
                }
            });

            // 订阅来自登陆的用户头像
            $scope.$on('userAvatarPath', function(e,data){
                $scope.userAvatarPath = data;
            });
        }

        SubcribeMessage();

        // 取消订阅
        $scope.$on('$destroy', function () {
            PubSub.unsubscribe(subMsg);
        });

        /**-------------------------------- 消息订阅 END --------------------------- */

        /**-------------------------------- 两侧通信 --------------------------- */

        var ipcRenderer = require('electron').ipcRenderer;
        $scope.closeWindow = function() {
            ipcRenderer.send('close-main-window');
        }

        /**-------------------------------- 两侧通信 END --------------------------- */

        // 语言切换功能
        $scope.changeLanguage = function(langKey) {
            $translate.use(langKey);
            sessionStorage.setItem('myLangKey', langKey);
            $scope.langFlag = !$scope.langFlag;
        };

        // 个人名片
        $scope.showProfile = function(jid,targetId,$event){
            var persionData = null;
            var w = parseInt(angular.element(window).width());
            var h = parseInt(angular.element(window).height());
            var eventElement= angular.element($event.target)
            var pop =  angular.element('#person-card')
            uiTolls.test(pop);

            if(jid =='myselfLogin'){
                jid = globalService.GetUserInfo('jid');
            }
            // persionData = commonService.getUserInfoByJid(jid);
            addressbookService.GetInfoBatch([jid],function(strFlagEnd, strGetType, userMap, userMapError){
                console.log(arguments);
                if (strFlagEnd === 'end') {
                    persionData = userMap.get(jid);
                    if(!persionData.avatarPath){
                       persionData.avatarPath = avatarService.getAvatar({
                           jid:persionData.jid,
                           path:persionData.avatar
                       },function(pathObj){
                            if(pathObj.statusCode===200){
                                $timeout(function(){
                                    $scope.eachPresonDetails.avatarPath = pathObj.path;
                                    console.log('个人面板头像下载完了',pathObj.path)
                                },0)
                            }
                       })
                    }
                     
                }
            });
            $scope.eachPresonDetails = persionData;
            var offset = eventElement.offset();
            offset.top = offset.top+40;
            offset.left = offset.left+10;
            if((offset.top+pop.height())>h){
                offset.top = 120;
                //offset.left = 540;
            }
            pop.css({
                top:offset.top,
                left:offset.left
            });
            $scope.switch.isPersionMs = true;
            angular.element(document).bind("click",function(e){
                $timeout(function(){
                   var target = angular.element(e.target); 
                    if(target.closest("#"+targetId).length == 0 && target.closest('#person-card').length == 0){
                       $scope.switch.isPersionMs = false;
                        // $scope.$apply();
                        console.log('绑定被解除');
                        angular.element(document).unbind('click');
                    }     
                },1)
            });

        };

        // 刷新个人信息profile
        $scope.refreshProfile = function(item){
            // BBGlobal.userLoading=true
            $scope.userLoading=true;
            $scope.eachPresonDetails = item;
        };

        // 关闭个人信息
        $scope.closeProfile = function(){
            angular.element("#mmpop_profile").hide();
        };

        // 状态列表展示
        $scope.showStatus = function() {
            $scope.isShowStatusMenu = true;
            //$scope.isStatus = !$scope.isStatus;
            angular.element(document).bind("click", function(e) {
                var target = angular.element(e.target);
                if (target.closest(".nickname").length == 0) {
                    $scope.isShowStatusMenu = false;
                }
            });
        };

        // 在线功能
        $scope.onlineClick = function() {
            $scope.isShowStatusMenu = false;
            $scope.isLoadingOnline = true;
            $scope.choseOnline = false;
            $scope.choseOutline = false;
            var sessionContent = sessionStorage.getItem("content");
            if (sessionContent == null || sessionContent == "") {
                return alert("sessionContent:null");
            } else {
                //showMainChat();
                var decryptcontent = utilService.decryptByDES(sessionContent, desKey);
                var msg = JSON.parse(decryptcontent);
                globalService.SetUserInfo('username') = msg.data.username;
                globalService.SetUserInfo('pwd') = msg.data.pwd;
                LoginStateService.LoginXMPP(msg.data.username, msg.data.pwd);
            }

        };

        // 离线功能
        $scope.outlineClick = function() {
            $scope.isShowStatusMenu = false;
            BBXmpp.disconnect();
            $scope.isOnline = false;
        };

        // 放大图片
        $scope.previewImg = function(message){
            var w = document.documentElement.clientWidth;
            var h = document.documentElement.clientHeight ;
            var imgDom = document.getElementById("img_dom");
            var i =document.getElementById("img_preview");
            i.src = message.link;
            var img = new Image();
            img.src = i.src;
            var j;
            img.onload = function () {
                $scope.isLoaded = true;
                var orgw = img.width;
                var orgh = img.height;
                if(orgw>orgh){
                if(orgw>600){
                    imgDom.style.width = 600+'px';
                    imgDom.style.height = orgh*(600/orgw)+'px';
                    j = (w-600)/2;
                }
                else{
                    j = (w-orgw)/2;
                }
                }
                if(orgw<=orgh){
                    if(orgh>(h-50)){
                        imgDom.style.height = 400+'px';
                        imgDom.style.width = orgw*(400/orgh)+'px';
                        j = (w-orgw*(400/orgh))/2;
                    }else{
                        j = (w-orgw)/2;
                    }
                }
                console.log(j);
                
                if(orgh<=(h-50)){
                    imgDom.style.top = (h-orgh)/2+'px';
                }
                
                imgDom.style.left = j+'px';

                $scope.bigImage = message.link;
                $scope.$apply();
                zooming.add(document.getElementById("img_preview"));
            };

                //$scope.showImage = true;
                document.getElementById('img_big').style.display = 'block';
                $scope.isLoaded = false;
                imgDom.style.top = '50px';
        };

        // 关闭图片
        $scope.closeImage = function(){
            current = 0;
            var imgId = document.getElementById("img_preview");
            var imgDom = document.getElementById("img_dom");
            imgId.className = 'rotate'+current;
            //imgId.src = "";
            //$scope.showImage = false;
            document.getElementById('img_big').style.display = 'none';
            $scope.bigImage = '';
            $scope.imageId = '';
            /*imgDom.style.width = '0px';
            imgDom.style.height = '0px';*/
            imgDom.style.cssText = "";
            imgId.style.cssText = "";
            imgId.src = "";
            $scope.$apply();
        };
        // 旋转图片 current是图片处理全局变量
        var current = 0;
        $scope.transformImage = function(){
            var imgDom = document.getElementById("img_dom");
            var imgPreview = document.getElementById('img_preview');
            // 初始化图片位置
            imgDom.style.cssText = "";
            imgPreview.style.cssText = "";
            imgPreview.src = $scope.bigImage;
            var img = new Image();
            img.src = imgPreview.src;
            var orgw = img.width;
            var orgh = img.height;
            if(orgw>orgh){
                if(orgw>600){
                    imgDom.style.width = 600+'px';
                    imgDom.style.height = orgh*(600/orgw)+'px';
                    j = (w-600)/2;
                }
                else{
                    j = (w-orgw)/2;
                }
            }
            if(orgw<=orgh){
                if(orgh>(h-50)){
                    imgDom.style.height = 400+'px';
                    imgDom.style.width = orgw*(400/orgh)+'px';
                    j = (w-orgw*(400/orgh))/2;
                }else{
                    j = (w-orgw)/2;
                }
            }
            imgDom.style.left = j+'px';
            imgDom.style.top = '50px';
            // 旋转图片
            current = (current+90)%360;
            imgPreview.className = 'rotate'+current;
            imgDom.style.width = imgDom.style.height+'px';
            imgDom.style.height = imgDom.style.width+'px';
        };

        // 功能列表展示
        $scope.showSystemMenu = function() {
            $scope.isShowSystem = true;
            //$scope.isStatus = !$scope.isStatus;
            angular.element(document).bind("click", function(e) {
                var target = angular.element(e.target);
                if (target.closest(".nickname").length == 0) {
                    $scope.isShowSystem = false;
                }
            });
        };

        // 退出登录  需要重新实例化的对象或者重新复制的变量 自主添加到函数中
        $scope.loginout = function() {

            //psr退出窗口
            ipcRenderer.send('close-main-window');
            BBXmpp.disconnect();
            // chatMap = new Map();
            // circleRoomMap = new Map(); //群聊房间Map ab046424
            sessionStorage.clear();
            $scope.isLoading = false;
        };

        // 警告提示
        $scope.isShowPoint = function() {
            document.getElementById('point').style.display = 'none';
            $scope.pointDesc = '';
        };

        // 删除群聊  后期重构  目前没有用
        // $scope.removeGroup = function(id) {
        //     if ($rootScope.titleId == id) {
        //         $rootScope.titleId = "";
        //         $rootScope.titleName = "";
        //         $rootScope.currentChat = false;
        //         $rootScope.isDisplayName = true;
        //         $rootScope.titleType = "";
        //     }
        //     // 不能移除全局chatMap中的键值，应该移除windowsArray中的id对应的键值对
        //     windowsArray.remove(id);
        //     sessionStorage.setItem("windowsArray", windowsArray);
        //     sessionStorage.removeItem(id);
        //     // BBUI.changeNewChatList();
        // };

        /**-------------------------- 函数声明 ------------------------------------------ */

        var zooming = function(e) {
            // 去除外面边框的样式
            // 获取浏览器可见的宽度
            var w = document.documentElement.clientWidth;
            var h = document.documentElement.clientHeight;
            var imgDom = document.getElementById("img_dom");
            var imgPreview = document.getElementById("img_preview");

            e = window.event || e;
            var o = this,
                data = e.wheelDelta || e.detail * 40,
                zoom, size;
            if (!+'\v1') { //IE
                zoom = parseInt(o.style.zoom) || 100;
                zoom += data / 12;
                if (zoom > zooming.min)
                    o.style.zoom = zoom + '%';
            } else {
                size = o.getAttribute("_zoomsize").split(",");
                zoom = parseInt(o.getAttribute("_zoom")) || 100;
                zoom += data / 12;
                if (zoom > zooming.min) {
                    o.setAttribute("_zoom", zoom);
                    o.style.width = size[0] * zoom / 100 + "px";
                    o.style.height = size[1] * zoom / 100 + "px";
                    if (parseInt(o.style.width) > parseInt(imgDom.style.width)) {
                        imgDom.style.left = (w - parseInt(o.style.width)) / 2 + "px";
                    } else {
                        imgDom.style.left = (w - parseInt(imgDom.style.width)) / 2 + "px";
                    }

                    if (parseInt(o.style.height) > 600) {
                        imgDom.style.top = "";
                    }
                } else {
                    imgDom.style.left = (w - parseInt(imgDom.style.width)) / 2 + "px";
                    imgDom.style.top = "100px";
                }
            }
        };

        zooming.add = function(obj, min) { //第一个参数指定可以缩放的图片，min指定最小缩放的大小 ,default to 50

            zooming.min = min || 50;
            obj.onmousewheel = zooming;
            if (/a/ [-1] == 'a') //if Firefox
                obj.addEventListener("DOMMouseScroll", zooming, false);
            if (-[1, ]) { //if not IE
                obj.setAttribute("_zoomsize", obj.offsetWidth + "," + obj.offsetHeight);
            }
        };

        
        function touchScroll(id) {
            var msgdiv = document.getElementById(id);
            msgdiv.scrollTop = msgdiv.scrollHeight;

        }
        //未使用psr
        function bottomClick() {
            angular.element('#msg_end').focus();
        };
        function getPosition(ele, oRefer) {
            oRefer = oRefer || document.body;
            var x = ele.offsetLeft;
            var y = ele.offsetTop;
            p = ele.offsetParent;
            while (p != oRefer && p != document.body) {
                if (window.navigator.userAgent.indexOf('MSIE 8.0') > -1) {
                    x += p.offsetLeft;
                    y += p.offsetTop;
                } else {
                    x += p.offsetLeft + p.clientLeft;
                    y += p.offsetTop + p.clientTop;
                }
                p = p.offsetParent;
            }
            var obj = {};
            obj.x = x;
            obj.y = y;
            console.log(obj);
            return obj;
        }
     
    }])
    // .directive('contextMenu', ['$window', function($window) {
    //     return {
    //         restrict: 'A',
    //         /* replace:'true',*/
    //         link: function($scope, element, attrs) {
    //             document.getElementById('contextMenu').style.display = 'none';
    //             var menuElement = angular.element(document.getElementById(attrs.target));

    //             function open(event, element, id) {
    //                 document.getElementById('contextMenu').style.display = 'block';
    //                 document.getElementById('contextMenu').style.top = event.clientY + 'px';
    //                 document.getElementById('contextMenu').style.left = event.clientX + 'px';
    //                 document.getElementById('id').value = id;
    //                 /*varmenuElement.css('top', event.clientY + 'px');
    //                 varmenuElement.css('left', event.clientX + 'px');*/
    //                 /* $scope.rightId = document.getElementById('rightJid').value ;
    //                  $scope.modelId=[{id:$scope.rightId}];*/
    //             }

    //             function close(element) {
    //                 document.getElementById('contextMenu').style.display = 'none';
    //                 document.getElementById('contextMenu').style.top = 0 + 'px';
    //                 document.getElementById('contextMenu').style.left = 0 + 'px';
    //             }


    //             if (attrs.target == 'chatList') {
    //                 $scope.model = [{
    //                     name: "关闭聊天"
    //                 }];
    //             }
    //             /* if(attrs.target=='other'){
    //                  $scope.model=[{name:"复制"},{name:"转发"}];
    //              }*/

    //             //显示右键菜单
    //             element.bind('contextmenu', function(event) {
    //                 console.log(element);
    //                 console.log(element.children().val());
    //                 $scope.$apply(function() {
    //                     var id = element.children().val();
    //                     $scope.rightId = id;
    //                     event.preventDefault();
    //                     open(event, menuElement, id);
    //                 });
    //                 //窗口绑定点击事件 隐藏右键菜单
    //                 angular.element($window).bind('click', function(event) {
    //                     if (document.getElementById('contextMenu').style.display == 'block') {
    //                         angular.element($window).unbind('click');
    //                         $scope.$apply(function() {
    //                             event.preventDefault();
    //                             close(menuElement);
    //                         });
    //                     }
    //                 });
    //             });
                
    //         }
    //     };
    // }]);
/*.directive('statusMenu', ['$window', function($window) {
        return {
            restrict: 'A',
            */
/* replace:'true',*/
/*
            link: function($scope, element, attrs) {
                document.getElementById('statusMenu').style.display='none';
                varmenuElement = angular.element(document.getElementById(attrs.target));

                console.log(varmenuElement);
                function open(event, element ) {
                    document.getElementById('statusMenu').style.display='block';

                }

                function close(element) {
                    document.getElementById('statusMenu').style.display='none';

                }

                if(attrs.target=='statusList'){
                    $scope.statusModel=[{name:"在线"},{name:"离线"}];
                }
                */
/* if(attrs.target=='other'){
                 $scope.model=[{name:"复制"},{name:"转发"}];
                 }*/
/*
                console.log($scope.model);

                //显示右键菜单
                element.bind('contextmenu', function(event) {
                    event.preventDefault();
                    open(event, varmenuElement);
                });
                //窗口绑定点击事件 隐藏右键菜单
                angular.element($window).bind('click', function(event) {
                    if (document.getElementById('statusMenu').style.display=='block') {
                        event.preventDefault();
                        close(varmenuElement);
                    }
                });
            }
        };
    }]).directive('systemMenu', ['$window', function($window) {
        return {
            restrict: 'A',
            */
/* replace:'true',*/
/*
            link: function($scope, element, attrs) {
                document.getElementById('systemMenu').style.display='none';
                varmenuElement = angular.element(document.getElementById(attrs.target));

                console.log(varmenuElement);
                function open(event, element ) {
                    document.getElementById('systemMenu').style.display='block';

                }

                function close(element) {
                    document.getElementById('systemMenu').style.display='none';

                }
                if(attrs.target=='systemList'){
                    $scope.systemModel=[{name:"退出登录"}];
                }
                */
/* if(attrs.target=='other'){
                 $scope.model=[{name:"复制"},{name:"转发"}];
                 }*/
/*
                console.log($scope.model);

                //显示右键菜单
                element.bind('contextmenu', function(event) {
                    event.preventDefault();
                    open(event, varmenuElement);
                });
                //窗口绑定点击事件 隐藏右键菜单
                angular.element($window).bind('click', function(event) {
                    if (document.getElementById('systemMenu').style.display=='block') {
                        event.preventDefault();
                        close(varmenuElement);
                    }
                });
            }
        };
    }]);*/

indexModule.filter("address", function() {
    return function(input) {
        if (input == null || input == '' || typeof(input) == 'undefined') {
            return '';
        } else {
            return BBArea.getFullName(input);
        }
    }
});
/**
 * Created by PrincessofUtopia on 2016/1/30.
 */
/*var bbChatModule = angular.module('indexApp', ['ngRoute']);*/
var chatTitleName;
var indexModule = angular.module('indexApp', ['ui.router','ngRoute','ngSanitize','pascalprecht.translate']);
indexModule.controller("loginController", ['$scope','$rootScope','$state','$translate',function ($scope,$rootScope,$state,$translate) {
    $rootScope.$state = $state; // 使$state生效
    console.log($state);
    $scope.model=[{name:"关闭聊天"}];
    $scope.isShowChatRoomMembers = false;
    /*$scope.isShowIcon = false;*/
    $scope.isLogin = true;
    $scope.isScan = false;
    $scope.loginStatus = true;
    //$scope.showImage = false;
    $scope.choseChat = true;
    $scope.currentChat = false;
    $scope.isDisplayName = true;
    $scope.isOnline = false;
    $scope.isStatus = false;
    $scope.system_menu = false;
    $scope.displayName =[];
    document.getElementById('contextMenu').style.display='none';
    //document.getElementById('img_big').style.display = 'none';
    // 离线弹出层
    document.getElementById('off_tip').style.display = 'none';

    // 获取浏览器可见的宽度
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight ;


    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
        sessionStorage.setItem('myLangKey',langKey);
    };

    $scope.changSecond = function()
    {
        $scope.isScan = true;
    };
    $scope.makeSure=function(){
        $scope.isLogin = false;
    };
    $scope.makeSure1=function(data){
        //alert(data);
        console.log(data);
        $rootScope.list = data;
        console.log(data);
        $scope.$apply();//刷新数据
    };

    $scope.refresh=function(data){
        console.log(data);
        $rootScope.list = data;
    };
    /*$scope.tabClickChat = function () {
        $scope.choseChat = true;
    };
    $scope.tabClickContact = function(){
        $scope.choseChat = false;
    };*/

    $scope.chatItemClick = function(chatPerson){
        // 草稿存储
        /*if(chatPerson.jid!=BBGlobal.tojid&&BBGlobal.tojid!=""){
            var val = document.getElementById('editArea').innerHTML;
            draftMap.put(BBGlobal.tojid,val);
        }*/
        var val = document.getElementById('editArea').innerHTML;
        draftMap.put(BBGlobal.tojid,val);

        var draft = draftMap.get(chatPerson.jid);
        if(draft==undefined){
            document.getElementById('editArea').innerHTML = "";
        }else{
            document.getElementById('editArea').innerHTML = draft;
        }

        $scope.currentChat = true;
        $scope.isDisplayName = false;
        $scope.isShowChatRoomMembers = false;
        BBGlobal.tojid = chatPerson.jid;
        var count = parseInt(chatPerson.count);
        count = 0;
        if(chatPerson.isAt == true){
            chatPerson.message = (chatPerson.message).replace("<span style='color:red'>[有人@我]：</span>","");
            chatPerson.isAt = false;
        }

        $rootScope.titleId = chatPerson.jid;
        console.log($rootScope.titleId);
        $rootScope.titleName = chatPerson.name;
        console.log($rootScope.titleName);
        $rootScope.titleType = chatPerson.type;
        console.log($rootScope.titleType);
        $rootScope.messageInfo = [];
        //console.log(chatLogMap.get(id));
        BBUI.getChatLog(chatPerson.jid);
        if(chatPerson.type!='chat'){
            $rootScope.chatMember = BBUI.getChatMember(chatPerson.jid);
            $scope.chatAtMember = $rootScope.chatMember;
            console.log($rootScope.chatMember);
        }
        $scope.$apply();
        //BBUI.bottomClick();
        // 滚动轮最底部
        BBUI.touchScroll("wholeScroll");
    };
    $scope.newChatClick = function(chatPerson){
        document.getElementById("mmpop_search").style.display = 'none';
        document.getElementById("keyword").value = '';
        $scope.currentChat = true;
        $scope.isDisplayName = false;
        $scope.isShowChatRoomMembers = false;
        BBGlobal.tojid = chatPerson.jid;
        var count = parseInt(chatPerson.count);
        count = 0;
        $rootScope.titleId = chatPerson.jid;
        console.log($rootScope.titleId);
        $rootScope.titleName = chatPerson.name;
        console.log($rootScope.titleName);
        $rootScope.titleType = chatPerson.type;
        console.log($rootScope.titleType);
        $rootScope.messageInfo = [];
        //console.log(chatLogMap.get(id));
        BBUI.getChatLog(chatPerson.jid);
        if(chatPerson.type!='chat'){
            $rootScope.chatMember = BBUI.getChatMember(chatPerson.jid);
            $scope.chatAtMember = $rootScope.chatMember;
            console.log($rootScope.chatMember);
        }
        $scope.$apply();
    };

    /*
     * 发送消息
     * content：当前聊天内容
     * MsgType：消息类型
     *          1.MSGTYPE_TEXT：纯文本
     *          2.MSGTYPE_VOICE：语音
     *          3.MSGTYPE_IMAGE：图片
     * MMIsSend：true：我发送的消息 false：对方传入消息
     * UUId：当前聊天人姓名
     * head：头像
     * */
    $rootScope.messageInfo = [];
    $scope.sendUIMessage = function(currentId,messageData){
        $rootScope.messageInfo.push(messageData);
        tojid = currentId;
        $rootScope.imgCount = messageData.uuid;
        $scope.$apply();			//刷新数据

        // 滚动轮最底部
        BBUI.touchScroll("wholeScroll");
    };

    // 加载通讯录
    $scope.showAllContact = function(data){
        $rootScope.allContacts = data;
        console.log(data);
        $scope.$apply();//刷新数据
    };

    // 通讯录详细信息
    $scope.showDetails = function(item){
        $scope.currentContact = true;
        $scope.RoomContact =item.roomContact;
        $scope.contactType =item.type;
        $scope.contactId = item.jid;
        $scope.contactName = item.name;
        $scope.contactAvatar = item.avatar100;
        $scope.smallAvatar = item.avatar;
        // 安邦人图标
        $scope.accChatType = item.accountType;
        /*$scope.contactSignature = item.signature;*/
        /*$scope.contactProvince = item.areaId;*/
        // 根据id号从circleMap中获取详细信息
        $rootScope.contactDetails = circleMap.get(item.jid);
        console.log($rootScope.contactDetails);
    };

    // 搜索好友
    document.getElementById("mmpop_search").style.display = 'none';
    var inputChar='';
    $scope.searchKeydown = function($event){
       var input =  document.getElementById("keyword").value;
        if(input!=null&&input!=''){
            $scope.searchContacts = BBUI.searchFriends(input);
            document.getElementById("mmpop_search").style.display = 'block';
        }
        else{
            document.getElementById("mmpop_search").style.display = 'none';
        }
    };

    
    // 点击at全选按钮
    /*$scope.chooseAtAll = function(){
        document.getElementById("atKeyword").value="";
        document.getElementById("editArea").innerHTML +="全体群成员";
        document.getElementById("at_someone").style.display = 'none';
    };*/
    // 点击at取消按钮
    $scope.cancelAtMember = function () {
        document.getElementById("at_someone").style.display = 'none';
        document.getElementById("atKeyword").value="";
    };


    // 放大图片
    $scope.previewImg = function(message){
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
            BBUI.zooming.add(document.getElementById("img_preview"));
        };

            //$scope.showImage = true;
            document.getElementById('img_big').style.display = 'block';
            $scope.isLoaded = false;
            imgDom.style.top = '50px';
        };

    // 关闭图片
    $scope.closeImage = function(){
        //document.getElementById("img_big").style.display = 'none';
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
    // 旋转图片
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

    // 播放语音
    $scope.playVoice = function(message){
        message.play = true;
        message.read = !message.read;
        if(BBGlobal.isChrome){
        	fetchBlob(message.message, function (blob) {
            	convertAmrBlobToWav(blob,message);
                message.read = $scope.msgVoice;
            });
        }else{
            if(message.mp3url!=''){
                playIEMp3(message);
                //message.read = $scope.msgVoice;
                return;
            }
            $.ajax({
                type:"POST",
                url:BBWeb.bashPath() + '/getMp3Key',
                async: false,
                dataType:"json",
                data:{message:message.message},
                success:function(data){
                    if (data.serverCode == "1") {
                        var key = data.key;
                        message.mp3url = key;
                        playIEMp3(message);
                       // message.read = $scope.msgVoice;

                    }else{
                        message.read = false;
                        var app = document.body;
                        var $scope = angular.element(app).scope();
                        $scope.pointDesc = data.serverMsg;
                        $scope.$apply();
                        document.getElementById('point').style.display = 'block';
                    }
                },
                failure:function (result) {
                    message.read = false;
                    var app = document.body;
                    var $scope = angular.element(app).scope();
                    $scope.pointDesc = '语音转码异常，请联系管理员';
                    $scope.$apply();
                    document.getElementById('point').style.display = 'block';
                }
            });
        }

    };

    // 群成员面版
    $scope.showChatRoomMembers = function($event){
        $scope.isShowChatRoomMembers = !$scope.isShowChatRoomMembers;
        console.log($event);
    };

    // 页面跳转
    $scope.transferClick = function(contactId,contactName,nickName,contactAvatar,contactType,accountType){
        BBWeb.changeWinArr(contactId);  //更新对话窗口序列
        if(contactName==undefined||contactName==""){
        	contactName = nickName;
        }
        BBWeb.updatechatMap(contactId, contactName, contactAvatar, true, "", "","",contactType,"",accountType);
        BBUI.changeNewChatList();
        var chatInfo = chatMap.get(contactId);
        // 安邦人类型判断
        if(chatInfo.accountType==undefined){
         chatInfo.accountType = accountType;
         }
        if(contactName!=null){
            chatInfo.name = contactName;
        }
        else{
            chatInfo.name = nickName;
        }

        $scope.newChatClick(chatInfo);
    };


    $scope.fn = function($event,sName){
        /*根据sName 来判断使用什么函数*/
        var id = document.getElementById('id').value;
        console.log(id);
        console.log(sName);
        $scope.fns[sName]($event,id);
    };
    //每个项点击的事件
    $scope.fns = {
        "关闭聊天":function($event,id){
            if($rootScope.titleId==id){
                $rootScope.titleId = "";
                $rootScope.titleName = "";
                $scope.currentChat = false;
                $scope.isDisplayName = true;
                $rootScope.titleType = "";
               /* var chatLog = chatLogMap.get(id);
                chatLog = null;*/
                $rootScope.messageInfo = [];
                BBGlobal.tojid = "";
                //$("#chatItem").removeClass("active");
            }

            console.log($event);
            // 不能移除全局chatMap中的键值，应该移除windowsArray中的id对应的键值对
            windowsArray.remove(id);
            sessionStorage.setItem("windowsArray",windowsArray);
            sessionStorage.removeItem(id);
            BBUI.changeNewChatList();
        },
        "Close Chats":function($event,id){
            if($rootScope.titleId==id){
                $rootScope.titleId = "";
                $rootScope.titleName = "";
                $scope.currentChat = false;
                $scope.isDisplayName = true;
                $rootScope.titleType = "";
                /* var chatLog = chatLogMap.get(id);
                 chatLog = null;*/
                $rootScope.messageInfo = [];
                BBGlobal.tojid = "";
                //$("#chatItem").removeClass("active");
            }

            console.log($event);
            // 不能移除全局chatMap中的键值，应该移除windowsArray中的id对应的键值对
            windowsArray.remove(id);
            sessionStorage.setItem("windowsArray",windowsArray);
            sessionStorage.removeItem(id);
            BBUI.changeNewChatList();
        }
        /* ,
         "置顶":function($event){
         console.log('12-'+$event);
         alert('置顶')
         }
         */
    };

    // 删除群聊
    $scope.removeGroup = function(id){
        if($rootScope.titleId==id){
            $rootScope.titleId = "";
            $rootScope.titleName = "";
            $scope.currentChat = false;
            $scope.isDisplayName = true;
            $rootScope.titleType = "";
            /* var chatLog = chatLogMap.get(id);
             chatLog = null;*/
            $rootScope.messageInfo = [];
            BBGlobal.tojid = "";
            //$("#chatItem").removeClass("active");
        }
        // 不能移除全局chatMap中的键值，应该移除windowsArray中的id对应的键值对
        windowsArray.remove(id);
        sessionStorage.setItem("windowsArray",windowsArray);
        sessionStorage.removeItem(id);
        BBUI.changeNewChatList();
    };

    // 状态列表展示
    //document.getElementById("statusMenu").style ='none';
    $(".status").hide();
    $scope.showStatus = function(){
        $(".status").show();
        //$scope.isStatus = !$scope.isStatus;
        $(document).bind("click",function(e){
            var target = $(e.target);
            if(target.closest(".nickname").length == 0){
                $(".status").hide();
            }
        });
        //e.stopPropagation();//阻止事件向上冒泡
    };
   // 在线功能
    $scope.isLoadingOnline = false;
    $scope.onlineClick = function(){
        $(".status").hide();
        $scope.isLoadingOnline = true;
        $scope.choseOnline = false;
        $scope.choseOutline = false;
        var sessionContent = sessionStorage.getItem("content");
        if (sessionContent == null || sessionContent == "") {
            return alert("sessionContent:null");
        } else {
            //showMainChat();
            var decryptcontent = decryptByDES(sessionContent, desKey);
            var msg = JSON.parse(decryptcontent);
            BBGlobal.username = msg.data.username;
            BBGlobal.pwd = msg.data.pwd;
            connection = new Strophe.Connection(BBGlobal.BOSH_SERVICE);
            connection.connect(msg.data.username, msg.data.pwd, BBWeb.onConnect);
        }
        //$scope.isOnline = true;

    };
    // 离线功能
    $scope.outlineClick = function(){
        $(".status").hide();
        connection._doDisconnect();
        $scope.isOnline = false;
    };

    // 功能列表展示
    //document.getElementById("systemMenu").style ='none';
    $(".system").hide();
    $scope.showSystemMenu = function(){
        $(".system").show();
        //$scope.isStatus = !$scope.isStatus;
        $(document).bind("click",function(e){
            var target = $(e.target);
            if(target.closest(".nickname").length == 0){
                $(".system").hide();
            }
        });
        //e.stopPropagation();//阻止事件向上冒泡
    };
    
    // 退出登录
    $scope.loginout = function(){
        //BBWeb.statusResult();
        connection._doDisconnect();
        BBGlobal =  new BBWeb_Global();
        BBGlobal = new BBWeb_Global();
        windowsArray = new Array();
        chatMap = new Map();
        chatLogMap = new Map();  //聊天记录Map  ab046424
        contactMap = new Map();  //好友通讯录Map ab046424
        circleRoomMap = new Map(); //群聊房间Map ab046424
        circleMap = new Map();  //群成员Map ab046424
        ackArray = new Array(); //消息回置队列
        ackMap = new Map(); //消息回置Map
        recMsgIdArray = new Array(); //消息id数组，只存储最近500条
        scrollMap = new Map();
        BBWeb.unReadCount();//清空未读消息数
        sessionStorage.clear();
        $("#qrdiv").show();
        $("#qrokdiv").hide();
        $("#loginDiv").css('display','block');
        //最好有一个转场特效
        $("#mainchat").css('display','none');
        connection = new Strophe.Connection(BBGlobal.BOSH_SERVICE);
        $scope.isLoading = BBGlobal.initDataFlag;
        $rootScope.titleId = "";
        $rootScope.titleName = "";
        $scope.currentChat = false;
        $scope.isDisplayName = true;
        $rootScope.titleType = "";
        /* var chatLog = chatLogMap.get(id);
         chatLog = null;*/
        $rootScope.messageInfo = [];
        BBGlobal.tojid = "";
        $scope.isShowChatRoomMembers = false;
    };

    // 展示个人信息profile
    $("#mmpop_profile").hide();
    $scope.showProfile = function(jid,targetId,$event){
        var w = parseInt($(window).width());
        var h = parseInt($(window).height());
        //var i =1;
        // if(jid =='myselfLogin'){
        //     //jid = BBGlobal.jid;
        //     //jid = jid.substring(0,jid.length-4);
        //     BBGlobal.userLoading=true;
        //     $scope.userLoading=BBGlobal.userLoading;
        //     $rootScope.eachPresonDetails = BBGlobal.loginInfo;
        //     //$("#mmpop_profile").show().css({"left":"52px","top":"106px"});
        //     var myoffset = $(event.target).offset();
        //     myoffset.top = myoffset.top+40;
        //     myoffset.left = myoffset.left+10;
        //     $("#mmpop_profile").show().css(myoffset);
        // } else{
            if(jid =='myselfLogin'){
                jid = BBGlobal.jid;
            }
            jid = jid.split('/')[0];
            var info=circleMap.get(jid);
            if(info.ver==undefined||info.ver==''){
                BBGlobal.userLoading=false;
                var userarray=[];
                userarray[0]=jid;
                BBGlobal.userLoadingjid=jid;
                BBWeb.iqUserInfo(userarray);
            }else{
                BBGlobal.userLoading=true;
            }
            $scope.userLoading=BBGlobal.userLoading;
            $rootScope.eachPresonDetails = circleMap.get(jid);
            var offset = $($event.target).offset();
            offset.top = offset.top+40;
            offset.left = offset.left+10;
            if((offset.top+$('#mmpop_profile').height())>h){
                offset.top = 120;
                //offset.left = 540;
            }
            $("#mmpop_profile").show().css(offset);
        //}

       /* $(document).bind("click",function(e){
            var target = $(e.target);
            if(target.closest("#"+targetId).length == 0){
                $("#mmpop_profile").hide();
            }

            e.stopImmediatePropagation();
        });*/

    };
    //刷新个人信息profile
    $scope.refreshProfile = function(item){
        $scope.userLoading=BBGlobal.userLoading;
        $rootScope.eachPresonDetails = item;
    };
    $scope.closeProfile = function(){
        $("#mmpop_profile").hide();
    };
        //消息重发
    $scope.resendMsg = function(message){

        message.ackflag='0';
        BBWeb.resendText(message)
    };
    // 警告提示
    document.getElementById('point').style.display = 'none';
    $scope.isShowPoint = function(){
        document.getElementById('point').style.display = 'none';
        $scope.pointDesc = '';
    };
    // 表情面版展示
    //document.getElementById('mmpop_expression_panel').style.display = 'none';
    $scope.showExpressionPanel = function(event){
        document.getElementById('mmpop_expression_panel').style.display = 'block';
        var mb = BBUI.myBrowser();
        if(mb=='IE') {
            document.getElementById('exp_panel').style.marginBottom = '-17px';
            document.getElementById('exp_panel').style.marginRight = '-17px';
        }
    };

    $scope.paste = function () {
        alert('paste');
    }

}])
.directive('contextMenu', ['$window', function($window) {
    return {
        restrict: 'A',
       /* replace:'true',*/
        link: function($scope, element, attrs) {
            document.getElementById('contextMenu').style.display='none';
            varmenuElement = angular.element(document.getElementById(attrs.target));

            function open(event, element , id ) {
                document.getElementById('contextMenu').style.display='block';
                document.getElementById('contextMenu').style.top = event.clientY + 'px';
                document.getElementById('contextMenu').style.left = event.clientX + 'px';
                document.getElementById('id').value=id;
                /*varmenuElement.css('top', event.clientY + 'px');
                varmenuElement.css('left', event.clientX + 'px');*/
               /* $scope.rightId = document.getElementById('rightJid').value ;
                $scope.modelId=[{id:$scope.rightId}];*/
            }

            function close(element) {
                document.getElementById('contextMenu').style.display='none';
                document.getElementById('contextMenu').style.top = 0 + 'px';
                document.getElementById('contextMenu').style.left = 0 + 'px';
            }


            if(attrs.target=='chatList'){
                $scope.model=[{name:"关闭聊天"}];
            }
            /* if(attrs.target=='other'){
                 $scope.model=[{name:"复制"},{name:"转发"}];
             }*/

            //显示右键菜单
            element.bind('contextmenu', function(event) {
                console.log(element);
                console.log(element.children().val() );
                $scope.$apply(function() {
                    var id = element.children().val();
                    $scope.rightId = id;
                    event.preventDefault();
                    open(event, varmenuElement , id);
                });
            });
            //窗口绑定点击事件 隐藏右键菜单
            angular.element($window).bind('click', function(event) {
                if (document.getElementById('contextMenu').style.display=='block') {
                    $scope.$apply(function() {
                        event.preventDefault();
                        close(varmenuElement);
                    });
                }
            });
        }
    };
}]);
/*.directive('statusMenu', ['$window', function($window) {
        return {
            restrict: 'A',
            *//* replace:'true',*//*
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
                *//* if(attrs.target=='other'){
                 $scope.model=[{name:"复制"},{name:"转发"}];
                 }*//*
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
            *//* replace:'true',*//*
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
                *//* if(attrs.target=='other'){
                 $scope.model=[{name:"复制"},{name:"转发"}];
                 }*//*
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

indexModule.filter("address", function () {
    return function (input) {
        if (input == null || input == '' || typeof(input) == 'undefined') {
            return '';
        } else {
            return BBArea.getFullName(input);
        }
    }
});


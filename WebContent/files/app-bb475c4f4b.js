/**
 * Created by PrincessofUtopia on 2016/1/30.
 */
/*var test1 ='tank'; //全局变量*/


indexModule.config(['$stateProvider','$urlRouterProvider','$translateProvider',function($stateProvider,$urlRouterProvider,$translateProvider) {
        /*$urlRouterProvider.otherwise("/chat");*/
        $stateProvider
            .state('chat', {
                url: "/index",
                /* cache:'true',*/
                views: {
                    "navView": {
                        templateUrl: "templates/chatList.html",
                        controller:function($scope,$state){
                            // 判断浏览器是否为IE浏览器: margin-bottom: -17px; margin-right: -17px;
                            // 获取浏览器可见的宽度
                            var wchat = document.documentElement.clientWidth;
                            var hchat = document.documentElement.clientHeight ;
                            /*var mb = BBUI.myBrowser();
                            if(mb=='IE'){
                                document.getElementById('navChat').style.marginBottom = '-17px';
                                document.getElementById('navChat').style.marginRight = '-17px';
                                if(hchat<=800){
                                    document.getElementById('navChat').style.height = (hchat-202)+"px";
                                }else{
                                    document.getElementById('navChat').style.height = (hchat*0.8-202)+"px";
                                }
                            }
                            else{
                                document.getElementById('navChat').style.marginBottom = '0px';
                                document.getElementById('navChat').style.marginRight = '0px';
                                if(hchat<=800){
                                    document.getElementById('navChat').style.height = (hchat-220)+"px";
                                }else{
                                    document.getElementById('navChat').style.height = (hchat*0.8-220)+"px";
                                }
                            }*/

                        }
                    },
                    "contentView": {
                        templateUrl: "templates/chatContent.html?v20170220",
                        controller:function($scope,$state){
                            // 获取浏览器可见的宽度
                            var wchat = document.documentElement.clientWidth;
                            var hchat = document.documentElement.clientHeight ;
                            // 判断浏览器是否为IE浏览器: margin-bottom: -17px; margin-right: -17px;
                            /*var mb = BBUI.myBrowser();
                            if(mb=='IE'){
                                document.getElementById('wholeScroll').style.marginBottom = '-17px';
                                document.getElementById('wholeScroll').style.marginRight = '-17px';
                            }
                            else{
                                document.getElementById('wholeScroll').style.marginBottom = '0px';
                                document.getElementById('wholeScroll').style.marginRight = '0px';
                            }*/
                            /*if(hchat<=800){
                                document.getElementById('wholeScroll').style.height = (hchat-232-17)+"px";
                            }else{
                                document.getElementById('wholeScroll').style.height = (hchat*0.8-232-17)+"px";
                            }*/
                            document.getElementById('mmpop_expression_panel').style.display = 'none';
                            document.getElementById("at_someone").style.display = 'none';
                            document.getElementById('img_big').style.display = 'none';


                        }
                    }
                }
            })
            .state('contact', {
                url: "/contact",
                views: {
                    "navView": {
                        templateUrl: "templates/contactList.html",
                        controller:function($rootScope,$scope,$state){
                            // 判断浏览器是否为IE浏览器: margin-bottom: -17px; margin-right: -17px;
                            // 获取浏览器可见的宽度
                            var wchat = document.documentElement.clientWidth;
                            var hchat = document.documentElement.clientHeight ;
                            /*var mb = BBUI.myBrowser();
                            if(mb=='IE'){
                                document.getElementById('navContact').style.marginBottom = '-17px';
                                document.getElementById('navContact').style.marginRight = '-17px';
                                if(hchat<=800){
                                    document.getElementById('navContact').style.height = (hchat-202)+"px";
                                }else{
                                    document.getElementById('navContact').style.height = (hchat*0.8-202)+"px";
                                }
                            }
                            else{
                                document.getElementById('navContact').style.marginBottom = '0px';
                                document.getElementById('navContact').style.marginRight = '0px';
                                if(hchat<=800){
                                    document.getElementById('navContact').style.height = (hchat-220)+"px";
                                }else{
                                    document.getElementById('navContact').style.height = (hchat*0.8-220)+"px";
                                }
                            }*/
                        }
                    },
                    "contentView": {
                        templateUrl: "templates/contactContent.html",
                        controller:function($scope,$state){

                        }
                    }
                }
            });
        $urlRouterProvider.otherwise('/index');
        //$locationProvider.html5Mode(true);

        $translateProvider
            .translations('zh', {
                WEBTITLE:'邦邦社区网页版',
                LOGO:'邦邦社区',
                SUBTITLE: '扫描二维码登录邦邦社区web版',
                TITLE:'（需升级到最新版本）',
                DESC:'手机上',
                DESCINSTALL:'安装',
                DESCLOGIN:'并登录邦邦社区',
                TIPDESCRIBE:'打开扫一扫，扫描上方二维码',
                SUCCESSTIPS:'扫描成功',
                LOGINTIPS:'请在手机上点击确认以登录',
                LOGINING:'正在登录...',
                BACKLOGIN:'返回二维码登录',
                LOGOUT:'退出登录',
                ONLINE:'在线',
                OUTLINE:'离线',
                CHAT:'聊天',
                CONTACT:'通讯录',
                CHOSECHAT:'接收消息(文件)失败，请',
                REFRESH:'刷新',
                PAGE:'页面',
                MESSAGEINFO:'暂时没有新消息',
                SEARCH:'搜索',
                EXPRESSION:'表情',
                FILE:'图片和文件',
                SENDTIPS:'按下Ctrl+Enter换行',
                SEND:'发送',
                CLOSECHAT:'关闭聊天',
                CONTACTSEND:'发消息',
                DETAILS:'详细信息',
                REMARKS:'备    注：',
                GROUPNAME:'群    名：',
                REGION:'地    区：',
                COMMUNITY:'社    区ID：',
                NAME:'姓    名：',
                JOBNUMBER:'工    号：',
                PERPHONE:'个人电话：',
                PUBPHONE:'公共电话：',
                OFFICEPHONE:'办公电话',
                MAIL:'邮    箱：',
                SUBJECT:'主    体：',
                DEPARTMENT:'机    构：',
                INSTITUTION:'部    门：',
                BUSDEPARTMENT:'事业部  ：',
                CHATLIST:'正在获取最近的聊天...',
                CONTACTLIST:'正在获取联系人...',
                USERINFO:'正在获取详细信息...',
                NOMACTCH:'找不到匹配的结果',
                ONE             : '笑'      ,
                TWO             : '大笑'      ,
                THREE           : '微笑'      ,
                FOUR            : '不开心'      ,
                FIVE            : '呆萌'      ,
                SIX             : '花痴'      ,
                SEVEN           : '害羞'      ,
                EIGHT           : '闭嘴'      ,
                NINE            : '睡着'      ,
                TEN             : '哈欠'      ,
                ELEVEN          : '吃惊'      ,
                TWELVE          : '困'      ,
                THIRTEEN        : '疯了'      ,
                FOURTEEN        : '被批评'      ,
                FIFTEEN         : '偷笑'      ,
                SIXTEEN         : '无视'      ,
                SEVENTEEN       : '尴尬'      ,
                EIGHTEEN        : '打脸'      ,
                NINETEEN        : '努力'      ,
                TWENTY          : '女哭'      ,
                TWENTYONE       : '小哭'      ,
                TWENTYTWO       : '吃东西'      ,
                TWENTYTHREE     : '狂笑'      ,
                TWENTYFOUR      : '汗'      ,
                TWENTYFIVE      : '鬼脸'      ,
                TWENTYSIIX      : '发火'      ,
                TWENTYSEVEN     : '小火'      ,
                TWENTYEIGHT     : '泪流成河'       ,
                TWENTYNINE      : '安慰'      ,
                THIRTY          : '发呆'      ,
                THIRTYONE       : '鄙视'      ,
                THIRTYTWO       : '飞吻'      ,
                THIRTYTHREE     : '喷人'      ,
                THIRTYFOUR      : '糗大了'      ,
                THIRTYFIVE      : '思考'      ,
                THIRTYSIX       : '挑逗'      ,
                THIRTYSEVEN     : '喝水'      ,
                THIRTYEIGHT     : '花心'      ,
                THIRTYNINE      : '惊悚'      ,
                FORTY           : '亮牙'      ,
                FORTYONE        : '抠鼻'      ,
                FORTYTWO        : '呕吐'      ,
                FORTYTHREE      : '撇嘴'      ,
                FORTYFOUR       : '委屈'      ,
                FORTYFIVE       : '财迷'      ,
                FORTYSIX        : '惊吓'      ,
                FORTYSEVEN      : '阴险'      ,
                FORTYEIGHT      : '再见'      ,
                FORTYNINE       : '晕'      ,
                FIFTY           : '疑问'      ,
                FIFTYONE        : '嘘'      ,
                FIFTYTWO        : '烟'      ,
                FIFTYTHREE      : '敲打'      ,
                FIFTYFOUR       : '口罩'      ,
                FIFTYFIVE       : '左哼哼'      ,
                FIFTYSIX        : '右哼哼'      ,
                FIFTYSEVEN      : '笑哭'      ,
                FIFTYEIGHT      : '小瞧'      ,
                FIFTYNINE       : '潜水'      ,
                SIXTY           : '衰'      ,
                SIXTYONE        : '倒'      ,
                SIXTYTWO        : '勾引'      ,
                SIXTYTHREE      : '拳头'      ,
                SIXTYFOUR       : '握手'      ,
                SIXTYFIVE       : '耶'      ,
                SIXTYSIX        : '赞'      ,
                SIXTYSEVEN      : 'no'      ,
                SIXTYEIGHT      : 'ok'      ,
                SIXTYNINE       : '抱拳'      ,
                SEVENTY         : '鼓掌'      ,
                SEVENTYONE      : '猪头'      ,
                SEVENTYTWO      : '鲜花'      ,
                SEVENTYTHREE    : '凋谢'      ,
                SEVENTYFOUR     : '心'      ,
                SEVENTYFIVE     : '心碎'      ,
                SEVENTYSIX      : '蛋糕'      ,
                SEVENTYSEVEN    : '雷'      ,
                SEVENTYEIGHT    : '礼物'      ,
                SEVENTYNINE     : '西瓜'      ,
                EIGHTY          : '药',
                EIGHTYONE:'刀',
                EIGHTYTWO:'茶杯',
                EIGHTYTHREE:'米饭',
                EIGHTYFOUR:'喇叭',
                EIGHTYFIVE:'甲虫',
                EIGHTYSIX:'红包',
                EIGHTYSEVEN:'粑粑',
                EIGHTYEIGHT:'羽毛球',
                EIGHTYNINE:'篮球',
                NINETY:'乒乓球',
                NINETYONE:'足球',
                NINETYTWO:'嘴唇',
                TIP:'我知道了',
                SUGGESTDESC:'请升级到IE10以上版本、或使用',
                CHROME:'chrome42',
                SUGGESTTIP:'以上版本打开WEB端',
                FEEDBACK:'问题反馈：010-58257184/6147',
                AT:'@群成员',
                WEBBB:'邦邦WEB版',
                OFFICE:'办公好帮手',
                ONLINECHAT:'在线聊天',
                SYNC:'与手机端时刻同步',
                SENDFILES:'发送文件',
                CONVENTENT:'更加便捷',
                VIEWDATA:'查看好友资料',
                INITIATECHAT:'随时发起聊天'

            })
            .translations('en', {
                WEBTITLE:'Web BangBang Community',
                LOGO:'BangBang Community',
                SUBTITLE: 'Scan QR Code to log in',
                TITLE:'Need latest version',
                DESC:'On phone',
                DESCINSTALL:'Install',
                DESCLOGIN:'and open BangBang',
                TIPDESCRIBE:'Log in to Web BBCommunity->Scan QR Code',
                SUCCESSTIPS:'Scan successfully',
                LOGINTIPS:'Confirm on your phone',
                LOGINING:'Processing...',
                BACKLOGIN:'Back',
                LOGOUT:'Log Out',
                ONLINE:'Online',
                OUTLINE:'Offline',
                CHAT:'Chats',
                CONTACT:'Contacts',
                CHOSECHAT:'If receive message(files) failed,Please',
                REFRESH:'refresh',
                PAGE:'this page',
                MESSAGEINFO:'No new messages',
                SEARCH:'Search',
                EXPRESSION:'Stickers',
                FILE:'Image and File',
                SENDTIPS:'Press Ctrl+Enter to start a new line',
                SEND:'Send',
                CLOSECHAT:'Close',
                CONTACTSEND:'Send Messages',
                DETAILS:'Details',
                REMARKS:'Remarks:',
                GROUPNAME:'GroupName:',
                REGION:'Region:',
                COMMUNITY:'Community ID:',
                NAME:'Name:',
                JOBNUMBER:'Staff ID:',
                PERPHONE:'Personal phone:',
                PUBPHONE:'Public phone:',
                OFFICEPHONE:'Work phone:',
                MAIL:'Email:',
                SUBJECT:'Main party:',
                DEPARTMENT:'Organization:',
                INSTITUTION:'Department:',
                BUSDEPARTMENT:'Business department:',
                CHATLIST:'Getting the most recent chats...',
                CONTACTLIST:'Getting contacts...',
                USERINFO:'Getting userinfo...',
                NOMACTCH:'No results found',
                ONE             : 'Smile'      ,
                TWO             : 'Laugh'        ,
                THREE           : 'Happy'        ,
                FOUR            : 'Unhappy'        ,
                FIVE            : 'Dull'         ,
                SIX             : 'Lust'         ,
                SEVEN           : 'Shy'          ,
                EIGHT           : 'Shutup'       ,
                NINE            : 'Sleep'        ,
                TEN             : 'Yawn'         ,
                ELEVEN          : 'Amaze'        ,
                TWELVE          : 'Tired'      ,
                THIRTEEN        : 'Crazy'        ,
                FOURTEEN        : 'Shamed'         ,
                FIFTEEN         : 'Titter'       ,
                SIXTEEN         : 'Ignore'       ,
                SEVENTEEN       : 'Awkward'        ,
                EIGHTEEN        : 'Beat'         ,
                NINETEEN        : 'Strive'       ,
                TWENTY          : 'Cry'          ,
                TWENTYONE       : 'Weep'         ,
                TWENTYTWO       : 'Eat'            ,
                TWENTYTHREE     : 'Wild'         ,
                TWENTYFOUR      : 'Sweat'      ,
                TWENTYFIVE      : 'Funny'        ,
                TWENTYSIIX      : 'Mad'          ,
                TWENTYSEVEN     : 'Angry'        ,
                TWENTYEIGHT     : 'Cryriver'         ,
                TWENTYNINE      : 'Comfort'      ,
                THIRTY          : 'Daze'         ,
                THIRTYONE       : 'Despise'      ,
                THIRTYTWO       : 'Kiss'         ,
                THIRTYTHREE     : 'Spew'         ,
                THIRTYFOUR      : 'Embarrass'      ,
                THIRTYFIVE      : 'Think'        ,
                THIRTYSIX       : 'Tease'        ,
                THIRTYSEVEN     : 'Drink'        ,
                THIRTYEIGHT     : 'Fickle'       ,
                THIRTYNINE      : 'Horror'       ,
                FORTY           : 'Showteeth'    ,
                FORTYONE        : 'Picknose'     ,
                FORTYTWO        : 'Vomit'        ,
                FORTYTHREE      : 'Twitch'       ,
                FORTYFOUR       : 'Wronged'      ,
                FORTYFIVE       : 'Greedy'       ,
                FORTYSIX        : 'Scare'        ,
                FORTYSEVEN      : 'Sinister'     ,
                FORTYEIGHT      : 'Bye'          ,
                FORTYNINE       : 'Faint'      ,
                FIFTY           : 'Question'     ,
                FIFTYONE        : 'Hush'       ,
                FIFTYTWO        : 'Smoke'      ,
                FIFTYTHREE      : 'Strike'       ,
                FIFTYFOUR       : 'Mask'         ,
                FIFTYFIVE       : 'Leftgroan'      ,
                FIFTYSIX        : 'Rightgroan'     ,
                FIFTYSEVEN      : 'Cryout'       ,
                FIFTYEIGHT      : 'Contempt'     ,
                FIFTYNINE       : 'Dive'         ,
                SIXTY           : 'Tragic'     ,
                SIXTYONE        : 'Bad'        ,
                SIXTYTWO        : 'Tempt'        ,
                SIXTYTHREE      : 'Fist'         ,
                SIXTYFOUR       : 'Shake'        ,
                SIXTYFIVE       : 'Yeah'       ,
                SIXTYSIX        : 'Good'       ,
                SIXTYSEVEN      : 'No'         ,
                SIXTYEIGHT      : 'Ok'         ,
                SIXTYNINE       : 'Fight'          ,
                SEVENTY         : 'Clap'       ,
                SEVENTYONE      : 'Pig'       ,
                SEVENTYTWO      : 'Flower'      ,
                SEVENTYTHREE    : 'Wither'       ,
                SEVENTYFOUR     : 'Heart'         ,
                SEVENTYFIVE     : 'Broken'       ,
                SEVENTYSIX      : 'Cake'         ,
                SEVENTYSEVEN    : 'Bomb'        ,
                SEVENTYEIGHT    : 'Gift'       ,
                SEVENTYNINE     : 'Melon'      ,
                EIGHTY          : 'Drug'       ,
                EIGHTYONE:'Knife',
                EIGHTYTWO:'Tea',
                EIGHTYTHREE:'Rice',
                EIGHTYFOUR:'Loudspeak',
                EIGHTYFIVE:'Bettle',
                EIGHTYSIX:'Red packet',
                EIGHTYSEVEN:'Ppop',
                EIGHTYEIGHT:'Badminton',
                EIGHTYNINE:'Basketball',
                NINETY:'Ping-pong',
                NINETYONE:'Football',
                NINETYTWO:'Lip',
                TIP:'I got it!',
                SUGGESTDESC:'Please upgrade to more than IE10 version, or using the above version of',
                CHROME:'chrome42',
                SUGGESTTIP:'opening the WEB ',
                FEEDBACK:'Feedback:010-58257184/6147',
                AT:'Select group members to be reminded',
                WEBBB:'Web BangBang Community',
                OFFICE:'Good office assistant',
                ONLINECHAT:'Chat online',
                SYNC:'Sync with mobile terminal',
                SENDFILES:'Send files',
                CONVENTENT:'More convenient',
                VIEWDATA:'View friends information',
                INITIATECHAT:'To initiate a chat at any time'
            });
        if(sessionStorage.getItem('myLangKey')==""||sessionStorage.getItem('myLangKey')==undefined
            ||sessionStorage.getItem('myLangKey')==null||sessionStorage.getItem('myLangKey')=="zh"){
            $translateProvider.preferredLanguage('zh');
        }
        else if(sessionStorage.getItem('myLangKey')=="en"){
            $translateProvider.preferredLanguage('en');
        }


    }]
);

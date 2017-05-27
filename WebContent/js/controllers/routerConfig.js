/**
 * Created by lileilei
 * 路由配置
 */
indexModule.config(['$stateProvider', '$urlRouterProvider', '$translateProvider', function($stateProvider, $urlRouterProvider, $translateProvider) {

    // 路由缺省配置 参数为url中的hash值
    $urlRouterProvider.otherwise('chat');
    // 路由状态配置
    $stateProvider
        .state('bangbang', {
            url: '/',
            views: {
                "": {
                    templateUrl: 'templates/bangbangContent.html'
                },
                "login@bangbang": {
                     templateUrl: 'templates/login.html',
                     controller: 'loginController'
                },
                "guid@bangbang": { templateUrl: 'templates/guid.html' },
                "main@bangbang": {
                    templateUrl: 'templates/main.html',
                    controller: 'infoTransforController'
                }
            }
        })
        // 聊天状态
        .state('bangbang.chat', {
            url: 'chat',
            views: {
                // 最近联系人列表
                "navView": {
                    templateUrl: "templates/chatList.html",
                    controller: "chatListController"
                },
                // 聊天区域
                "contentView": {
                    templateUrl: "templates/chatContent.html",
                    controller: 'chatController'
                }
            },
            // bangbang.chat的状态参数
            params: {
                contatData: null
            }
        })
        // 通讯录状态
        .state('bangbang.contact', {
            url: 'contact',
            views: {
                // 联系人（好友和群）
                "navView": {
                    templateUrl: "templates/contactList.html",
                    controller: "contactListController"
                },
                // 联系人信息展示
                "contentView": {
                    templateUrl: "templates/contactContent.html",
                    controller: 'contactContentController'
                }
            }
        })
}]);
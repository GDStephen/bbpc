/**
 * chatController的子控制器
 *  输入表情
 *  at群成员
 *  发送文件和图片
 */
indexModule.controller('inputController', ['$scope','$timeout', function ($scope,$timeout) {

    //----------------------------------------变量------------------------------------------
    //是否是IE浏览器
    var _isIE = utilService.getBrowser() == 'IE';

    //----------------------------------------页面流程------------------------------------------

    /**
     * 聊天对话框的键盘事件处理
     * @param event 键盘相关对象
     * @returns {boolean}
     *
     * 1.如果只是按下了回车键，则发送消息
     * 2.如果同时按下ctrl+enter则换行
     */
    $scope.sendKeydown = function (event) {
        var keyCode = 0;
        if (_isIE) {
            keyCode = event.keyCode;
        } else {
            keyCode = event.which;
        }
        //如果只是按下了回车键
        if (keyCode == 13 && event.ctrlKey == false) {
            //如果聊天对话框中内容为空
            if ($scope.isChatContentEmpty()) {
                if (_isIE)
                    event.preventDefault();
                event.returnValue = false;
            } else {
                $scope.showAtMemberPanel = false;
                // $scope.chatAtMember = $scope.groupMemberArray;
                //调用父控制器的发送消息方法
                $scope.sendMessage();
                if (_isIE)
                    event.preventDefault();
                event.returnValue = false;
            }
        }
        //如果是同时按下ctrl+enter，则进行换行
        if (keyCode == 13 && event.ctrlKey) {
            insertNewLine();
        }
    };

    /**
     * TODO 需要把dom操作提取
     * 添加聊天对话框的粘贴事件处理，如果发现有内容粘贴，对粘贴的内容进行处理
     */
    angular.element("#editArea").bind('paste', function (e) {
        setTimeout(function () {
            var content = messageManageService.filterPasteText(content);
            angular.element('#editArea').html(content);
        }, 100);
    });

    /**
     * TODO 需要把dom操作提取
     * 点击@的icon后，显示@群成员的列表面板
     */
    $scope.openAtMemberPanel = function () {
        //赋值@群成员列表，用于界面显示
        // $scope.chatAtMember = $scope.groupMemberArray;
        document.getElementById("at_someone").style.display = 'block';

        // 在对话输入框（pre标签）中插入一个input类型的dom元素，然后得到这个新插入的input的id(唯一值)
        var inputId = insertInput();
        document.getElementById('atOneId').value = inputId;
        var addInput = document.getElementById(inputId);
        addInput.focus();
        var inputVal = addInput.value.trim();
        if (inputVal.substr(0, 1) != "@") {
            document.getElementById(inputId).value = "@" + inputVal;
        }
        document.getElementById("at_someone").style.left = addInput.offsetLeft + "px";
        document.getElementById("at_someone").style.bottom = (144 - addInput.offsetTop + 36) + "px";
    };

    /**
     * TODO 需要把dom操作提取
     *  在@群成员展开的下拉面板中点击某一项之后的处理：
     *   1）获取到点击的成员信息，然后保存到父控制器
     *   2）根据点击显示@群成员面板的时候插入的input，和当前选择的群成员，插入群成员的名称到聊天输入框
     *   3）根据群成员的名称是否是中文确定input元素的size
     *   4) 扫尾处理，隐藏面板，清空临时值
     * @param id
     * @param name
     */
    $scope.groupMemberClick = function (id, name) {
        document.getElementById("at_someone").style.display = 'none';

        //保存到父控制器，用于发送消息
        $scope.addAtMember(id, "@" + name);

        document.getElementById('editArea').focus();
        var atOneId = document.getElementById('atOneId').value;
        //插入群成员的名称到聊天输入框
        insertAtHtml(name, atOneId);

        inputsMap.put(atOneId, '@' + name);

        var chinese = utilService.cal(name);
        if (chinese == 0) {
            if (name.length < 4) {
                document.getElementById(atOneId).size = 3;
            } else {
                document.getElementById(atOneId).size = chinese * 2 + (name.length - chinese) + 1;
            }

        } else {
            if (name.length - chinese == 0) {
                if (chinese * 2 + (name.length - chinese) < 4) {
                    document.getElementById(atOneId).size = 2;
                }
                else {
                    document.getElementById(atOneId).size = chinese * 2 + (name.length - chinese);
                }
            } else {
                if (chinese * 2 + (name.length - chinese) < 4) {
                    document.getElementById(atOneId).size = 3;
                }
                else {
                    document.getElementById(atOneId).size = chinese * 2 + (name.length - chinese) + 1;
                }
            }
        }

        document.getElementById(atOneId).readOnly = true;
        document.getElementById("at_someone").style.display = 'none';
        document.getElementById('atOneId').value = "";
    };

    /**
     * TODO 需要把dom操作提取
     * 取消at
     */
    $scope.cancelAtMember = function () {
        document.getElementById("at_someone").style.display = 'none';
        document.getElementById("atKeyword").value = "";
    };

    /**
     * TODO 需要把dom操作提取
     * 显示表情面板，当表情面板显示状态，点击屏幕其他区域，隐藏表情面板
     * @param event
     */
    $scope.showExpressionPanel = function (event) {
        document.getElementById('mmpop_expression_panel').style.display='block';
        var mb = utilService.getBrowser();
        if (mb == 'IE') {
            var expPanel = document.getElementById('exp_panel');
            expPanel.style.marginBottom = '-17px';
            expPanel.style.marginRight = '-17px';
        }
        $timeout(function () {
            angular.element(document).bind("click", function (e) {
                var isShow = document.getElementById('mmpop_expression_panel').style.display;
                if(isShow==='block'){
                    angular.element('#mmpop_expression_panel').hide();
                    angular.element(document).unbind('click');
                }
                e.stopImmediatePropagation();
            });
        },100);
    };

    /**
     * TODO 需要把dom操作提取，使用页面的过滤器来实现
     * at群成员的面板中的搜索，暂时未用到
     * @param addInput
     * @param atOneId
     */
    $scope.searchSomeone = function (addInput, atOneId) {
        /*     if (addInput != '' && addInput != undefined && addInput != null) {
         var resInputChar = pinyin.getFullChars(addInput).toUpperCase();
         var searchArray = new Array();
         var atMap = $rootScope.chatMember;
         // 搜索好友
         for (var t = 0; t < atMap.length; t++) {
         var dataObj = atMap[t];
         if (dataObj.nickname == undefined) continue;
         dataObj.name_sort = pinyin.getFullChars(dataObj.nickname).toUpperCase();
         if (dataObj.name_sort.indexOf(resInputChar) > -1) {
         searchArray[searchArray.length] = dataObj;
         }
         }

         $scope.chatAtMember = searchArray;
         } else {
         $scope.chatAtMember = $rootScope.chatMember;
         /!*$scope.$apply();*!/
         }*/
    };

    /**
     * 发送文件
     * 1.检查被发文件是否图片；非图片的文件类型是否合法。
     * 2.更新界面，添加聊天记录，更新最近联系人，同时调用服务上传文件
     * 3.服务上传回调返回之后更新页面部分字段：ackflag,message,link,fileUrl,size
     *      3.1 上传成功则发送消息
     *      3.2 上传失败，提示上传失败
     * @param files 多文件数组，目前是单文件
     */
    $scope.sendFile = function (files) {
        // if (!files || files.length) return;

        var firstFile = files[0];
        var subject = '';
        if (firstFile.type.indexOf("image") > -1) {
            subject = 'image';
        } else { //如果要发送文件，则检查文件的类型是否合格
            var isFileTypeOk = validateFileType(firstFile);
            if (!isFileTypeOk) {
                alert('不接受此文件类型');
                return;
            }
            subject = 'document';
        }

        var userInfo = $scope.getAppUserInfo();
        var toJid = userInfo.currentTalkJid;
        var uuid = Math.uuid();

        var param = {
            uuid: uuid,
            subject: subject,
            type: $scope.currentInfo.type,
            fromJid: userInfo.userId,
            toJid: toJid
        };
        var chatLog = {
            uuid: uuid,
            type: $scope.currentInfo.type,
            jid: userInfo.userId,
            count: 0,
            message: firstFile.name,
            subject: subject,
            from_me: true,
            ackflag: 0,
            msgTime: getMsgTime(toJid),
            msgFullTime: +new Date(),
            createTime: +new Date(),
            avatar: userInfo.userAvatar,
            link: config.url.tfsUrl,
            size: 0,
            avatarPath: userInfo.userAvatar,
            fileUrl: firstFile.path
        };
        updatePageUI(chatLog, toJid);

        messageManageService.sendFile(param, firstFile,
            function (arg) {
                document.getElementById('hiddenFile').value = '';
                if (arg.isFail) {
                    console.log('文件上传失败');
                    chatLog.ackflag = 2;

                } else {
                    console.log('文件上传成功，等待消息回执处理');
                }
                chatLog.message = arg.data.message;
                chatLog.link += arg.data.link;
                chatLog.fileUrl = arg.data.fileUrl;
                if (chatLog.subject === 'document') {
                    chatLog.size = arg.data.size;
                }
                chatLogService.addChatLog(toJid, chatLog);
            },
            function (arg) {
                document.getElementById('hiddenFile').value = '';
                console.log('调用发送文件接口异常');
            });
    };

    //-----------------------------------------------辅助工具方法-----------------------------------------------------


    /**
     * 发送文件后，更新界面：最近联系人，聊天记录，当前窗口
     * @param chatLog
     * @param toJid
     */
    function updatePageUI(chatLog, toJid) {
        // var chatForRencentList = JSON.parse(JSON.stringify(chatLog));
        // chatForRencentList.message = chatLog.subject === 'image' ? '[图片]' : '[文件]'+chatForRencentList.message;
        chatLog.displayMessage = chatLog.subject === 'image' ? '[图片]' : '[文件]' + chatLog.message;
        chatListService.updateRecentChatList(toJid, chatLog);      //更新最近联系人列表
        //添加聊天记录
        $scope.sendUIMessage(toJid, chatLog);                                   //更新当前窗口的聊天记录
    }

    /**
     * 获取聊天记录的最后时间戳
     * @param jid
     * @param msgTime
     * @returns {*}
     */
    function getMsgTime(jid, msgTime) {
        if (!msgTime)
            msgTime = commonService.getTime();
        var msgTimeInt = parseInt(msgTime.replace(":", ""), 10);
        var lastMsgTimeInt = chatLogService.getLastMessageTime(jid);
        if (msgTimeInt > lastMsgTimeInt) {
            return msgTime;
        } else {
            return '';
        }
    }

    /**
     * 检查发送的文件类型是否合法
     * @param selectedFile
     * @returns {boolean}
     */
    function validateFileType(selectedFile) {
        var fileName = selectedFile.name;
        var fileType = fileName.substr(fileName.lastIndexOf(".")).toLowerCase();
        fileType = fileType.substring(1, fileType.length);
        var validFileTypeArray = ["doc", "ppt", "xls", "pdf", "docx", "xlsx", "pptx", ".zip", ".rar"];
        if (validFileTypeArray.indexOf(fileType) === -1)
            return false;
        return true;
    }

    /**
     * TODO DOM操作提取
     * 在聊天输入框（pre元素）中插入一个input元素，并且返回这个input元素的id
     * @returns {string} uuid 唯一值
     */
    function insertInput() {
        angular.element('#editArea').focus();
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            // 返回一个 Selection 对象，表示用户选择的文本。
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                console.log(sel.getRangeAt(0));
                console.log(range);
                //range.deleteContents();
                var el = document.createElement("pre");
                var inputId = Math.uuid();
                //var ele = angular.element('#editArea');
                el.innerHTML = '<input id="add_input_' + inputId + '" style="border: 0;min-width:50px;font-style:italic;font-weight: 600;height: 20px;background-color: #f8f8f8;"  value="" name="add_input_' + inputId + '">&nbsp;';
                var frag = document.createDocumentFragment(),
                    node, lastNode;
                while ((node = el.firstChild)) {
                    console.log(el.firstChild);
                    lastNode = frag.appendChild(node);
                    console.log(lastNode);
                }
                range.insertNode(frag);
                console.log(range);
                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type != "Control") {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
        angular.element('#editArea').focus();
        return "add_input_" + inputId;
    }

    /**
     * TODO DOM操作提取
     * 在聊天输入框中插入换行符
     */
    function insertNewLine() {
        angular.element('#editArea').focus();
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                console.log(range);
                //range.deleteContents();
                var el = document.createElement("pre");
                el.innerHTML = '\r\n';
                /*el.innerHTML = '\n'+'&nbsp;';*/
                /*el.innerHTML ='<br/>';*/
                // $("#editArea").append("<br/>");
                angular.element('#editArea').append("<br/>");
                var frag = document.createDocumentFragment(),
                    node, lastNode;
                while ((node = el.firstChild)) {
                    console.log(node);
                    lastNode = frag.appendChild(node);
                }
                console.log(lastNode);
                range.insertNode(frag);
                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
        else if (document.selection && document.selection.type != "Control") {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    };

    /**
     * TODO DOM操作提取
     * 聚焦到文本框输入的最后
     * @param textFeildValue
     * @param atOneId
     */
    function insertAtHtml(textFeildValue, atOneId) {
        var textObj = document.getElementById(atOneId);
        document.getElementById(atOneId).value = (document.getElementById(atOneId).value).substr(0, 1);

        if (document.all && textObj.createTextRange && textObj.caretPos) {
            var caretPos = textObj.caretPos;
            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ?
                textFeildValue + '' : textFeildValue;
        } else if (textObj.setSelectionRange) {
            var rangeStart = textObj.selectionStart;
            var rangeEnd = textObj.selectionEnd;
            var tempStr1 = textObj.value.substring(0, rangeStart);
            var tempStr2 = textObj.value.substring(rangeEnd);
            textObj.value = tempStr1 + textFeildValue + tempStr2;
            textObj.focus();
            var len = textFeildValue.length;
            textObj.setSelectionRange(rangeStart + len, rangeStart + len);
            textObj.blur();
        } else {
            textObj.value += textFeildValue;
        }
    }


}]);
/**
 * 准备加入通讯录
 * 模块，通讯录中应该有个人信息列表
 * （map格式jid做主键），群列表（待定map格式jid做主键）
 * （最近联系人列表jid做主键）
 */
(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);

    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    }

    // Browser globals
    var addressbookService = {};
    root.addressbookService = addressbookService;
    factory(addressbookService);

}((typeof window === 'object' && window) || this, function (addressbookService) {
    //个人信息
    var _dataPersonMap = null;
    //链接请求 jid做主键，obj是请求对象，多个jid可以对应一个请求对象，用来快速检索
    var RequestMgr = new Map();
    //每个请求都会创建一个请求对象，放在数组中
    var RequestArrayNet = [];
    //initAllData();
    /**
     * 初始化通讯录
     */
    function initAllData(strJid,CallBack) {
        _dataPersonMap = new Map();
        bbDataBase.openDB(strJid,function (bSuccess, typeStr) {
            //这里可以加载部分数据
            CallBack(bSuccess,typeStr);
        });
    }
    /**
     * 登陆时获取人员接口信息，备注：这个接口返回的信息应该是只读的，回掉函数中不应该修改
     * 里面的数据。
     * @param {*} ArrayJid 
     * @param {*} funCallBack 
     */
    function GetPerInfoOnLogin(ArrayJid, funCallBack) {
        bbDataBase.GetItemBatch('memberInfo', ArrayJid, function (bSuccess, event, reqArraySuccess, reqArrayFailed) {
            var MapGetdataDb = new Map();
            for (var i = 0; i < reqArraySuccess.length; ++i) {
                MapGetdataDb.put(reqArraySuccess[i].jid, reqArraySuccess[i]);
                _dataPersonMap.put(reqArraySuccess[i].jid, reqArraySuccess[i]);
            }
            funCallBack('on', 'dbCatch', MapGetdataDb);
            var MapUpdateFronNet = new Map();
            BBXmpp.iqUserInfo(ArrayJid, function (result, UserInfoMap) {
                UserInfoMap.each(function (key, value, index) {
                    var DataResult = _dataPersonMap.get(key);
                    if(DataResult && DataResult.ver === value.ver)
                    {

                    }
                    else
                    {
                        _dataPersonMap.put(key, value);
                        MapUpdateFronNet.put(key,value);
                    }
                    
                });
                if(MapUpdateFronNet.size() > 0)
                {
                   
                    bbDataBase.updateDataBathMap('memberInfo', MapUpdateFronNet, function (bSuccess, event, ArrayTest) {});
                    //funCallBack('end', 'netUpdate', MapUpdateFronNet);
                }
                funCallBack('end', 'netUpdate', UserInfoMap);
                
            });
        });
    }

    /**
     * 直接从网上获取个人信息接口
     * @param {*需要查询人的jid数组列表} ArrayJid 
     * @param {*回调通知接口} funCallBack 
     */
    function GetPersonInfoDirectNet(ArrayJid, funCallBack) {
        BBXmpp.iqUserInfo(ArrayJid, function (result, UserInfoMap) {
            UserInfoMap.each(function (key, value, index) {
                _dataPersonMap.put(key, value);
            });
            funCallBack('end', 'net', UserInfoMap);
            bbDataBase.updateDataBathMap('memberInfo', UserInfoMap, function (bSuccess, event, ArrayTest) {});
        });
    }

    /**
     * 从数据库获取人员信息
     * @param {*jid数组} ArrayJid 
     * @param {*回掉函数} funCallBack 
     * @param {*所有应该返回人员信息，jid做key} MapTotalReturn 
     * @param {*失败的jid获取列表} MapTotalFailed 
     * @param {*总共需要获取人员信息数量} TotalNeedToGetFunc 
     */
    function GetPersonInfoFromDB(ArrayJid, funCallBack, MapTotalReturn, MapTotalFailed, TotalNeedGetObj) {
        bbDataBase.GetItemBatch('memberInfo', ArrayJid, function (bSuccess, event, reqArraySuccess, reqArrayFailed) {
            if (bSuccess) {
                console.log('GetAllDataComplete');
            } else {
                console.log('some error happened!');
            }
            /**
             * 如果已经完全获取完毕，
             * 走end流程，反之走on
             */
            var MapGetdataDb = new Map();
            for (var i = 0; i < reqArraySuccess.length; ++i) {
                MapGetdataDb.put(reqArraySuccess[i].jid, reqArraySuccess[i]);
                MapTotalReturn.put(reqArraySuccess[i].jid, reqArraySuccess[i]);
                _dataPersonMap.put(reqArraySuccess[i].jid, reqArraySuccess[i]);
            }
            if (reqArraySuccess.length > 0) {
                funCallBack('on', 'localDB', MapGetdataDb, new Map());
            }
            
            if (MapTotalReturn.size() + MapTotalFailed.size() === TotalNeedGetObj.nTotalToGet) {
                funCallBack('end', 'localDB', MapTotalReturn, MapTotalFailed);
                console.log('zhengwei Get All Item From DB!!!!!!!!!!!');
            } else {
                GetPerInfoFromNet(reqArrayFailed, funCallBack, MapTotalReturn, MapTotalFailed, TotalNeedGetObj);
            }

        });
    }
    /**
     * 批量获取数据信息
     * @param {*jid数组} ArrayInputJID 
     * @param {*回调函数} func 
     */
    function GetInfoBatch(ArrayInputJID, func) {
        /**
         * 这里用来过滤重复的jid
         */
        var ArrayMemberjid = [];
        var json = {};
        for (var i = 0; i < ArrayInputJID.length; i++) {
            if (!json[ArrayInputJID[i]]) {
                ArrayMemberjid.push(ArrayInputJID[i]);
                json[ArrayInputJID[i]] = true;
            }
        }
        /////////////////////////////
        /**
         * MapTotalReturn 所有的成功返回人员信息
         * MapTotalFailed 所有的失败人员信息
         * MapdataOnGet 本次请求返回信息
         * TotalNeedGetObj 本次请求人员数量
         * GetFromLocal 本地获取数量
         */
        var MapTotalReturn = new Map();
        var MapTotalFailed = new Map();
        var MapdataOnGet = new Map();
        var GetFromLocal = 0;
        var TotalNeedGetObj = {
            nTotalToGet: ArrayMemberjid.length
        };
        ////////////////////////////////
        /**
         * 先从本地内存中获取，给界面on通知
         * 如果全部在本地内存中找到给界面end通知，
         * 表示所有的数据都获取到了。
         */
        for (i = 0; i < ArrayMemberjid.length;) {
            var Temp = _dataPersonMap.get(ArrayMemberjid[i]);
            if (Temp) {
                MapdataOnGet.put(ArrayMemberjid[i], Temp);
                MapTotalReturn.put(ArrayMemberjid[i], Temp);
                ArrayMemberjid.splice(i, 1);
                ++GetFromLocal;
            } else {
                ++i;
            }
        }
        if (GetFromLocal > 0) {
            func('on', 'local', MapdataOnGet, new Map());
        }
        if (ArrayMemberjid.length === 0) {
            func('end', 'local', MapTotalReturn, MapTotalFailed);
        } else {

            /**
             * 从DB中获取数据
             * 这里作个判断如果是桌面环境调用GetPersonInfoFromDB
             * 如果是浏览器环境调用GetPerInfoFromNet
             */
            GetPersonInfoFromDB(ArrayMemberjid, func, MapTotalReturn, MapTotalFailed, TotalNeedGetObj);
        }

    }

    /**
     * 获取网络请求对象
     * @param {*jid数组} ArrayJid 
     * @param {*回掉函数} func 
     * @param {*所有应该返回人员信息，jid做key} MapTotalReturn 
     * @param {*失败的jid获取列表} MapTotalFailed 
     * @param {*总共需要获取人员信息数量} TotalNeedToGetFunc 
     */
    function GetNetRequest(ArrayJid, func, MapTotalReturn, MapTotalFailed, TotalNeedToGetFunc) {
        /**
         * RequestInfo 请求回掉通知通知数据数组
         */
        var RequestInfo = [];
        /**
         * 
         */
        var obj = {
            CallBack: func,
            JidArray: ArrayJid,
            mapOnReturn: new Map(),
            mapOnFailed: new Map(),
            mapOnTotal: MapTotalReturn,
            mapOnTotalFailed: MapTotalFailed,
            TotalToGet: TotalNeedToGetFunc
        };
        RequestInfo.push(obj);
        var objTrueRequst = {
            bAdded: false,
            RequstArray: RequestInfo
        };
        for (var i = 0; i < ArrayJid.length; ++i) {
            RequestMgr.put(ArrayJid[i], objTrueRequst);
        }

        var nIndex = RequestArrayNet.push(objTrueRequst);
        return {
            RequestInfo: RequestInfo,
            nIndex: nIndex
        };
    }
    /**
     * 过滤已经开启网络请求的项目
     * @param {*jid数组} ArrayJid 
     * @param {*回掉函数} func 
     * @param {*所有应该返回人员信息，jid做key} MapTotalReturn 
     * @param {*失败的jid获取列表} MapTotalFailed 
     * @param {*总共需要获取人员信息数量} TotalNeedToGetFunc 
     */
    function SplitExsitReq(ArrayJid, func, MapTotalReturn, MapTotalFailed, TotalNeedToGetFunc) {
        for (var i = 0; i < ArrayJid.length;) {
            var obj = RequestMgr.get(ArrayJid[i]);
            if (obj) {
                if (obj.bAdded) {
                    var RequestNow = obj.RequstArray[obj.RequstArray.length - 1];
                    RequestNow.JidArray.push(ArrayJid[i]);
                } else {
                    var TempItem = {
                        CallBack: func,
                        JidArray: [],
                        mapOnReturn: new Map(),
                        mapOnFailed: new Map(),
                        mapOnTotal: MapTotalReturn,
                        mapOnTotalFailed: MapTotalFailed,
                        TotalToGet: TotalNeedToGetFunc
                    };
                    TempItem.JidArray.push(ArrayJid[i]);
                    obj.RequstArray.push(TempItem);
                    obj.bAdded = true;
                }
                ArrayJid.splice(i, 1);

            } else {
                ++i;
            }
        }
        for (var j = 0; j < RequestArrayNet.length; ++j) {
            var objRequest = RequestArrayNet[j];
            objRequest.bAdded = false;
        }

    }
    /**
     * 从网络获取人员信息
     * @param {*jid数组} ArrayJid 
     * @param {*回掉函数} func 
     * @param {*所有应该返回人员信息，jid做key} MapTotalReturn 
     * @param {*失败的jid获取列表} MapTotalFailed 
     * @param {*总共需要获取人员信息数量} TotalNeedToGetFunc 
     */
    function GetPerInfoFromNet(ArrayJid, func, MapTotalReturn, MapTotalFailed, TotalNeedGetObj) {
        var ArrayReqExist = SplitExsitReq(ArrayJid, func, MapTotalReturn, MapTotalFailed, TotalNeedGetObj);
        if (ArrayJid.length > 0) {
            var ObjTemp = GetNetRequest(ArrayJid, func, MapTotalReturn, MapTotalFailed, TotalNeedGetObj);
            var RequestThisArray = ObjTemp.RequestInfo;
            var nIndex = ObjTemp.nIndex;
            //DataGenerate.GetData(ArrayJid, function(bSuccess, UserInfoMap) {
            BBXmpp.iqUserInfo(ArrayJid, function (result, UserInfoMap) {
                //对于每个获取的结果
                var obj = RequestThisArray;
                /**
                 * 以防万一服务器少给了数据
                 * 所以增加一个错误信息返回接口
                 */
                var MapFailed = new Map();
                if (result === BBXmpp.Status.SUCCESS) {
                    for (var k = 0; k < RequestThisArray.length; ++k) {
                        var JidArrayIn = RequestThisArray[k].JidArray;
                        for (var m = 0; m < JidArrayIn.length; ++m) {
                            var UserInfoItem = UserInfoMap.get(JidArrayIn[m]);
                            if (UserInfoItem) {
                                RequestThisArray[k].mapOnReturn.put(JidArrayIn[m], UserInfoItem);
                                RequestThisArray[k].mapOnTotal.put(JidArrayIn[m], UserInfoItem);
                                _dataPersonMap.put(JidArrayIn[m], UserInfoItem);
                            } else {
                                RequestThisArray[k].mapOnFailed.put(JidArrayIn[m], {
                                    data: JidArrayIn[m]
                                });
                                RequestThisArray[k].mapOnTotalFailed.put(JidArrayIn[m], {
                                    data: JidArrayIn[m]
                                });
                                /**
                                 * 从全部要获取的数据中删除
                                 * 错误的节点信息
                                 */
                                --(RequestThisArray[k].TotalToGet.nTotalToGet);
                            }
                            RequestMgr.remove(JidArrayIn[m]);
                        }
                    }
                    /**
                     * 将数据存入数据库中
                     */
                    bbDataBase.updateDataBathMap('memberInfo', UserInfoMap, function (bSuccess, event, ArrayTest) {

                    });
                } else {
                    for (var kErr = 0; kErr < RequestThisArray.length; ++kErr) {
                        var JidArrayInErr = RequestThisArray[kErr].JidArray;
                        for (var mErr = 0; mErr < JidArrayInErr.length; ++mErr) {
                            RequestThisArray[kErr].mapOnFailed.put(JidArrayInErr[mErr], {
                                data: JidArrayInErr[mErr]
                            });
                            RequestThisArray[kErr].mapOnTotalFailed.put(JidArrayInErr[mErr], {
                                data: JidArrayInErr[mErr]
                            });
                            /**
                             * 从全部要获取的数据中删除
                             * 错误的节点信息
                             */
                            --(RequestThisArray[kErr].TotalToGet.nTotalToGet);
                            RequestMgr.remove(JidArrayInErr[mErr]);
                        }
                    }
                }

                /**
                 * 通知界面数据获取完毕
                 */
                for (var t = 0; t < RequestThisArray.length; ++t) {
                    RequestThisArray[t].CallBack('on', 'net', RequestThisArray[t].mapOnReturn, RequestThisArray[t].mapOnFailed);
                    if (RequestThisArray[t].TotalToGet.nTotalToGet === RequestThisArray[t].mapOnTotal.size()) {
                        RequestThisArray[t].CallBack('end', 'net', RequestThisArray[t].mapOnTotal, RequestThisArray[t].mapOnTotalFailed);
                    }
                }
                /**
                 * 移除数组元素
                 */
                RequestArrayNet.splice(nIndex, 1);
            });
        }
    }
    // 导出函数
    addressbookService.GetInfoBatch = GetInfoBatch;
    addressbookService.GetPersonInfoDirectNet = GetPersonInfoDirectNet;
    addressbookService.initAllData = initAllData;
    addressbookService.GetPerInfoOnLogin = GetPerInfoOnLogin;
}));
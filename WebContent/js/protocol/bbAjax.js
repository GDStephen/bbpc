/**
 * Created by guoda on 2017/4/27.
 *
 * 封装XMLHttpRequest底层协议
 */

/**
 * class AJAXRequest
 * @author      guoda
 * @copyright   2017-2018 guoda.
 * @constructor
 * @version     $Id: ajaxrequest.js 35 2017-04-28 18:32:21Z guoda $
 * @class       AJAXRequest
 * @param       {object}        [obj]                   Init parameter object
 * @param       {string}        [obj.url]               Url to request
 * @param       {string}        [obj.content]           Content to send
 * @param       {string}        [obj.method]            Request method, GET or POST
 * @param       {string}        [obj.charset]           Charset of content
 * @param       {boolean}       [obj.async=true]        Async request, true or false
 * @param       {number}        [obj.timeout=3600000]   Request timeout in millisecond
 * @param       {function}      [obj.encode=encodeURIComponent] Encoding method, default encodeURIComponent
 * @param       {function}      [obj.ontimeout]         Timeout callback
 * @param       {function}      [obj.onrequeststart]    Request start callback
 * @param       {function}      [obj.onrequestend]      Request end callback
 * @param       {function}      [obj.oncomplete]        Request complete successful callback
 * @param       {function}      [obj.onexception]       Handle request exception callback
 * @param       {function}      [obj.onprogress]  Handle request progress callback
 * @property    {string}        url             Url to request
 * @property    {string}        content         Content to send
 * @property    {string}        method          Request method, GET or POST
 * @property    {string}        charset         Charset of content
 * @property    {boolean}       async           Async request, true or false
 * @property    {number}        timeout         Request timeout in millisecond
 * @property    {function}      encode          Encoding method
 * @property    {function}      ontimeout       Timeout callback
 * @property    {function}      onrequeststart  Request start callback
 * @property    {function}      onrequestend    Request end callback
 * @property    {function}      oncomplete      Request complete successful callback
 * @property    {function}      onexception     Handle request exception callback
 * @property    {function}      onprogress     Handle request progress callback
 * @example
 * // using default values to init AJAXRequest object.
 * var ajax1 = new AJAXRequest();
 * // using a parameter to init AJAXRequest object.
 * var ajax2 = new AJAXRequest({
 *      url: "getdata.asp",     // get data from getdata.asp
 *      method: "GET",          // GET method
 *      oncomplete: function(obj) {
 *              alert(obj.responesText);        // show data from getdata.asp
 * });
 */
function AJAXRequest(init) {
    var objPool = [];
    var AJAX = this;
    var _pool = [];
    (function(obj) {
        // init xmlhttp pool, and some consts
        var emptyFun = function() { };

        // process inti parameter
        obj = obj ? obj : {};
        var prop = ['url',  'content',  'method',   'async',    'encode',       'timeout',  'ontimeout',    'onrequeststart',   'onrequestend', 'oncomplete',   'onexception',  'onprogress'];
        var defs = ['',     '',         'GET',      true,       _GEC('UTF-8'),  3600000,    emptyFun,       emptyFun,           emptyFun,       emptyFun,       emptyFun,       emptyFun];
        var pc = prop.length;
        while(pc--) {
            AJAX[prop[pc]] = getp(obj[prop[pc]], defs[pc]);
        }

        // get the first xmlhttp, if failed then return false
        if(!getXHR()) { return false; }
    })(init);
 
    // get param or its default
    function getp(p, d) { return p != undefined ? p : d; }

    // get XMLHttpRequest from pool
    function getXHR() {
        var xhr;
        var _vers = [window.XMLHttpRequest, "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
        for(var i = 0; i < _pool.length; i+=1) {
            if(_pool[i].readyState == 0 || _pool[i].readyState == 4) {
                return _pool[i];
            }
        }
        
        for(var i = 0; i < _vers.length; i+=1) {
            try {
                xhr = (_vers[i] && typeof(_vers[i]) == "function" ? new _vers[i] : new ActiveXObject(_vers[i]));
                break;
            } catch(e) {
                xhr = false;
                continue;
            }
        }

        if(!xhr) {
            return false;
        }
        else {
            _pool[_pool.length] = xhr;
            return xhr;
        }
    }
 
    // get element by id
    function $(id) { return document.getElementById(id); }

    // convert anything to number
    function _N(d) { var n = d * 1; return(isNaN(n) ? 0 : n); }

    // convert anything to HtmlObject
    function _VO(v) { return (typeof(v) == "string" ? (v = $(v)) ? v : false : v); }

    // get an unique number
    function _GID(){return((new Date)*1);}
 
    // save update object
    function _SOP(id, ct) { objPool[id + ""] = ct; }
 
    // load update object
    function _LOP(id) { return(objPool[id + ""]); }
 
    // string replace function generator
    function _SRP(pre, reps, ps){
        return (function rep(str) {
            str = pre(str);
            for(var i = 0, n = reps.length; i < n; i+=1) {
                str = str.replace(reps[i], ps[i]);
            }
            return(str);
        });
    }
 
    // get encode method
    function _GEC(cs){
        if(cs.toUpperCase() == "UTF-8") {
            return(encodeURIComponent);
        }
        else {
            // replace sepcial chars: +
            return(_SRP(escape, [/\+/g], ["%2B"]));
        }
    }
 
    // set content to HtmlObject
    function _ST(obj, txt) {
        if(!obj.nodeName) {
            return;
        }
        var nn = "|" + obj.nodeName.toUpperCase() + "|";
        if("|INPUT|TEXTAREA|OPTION|".indexOf(nn) > -1) {
            obj.value = txt;
        }
        else {
            try {
                obj.innerHTML = txt;
            } catch(e) { };
        }
    }
 
    // generate a callback function
    function _CB(cb) {
        if(typeof(cb) == "function") {
            return cb;
        }
        else {
            cb = _VO(cb);
            if(cb) {
                return (function(obj) {
                    _ST(cb, obj.responseText);
                });
            }
            else {
                return AJAX.oncomplete;
            }
        }
    }

    // is obj undefined
    function _TBD(obj) {
        return obj == undefined;
    }
 
    /**
     * generate parameters
     * p  output parameters array
     * v  input parameter values
     * d  default values
     * f  extra process function
     */
    function $GP(v, d, f) {
        var i = 0;
        var p = [];
        while(i < v.length) {
            p[i] = (!_TBD(v[i])) ? (f[i] ? f[i](v[i]) : v[i]) : (f[i] ? f[i](d[i]) : d[i]);
            i+=1;
        }

        while(i < d.length) {
            p[i] = (f[i] ? f[i](d[i]) : d[i]);
            i+=1;
        }

        return p;
    }

    /**
     * Set charset of content
     *
     * @param {string} charset charset, UTF-8 or GB2312, and etc..
     * @see AJAXRequest#charset
     * @see AJAXRequest#encode
     * @example
     * var ajax = new AJAXRequest();
     * ajax.setcharset("GB2312");
     */
    this.setcharset = function(cs) {
        AJAX.encode = _GEC(cs);
    }
 
    //format params
    function _FP(data){
        var arr=[];
        for(var name in data){
            arr.push(AJAX.encode(name) + "=" + AJAX.encode(data[name]));
        }
        
        arr.push("timestamp=" + _GID());
        return arr.join("&");
    }

    //format files params
    function _FFP(files){
        var data = new FormData();
        var file = files[0];
        data.append("myfiles", files[0]);
        
        return data;
    }
 
    // send request
    function send() {
        var ct;
        var xhr = getXHR();

        // process parameters
        var p = $GP(arguments,
            [AJAX.url, AJAX.content, AJAX.oncomplete, AJAX.method, AJAX.async, null],
            [null, _FP, _CB, null, null, null]
        );

        var url = p[0];
        var content = p[1];
        var callback = p[2];
        var method = p[3];
        var async = p[4];
        var extra = p[5];

        // is use POST method?
        var isPost = method.toUpperCase() == "POST" ? true : false;

        // check if url exists
        if(!url) {
            return false;
        }

        // event callback argument
        var ev = {
            url: url,
            content: content,
            method: method,
            params: extra
        };

        // append content to the url and open XMLHttpRequest
        if(!isPost) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + content;
        }
        try{
            xhr.open(method, url, async);
            
            // request start event
            AJAX.onrequeststart(ev);

            // POST method needs a sepcial Content-Type
            if(isPost) {
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            }
            xhr.setRequestHeader("X-Request-With", "XMLHttpRequest");

            var ctf = false;
            // set a timeout to cancel request when timeout
            ct = setTimeout(function() {
                    ctf = true;
                    xhr.abort();
                    AJAX.ontimeout(ev);
                    AJAX.onrequestend(ev);
                },
                AJAX.timeout
            );

            var rc = function() {
                if(!ctf && xhr.readyState == 4) {
                    clearTimeout(ct);
                    ev.status = xhr.status;
                    try{
                        if(xhr.status == 200) {
                            callback(xhr, extra);
                        }
                        else {
                            AJAX.onexception(ev);
                        }
                    }
                    catch(e) {
                        AJAX.onexception(ev);
                    }
                    AJAX.onrequestend(ev);
                }
            }
            
            xhr.onreadystatechange = rc;
            if(isPost) {
                xhr.send(content);
            } else {
                xhr.send("");
            }

            if(async == false) {
                rc();
            }

        } catch(e) {
            AJAX.onexception(ev);
        }

        return true;
    }

    // uploadfile request
    function uploadFile() {
        this.uploadXHR = getXHR();

        // process parameters
        var p = $GP(arguments,
            [AJAX.url,  AJAX.content,   AJAX.oncomplete,    AJAX.onexception,    AJAX.onprogress,   AJAX.onrequeststart,    AJAX.method,    AJAX.async, null],
            [null,      _FFP,           _CB,                _CB,                _CB,                _CB,                    null,           null,       null]
        );

        var url = p[0];
        var files = p[1];
        var complete = p[2];
        var error = p[3];
        var progress = p[4];
        var start = p[5];
        var method = p[6];
        var bAsync = p[7];
        var extra = p[8];

        // check if url exists
        if(!url) {
            return false;
        }

        uploadXHR.open(method, url, bAsync);
        uploadXHR.setRequestHeader("Cache-Control","max-age=0");
        uploadXHR.setRequestHeader("Upgrade-Insecure-Requests","1");

        // uploadXHR.onload = complete; //请求完成
        uploadXHR.onload = function () {
            complete(uploadXHR.responseText);

        };

        //请求失败
        uploadXHR.onerror =  error;

        //【上传进度调用方法实现】
        uploadXHR.upload.onprogress = progress;

        //开始上传
        uploadXHR.upload.onloadstart = start;

        //开始上传，发送files数据
        uploadXHR.send(files);

        return uploadXHR;
    }

    /**
     * Get data from sepcial url
     *
     * @param   {string}                    [url]           Url to request
     * @param   {Array|object}              [files]         files array, or file object
     * @param   {function|object|string}    [complete]      Successful callback, or Html object, or Html object's ID
     * @param   {function|object|string}    [error]         Failed callback, or Html object, or Html object's ID
     * @param   {function|object|string}    [progress]      Progress callback, or Html object, or Html object's ID
     * @param   {function|object|string}    [start]         Start callback, or Html object, or Html object's ID
     * @returns {boolean}                   Is the request successfully sent
     * @example
     * var ajax = new AJAXRequest();
     * ajax.upload("upload.asp", {file1, file2, file3}, function(obj) {
     *      alert("上传成功！");
     * }, function(obj) {
     *      alert("上传失败！");
     * }, function(obj) {
     *      // event.total是需要传输的总字节，event.loaded是已经传输的字节。如果event.lengthComputable不为真，则event.total等于0
     *      if (evt.lengthComputable) {//
     *          progressBar.max = evt.total;
     *          progressBar.value = evt.loaded;
     *          已经上传百分比 = Math.round(evt.loaded / evt.total * 100) + "%";
     *      }
     * }, function(obj) {
     *      alert("开始上传！");
     * });
     * ajax.upload("upload.asp", {file1, file2, file3}, "txtData");  // show data from upload.asp in html object "txtData"
     */
    this.upload = function(url, files, complete, error, progress, start) {
        return uploadFile(url, files, complete, error, progress, start, "POST", true, null);
    }

    this.cancleUpload = function() {
        this.uploadXHR.abort();
        delete this.uploadXHR;
        this.uploadXHR = null;
    }
 
    /**
     * Get data from sepcial url
     *
     * @param   {string}                    [url]           Url to request
     * @param   {Array}                     [content]         params array
     * @param   {function|object|string}    [oncomplete]    Successful callback, or Html object, or Html object's ID
     * @param   {object}                    [extra]         Extra data post to callback function
     * @returns {boolean}                   Is the request successfully sent
     * @example
     * var ajax = new AJAXRequest();
     * ajax.get("getdata.asp", function(obj) {
     *      alert(obj.responseText);        // show data from getdata.asp
     * });
     * ajax.get("getdata.asp", "txtData");  // show data from getdata.asp in html object "txtData"
     */
    this.get = function(url, content, callback, extra) {
        return send(url, content, callback, 'GET', AJAX.async, extra);;
    }
 
    /**
     * Update the sepcial object with data from request url
     *
     * @param       {function|object|string}    callback        oncomplete      Successful callback, or Html object, or Html object's ID
     * @param       {string}                    url             Url to request
     * @param       {Array}                     content         params array
     * @param       {number}                    interval        Interval to update, if <1 times = 1
     * @param       {number}                    times           Total update times, if <1 times = INFINITY
     * @param       {object}                    [extra]         Extra data post to callback function
     * @returns     {string}                    id of update request, use to stop the update
     * @see         AJAXRequest#stopupdate
     * @example
     * var ajax = new AJAXRequest();
     * ajax.update(function(obj) {
     *          alert(obj.responseText);
     *      },
     *      "getdata.asp",  // get data from getdata.asp
     *      1000,   // update per second
     *      3       // total update 3 times
     * );
     */
    this.update = function(callback, url, content, interval, times, extra) {
        interval = _N(interval);
        times = _N(times);
        if(interval < 1) {
            times = 1;
        }
        else if(times < 1) {
            times = Number.POSITIVE_INFINITY;
        }

        var sendfoo = function() {
            send(url, content, callback, "GET", AJAX.async, extra);
        };
        
        var updateid = _GID();
        var updatefoo = function(updateCount) {
            sendfoo();
            updateCount--;
            if(updateCount > 0) {
                _SOP(updateid, setTimeout(function(){
                    updatefoo(updateCount);
                }, interval));
            }
        }

        updatefoo(times);
        return updateid;
    }
 
    /**
     * Stop update an object
     *
     * @param   {string}    update_id   update id which return by update method
     * @see     AJAXRequest#update
     * @example
     * var ajax = new AJAXRequest();
     * var up = ajax.update("txtData", "getdata.asp");
     * ajax.stopupdate(up);
     */
    this.stopupdate = function(id) {
        clearTimeout(_LOP(id));
    }
 
    /**
     * Post data to the sepcial url
     *
     * @param       {string}                    [url]           Url to post data
     * @param       {string}                    [content]       Data to post
     * @param       {function|object|string}    [oncomplete]    Successful callback, or Html object, or Html object's ID
     * @param       {object}                    [extra]         Extra data post to callback function
     * @returns     {boolean}                   Is the request successfully sent
     * @see         AJAXRequest#postf
     * @example
     * var ajax = new AJAXRequest();
     * ajax.post("postdata.asp", {data1:a, data2:b}, "the data to post", function(){});
     */
    this.post = function(url, content, callback, extra) {
        return send(url, content, callback, "POST", AJAX.async, extra);
    }
 
    /**
     * Post the special form to an url
     *
     * @param       {string|object}             formObject      The form object or its ID
     * @param       {function|object|String}    [oncomplete]    Successful callback, or Html object, or Html object's ID
     * @param       {object}                    [extra]         Extra data post to callback function
     * @returns     {boolean}                   Is the request successfully sent
     * @see         AJAXRequest#post
     * @example
     * var ajax = new AJAXRequest();
     * ajax.postf("dataForm", function(obj) {
     *      alert(obj.responseText);
     * });
     */
    this.postf = function(formObj, callback, extra) {
        var p=[];
        var vaf, pcbf, purl, pc, pm;
        var ac=arguments.length;
        var av=arguments;

        // check form legal
        formObj = formObj ? _VO(formObj) : false;
        if(!formObj || formObj.nodeName != "FORM") {
            return false;
        }

        // process form validate
        validfoo = formObj.getAttribute("onvalidate");
        validfoo = validfoo ? (typeof(validfoo)=="string" ? new Function(validfoo) : validfoo) : null;
        if(validfoo && !validfoo()) {
            return false;
        }

        // get url and method from formObj's attributes
        var url = formObj.getAttribute("action");
        var method = formObj.getAttribute("method");

        // check if content is empty
        var content = AJAX.formToArray(formObj);
        if(content.length == 0) {
            return false;
        }

        // send the request
        if(method.toUpperCase()=="POST") {
            return send(url, content, callback, "POST", true, extra);
        }
        else {
            return send(url, content, callback, "GET", true, extra);
        }
    }
 
    /**
     * Translate the form object to Array
     *
     * @param   {object} formObject
     * @returns {Array} The Array of the form
     * @see     AJAXRequest#postf
     * @ignore
     */
    this.formToArray = function(formObj) {
        var array = {};
        var elem, value;
        for(var i = 0; i< formObj.length; i+=1) {
            elem = formObj[i];

            if (elem.name!='') {
                value = undefined;
                switch(elem.type) {
                    case "select-one": {
                        if(elem.selectedIndex > -1) {
                            value = elem.options[elem.selectedIndex].value;
                        }
                        else {
                            value = "";
                        }
                        break;
                    }
                    case "checkbox":
                    case "radio": {
                        if (elem.checked == true) {
                            value = elem.value;
                        }
                        break;
                    }
                    default: {
                        value = elem.value;
                    }
                }

                if(value != undefined) {
                    value = AJAX.encode(value);
                    array[elem.name] = value;
                }
            }
        }
        
        return array;
    }
}
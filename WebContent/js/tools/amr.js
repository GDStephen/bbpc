/**
 * amr播放功能
 */

function E(selector) {
    return document.querySelector(selector);
}
var gAudioContext = new AudioContext();

function getAudioContext() {
    if (!gAudioContext) {
        gAudioContext = new AudioContext();
    }
    return gAudioContext;
}

function fetchBlob(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        callback(this.response);
    };
    xhr.onerror = function () {
        alert('Failed to fetch ' + url);
    };
    xhr.send();
}

function readBlob(blob, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        callback(data);
    };
    reader.readAsArrayBuffer(blob);
}

function fetchAndReadBlob(url, callback) {
    fetchBlob(url, function (blob) {
        readBlob(blob, callback);
    });
}

function playAmrBlob(blob, callback) {
    readBlob(blob, function (data) {
        playAmrArray(data);
    });
}

function convertAudioBlobToAmr(blob) {
    readBlob(blob, function (data) {
        var ctx = getAudioContext();
        ctx.decodeAudioData(data.buffer, function (audioBuffer) {
            var pcm;
            if (audioBuffer.copyFromChannel) {
                pcm = new Float32Array(audioBuffer.length);
                audioBuffer.copyFromChannel(pcm, 0, 0);
            } else {
                pcm = audioBuffer.getChannelData(0);
            }
            var amr = AMR.encode(pcm, audioBuffer.sampleRate, 7);
            playAmrArray(amr);
        });
    });
}

function playAmrArray(array) {
    var samples = AMR.decode(array);
    if (!samples) {
        alert('Failed to decode!');
        return;
    }
    playPcm(samples);
}

function playPcm(samples) {
    var ctx = getAudioContext();
    var src = ctx.createBufferSource();
    var buffer = ctx.createBuffer(1, samples.length, 8000);
    if (buffer.copyToChannel) {
        buffer.copyToChannel(samples, 0, 0)
    } else {
        var channelBuffer = buffer.getChannelData(0);
        channelBuffer.set(samples);
    }

    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start();
}
//判断是否语音播放完
var flag = true;
//判断是不是同一个语音
var urlflag;
var audio = new Audio();
function convertAmrBlobToWav(blob, message) {
    if (flag) {
        flag = false;
        readBlob(blob, function (data) {
            var buffer = AMR.toWAV(data);
            //  E('pre').textContent = toHex(buffer);
            var url = URL.createObjectURL(new Blob([buffer], {type: 'audio/x-wav'}));
            urlflag = toHex(buffer);
            // Play wav buffer
            audio.src = url;
            audio.onloadedmetadata = audio.onerror = function () {
                URL.revokeObjectURL(url);
            };
            audio.play();
            audio.addEventListener('ended', function () {
                flag = true;
                var app = document.body;
                var $scopeUI = angular.element(app).scope();
                $scopeUI.msgVoice = false;
                $scopeUI.$apply();
            }, false);
        });
    } else {
        flag = false;
        readBlob(blob, function (data) {
            var buffer = AMR.toWAV(data);
            // E('pre').textContent = toHex(buffer);
            //暂停播放语音
            if (urlflag == toHex(buffer)) {
                audio.pause();
                audio.startTime = 0.0;
                flag = true;
                var app = document.body;
                var $scopeUI = angular.element(app).scope();
                $scopeUI.msgVoice = false;
                $scopeUI.$apply();
            } else {//播放另一个语音
                var url = URL.createObjectURL(new Blob([buffer], {type: 'audio/x-wav'}));
                audio.src = url;
                audio.onloadedmetadata = audio.onerror = function () {
                    URL.revokeObjectURL(url);
                };
                audio.play();
                audio.addEventListener('ended', function () {
                    flag = true;
                    var app = document.body;
                    var $scopeUI = angular.element(app).scope();
                    $scopeUI.msgVoice = false;
                    $scopeUI.$apply();
                }, false);
            }
        });
    }

}

var lastVoice = null;
function playIEMp3(message) {
    if (lastVoice != null) {
        lastVoice.read = false;
    }
    lastVoice = message;
    message.read = true;

    var oAudio = document.getElementById('IEAudio');

    if (flag) {
        flag = false;
        var IEUrl = config.url.tfsUrl + message.mp3url + "?name=" + message.uuid + ".mp3";
        oAudio.src = IEUrl;
        oAudio.play();
        urlflag = IEUrl;
        oAudio.addEventListener('ended', function () {
            flag = true;
            message.read = false;
            var app = document.body;
            var $scopeUI = angular.element(app).scope();
            $scopeUI.$apply();
        }, false);
    } else {
        flag = false;
        var IEUrlm = config.url.tfsUrl + message.mp3url + "?name=" + message.uuid + ".mp3";
        //暂停播放语音
        if (urlflag == IEUrlm) {
            oAudio.pause();
            oAudio.startTime = 0.0;
            flag = true;
            message.read = false;
            var app = document.body;
            var $scopeUI = angular.element(app).scope();
            $scopeUI.$apply();
        } else {//播放另一个语音
            var IEUrle = config.url.tfsUrl + message.mp3url + "?name=" + message.uuid + ".mp3";
            oAudio.src = IEUrle;
            oAudio.play();
            oAudio.addEventListener('ended', function () {
                flag = true;
                message.read = false;
                var app = document.body;
                var $scopeUI = angular.element(app).scope();
                $scopeUI.$apply();
            }, false);
        }
    }
}


function toHex(buffer) {
    var str = '';
    for (var i = 0; i < buffer.length; i++) {
        var s = buffer[i].toString(16);
        if (s.length == 1) {
            s = '0' + s;
        }
        str += s;
        if (i % 16 == 15) { // print 16 bytes per line
            str += '\n'
        } else if (i % 2 == 1) { // add a space seperator every two bytes.
            str += ' ';
        }
    }
    return str;
}
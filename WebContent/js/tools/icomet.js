/*
config = {
	channel: 'abc',
	// [optional]
	// sign_url usually link to a app server to get a token,
	// if icomet do not need athentication, this parameter could be omitted.
	sign_url: 'http://...',
	// sub_url link directly to icomet server
	sub_url: 'http://...',
	[pub_url: 'http://...',]
	// be called when receive a msg
	callback: function(content){}
};
*/
function iComet(config){
	var self = this;

	iComet.id__ = iComet.id__ || 0;
	self.id = iComet.id__++;
	self.cb = 'icomet_cb_' + self.id;
	self.timer = null;
	self.sign_timer = null;
	self.stopped = true;
	self.last_sub_time = 0;
	self.need_fast_reconnect = true;
	self.token = '';
	self.data_seq = 0;
	self.noop_seq = 0;
	self.sign_cb = null;
	
	self.cname = config.channel;
	self.sub_timeout = config.sub_timeout || (60 * 1000);
	self.pub_url = config.pub_url;
	self.sub_url = config.sub_url + ((config.sub_url.indexOf('?') == -1) ? '?' : '&') + 'cb=' + self.cb;
	config.sign_url && (self.sign_url = config.sign_url + ((config.sign_url.indexOf('?') == -1) ? '?' : '&') + 'cb=' + self.cb + '&cname=' + self.cname);

	function clearTimer(timer) {
		if(timer){
			clearTimeout(timer);
			timer = null;
		}
	}

	self.sub_cb = function(msg) {
		var cb = config.callback || config.sub_callback;
		if(cb){
			try{
				cb(msg.content);
			}catch(e){
				self.log(e);
			}
		}
	}

	window[self.cb] = function(msg, in_batch){
		// batch repsonse
		if(msg instanceof Array){
			self.log('batch response', msg.length);
			for(var i in msg){
				if(msg[i] && msg[i].type == 'data'){
					if(i == msg.length - 1){
						window[self.cb](msg[i]);
					}else{
						window[self.cb](msg[i], true);
					}
				}
			}
			return;
		}
		//self.log('resp', msg);
		if(self.stopped || !msg){
			return;
		}

		switch(msg.type) {
			case '404': {
				self.log('resp', msg);
				// TODO channel id error!
				alert('channel not exists!');
				break;
			}
			case '401': {
				// TODO token error!
				self.log('resp', msg);
				alert('token error!');
				break;
			}
			case '429': {
				//alert('too many connections');
				self.log('resp', msg);
				setTimeout(self_sub, 5000 + Math.random() * 5000);
				break;
			}
			case 'sign': {
				self.log('proc', msg);
				if(self.sign_cb){
					self.sign_cb(msg);
				}
				break;
			}
			case 'noop': {
				self.last_sub_time = (new Date()).getTime();
				if(msg.seq == self.noop_seq){
					self.log('proc', msg);
					self.noop_seq = (self.noop_seq == 2147483647) ?  -2147483648 : (self.noop_seq + 1);

					// if the channel is empty, it is probably empty next time,
					// so pause some seconds before sub again
					setTimeout(self_sub, 1000 + Math.random() * 2000);
				} else {
					// we have created more than one connection, ignore it
					self.log('ignore exceeded connections');
				}
				break;
			}
			case 'next_seq': {
				self.log('proc', msg);
				self.data_seq = msg.seq;
				self_sub();
				break;
			}
			case 'broadcast': {
				self.last_sub_time = (new Date()).getTime();
				self.log('proc', msg);
				self.sub_cb(msg);
				self_sub();
				break;
			}
			case 'data': {
				self.last_sub_time = (new Date()).getTime();
				if(msg.seq != self.data_seq){
					if(msg.seq == 0 || msg.seq == 1) {
						self.log('server restarted');
						// TODO: lost_cb(msg);
						self.sub_cb(msg);
					}else if(msg.seq < self.data_seq) {
						self.log('drop', msg);
					}else{
						self.log('msg lost', msg);
						// TODO: lost_cb(msg);
						self.sub_cb(msg);
					}
					
					self.data_seq = (msg.seq == 2147483647) ?  -2147483648 : (msg.seq + 1);
					if(!in_batch){
						// fast reconnect
						var now = new Date().getTime();
						if(self.need_fast_reconnect || (now - self.last_sub_time) > 3 * 1000){
							self.log('fast reconnect');
							self.need_fast_reconnect = false;
							self_sub();
						}
					}
				} else {
					self.log('proc', msg);
					self.data_seq = (self.data_seq == 2147483647) ?  -2147483648 : (self.data_seq + 1);
					self.sub_cb(msg);
					if(!in_batch){
						self_sub();
					}
				}
				break;
			}
			default: break;
		}
	}
	
	self.sign = function(callback){
		self.log('sign in icomet server...');
		self.sign_cb = callback;
		var url = self.sign_url + '&_=' + new Date().getTime();
		$.ajax({
			url: url,
			dataType: "jsonp",
			jsonpCallback: "cb"
		});
	}

	var self_sub = function(){
		self.stopped = false;
		self.last_sub_time = (new Date()).getTime();
		$('script.' + self.cb).remove();
		var url = self.sub_url
			 + '&cname=' + self.cname
			 + '&seq=' + self.data_seq
			 + '&noop=' + self.noop_seq
			 + '&token=' + self.token
			 + '&_=' + new Date().getTime();
 		self.log('sub ' + url);
		$.ajax({
			url: url,
			dataType: "jsonp",
			jsonpCallback: "cb"
		});
	}
	
	self.start = function(){
		self.stopped = false;
		clearTimer(self.timer);

		if(self.sign_url){
			self.sign_timer = self.sign_timer || setInterval(self.start, 3000 + Math.random() * 2000);
			self.sign(function(msg) {
				clearTimer(self.sign_timer);
				if(!self.stopped) {
					self.cname = msg.cname;
					self.token = msg.token;
					var a = parseInt(msg.sub_timeout) || 0;
					self.sub_timeout = (a * 1.2) * 1000;
					self.log(`start sub ${self.cname}, seq=${self.data_seq}, timeout=${self.sub_timeout} ms`);
					self._start_timeout_checker();
					self_sub();
				}
			});
		} else {
			self.log(`start sub ${self.cname} , seq=${self.data_seq}, timeout=${self.sub_timeout} ms`);
			self._start_timeout_checker();
			self_sub();
		}
	}

	self.stop = function(){
		self.stopped = true;
		self.last_sub_time = 0;
		self.need_fast_reconnect = true;
		clearTimer(self.timer);
		clearTimer(self.sign_timer);
		window[self.cb] = function() {};
	}
	
	self._start_timeout_checker = function(){
		clearTimer(self.timer);
		self.timer = setInterval(function(){
			var now = (new Date()).getTime();
			if(now - self.last_sub_time > self.sub_timeout){
				self.log('timeout');
				self.stop();
				self.start();
			}
		}, 1000);
	}
	
	self.pub = function(content, callback){
		// msg must be string
		if(typeof(content) != 'string' || !self.pub_url){
			alert(self.pub_url);
			return false;
		}
		if(callback == undefined){
			callback = function(){};
		}
		var data = {};
		data.cname = self.cname;
		data.content = content;

		$.getJSON(self.pub_url, data, callback);
	}
	
	self.log = function(){
		try{
			var v = arguments;
			var p = 'icomet[' + self.id + ']';
			var t = new Date().toTimeString().substr(0, 8);
			console.log.apply(this, t, p, arguments);
		}catch(e){}
	}

	self.start();

}

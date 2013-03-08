// 监视url
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (tab.url.indexOf('file://') > -1) {
		chrome.pageAction.show(tabId);
		chrome.pageAction.setTitle({
			'tabId': tabId,
			'title': 'Catch me to localhost'
		});
	}
});

// 按钮事件
chrome.pageAction.onClicked.addListener(function(tab){
	var url = tab.url;
	if (url.indexOf('file://') > -1){
		url = url.substr(8);
		initWS(function(){
			_WS.send('D:/Projects' + url.substr(2, url.lastIndexOf('/') -2));
		});
		chrome.tabs.update(tab.id, {'url': url.replace(/^\w:\//, 'http://www.test.com/').replace(/#.*/g, '')});
	} else {
		chrome.tabs.update(tab.id, {'url': url.replace(/#.*/g, '') + '#!watch'});
	}
});


var _WS, _WS_SetTimeout4less = false, _WS_SetTimeout4reload = false,
	_WS_Interval = 1000;
function initWS(callback){
	if (!_WS) {
		_WS = new WebSocket('ws://127.0.0.1:8080/');
		_WS.onopen = function (evt) {
			console.log("Connected to WebSocket server.");
			callback();
		};
		_WS.onclose = function (evt) { 
			_WS = false;
			console.log("Disconnected");
		};
		_WS.onmessage = function (evt) {
			var json = JSON.parse(evt.data);
			if (json.filename.indexOf('.less') != -1) {
				if (!_WS_SetTimeout4less) {
					_WS_SetTimeout4less = true;
					chrome.tabs.executeScript(null, {
						'code': ''
					});

					setTimeout(function(){
						_WS_SetTimeout4less = false;
					}, _WS_Interval);
				}
			} else {
				if (!_WS_SetTimeout4reload) {
					_WS_SetTimeout4reload = true;
					_WS_SetTimeout4less = true;
					chrome.tabs.reload();

					setTimeout(function(){
						_WS_SetTimeout4reload = false;
						_WS_SetTimeout4less = false;
					}, _WS_Interval);
				}
			}
		};
		_WS.onerror = function (evt) { 
			_WS = false;
			console.log('Error occured: ' + evt.data);
		};
	} else {
		callback();
	}
}



// 接受信息
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	chrome.pageAction.show(sender.tab.id);
});

var crypto = require('crypto');
var config = require('cloud/config/weixin.js');
var debug = require('debug')('AV:weixin');

exports.exec = function(params, cb) {
  if (params.signature) {
    checkSignature(params.signature, params.timestamp, params.nonce, params.echostr, cb);
  } else {
	var msgType = '' + params.xml.MsgType + '';
	if (msgType == 'text') {
		var msgCont = '' + params.xml.Content + '';
		var msgPrefix = msgCont.substring(0, 2);
		switch(msgPrefix){
			case "添加":
				addContact(params, cb);
				break;
			default:
				receiveMessage(params, cb);
				break;
		}
	}
  }
}

// 验证签名
var checkSignature = function(signature, timestamp, nonce, echostr, cb) {
	var oriStr = [config.token, timestamp, nonce].sort().join('')
	var code = crypto.createHash('sha1').update(oriStr).digest('hex');
	debug('code:', code)
	if (code == signature) {
		cb(null, echostr);
	} else {
		var err = new Error('Unauthorized');
		err.code = 401;
		cb(err);
	}
}

// 接收普通消息
var receiveMessage = function(msg, cb) {
	var cName = "" + msg.xml.Content + "";
	//console.log(cName);
	var query = new AV.Query("Contacts");
	query.equalTo("CName", cName);
	query.first().then(
		function(obj) {
			var cont = "不知道你啥意思~~";
			if (obj) cont = cName + '的手機號是: ' + obj.get("MobiPhone") + '';
			var result = {
				xml: {
					ToUserName: msg.xml.FromUserName[0],
					FromUserName: '' + msg.xml.ToUserName + '',
					CreateTime: new Date().getTime(),
					MsgType: 'text',
					Content: cont
				}
			}
			cb(null, result);
		},
		function(error){
		}
	);
}

//添加联系人
var addContact = function(msg, cb) {
	var cont = '' + msg.xml.Content + '';
	var tmpStr = cont.substring(2);
	var cName = tmpStr.replace(/[^\u4E00-\u9FA5]/g,'');
	var mobiPhone = tmpStr.replace(/[^\d]/g,'');
	//console.log(cName);
	var query = new AV.Query("Contacts");
	query.equalTo("CName", cName);
	query.first().then(
		function(obj) {
			if (!obj) {
				var newCont = new AV.Object("Contacts");
				newCont.set("CName", cName);
				newCont.set("MobiPhone", mobiPhone);
				newCont.save().then(
					function(){
						var result = {
							xml: {
								ToUserName: msg.xml.FromUserName[0],
								FromUserName: '' + msg.xml.ToUserName + '',
								CreateTime: new Date().getTime(),
								MsgType: 'text',
								Content: '保存成功！'
							}
						};
						cb(null, result);
					}
				);
			}
			else {
				var result = {
					xml: {
						ToUserName: msg.xml.FromUserName[0],
						FromUserName: '' + msg.xml.ToUserName + '',
						CreateTime: new Date().getTime(),
						MsgType: 'text',
						Content: '保存成功！'
					}
				};
				cb(null, result);
			}
		}
	);
}

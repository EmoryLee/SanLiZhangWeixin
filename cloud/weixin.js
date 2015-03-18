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
			case "删除":
				delContact(params, cb);
				break;
			case "更新":
				editContact(params, cb);
				break;
			default:
				queryContact(params, cb);
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

// 查詢聯繫人
var queryContact = function(msg, cb) {
	var cName = "" + msg.xml.Content + "";
	//console.log(cName);
	var query = new AV.Query("Contacts");
	query.equalTo("CName", cName);
	query.first().then(
		function(obj) {
			var arr = ['不知道你啥意思~~', '你想干嘛~~', '是不是很無聊~~', '想請我吃飯？抱歉，沒時間~~'];
			arr.sort(function(){return Math.random()-0.5;});
			var cont = arr.slice(0,1);
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
					},
					function(err){
						var result = {
							xml: {
								ToUserName: msg.xml.FromUserName[0],
								FromUserName: '' + msg.xml.ToUserName + '',
								CreateTime: new Date().getTime(),
								MsgType: 'text',
								Content: '保存失敗:' + err + ''
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
						Content: '用户已存在'
					}
				};
				cb(null, result);
			}
		},
		function(err) {
			var result = {
				xml: {
					ToUserName: msg.xml.FromUserName[0],
					FromUserName: '' + msg.xml.ToUserName + '',
					CreateTime: new Date().getTime(),
					MsgType: 'text',
					Content: '查詢失敗' + err + ''
				}
			};
			cb(null, result);
		}
	);
}


//删除联系人
var delContact = function(msg, cb) {
	var cont = '' + msg.xml.Content + '';
	var tmpStr = cont.substring(2);
	var cName = tmpStr.replace(/[^\u4E00-\u9FA5]/g,'');
	//var mobiPhone = tmpStr.replace(/[^\d]/g,'');
	//console.log(cName);
	var query = new AV.Query("Contacts");
	query.equalTo("CName", cName);
	query.first().then(
		function(obj) {
			if (obj) {
				obj.destroy().then(
					function(){
						var result = {
							xml: {
								ToUserName: msg.xml.FromUserName[0],
								FromUserName: '' + msg.xml.ToUserName + '',
								CreateTime: new Date().getTime(),
								MsgType: 'text',
								Content: '刪除成功！'
							}
						};
						cb(null, result);
					},
					function(err){
						var result = {
							xml: {
								ToUserName: msg.xml.FromUserName[0],
								FromUserName: '' + msg.xml.ToUserName + '',
								CreateTime: new Date().getTime(),
								MsgType: 'text',
								Content: '刪除失敗:' + err + ''
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
						Content: '用户不存在'
					}
				};
				cb(null, result);
			}
		},
		function(err) {
			var result = {
				xml: {
					ToUserName: msg.xml.FromUserName[0],
					FromUserName: '' + msg.xml.ToUserName + '',
					CreateTime: new Date().getTime(),
					MsgType: 'text',
					Content: '查詢失敗' + err + ''
				}
			};
			cb(null, result);
		}
	);
}

//更新联系人
var editContact = function(msg, cb) {
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
								Content: '沒找到' + cName + ', 已添加成功！'
							}
						};
						cb(null, result);
					},
					function(err){
						var result = {
							xml: {
								ToUserName: msg.xml.FromUserName[0],
								FromUserName: '' + msg.xml.ToUserName + '',
								CreateTime: new Date().getTime(),
								MsgType: 'text',
								Content: '沒找到' + cName + ', 嘗試添加時發生錯誤:' + err + ''
							}
						};
						cb(null, result);
					}
				);
			}
			else {
				obj.set("MobiPhone", mobiPhone);
				obj.save().then(
					function(){
						var result = {
							xml: {
								ToUserName: msg.xml.FromUserName[0],
								FromUserName: '' + msg.xml.ToUserName + '',
								CreateTime: new Date().getTime(),
								MsgType: 'text',
								Content: '更新成功!'
							}
						};
						cb(null, result);
					},
					function(err){
						var result = {
							xml: {
								ToUserName: msg.xml.FromUserName[0],
								FromUserName: '' + msg.xml.ToUserName + '',
								CreateTime: new Date().getTime(),
								MsgType: 'text',
								Content: '更新時發生錯誤:' + err + ''
							}
						};
						cb(null, result);
					}
				);
			}
		},
		function(err) {
			var result = {
				xml: {
					ToUserName: msg.xml.FromUserName[0],
					FromUserName: '' + msg.xml.ToUserName + '',
					CreateTime: new Date().getTime(),
					MsgType: 'text',
					Content: '查詢是否存在該聯繫人時發生錯誤:' + err + ''
				}
			};
			cb(null, result);
		}
	);
}

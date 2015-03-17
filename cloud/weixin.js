var crypto = require('crypto');
var config = require('cloud/config/weixin.js');
var debug = require('debug')('AV:weixin');

exports.exec = function(params, cb) {
  if (params.signature) {
    checkSignature(params.signature, params.timestamp, params.nonce, params.echostr, cb);
  } else {
    receiveMessage(params, cb)
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

function queryMobiPhone(cname){
	var mobiPhone = "";
	var query = new AV.Query("Contacts");
	query.equalTo("CName", cname);
	query.first({
		success: function(results) {
			if (results) {
				mobiPhone = "" + results.get("MobiPhone") + "";
				console.log(mobiPhone);
			}
			else{
				mobiPhone = "Not Found.";
			}
		},
		error: function(error) {
			mobiPhone = "" + error + "";
		}
	});
	return mobiPhone;
}

// 接收普通消息
var receiveMessage = function(msg, cb) {
  //var frmUser = msg.xml.ToUserName;
  //var frmUser = "朋友";
  //var msgCont = "";
  //AV.Cloud.run('hello', {name: frmUser}, {
  //  success: function(data){msgCont = data},
  //  error: function(err){ msgCont = err}
  //})
  var cName = "" + msg.xml.Content + "";
  //console.log(cName);
  //var cname = cName.replace("[ '", "").replace("' ]", "");
  var mobiPhone = queryMobiPhone(cName);
  console.log('mobiPhone', mobiPhone);
  //AV.Cloud.run('queryPhone', {"cname": cName}, {
  //	success: function(data){mobiPhone = data},
  //	error: function(err){mobiPhone = err}
  // });
  /*
   var query = new AV.Query("Contacts");
   console.log('param:cname:', cName);
   query.equalTo("CName", cName);
   query.first({
	 success: function(results) {
		//console.log(results[0].attributes.MobiPhone);
		// console.log(results);
		console.log(results.get("MobiPhone"));
		mobiPhone = '' + results.get("MobiPhone") + '';
	 },
	 error: function(error) {
		console.log("error", error);
	 }
   });
   */
  
  var result = {
    xml: {
      ToUserName: msg.xml.FromUserName[0],
      FromUserName: '' + msg.xml.ToUserName + '',
      CreateTime: new Date().getTime(),
      MsgType: 'text',
      Content: 'AutoReply: ' + mobiPhone + ''
    }
  }
  cb(null, result);
}

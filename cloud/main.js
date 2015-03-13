﻿require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
/* AV.Cloud.define("hello", function(request, response) {
  var name = request.params.name;
  if (name) {
    response.success("Hello " + name);
  } else {
    response.error('name?');
  }
});
 */
AV.Cloud.define("queryPhone", function(request, response) {
  var query = new AV.Query("Contacts");
  var cname = request.params.cname;
  var ret = "";
  query.equalTo('CName', request.params.cname);
  query.first({
    success: function(results) {
      //var sum = 0;
      //for (var i = 0; i < results.length; ++i) {
      //  sum += results[i].get('stars');
      //}
      //response.success(sum / results.length);
	  //if (result.length > 0) {
		//response.success(request.params.cname + "的手机号是: " + results[0].getString('MobiPhone'));
		ret = request.params.cname + "的手机号是: " + results.get('MobiPhone');
	  //}
	  //else {
		//response.success('Nothing found.');
		//ret = "Nothing found.";
	  //}
	  //response.success('OK');
    },
    error: function() {
      //response.error('Error.');
	  ret = "Error";
    }
  });
  response.success(ret);
});

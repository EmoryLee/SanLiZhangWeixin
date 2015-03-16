require("cloud/app.js");
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
AV.Cloud.define('queryPhone', function(request, response) {
	var query = new AV.Query("Contacts");
	var cname = request.params.cname;
	query.equalTo("CName", cname);
	query.first({
		success: function(results) {
			//response.success(request.params.cname + "的手机号是: " + results.get('CName') + "");
			response.success(results.length);
		},
		error: function() {
			response.error("Error");
		}
	});

	//response.success(ret + cname);});
});
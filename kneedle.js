var journey = require('journey');
var knox = require('knox');

var nodemailer = require('nodemailer');

nodemailer.SMTP = {
    host: "smtp.gmail.com", // required
    port: 465, // optional, defaults to 25 or 465
    use_authentication: true,
    ssl: true,
    user: "noreply@getkneedle.com",
    pass: "hhyd9944"
}

var formidable = require('formidable');

var Db = require('./node-mongodb-native').Db,
  Connection = require('./node-mongodb-native').Connection,
  Server = require('./node-mongodb-native').Server,
  BSON = require('./node-mongodb-native').BSONNative;

var client = new Db('kneedle', new Server("10.170.98.254", 27017, {}));
        client.open(function(err, p_client) {
});

var accountsCol;
client.collection('accounts', function(err, collection) {
        accountsCol = collection;
});

var itemsCol;
client.collection('items', function(err, collection) {
        itemsCol = collection;
});

var savedSearchesCol;
client.collection('savedSearches', function(err, collection) {
        savedSearchesCol = collection;
});

var categoriesCol;
client.collection('categories', function(err, collection) {
        categoriesCol = collection;
});

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

function getDistance (lat1, lon1, lat2, lon2) {

	lat1=parseFloat(lat1);
	lat2=parseFloat(lat2);
	lon1=parseFloat(lon1);
	lon2=parseFloat(lon2);

	if (lat1 != undefined && lon1 != undefined && lat2 != undefined && lon2 != undefined) {
		var R = 3963; // Radius of the earth in miles
		var l1 = lat2-lat1;
		var l2 = lon2-lon1;
		var dLat = l1.toRad();  // Javascript functions in radians
		var dLon = l2.toRad(); 
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
		        Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in miles
	} else {
		var d = 0;
	}

	return d;

}

//
// Create a Router
//
var router = new(journey.Router);

// UPDATE TYPES
/*
GET returns info on an object
POST creates an object
PUT updates an object
DELETE deletes an object
*/

/*
AUTHORIZATION
for any method which requires authorization, simple provide the following 2 params with request
deviceId
email
*/
function auth(deviceId, email, callback) {
	accountsCol.find({'deviceId':deviceId,'email':email}).toArray(function(err, docs) {
		if (docs.length == 0) {
			err = new Array('incorrect authentication credentials');
		}
		callback(err, docs);
	});
}

/*
GET /account

returns account information

AUTH REQUIRED

REQUEST PARAMS

RESPONSE CODES
200 - Valid User
	returns json document with 2 main keys, items and savedSearches
400 - Unauthorized
	returns nothing
*/
router.get('/account').bind(function (req, res, params) {
	auth(params.deviceId, params.email, function (err, docs) {
		if (err) {
			res.send(400, {}, {'error':err});
		} else {

			var ret = new Object();

			itemsCol.find({'email':params.email}).toArray(function(err, docs) {
				if (err) {
				} else {
					ret.items = docs;
				}

				savedSearchesCol.find({'email':params.email}).toArray(function(err, docs) {
					if (err) {
					} else {
						ret.savedSearches = docs;
					}

					res.send(200, {}, ret);

				});
			});

		}
	});
});

/*
PUT /account

creates a new account if it doesn't exist

REQUEST PARAMS
deviceId
email

RESPONSE CODES
200 - Account Created
	returns json document with account information
400 - Error
	returns error
*/
router.put('/account').bind(function (req, res, params) {
	accountsCol.update({'deviceId':params.deviceId, 'email':params.email}, {$set: {'deviceId':params.deviceId, 'email':params.email, 'createdAt':Math.round((new Date()).getTime()/1000)}}, {safe:true, upsert:true}, function(err, objects) {
		if (err) {
			res.send(400, {}, {'error':err});
		} else {
			res.send(200, {}, {'success':1});
		}
	});
});

/*
POST /item

creates a new item

AUTH REQUIRED

REQUEST PARAMS
name: name of the item
desc: description of the item
category: name of the category
photo: comma seperated list of photo urls
lat: latitude
lng: longitude

RESPONSE CODES
200 - Item Created
	returns json document with item information
400 - Error
	returns nothing
*/
router.post('/item').bind(function (req, res, params) {
	auth(params.deviceId, params.email, function (err, docs) {
		if (err) {
			res.send(400, {}, {'error':err});
		} else {

			if (params.name != '') {

				// split up name
				var t = new Object();
				var nS = new Array();
				var nArr = params.name.split(' ');
				for (var i=0;i<nArr.length;i++) {
					// lowercase all values for searching later
					nArr[i] = nArr[i].toLowerCase();
					nS.push({'termSearch':nArr[i].toLowerCase()});
				}

				// search savedSearches for this item
				t.$or = nS;

				// add lat lon
				// t.loc = {$near:[Number(params.lat),Number(params.lng)]};

				savedSearchesCol.find(t).toArray(function(err, docs) {
					if (err) {
						console.log(err);
					} else {
						for (var i=0;i<docs.length;i++) {
							docs[i].distance = getDistance(params.lat, params.lng, docs[i].loc[0], docs[i].loc[1]);
							// send email
							console.log('emailing '+docs[i].email+' about '+params.name);

							nodemailer.send_mail({
								to:docs[i].email,
								sender:'noreply@gmail.com',
								subject:'Saved Search on Kneedle for '+docs[i].term,
								body:'Someone has posted an item '+Math.round(docs[i].distance*100)/100+' miles away which matches your saved search for "'+docs[i].term+'".'+"\n\n"+params.name+"\n\n"+params.desc+"\n\n"+'Open the Kneedle app for more information!'},
								function(err, success) {
									if (err) {
										console.log(err);
									}
								});

						}
					}
				});

				itemsCol.insert({'name':params.name, 'nameSearch':nArr, 'desc':params.desc, 'deviceId':params.deviceId, 'email':params.email, 'category':params.category, 'photo':params.photo, 'loc':[Number(params.lat), Number(params.lng)], 'createdAt':Math.round((new Date()).getTime()/1000), 'price':params.price}, {safe:true}, function(err, objects) {
					if (err) {
						res.send(400, {}, {'error':err.message});
					} else {
						res.send(200, {}, objects[0]);
					}
				});

			} else {
				res.send(400, {}, {'error':'items must have a title'});
			}

		}
	});
});

/*
GET /item

returns item information

REQUEST PARAMS
id: _id of the item

RESPONSE CODES
200 - Success
	returns json document with item information
400 - Error
	returns nothing
*/
router.get('/item').bind(function (req, res, params) {

	itemsCol.find({'_id':client.bson_serializer.ObjectID(params.id)}).toArray(function(err, docs) {
		if (err) {
			res.send(400, {}, {'error':err});
		} else {
			res.send(200, {}, docs[0]);
		}
	});

});

/*
DELETE /item

deletes an item

AUTH REQUIRED

REQUEST PARAMS
id: item _id

RESPONSE CODES
200 - Success
	returns json success
400 - Error
	returns error
*/
router.del('/item').bind(function (req, res, params) {
	auth(params.deviceId, params.email, function (err, docs) {
		if (err) {
			res.send(400, {}, {'error':err});
		} else {

			itemsCol.remove({'_id':client.bson_serializer.ObjectID(params.id), 'email':params.email}, function(err, objects) {
				if (err) {
					res.send(400, {}, {'error':err.message});
				} else {
					res.send(200, {}, {'success':'true'});
				}
			});
		}
	});
});

/*
DELETE /search

deletes a saved search

AUTH REQUIRED

REQUEST PARAMS
id: savedSearch _id

RESPONSE CODES
200 - Success
	returns json success
400 - Error
	returns error
*/
router.del('/search').bind(function (req, res, params) {
	auth(params.deviceId, params.email, function (err, docs) {
		if (err) {
			res.send(400, {}, {'error':err});
		} else {

			savedSearchesCol.remove({'_id':client.bson_serializer.ObjectID(params.id), 'email':params.email}, function(err, objects) {
				if (err) {
					res.send(400, {}, {'error':err.message});
				} else {
					res.send(200, {}, {'success':'true'});
				}
			});
		}
	});
});

/*
POST /search

creates a saved search

AUTH REQUIRED

REQUEST PARAMS
term: search term for name or desc field
category: category to match
distance: distance to search in miles
lat: latitude
lng: longitude

RESPONSE CODES
200 - Success
	returns json success
400 - Error
	returns error
*/
router.post('/search').bind(function (req, res, params) {
	auth(params.deviceId, params.email, function (err, docs) {
		if (err) {
			res.send(400, {}, {'error':err});
		} else {

			// split up name
			var nArr = params.term.split(' ');
			for (var i=0;i<nArr.length;i++) {
				// lowercase all values for searching later
				nArr[i] = nArr[i].toLowerCase();
			}


			savedSearchesCol.insert({'term':params.term, 'termSearch':nArr, 'deviceId':params.deviceId, 'email':params.email, 'category':params.category, 'distance':params.distance, 'loc':[Number(params.lat), Number(params.lng)], 'createdAt':Math.round((new Date()).getTime()/1000)}, {safe:true}, function(err, objects) {
				if (err) {
					res.send(400, {}, {'error':err.message});
				} else {
					res.send(200, {}, {'success':'true'});
				}
			});
		}
	});
});

/*
GET /search

returns a list of items limited at 50 max

REQUEST PARAMS
term: search term for name or desc field
category: category to match
distance: distance to search in miles
lat: latitude
lng: longitude

RESPONSE CODES
200 - Success
	returns json document with list of matching items
400 - Error
	returns error
*/
router.get('/search').bind(function (req, res, params) {

	var t = new Object();

	if (params.term != undefined && params.term != '') {

		// split up the search string
		var nArr = params.term.split(' ');
		var nS = new Array();
		for (var i=0;i<nArr.length;i++) {
			// lowercase all values for searching later
			nS.push({'nameSearch':nArr[i].toLowerCase()});
		}

		t.$or = nS;
	}

	if (params.category != undefined && params.category != '') {
		t.category = params.category;
	}

	if (params.lat != undefined && params.lng != undefined) {
		if (params.distance == undefined) {
			// set it to 50 miles
			params.distance = 50;
		}
		//t.loc = {$near:[Number(params.lat),Number(params.lng)],$maxDistance:Number(params.distance/69)};
		t.loc = {$near:[Number(params.lat),Number(params.lng)]};
	}

	itemsCol.find(t).limit(50).sort({'createdAt':-1}).toArray(function(err, docs) {
		if (err) {
			res.send(400, {}, {'error':err});
		} else {
			for (var i=0;i<docs.length;i++) {
				docs[i].distance = getDistance(params.lat, params.lng, docs[i].loc[0], docs[i].loc[1]);
			}
			res.send(200, {}, docs);
		}
	});

});

/*
GET /categories

returns a list of all categories

RESPONSE CODES
200 - Success
	returns json document with list of categories
400 - Error
	returns error
*/
router.get('/categories').bind(function (req, res, params) {
	categoriesCol.find({}, {sort:['displayName', 'asc']}).toArray(function(err, docs) {
		if (err) {
			res.send(400, {}, {'error':err});
		} else {
			res.send(200, {}, docs);
		}
	});
});

/*
POST /upload

uploads a file, or multiple files

AUTH REQUIRED

REQUEST PARAMS
file: file upload field <input type="file" name="file" />

RESPONSE CODES
200 - Success
	returns json list of file locations
400 - Error
	returns error
*/

// start the server

require('http').createServer(function (request, response) {

	if (request.method == 'OPTIONS') {

		response.writeHead(200, {'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET, POST, PUT, OPTIONS, DELETE'});
		response.end();

	} else if (request.url != '/upload') {

		console.log(request.method+' '+request.url);

		var body = "";

		request.addListener('data', function (chunk) { body += chunk });
		request.addListener('end', function () {
			router.handle(request, body, function (result) {
				result.headers['Access-Control-Allow-Origin'] = '*';
				result.headers['Access-Control-Allow-Methods'] = '*';
				response.writeHead(result.status, result.headers);
				response.end(result.body);
			});
		});

	} else {
		// handle upload

		console.log('new file upload');

		var form = new formidable.IncomingForm(),
		files = [],
		fields = [];

		form.uploadDir = '/usr/share/nginx/html/uploads/';
		form.keepExtensions = true;

		form
			.on('field', function(field, value) {
				fields[field] = value;
			})
			.on('file', function(field, file) {
				files.push([field, file]);
			})
			.on('end', function() {
				auth(fields.deviceId, fields.email, function (err, docs) {
					if (err) {
						response.writeHead(400, {'content-type':'application/json'});
						var myErr = {'error':err};
						response.end(JSON.stringify(myErr));
					} else {

						var allFiles = '';
						for (var i=0;i<files.length;i++) {
							if (i<0) {
								allFiles = allFiles+',';
							}
							var s = files[i][1]['path'].split('/');
							allFiles = allFiles+'"http://api1.getkneedle.com:8080/uploads/'+s[s.length-1]+'"';
						}
						response.writeHead(200, {'content-type':'application/json'});
						console.log(allFiles);
						response.end('{files:['+allFiles+']}');
					}
				});
			});
		form.parse(request);
	}
}).listen(80);

console.log('listening on port 80');

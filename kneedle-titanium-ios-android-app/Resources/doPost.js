var localEmail = Titanium.App.Properties.getString("localEmail", "");

var win = Ti.UI.currentWindow;
win.title = 'Post: '+win.category;

var photoStr = [];

var actInd = Ti.UI.createImageView({
	width: 320,
	height: 480,
	image: 'actInd.png'
});

var sView = Titanium.UI.createScrollView({
	contentWidth:'auto',
	contentHeight:'auto',
	top: 0,
	showVerticalScrollIndicator: true
});
win.add(sView);

var name = Titanium.UI.createTextField({
	color:'#000',
	top:10,
	left:10,
	width:255,
	height:40,
	autocorrect: false,
	hintText:'Name',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
sView.add(name);

var catI = Ti.UI.createImageView({
	image:'categories/'+win.category+'Pin.png',
	top:10,
	right:10,
	height:40,
	width:40
});
sView.add(catI);

var desc = Titanium.UI.createTextArea({
	color:'#000',
	top:60,
	left:10,
	width:300,
	height:120,
	autocorrect: false,
	value:'Description',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
sView.add(desc);

desc.addEventListener('focus',function (e) {
	desc.value = '';
});

var price = Titanium.UI.createTextField({
	color:'#000',
	top:190,
	left:10,
	width:200,
	height:40,
	autocorrect: false,
	hintText:'$',
	keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
sView.add(price);

var loginBtn = Titanium.UI.createButton({
	title:'Post Item',
	top:190,
	width:90,
	right:10,
	height:40
});
sView.add(loginBtn);

var photoBtn = Titanium.UI.createButton({
	title:'Add Photo',
	top:240,
	left:10,
	width:90,
	height:40
});
sView.add(photoBtn);

var nextThumbTop = 290;

photoBtn.addEventListener('click',function(e) {

	Titanium.Media.showCamera({
 
		success:function(event) {

			win.add(actInd);

			var image = event.media;

			var xhr = Ti.Network.createHTTPClient();

			xhr.timeout = 1000000;
			xhr.open("POST","http://api1.getkneedle.com/upload");

			xhr.onload = function() {
				win.remove(actInd);
				try {
					var r = eval('('+this.responseText+')');
					for (var i=0;i<r.files.length;i++) {
						photoStr.push(r.files[i]);
						var iV = Titanium.UI.createImageView({
							image:r.files[i],
							top: nextThumbTop,
							left: 10,
							width: 300,
							height: 300
						});
						sView.add(iV);
						nextThumbTop = nextThumbTop+310;
					}
				} catch(E) {
					alert(E);
				}
			};

			xhr.send({
				media:image,
				deviceId:Ti.Platform.id,
				email:localEmail
			});
 
 
		},cancel:function() {
		},error:function(error) {

			var a = Titanium.UI.createAlertDialog({title:'Camera'});

			if (error.code == Titanium.Media.NO_CAMERA) {
				a.setMessage('Sorry, your device does not have a camera.');
			} else {
				a.setMessage('Unexpected error: ' + error.code);
			}
 
			// show alert
			a.show();
		},
		saveToPhotoGallery:true,
		allowEditing:true,
		//mediaTypes:[Ti.Media.MEDIA_TYPE_VIDEO,Ti.Media.MEDIA_TYPE_PHOTO]
		mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
	});

});

loginBtn.addEventListener('click',function(e) {

	win.add(actInd);

	// get device location

	Titanium.Geolocation.purpose = 'Local Search';
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
	Titanium.Geolocation.distanceFilter = 4;

	Titanium.Geolocation.getCurrentPosition(function(e) {
		if (e.error) {
			alert('Your device has no location');
			return;
		}

		var latitude = e.coords.latitude; 
		var longitude = e.coords.longitude;

		var xhr = Ti.Network.createHTTPClient();

		xhr.open('POST','http://api1.getkneedle.com/item');

		xhr.onload = function () {

			win.remove(actInd);

			alert('item posted');

			win.close();

		};

		// Get the data
		var cPhotos = '';
		for (var i=0;i<photoStr.length;i++) {
			if (i>0) {
				cPhotos = cPhotos+',';
			}
			cPhotos = cPhotos+photoStr[i];
		}

		delete photoStr;

		xhr.send({'deviceId':Ti.Platform.id,'email':localEmail,'lat':latitude,'lng':longitude,'name':name.value,'desc':desc.value,'photo':cPhotos,'category':win.category,'price':price.value});

	});

});

win.addEventListener('focus', function() {
	delete photoStr;
});

var msgType = Ti.UI.currentWindow.msgType;
var msgUrl = Ti.UI.currentWindow.msgUrl;
var msgSender = Ti.UI.currentWindow.msgSender;

var window = Ti.UI.createWindow({backgroundColor:'#fff'});

if (msgType == 3) {
	// this is a location

	var loc = msgUrl.split(',');

	var apple = Ti.Map.createAnnotation({
	    latitude:loc[0],
	    longitude:loc[1],
	    title:msgSender,
	    animate:true,
	}); 

	var mapView = Ti.Map.createView({
	    mapType: Ti.Map.STANDARD_TYPE,
	    region:{latitude:loc[0], longitude:loc[1], 
            latitudeDelta:.5, longitudeDelta:.5},
	    animate:true,
	    regionFit:true,
	    userLocation:false,
	    annotations:[apple]
	}); 

	Titanium.Geolocation.purpose = 'Your Location';
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
	Titanium.Geolocation.distanceFilter = 4;

	Titanium.Geolocation.getCurrentPosition(function(e){
	        var region={
	            latitude: e.coords.latitude,
	            longitude: e.coords.longitude,
			title:'Your Location',
			pincolor:Titanium.Map.ANNOTATION_GREEN,
	            animate:true,
	        };
	        mapView.createAnnotation(region);
	});

	window.add(mapView);

} else if (msgType == 2) {
	// this is an image

	var newImg = Ti.UI.createImageView({
		image:msgUrl,
		left:0,
		top:0,
	});
	window.add(newImg);

}

var postBtn = Titanium.UI.createButton({
        title:'Close',
	top: 10,
        right: 10,
        width:60,
        height:35,
        borderRadius:1,
        font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});

postBtn.addEventListener('click',function(e) {

	window.close();
	Ti.UI.currentWindow.close();

});

window.add(postBtn);
window.open();


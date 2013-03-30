var localEmail = Titanium.App.Properties.getString("localEmail", "");

var win = Ti.UI.currentWindow;

var recentSearches = [];

win.hideNavBar();

var searchB = Ti.UI.createSearchBar({
	top:40,
	height:40,
	showCancel:true,
	barColor:'#000',
	hintText:'What are you looking for?'
});
win.add(searchB);

searchB.addEventListener('cancel',function(source, type) {
	searchB.blur();
	searchB.value = '';
	getResults('');
});

searchB.addEventListener('return',function(source, type) {
	searchB.blur();
	getResults(searchB.value);
});

searchB.addEventListener('focus', function(source, type) {
	searchB.value = '';
	viewRecents();
});

searchB.addEventListener('blur', function(source, type) {
	win.remove(recents);
});

var actInd = Ti.UI.createImageView({
	width: 320,
	height: 480,
	image: 'actInd.png'
});

var recents = Ti.UI.createTableView({top:80, height:165});
var recentHeaderRow = Ti.UI.createTableViewRow({height:60});
var recentHeaderView = Ti.UI.createView({height:60});

var recentHeaderTitle = Ti.UI.createLabel({
	text:'Recent Searches',
	left: 10,
	top: -20
});

var recentHeaderLine = Ti.UI.createLabel({
	text:'Save searches to be notified of new matching items',
	left: 10,
	top: 20,
	color: '#bbb',
	font:{fontSize:12}
});

recentHeaderView.add(recentHeaderTitle);
recentHeaderView.add(recentHeaderLine);
recentHeaderRow.add(recentHeaderView);

function viewRecents() {

	recents.data = [];

	recents.appendRow(recentHeaderRow);

	recentSearches.reverse();

	for (var i=0;i<recentSearches.length;i++) {
		var tt = Ti.UI.createTableViewRow({height: 60,hasChild:true});
		tt.searchTerm = recentSearches[i];

		var ttView = Ti.UI.createView({height:60});

		var ttSave = Ti.UI.createButton({
			title:'Save',
			width:50,
			height:40,
			left:5,
			backgroundImage:'save.png'
		});

		ttSave.addEventListener('click', function(e) {
			saveSearch(tt.searchTerm);
		});

		var ttTitle = Ti.UI.createLabel({
			text:recentSearches[i],
			left: 65
		});

		ttView.add(ttTitle);
		ttView.add(ttSave);
		tt.add(ttView);

		recents.appendRow(tt);
	}

	win.add(recents);

}

recents.addEventListener('click', function(e) {
	if (e.source.title == 'Save') {
	} else {
		getResults(e.rowData.searchTerm);
		searchB.value = e.rowData.searchTerm;
	}
	searchB.blur();
});

var tableview = Titanium.UI.createTableView({top:80,minRowHeight:58});
win.add(tableview);

function saveSearch(search) {

	Titanium.Geolocation.purpose = 'Your Location';
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
	Titanium.Geolocation.distanceFilter = 4;

	Titanium.Geolocation.getCurrentPosition(function(e){

		var latitude = e.coords.latitude;
		var longitude = e.coords.longitude;

		var xhr = Ti.Network.createHTTPClient();
		xhr.timeout = 1000000;

		xhr.open("POST",'http://api1.getkneedle.com/search');

		xhr.onload = function() {
			alert('Search Saved');
		}

		xhr.send({term:search,lat:latitude,lng:longitude,deviceId:Ti.Platform.id,email:localEmail});

	});

}

function getResults(search) {

	win.add(actInd);

	Titanium.Geolocation.purpose = 'Your Location';
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
	Titanium.Geolocation.distanceFilter = 4;

	Titanium.Geolocation.getCurrentPosition(function(e){

		var latitude = e.coords.latitude;
		var longitude = e.coords.longitude;
		//var latitude = 39.224140167236;
		//var longitude = -106.93737792969;

		// remove all map annotations
		mapView.removeAllAnnotations();

		var data = []; 
		tableview.setData(data);

		var xhr = Ti.Network.createHTTPClient();
		xhr.timeout = 1000000;

		if (search != '' && search != null && search != undefined) {
			// add to recent searches
			recentSearches.push(search);
		}

		xhr.open("GET",'http://api1.getkneedle.com/search?term='+search+'&lat='+latitude+'&lng='+longitude);

		xhr.onload = function() {

			win.remove(actInd);

			try {
				var r = eval('('+this.responseText+')');

				if (r.length>0) {

					for (i=0;i<r.length;i++) {

						var aImg = Ti.UI.createImageView({
							image:r[i].photo[0],
							width:30,
							height:30,
							left:-1000
						});
						win.add(aImg);

						var mapI = Ti.Map.createAnnotation({
							latitude:r[i].loc[0],
							longitude:r[i].loc[1],
							title:r[i].name,
							subtitle:r[i].desc,
							animate:true,
							rightButton:'rightArrow.png',
							image:'categories/'+r[i].category+'Pin.png',
							itemData:r[i],
							leftView:aImg
						});

						mapView.addAnnotation(mapI);

						var row = Ti.UI.createTableViewRow({hasChild:true,height:90});
						row.itemData = r[i];
						var post_view = Ti.UI.createView({
							height:90
						});

						if (r[i].photo.length > 0) {
							var thumb = Ti.UI.createImageView({
								image: r[i].photo[0],
								left: 5,
								top: 5,
								height: 80,
								width: 80
							});
							post_view.add(thumb);
						}

						if (r[i].category != undefined && r[i].category != '') {
							var category = Ti.UI.createImageView({
								image: 'categories/'+r[i].category+'Pin.png',
								right: 5,
								top: 5,
								width: 40,
								height: 40
							});
							post_view.add(category);
						}

						var rTitle = Ti.UI.createLabel({
							text:r[i].name,
							left: 94,
							top: -50,
							textAlign: 'left',
							color: '#000'
						});
						post_view.add(rTitle);

						var rTag = Ti.UI.createLabel({
							text:Math.round(r[i].distance*100)/100+' miles away',
							left: 94,
							top: -10,
							textAlign: 'left',
							color: '#ccc',
							font:{fontSize: 12}
						});
						post_view.add(rTag);

						if (r[i].desc != undefined && r[i].desc != '') {
							var tweet_text = Ti.UI.createLabel({
								text:r[i].desc,
								left:94,
								top:20,
								color:'#111',
								textAlign:'left',
								font:{fontSize:12}
							});
							post_view.add(tweet_text);
						}

						row.add(post_view);
						tableview.appendRow(row);
					}

					mapView.setLocation({latitude:latitude,longitude:longitude,latitudeDelta:.01,longitudeDelta:.01});


				} else {
					if (search != '') {
						// no results found
						var ad = Ti.UI.createAlertDialog({
							title:'No Results Found',
							message:'Save the Search to get email notifications whenever anyone nearby posts a matching item?',
							buttonNames:['No','Yes'],
							cancel:0
						});
						ad.show();
						ad.addEventListener('click', function(e) {
							if (e.index === 1) {
								saveSearch(search);
							}
							getResults('');
						});
					}
				}
			} catch(E) {
				alert(E);
			}
		}

		xhr.send();

	});

}

var bb1 = Titanium.UI.createTabbedBar({
    labels:['List', 'Map'],
    index:0,
    backgroundColor:'#090',
    top:5,
    style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
    height:30,
    width:310
});
win.add(bb1);

bb1.addEventListener('click',function(e) {
	if (e.index == 0) {
		tableview.show();
		mapView.hide();
	} else {
		mapView.show();
		tableview.hide();
	}
});

tableview.addEventListener('click', function(e) {

	var win = Titanium.UI.createWindow({
		url:'item.js',
	}); 
	win.itemData = e.rowData.itemData;
	Titanium.UI.currentTab.open(win,{animated:true});
	win.addEventListener('close', function() { win.close(); }); 

});

var mapView = Ti.Map.createView({
    mapType: Ti.Map.STANDARD_TYPE,
    //region:{latitude:50, longitude:50, latitudeDelta:.5, longitudeDelta:.5},
    animate:true,
    top:80,
    userLocation:true
}); 
win.add(mapView);
mapView.hide();

mapView.addEventListener('click', function(e) {

	if (e.clicksource == 'rightButton') {

		var win = Titanium.UI.createWindow({
			url:'item.js',
		});
		win.itemData = e.annotation.itemData;
		Titanium.UI.currentTab.open(win,{animated:true});
		win.addEventListener('close', function() { win.close(); });
	}

});

var firstSearch = 0;

win.addEventListener('focus', function() {
	if (firstSearch != 1) {
		getResults('');
		firstSearch = 1;
	}

	if (Ti.App.searchTerm) {
		getResults(Ti.App.searchTerm[0].term);
		searchB.value = Ti.App.searchTerm[0].term;
		delete Ti.App.searchTerm;
	}

});

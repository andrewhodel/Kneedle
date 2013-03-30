var localEmail = Titanium.App.Properties.getString("localEmail");

var win = Ti.UI.currentWindow;

var actIndMain = Titanium.UI.createActivityIndicator({
	style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
});

// Create the tableView and add it to the window.
var tableview = Titanium.UI.createTableView({minRowHeight:58});

win.add(tableview);
win.add(actIndMain);

//actIndMain.show();

// create table view data object
var data = [];
tableview.setData(data);
var xhr = Ti.Network.createHTTPClient();

xhr.timeout = 1000000;

// get device location

Titanium.Geolocation.purpose = 'Local Search';
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.distanceFilter = 4;

actIndMain.show();

Titanium.Geolocation.getCurrentPosition(function(e) {
	if (e.error) {
		alert('Your device has no location');
		return;
	}

	var latitude = e.coords.latitude; 
	var longitude = e.coords.longitude;

	xhr.open("GET",'http://api1.getkneedle.com/search'+win.search+'&lat='+latitude+'&lng='+longitude+'&distance=25');

	xhr.onload = function() {
		try {
			var r = eval('('+this.responseText+')');

			actIndMain.hide();

			if (r.length>0) {

				for (i=0;i<r.length;i++) {

					var row = Ti.UI.createTableViewRow({hasChild:true,height:'auto'});
					row.itemId = r[i]._id;
					row.title = r[i].name;

					// Create a vertical layout view to hold all the info labels and images for each tweet
					var post_view = Ti.UI.createView({
						height:'auto',
						layout:'vertical',
						left:5,
						top:5,
						bottom:5,
						right:5
					});

					var tweet_text = Ti.UI.createLabel({
						text:r[i].name,
						left:54,
						top:20,
						bottom:2,
						height:'auto',
							width:236,
						textAlign:'left',
						font:{fontSize:18}
					});
					// Add the tweet to the view
					post_view.add(tweet_text);

					// Add the vertical layout view to the row
					row.add(post_view);

					tableview.appendRow(row);

				}

			} else {

				alert('no results');
				win.close();

			}

		} catch(E) {

			alert(E);

		}

	};
	// Get the data
	xhr.send();

});

tableview.addEventListener('click', function(e)
{
    var win = Titanium.UI.createWindow({
		url:'item.js',
	});
 
	// send selected item's title to detail page
	win.itemId = e.rowData.itemId;
	win.title = e.rowData.title;

	Titanium.UI.currentTab.open(win,{animated:true});

	win.addEventListener('close', function() { win.close(); });

});

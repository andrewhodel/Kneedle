var localEmail = Titanium.App.Properties.getString("localEmail");

var win = Ti.UI.currentWindow;
win.title = 'My Kneedle';

var view = Titanium.UI.createView({
	backgroundColor: "#FFFEEE",
	top:0
});

var mySaved = Ti.UI.createTableView({
	style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	headerTitle: 'My Saved Searches',
	top: 0,
	height: 180,
	editable:true
});

var myItems = Ti.UI.createTableView({
	style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	headerTitle: 'My Items',
	top: 180,
	editable:true
});

function getFeed() {

	mySaved.data = [];
	myItems.data = [];

	var xhr = Ti.Network.createHTTPClient();

	xhr.timeout = 1000000;
	xhr.open("GET","http://api1.getkneedle.com/account?deviceId="+Ti.Platform.id+"&email="+localEmail);

	xhr.onload = function()
	{

		try
		{
			var r = eval('('+this.responseText+')');

			if (r.items.length+r.savedSearches.length>0) {
				Ti.UI.currentTab.setBadge(r.items.length+r.savedSearches.length);
			} else {
				Ti.UI.currentTab.setBadge(null);
			}

			// show savedSearches
			if (r.savedSearches.length>0) {

				for (var c=0;c<r.savedSearches.length;c++){

					var bgcolor = (c % 2) == 0 ? '#fff' : '#eee';
					var row = Ti.UI.createTableViewRow({hasChild:true,height:'auto',backgroundColor:bgcolor});

					// Create a vertical layout view to hold all the info labels and images for each tweet
					var post_view = Ti.UI.createView({
					});

					var user_label = Ti.UI.createLabel({
						text:r.savedSearches[c].term,
						left:10,
						textAlign:'left',
						color:'#000',
						font:{fontSize:18}
					});

					row.itemData = r.savedSearches[c];

					// Add the username to the view
					post_view.add(user_label);

					// Add the vertical layout view to the row
					row.add(post_view);
					row.className = 'item'+c;

					mySaved.appendRow(row);

				}

			}
			// show group requests
			if (r.items.length>0) {

				for (var c=0;c<r.items.length;c++){

					var bgcolor = (c % 2) == 0 ? '#fff' : '#eee';

					var row = Ti.UI.createTableViewRow({hasChild:true,height:'auto',backgroundColor:bgcolor});

					// Create a vertical layout view to hold all the info labels and images for each tweet
					var post_view = Ti.UI.createView({
					});

					var av = Ti.UI.createImageView({
							image:r.items[c].photo[0],
							left:10,
							height:30,
							width:30
						});
					// Add the avatar image to the view
					post_view.add(av);

					var user_label = Ti.UI.createLabel({
						text:r.items[c].name,
						left:50,
						textAlign:'left',
						color:'#000',
						font:{fontSize:18}
					});

					row.itemData = r.items[c];

					// Add the username to the view
					post_view.add(user_label);

					// Add the vertical layout view to the row
					row.add(post_view);
					row.className = 'item'+c;

					myItems.appendRow(row);

				}

			}

		}
		catch(E){
			alert(E);
		}

	};
	// Get the data
	xhr.send();

}

mySaved.addEventListener('delete', function(e) {

	// send off delete request
	var xhr = Ti.Network.createHTTPClient();
	xhr.open('DELETE','http://api1.getkneedle.com/search?deviceId='+Ti.Platform.id+'&email='+localEmail+'&id='+e.rowData.itemData._id);
	xhr.send();

});

mySaved.addEventListener('click', function(e) {

	Ti.App.searchTerm = [e.rowData.itemData];
	Ti.UI.currentWindow.tabGroup.setActiveTab(0);

});

myItems.addEventListener('delete', function(e) {

	// send off delete request
	var xhr = Ti.Network.createHTTPClient();
	xhr.open('DELETE','http://api1.getkneedle.com/item?deviceId='+Ti.Platform.id+'&email='+localEmail+'&id='+e.rowData.itemData._id);
	xhr.send();

});

myItems.addEventListener('click', function(e) {

	var win = Titanium.UI.createWindow({
		url:'item.js',
	}); 
	win.itemData = e.rowData.itemData;
	Titanium.UI.currentTab.open(win,{animated:true});
	win.addEventListener('close', function() { win.close(); });

});

view.add(mySaved);
view.add(myItems);
win.add(view);

win.addEventListener('focus', function() { getFeed(); });

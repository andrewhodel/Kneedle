var localEmail = Titanium.App.Properties.getString("localEmail");

var win = Ti.UI.currentWindow;

var actInd = Titanium.UI.createActivityIndicator({
	left:20,
	bottom:13,
	width:30,
	height:30,
	style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
});

var actIndMain = Titanium.UI.createActivityIndicator({
	style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
});

// Create the tableView and add it to the window.
var tableview = Titanium.UI.createTableView({minRowHeight:58});

win.add(tableview);
win.add(actIndMain);

var r = win.subcats;

for (i=0;i<r.length;i++) {

	var row = Ti.UI.createTableViewRow({hasChild:true,height:'auto'});
	row.category = r[i];

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
		text:r[i],
		left:10,
		top:10,
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

	//actIndMain.hide();

}

tableview.addEventListener('click', function(e)
{
    var win = Titanium.UI.createWindow({
		url:'doSearch.js',
	});
 
	// send selected item's title to detail page
	win.search = '?category='+e.rowData.category;
	win.title = e.rowData.category;

	Titanium.UI.currentTab.open(win,{animated:true});

	win.addEventListener('close', function() { win.close(); });

});

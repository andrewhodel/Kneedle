var localEmail = Titanium.App.Properties.getString("localEmail", "");

var win = Ti.UI.currentWindow;
win.title = win.itemData.name;

win.showNavBar();

var sView = Titanium.UI.createScrollView({
	contentWidth:'auto',
	contentHeight:'auto',
	top: 0,
	showVerticalScrollIndicator: true
});
win.add(sView);

var name = Titanium.UI.createLabel({
	text:'Title: '+win.itemData.name,
	color:'#fff',
	top:10,
	left:10,
	width:300,
	height:20,
	font:{fontSize: 24}
});
//sView.add(name);

var desc = Titanium.UI.createLabel({
	text:win.itemData.desc,
	color:'#fff',
	top:10,
	left:10,
	width:300,
	height:50
});
sView.add(desc);

var price = Titanium.UI.createLabel({
	text:'$ '+win.itemData.price,
	color:'#ccc',
	top:70,
	left:10,
	height:25,
	font:{fontSize:'24px'}
});
sView.add(price);

var sEmail = Titanium.UI.createButton({
	title:'Send Email',
	width: 300,
	height: 50,
	top:100,
	left:10
});

sView.add(sEmail);

sEmail.addEventListener('click', function(e) {
	var ed = Ti.UI.createEmailDialog({
		subject:'Kneedle - '+win.itemData.name,
		toRecipients:[win.itemData.email],
		messageBody:'Regarding your Kneedle - '+win.itemData.name,
	});
	ed.open();
});

var nextThumbTop = 160;

for (var i=0;i<win.itemData.photo.length;i++) {
	var iV = Ti.UI.createImageView({
		image:win.itemData.photo[i],
		top:nextThumbTop,
		left:10,
		width:300,
		height:300
	});
	sView.add(iV);
	nextThumbTop = nextThumbTop+310;
}

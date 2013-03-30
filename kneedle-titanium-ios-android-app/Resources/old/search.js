var localEmail = Titanium.App.Properties.getString("localEmail", "");

var win = Ti.UI.currentWindow;
win.title = 'Search';

var email = Titanium.UI.createTextField({
	color:'#336699',
	top:10,
	left:10,
	width:300,
	height:40,
	autocorrect: false,
	hintText:'What are you looking for?',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
win.add(email);

var loginBtn = Titanium.UI.createButton({
	title:'Search',
	top:100,
	width:90,
	height:35,
	borderRadius:1,
	font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});
win.add(loginBtn);

loginBtn.addEventListener('click',function(e) {

	var win = Titanium.UI.createWindow({
		url:'doSearch.js',
	});
	win.search = '?term='+email.value;
	win.title = 'Search Results';
	Titanium.UI.currentTab.open(win,{animated:true});
	win.addEventListener('close', function() { win.close(); });

});

win.addEventListener('focus', function() { email.value = ''; });

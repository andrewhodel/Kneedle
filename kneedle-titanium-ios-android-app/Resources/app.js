// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#333');

var localEmail = Titanium.App.Properties.getString("localEmail", "");

function validUser() {

	// create tab group
	var tabGroup = Titanium.UI.createTabGroup({barColor:'#090'});

	var win1 = Titanium.UI.createWindow({  
	    url:'browse.js'
	});
	var tab1 = Titanium.UI.createTab({  
	    icon:'browse.png',
	    title:'Browse',
	    window:win1
	});

	var win2 = Titanium.UI.createWindow({  
	    url:'post.js'
	});
	var tab2 = Titanium.UI.createTab({  
	    icon:'post.png',
	    title:'Post',
	    window:win2
	});

	var win3 = Titanium.UI.createWindow({  
	    url:'my.js'
	});
	var tab3 = Titanium.UI.createTab({  
	    icon:'my.png',
	    title:'My Kneedle',
	    window:win3
	});

	// add tabs
	tabGroup.addTab(tab1);  
	tabGroup.addTab(tab2);  
	tabGroup.addTab(tab3);  

	// open tab group
	tabGroup.open();

}

if (localEmail != '') {

	validUser();

} else {

	// launch login window

	var win = Titanium.UI.createWindow({

	});

	var tag = Titanium.UI.createLabel({
		text:'To get started, we just need the email address you would like to use when posting items to Kneedle.',
		color: '#fff',
		top: 10,
		height: 70,
		textAlign:'center'
	});
	win.add(tag);

	var email = Titanium.UI.createTextField({
		color:'#336699',
		top:90,
		left:10,
		width:300,
		height:40,
		autocorrect: false,
		hintText:'Email Address',
		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
		returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	win.add(email);

	var loginBtn = Titanium.UI.createButton({
		title:'Join Kneedle',
		top:140,
		width:160,
		height:40,
		font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
	});
	win.add(loginBtn);

	var logoImg = Ti.UI.createImageView({
		image:'kneedleLogo.png',
		top:200,
		width: 300
	});
	win.add(logoImg);

loginBtn.addEventListener('click',function(e) {
	xhr = Titanium.Network.createHTTPClient();
	xhr.setTimeout(10000);
	xhr.open('PUT', 'http://api1.getkneedle.com/account?deviceId='+Ti.Platform.id+'&email='+email.value);
	xhr.onload = function () {
		try {
			var r = eval('('+this.responseText+')');
			if (r.success == 1) {
				// all good
				Titanium.App.Properties.setString("localEmail", email.value);
				win.close();
				validUser();
			} else {
				alert('Error logging in, please try again later');
			}
		} catch(E) {
			alert(E);
		}
	}
	xhr.send();
});

	win.open();

}

Ti.App.addEventListener('pause', function(){
});

Ti.App.addEventListener('resume', function(){
});

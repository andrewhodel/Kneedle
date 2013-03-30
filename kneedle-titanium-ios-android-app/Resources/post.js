var win = Ti.UI.currentWindow;
win.title = 'Pick a Category';

var sView = Titanium.UI.createScrollView({
 	contentWidth:'auto',
 	contentHeight:'auto',
 	top: 0,
 	showVerticalScrollIndicator: true
 });
 win.add(sView);

function openWin(cat) {
	var nWin = Titanium.UI.createWindow({
		url:'doPost.js',
	});
	nWin.category = cat;
	Titanium.UI.currentTab.open(nWin,{animated:true});
	nWin.addEventListener('close', function() { win.close(); });
}

var activitiesT = Titanium.UI.createLabel({
	text:'Activities',
	height:	'auto',
	width:128,
	color:'#fff',
	font:{fontSize:14,fontWeight:'bold'},
	textAlign:'center',
	top:5,
	left:20
});
sView.add(activitiesT);

var activitiesB = Titanium.UI.createButton({
	image:'categories/activities.png',
	top:20,
	left: 20
});
sView.add(activitiesB);

activitiesB.addEventListener('click', function(e) {
	openWin('activities');
});

var communityT = Titanium.UI.createLabel({
	text:'Community',
	height:	'auto',
	width:128,
	color:'#fff',
	font:{fontSize:14,fontWeight:'bold'},
	textAlign:'center',
	top:5,
	right:20
});
sView.add(communityT);

var communityB = Titanium.UI.createButton({
	image:'categories/community.png',
	top:20,
	right: 20
});
sView.add(communityB);

communityB.addEventListener('click', function(e) {
	openWin('community');
});

var for_saleT = Titanium.UI.createLabel({
	text:'For Sale',
	height:	'auto',
	width:128,
	color:'#fff',
	font:{fontSize:14,fontWeight:'bold'},
	textAlign:'center',
	top:153,
	left:20
});
sView.add(for_saleT);

var for_saleB = Titanium.UI.createButton({
	image:'categories/for_sale.png',
	top:168,
	left: 20
});
sView.add(for_saleB);

for_saleB.addEventListener('click', function(e) {
	openWin('for_sale');
});

var housingT = Titanium.UI.createLabel({
	text:'Housing',
	height:	'auto',
	width:128,
	color:'#fff',
	font:{fontSize:14,fontWeight:'bold'},
	textAlign:'center',
	top:153,
	right:20
});
sView.add(housingT);

var housingB = Titanium.UI.createButton({
	image:'categories/housing.png',
	top:168,
	right: 20
});
sView.add(housingB);

housingB.addEventListener('click', function(e) {
	openWin('housing');
});

var jobsT = Titanium.UI.createLabel({
	text:'Jobs',
	height:	'auto',
	width:128,
	color:'#fff',
	font:{fontSize:14,fontWeight:'bold'},
	textAlign:'center',
	top:301,
	left:20
});
sView.add(jobsT);

var jobsB = Titanium.UI.createButton({
	image:'categories/jobs.png',
	top:316,
	left: 20
});
sView.add(jobsB);

jobsB.addEventListener('click', function(e) {
	openWin('jobs');
});

var personalsT = Titanium.UI.createLabel({
	text:'Personals',
	height:	'auto',
	width:128,
	color:'#fff',
	font:{fontSize:14,fontWeight:'bold'},
	textAlign:'center',
	top:301,
	right:20
});
sView.add(personalsT);

var personalsB = Titanium.UI.createButton({
	image:'categories/personals.png',
	top:316,
	right:20
});
sView.add(personalsB);

personalsB.addEventListener('click', function(e) {
	openWin('personals');
});

var servicesT = Titanium.UI.createLabel({
	text:'Services',
	height:	'auto',
	width:128,
	color:'#fff',
	font:{fontSize:14,fontWeight:'bold'},
	textAlign:'center',
	top:449,
	left:20
});
sView.add(servicesT);

var servicesB = Titanium.UI.createButton({
	image:'categories/services.png',
	top:464,
	left: 20
});
sView.add(servicesB);

servicesB.addEventListener('click', function(e) {
	openWin('services');
});

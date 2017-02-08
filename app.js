var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var fs = require('fs');
var chrono = require('chrono-node');

var vision = require('@google-cloud/vision')({
  projectId: 'insert projectId',
  keyFilename: 'insert keyFilename'
});

var language = require('@google-cloud/language')({
  projectId: 'insert projectId',
  keyFilename: 'insert keyFilename'
});

var library = "DWE,	Douglas Wright Engineering Building,E2,	Engineering 2,E3,	Engineering 3,PHY,	Physics,ML,	Modern Languages,ESC,	Earth Sciences & Chemistry,B1,	Biology 1,LIB,	Dana Porter Arts Library,AL,	Arts Lecture Hall,EV1,	Environment 1,RCH,	J.R. Coutts Engineering Lecture Hall,CSB,	Central Services Building,B2,	Biology 2,GSC,	General Services Complex,COM,	Commissary,SCH,	South Campus Hall,MC,	Mathematics & Computer Building,PAC,	Physical Activities Complex,SLC,	Student Life Centre,V1,	Student Village 1,HS,	Health Services,MHR,	Minota Hagey Residence,HH,	J.G. Hagey Hall of the Humanities,REV,	Ron Eydt Village,UWP,	University of Waterloo Place,UC,	University Club,C2,	Chemistry 2,CPH,	Carl A. Pollock Hall,PAS,	Psychology, Anthropology, Sociology,NH,	Ira G. Needles Hall,BMH,	B.C. Matthews Hall,OPT,	Optometry,EV2,	Environment 2,ECH,	East Campus Hall,DC,	William G. Davis Computer Research Centre,EIT,	Centre for Environmental and Information Technology,BAU,	Bauer Warehouse,COG,	Columbia Greenhouses,CIF,	Columbia Icefield,CLV,	Columbia Lake Village,MKV,	William Lyon Mackenzie King Village,TC,	William M. Tatham Centre for Co-operative Education & Career Services,ARC,	School of Architecture,ERC,	Energy Research Centre,PHR,	Pharmacy,QNC,	Mike & Ophelia Lazaridis Quantum-Nano Centre,RAC,	Research Advancement Centre,IHB,	Integrated Health Building,E5,	Engineering 5,STC,	Science Teaching Complex,DMS,	Digital Media Stratford,M3,	Mathematics 3,EV3,	Environment 3,RA2,	Research Advancement Centre 2,ART,	Arts Building,E6,	Engineering 6,TJB,	Toby Jenkins Applied Health Research Building,EC1,	East Campus 1,EC2,	East Campus 2,EC3,	East Campus 3,EC4,	East Campus 4,EC5,	East Campus 5,E7,	Engineering 7,NRB,	New Residence Building,ST2,	Science Teaching 2,TUN,	Service Tunnels,GST,	Ground Storage Building V2,EV,	Electrical Vault,MV,	Mechanical Vault,POV,	Pedestrian Overpass,PT,	Pedestrian Tunnels,TEN,	Tennis Courts,SGR,	Schmidt Greenhouse,GH,	Graduate House,DB,	Dearborn Pumphouse,BRH,	Brubacher House,BEG,	BEG Test Building,TUL,	Tri-University Library,AB,	Aberfoyle Building,AH,	Aberfoyle House,AS,	Aberfoyle Storage,KGC,	KW Garden Club,FRF,	Fire Research Facility,PTB,	Pavement & Transportation Technology Building,PTG,	Pavement & Transportation Technology Garage,AAR,	Architecture Annex Rome,ACW,	Accelerator Centre Waterloo,WFF,	Warrior Football Field,MRS,	Medical & Related Sciences,SCO,	Shanghai China Office,HSC,	Huntsville Summit Centre,BSC,	Bright Starts Co-operative Early Learning Centre,ASA,	Allen Square Arts,CIGI,	Centre for International Governance Innovation (BSIA),Velocity Garage,WCP,	Waterloo Central Place,MWS,	Manulife Water Street,MTT,	Master of Taxation Toronto,STM,	Shelburne Terrace, Gaithersburg, Maryland,LHI,	Lyle S. Hallman Institute for Health Promotion,STJ,	St. Jerome's University,REN,	Renison University College,STP,	St. Paul's University College,CGR,	Conrad Grebel University College,CLN,	Columbia Lake Village North,SCS,	South Campus - South Grounds,AHS,	AHS Expansion,SCN,	South Campus - North Grounds,CGB,	Campus General Buildings,VLG,	Village 1 & 2 Grounds,MHG,	Minota Hagey Grounds,FCG,	Faculty Club Grounds,GAG,	Garage & Garbage,MSG,	Married Student Grounds,GRH,	Greenhouse,NCG,	North Campus Grounds,BAG,	Bauer Grounds,LL,	Laurel Lake,SCG,	South Campus General,Manulife Clock Tower,Delta Waterloo,Bechtel Dog Park,Grand River Hospital,Cricket Oval,Elam Martin Farmstead,Visitor and Heritage Information Centre,Waterloo - St. Jacob Railway Station,Erbsville Centre,Mount Hope Cemetery,Waterloo Fire Department (Station 1),Waterloo Fire Department Headquarters (Station 2),Waterloo Fire Department (Station 3),Waterloo Service Centre,City of Waterloo Museum at Conestoga Mall,Grey Silo Golf Course,Waterloo Fire Department (Station 4),Public Square,Button Factory (Community Arts Centre),Waterloo City Hall (City Centre),Waterloo Memorial Recreation Complex,Waterloo Park,Moses Springer Community Centre,Albert McCormick Community Centre,Bechtel Park and Stadium,Wing 404 RCAFA Rotary Adult Centre,Adult Recreation Centre,Hillside Park,Manulife Financial Soccer and Sports Centre,RIM Park Manulife Financial Sportsplex,Parkview Cemetery,Waterloo Skatepark,Lion's Lagoon Splash Pad,Park Inn Concession,Gazebo (West),Gazebo (East),Centennial Bandshell,Abraham Erb Grist Mill,Eby Farmstead Animal Farm,Victorian Gardens,Waterloo Public Library (Main),Canadian Clay and Glass Gallery,University of Waterloo,Wilfrid Laurier University,Conestoga College,Conestoga Mall,Perimeter Institute,Centre for International Governance Innovation,Balsillie School of International Affairs,Waterloo Golf Academy,Westmount Golf and Country Club,Green Acre Park,Laurel Creek Conservation Area,Comfort Inn,Waterloo Hotel,The Waterloo Inn,Destination Inn,Dearborn Business Park,The Boardwalk,Waterloo Commons,David Johnston Research & Technology Park,Sunlife Centre,Blackberry,University of Waterloo Master of Public Service Program,UW School of Optometry,Conrad Grebel University College,St. Paul's University College,Renison University College,St. Jerome's University College,K W Granite Club".replace(/\t/g, '').split(',');

var app = express();

app.post('/upload', upload.single('image'), function(req, res, next){
	var options = {verbose: true};
	vision.detectText(req.file.path, options, function(err, text, apiResponse){
		fs.unlinkSync(req.file.path);
		if(err){
			res.send(err);
		} else {
			var concatted = concatSpace(text);
			console.log(concatted);
			language.detectEntities(concatted, function(err, entities, apiResponse){
				if(err){
					res.send(err);
				} else {
					var location = stringInLibrary(text, library);
					var title = getAdjacent(text, findMax(text));
					
					
					if(location==""){
						if(entities.places){
							location = entities.places[0];
						}else if (entities.organizations){
							location = entities.organizations[0];
						}
					}
					
					var returnobj = {
						date: chrono.parseDate(concatSpace(text)),
						location: location,
						title: title
					}
					res.send(returnobj);
				}
			})
		}
	})
});

function getAdjacent(text, index){
	var title = text[index].desc;
	for(var i=index+1;i<text.length;i++){
		if(getHeight(text[index])*0.75 <= getHeight(text[i])){
			title = title + " " + text[i].desc;
		}else{
			break;
		}
	}
	
	for(var i=index-1;i>1;i--){
		if(getHeight(text[index])*0.75 <= getHeight(text[i])){
			title = text[i].desc + " " + title;
		}else{
			break;
		}
	}
	return title;
}

function getHeight(text){
	var max = Math.max(text.bounds[0].y, text.bounds[1].y,text.bounds[2].y,text.bounds[3].y);
	var min = Math.min(text.bounds[0].y, text.bounds[1].y,text.bounds[2].y,text.bounds[3].y);
	return max-min;
}

function findMax(text){
	var max = 0;
	var height;
	var maxindex;
	for(var i=1;i<text.length;i++){
		height = getHeight(text[i]);
		if(max<height){
			max = height;
			maxindex = i;
		}
	}
	return maxindex;
}

var concatSpace = function(strings){
	var new_string = strings[1].desc;
	for(i=2; i<strings.length; i++){
		new_string = new_string + " " + strings[i].desc;
	}
	return new_string;
}

function stringInLibrary(text, library){
	var matches = [];
	var dists = [];
	var rooms = [];
	var dist;
	var dist2;
	var dist3;
	var dist4;
	var min=999999;
	var minvalue="";
	var minroom="";
	
	
	for(var j=0; j<text.length; j++){
		for(var i = 0; i<library.length; i++){
			dist = getEditDistance(text[j].desc, library[i]);
			if(dist<2){
				matches.push(library[i]);
				if(j+1==text.length){
					rooms.push('');
				}else{
					rooms.push(text[j+1].desc);
				}
				dists.push(dist);
			}
			
			if(j+1<text.length){
				dist2 = getEditDistance((text[j].desc + " " + text[j+1].desc).toLowerCase(), (library[i].split(' ')[0]+' '+library[i].split(' ')[1]).toLowerCase());
				if(dist2<2){
					matches.push(library[i]);
					rooms.push('');
					dists.push(dist2);
				}
			}
			
			if(j+2<text.length){
				dist3 = getEditDistance((text[j].desc + " " + text[j+1].desc + " " + text[j+2]).toLowerCase(), (library[i].split(' ')[0]+' '+library[i].split(' ')[1]+' '+library[i].split(' ')[2]).toLowerCase());
				if(dist3<2){
					matches.push(library[i]);
					rooms.push('');
					dists.push(dist3);
				}
			}
			
			if(j+3<text.length){
				dist4 = getEditDistance((text[j].desc + " " + text[j+1].desc + " " + text[j+2] + " " + text[j+3]).toLowerCase(), (library[i].split(' ')[0]+' '+library[i].split(' ')[1]+' '+library[i].split(' ')[2]+' '+library[i].split(' ')[3]).toLowerCase());
				if(dist4<2){
					matches.push(library[i]);
					rooms.push('');
					dists.push(dist4);
				}
			}
		}
		for(var i = 0; i<dists.length; i++){
			if(dists[i]==min){
				if(minvalue.length<matches[i].length){
					min = dists[i];
					minvalue = matches[i];
					minroom = rooms[i];
				}
			}else if(dists[i]<min){
				min = dists[i];
				minvalue = matches[i];
				minroom = rooms[i];
			}
		}
	}
	return minvalue + " " + minroom;
}

// Compute the edit distance between the two given strings
function getEditDistance(a, b) {
  if (a.length === 0) return b.length; 
  if (b.length === 0) return a.length; 

  var matrix = [];

  // increment along the first column of each row
  var i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) == a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};




app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
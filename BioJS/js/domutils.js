 /**
* February 15th:
* -> Remove all hardcoded DOM element
*getBFactor()
*getSASA()
*etc.
*
*-> Fix issue with the Align Center when calling the atom.toPDB() for atom names f length 2
*/

function buildTitle(size,str)
{
	var header = document.createElement("header");
	var h4 = document.createElement("h4");
	h4.textContent = str;
	header.style.textAlign="left";
	h4.style.fontSize=(size+"px")
	header.appendChild(h4);
	return header;
}

//This function build a HTML table dynamically based on tags in the XHR response
function buildTable(data)
{
	var table = document.createElement("table");
	var body= document.createElement("tbody");
	
	var strings = data.split(",");

for (var x = 0; x < strings.length; x++) 
{
	console.log("LINE: "+strings[x]);
	var key = "";
var value = "";
if(strings[x].includes("="))
{
	key = strings[x].split("=")[0];
value = strings[x].split("=")[1];
}
if (key == "COLUMNHEADER") 
{
	
	
	var value2 = value.split("|");
var header = document.createElement("tr");

var row = document.createElement("tr");
var cell = document.createElement("td");
cell.height = 3;
cell.style.borderBottom = "1px solid black";
//cell.style.borderTopColor="black";
cell.colSpan=(value2.length+value2.length-1);
row.appendChild(cell);
body.appendChild(row);

for (var y = 0; y < value2.length; y++) 
{
	var cell = document.createElement("td");
var text = document.createTextNode(value2[y]);
cell.appendChild(text);
header.appendChild(cell);
if(y < value2.length-1)
{
	var cell2 = document.createElement("td");
	cell2.width=15;
	header.appendChild(cell2);
}
}
body.appendChild(header);
var row2 = document.createElement("tr");
var cell2 = document.createElement("td");
cell2.height = 5;
cell2.style.borderTop = "3px solid black";
//cell.style.borderTopColor="black";
cell2.colSpan=(value2.length+value2.length-1);
row2.appendChild(cell2);
body.appendChild(row2);

}
else if (key == "ROW") 
{
	var value2 = value.split("|");
var row = document.createElement("tr");

for (var y = 0; y < value2.length; y++) 
{
	var cell = document.createElement("td");
var text = document.createTextNode(value2[y]);
cell.appendChild(text);
row.appendChild(cell);
if(y < value2.length-1)
{
	var cell2 = document.createElement("td");
	cell2.width=15;
	row.appendChild(cell2);
}
}
body.appendChild(row);
}
}
 
table.appendChild(body);

return table;
};


/**
 * 
 * @param data
 * array of Key value pairs separated by "=". Each column value is separated by a "|"
 * COLUMNHEADER="column1"|"column2"... etc.
 * ROW="column1"|"column2"... etc.
 * ROW="column1"|"column2"... etc.
 * ROW="column1"|"column2"... etc.
 * 
 * @returns {Array}
 */
function buildScrollingTable(data)
{
	var table = document.createElement("table");
	var body= document.createElement("tbody");
	
	var table2 = document.createElement("table");
	var body2= document.createElement("tbody");
	
	var strings = data.split(",");

	for (var x = 0; x < strings.length; x++) 
	{
		console.log("LINE: "+strings[x]);
		var key = "";
		var value = "";
		if(strings[x].includes("="))
		{
			key = strings[x].split("=")[0];
			value = strings[x].split("=")[1];
		}
		if (key == "COLUMNHEADER") 
		{
	
			var value2 = value.split("|");
			var header = document.createElement("tr");

			var row = document.createElement("tr");
			var cell = document.createElement("td");
			cell.height = 3;
			cell.style.borderBottom = "1px solid black";
			//cell.style.borderTopColor="black";
			cell.colSpan=(value2.length+value2.length-1);
			row.appendChild(cell);
			body.appendChild(row);

			for (var y = 0; y < value2.length; y++) 
			{
				var cell = document.createElement("td");
				var text = document.createTextNode(value2[y]);
				cell.width = 80;
				cell.appendChild(text);
				header.appendChild(cell);
				if(y < value2.length-1)
				{
					var cell2 = document.createElement("td");
					cell2.width=15;
					header.appendChild(cell2);
				}
			}
			body.appendChild(header);
			var row2 = document.createElement("tr");
			var cell2 = document.createElement("td");
			cell2.height = 5;
			cell2.style.borderTop = "3px solid black";
			//cell.style.borderTopColor="black";
			cell2.colSpan=(value2.length+value2.length-1);
			row2.appendChild(cell2);
			body.appendChild(row2);
		}
		else if (key == "ROW") 
		{
			var value2 = value.split("|");
			var row = document.createElement("tr");

			for (var y = 0; y < value2.length; y++) 
			{
				var cell = document.createElement("td");
				var text = document.createTextNode(value2[y]);
				cell.width = 80;
				cell.appendChild(text);
				row.appendChild(cell);	
				if(y < value2.length-1)
				{
					var cell2 = document.createElement("td");
					cell2.width=15;
					row.appendChild(cell2);
				}
			}
			body2.appendChild(row);
		}
	}
 
	table.appendChild(body);
	table.style.width=200;
	table2.appendChild(body2);
	table2.style.width=210;
	var fret = [table,table2];
	return fret;
};

function generateStructureTree(structure, htmlelement)
{
		var arr=[
			{title:1,dataAttrs:[{title:"dataattr1",data:"value1"},{title:"dataattr2",data:"value2"},{title:"dataattr3",data:"value3"}]},
			{title:2,dataAttrs:[{title:"dataattr4",data:"value4"},{title:"dataattr5",data:"value5"},{title:"dataattr6",data:"value6"}]},
			{title:3,dataAttrs:[{title:"dataattr7",data:"value7"},{title:"dataattr8",data:"value8"},{title:"dataattr9",data:"value9"}]}
				];
				
		var options = {
		title : "DropDown Tree Test",
		data: arr,
		clickHandler: function(element){
		console.log(element);
		},
		}
		
		$.htmlelement.DropDownTree(options);
}

function getReport(type) //either sasa, interaction, phipsi, bfactor,
{
	$.ajax(
{
type: "get",
url: "ReportProfile",
success: function(data) 
{
	console.log(data);
},
error: function(error) 
{},
data: {PDB: JOBID+".pdb",
	 TYPE: type
	}
 });
}

/**
 * Goal:More flexible structure of scrolling table generation
 * @param data
 * array of DOM elements. data[0] is the column header, data[1] is row 1, data[2] is row 2, etc.
 * array[0] = [String_column1,	String_column2, ...]
 * array[1] = [DOM_element1,	DOM_element2, 	...]
 * array[2] = [DOM_element1,	DOM_element2, 	...]
 * array[3] = [DOM_element1,	DOM_element2, 	...]
 * @returns {Array}
 * returns two tables
 * array[0] = headerTable, array[1] = dataTable
 */
function buildDOMelementScrollingTable(data,sizes)
{
	var headerTable = document.createElement("table");
	var headerBody= document.createElement("tbody");
	
	var dataTable = document.createElement("table");
	var dataBody= document.createElement("tbody");
	
	for (var x = 0; x < data.length; x++) 
	{
		if (x == 0) 
		{
			//HEADER TOP BLACK OUTLINE
			var myheader = document.createElement("tr");
			var row = document.createElement("tr");
			var cell = document.createElement("td");
			cell.height = 3;
			cell.style.borderBottom = "1px solid black";
			cell.colSpan=(data[x].length+data[x].length-1);
			row.appendChild(cell);
			headerBody.appendChild(row);

			//HEADER COLUMN TITLE ITSELF
			for (var y = 0; y < data[x].length; y++) 
			{
				//THIS IS THE ACTUAL DATA
				var cell = document.createElement("td");
				var text = document.createTextNode(data[x][y]);
				cell.width = sizes[y];
				cell.appendChild(text);
				myheader.appendChild(cell);
				
				//THIS IS FOR THE SPACER
				if(y < data[x].length-1)
				{
					var cell2 = document.createElement("td");
					cell2.width=15;
					myheader.appendChild(cell2);
				}
			}
			headerBody.appendChild(myheader);
			
			//HEADER BOTTOM BLACK OUTLINE
			var row2 = document.createElement("tr");
			var cell2 = document.createElement("td");
			cell2.height = 5;
			cell2.style.borderTop = "3px solid black";
			//cell.style.borderTopColor="black";
			cell2.colSpan=(data[x].length+data[x].length-1);
			row2.appendChild(cell2);
			headerBody.appendChild(row2);

		}
		else
		{
			var row = document.createElement("tr");

			for (var y = 0; y < data[x].length; y++) 
			{
				//THIS IS THE ACTUAL DATA
				var cell = document.createElement("td");
				var cellElement = (data[x][y]);
				if(x%2 == 0)
				{
					cell.style.backgroundColor = "lightgrey";
				}
				
				cell.width = sizes[y];
				cell.appendChild(cellElement);
				row.appendChild(cell);
				
				//THIS IS FOR THE SPACER
				if(y < data[x].length-1)
				{
					var cell2 = document.createElement("td");
					cell2.width=15;
					if(x%2 == 0)
					{
						cell2.style.backgroundColor = "lightgrey";
					}
					row.appendChild(cell2);
				}
			}
			dataBody.appendChild(row);
		}
	}
	var tablewidth=0
	for(var i = 0 ; i < sizes.length; i++)
	{
		tablewidth+=sizes[i];
	}
	headerTable.appendChild(headerBody);
	headerTable.style.width=tablewidth;
	dataTable.appendChild(dataBody);
	dataTable.style.width=tablewidth;
	var fret = [headerTable,dataTable];
	return fret;
};


function makeUL(document,element,dataArray) 
{
	// Create the list element:
	var list = document.createElement('ul');
	
	for(var i = 0; i < dataArray.length; i++) 
	{
		// Create the list item:
		var item = document.createElement('li');
		item.appendChild(document.createTextNode(dataArray[i]));
		list.appendChild(item);
	}
	element.appendChild(list);
}

/**
 * @param string
 * The string to format
 * @param charToAdd
 * what to add to the string to complete it
 * @param finalLength
 * the total length of the final String
 * @param alignment
 * choose from 
 * 		"right" / "left" / "center"
 * right: charToAdd prepended to the string
 * left: charToAdd appended to the string
 * center: charsToAdd prepended and then appended in turn to center the string
 * @return {String}
 * The newly formatted string aligned right, left or centered
 */
function FormatString(string, charToAdd, finalLength, alignment)
{
	var formattedString = string;
	for(var i = string.length; i < finalLength; i++)
	{
		if(alignment === "right")
		{
			formattedString = charToAdd+formattedString;
		}
		else if(alignment === "left")
		{
			formattedString = formattedString+charToAdd;
		}
		else if(alignment === "center")
		{
			if((finalLength - formattedString.length)%2 == 0)
			{
				formattedString = charToAdd+formattedString;
			}
			else
			{
				formattedString = formattedString+charToAdd;
			}
		}
	}
	return formattedString;
}

function RoundNumberTo(number,decimals)
{
	var newNum = Number(Math.round(number+'e'+decimals)+'e-'+decimals).toFixed(decimals);
	return newNum;
}

function FormatNumberToString(number, decimals, charToAdd, finalLength, alignment)
{
	var newNum = Number(Math.round(number+'e'+decimals)+'e-'+decimals).toFixed(decimals);
	var formattedString = newNum;
	for(var i = formattedString.length; i < finalLength; i++)
	{
		if(alignment === "right")
		{
			formattedString = charToAdd+formattedString;
		}
		else if(alignment === "left")
		{
			formattedString = formattedString+charToAdd;
		}
		else if(alignment === "center")
		{
			if((finalLength - formattedString.length)%2 === 0)
			{
				formattedString = charToAdd+formattedString;
			}
			else
			{
				formattedString = formattedString+charToAdd;
			}
		}
	}
	return formattedString;
}

/**
 * Goal: This generates a confirm dialog in the middle of the screen 
 * that follows scrolling by the user. Pressing the proceed button
 * triggers a customized action by the user and then closes itself
 * @param text
 * this is the text to be printed as a message to the user. (String)
 * @param proceedText
 * this is the text to be displayed on the proceed button (String)
 * @param cancelText
 * this is the text to be displayed on the cancel button (String)
 * @param action
 * this is a function that will be executed when the user clicks on 
 * the proceed button. The dialog is closed after the action as been
 * executed
 * @returns {DOM element}
 * It returns a confirm dialog element to be appended anywhere. I suggest to
 * the body. It will be deleted after the user clicks cancel or the proceed
 * button
 */
function ConfirmDialog(text, proceedText, cancelText, action)
{
	var cover = document.createElement("div");
	var confirmdialog = document.createElement("div");
	var confirmdialogtext = document.createElement("div");
	confirmdialogtext.innerHTML = text;
	var row = document.createElement("div");
	var col1 = document.createElement("div");
	var proceedbutton = document.createElement("a");
	proceedbutton.innerHTML = proceedText;
	
	proceedbutton.onclick = function()
	{
		action();
		confirmdialog.parentNode.removeChild(cover);
		confirmdialog.parentNode.removeChild(confirmdialog);
	}
	proceedbutton.href = "#";
	var col2 = document.createElement("div");
	var col3 = document.createElement("div");
	var cancelbutton = document.createElement("a");
	cancelbutton.innerHTML = cancelText;
	cancelbutton.href = "#";
	cancelbutton.onclick = function()
	{
		confirmdialog.parentNode.removeChild(cover);
		confirmdialog.parentNode.removeChild(confirmdialog);
	}
	
	cover.style =
		"display: block;\
		position: fixed;\
		left: 0px;\
		top: 0px;\
		z-index: 0;\
		background-color: gray;\
		opacity: 0.5;\
		width: 100%;\
		height: 100%;";
	
	confirmdialog.style = 
			"position: fixed;\
		  	left: 50%;\
		  	top: 50%;\
		  	transform: translate(-50%, -50%);\
		  	z-index: 0;\
		  	overflow: hidden;\
		  	width: 20%;\
		  	min-width: 250px;\
		  	height: auto;\
		  	border: 2px solid #e02727;\
		  	border-radius: 2px;\
		  	background-color: #fff;\
			box-shadow: 10px 10px 5px grey;\
		  	font-weight: 500;";
	
	confirmdialogtext.style = 
			"display: block;\
		  	margin-right: auto;\
		  	margin-left: auto;\
		  	padding-top: 5px;\
		  	padding-bottom: 20px;\
		  	height: auto;\
		  	color: black;\
		  	font-size: 14px;\
		  	font-weight: 700;\
		  	text-align: center;";
	
	row.style =
	    	"margin-left: 0;\
	    	margin-right: 0;\
	    	background-color: white;";
	
	col1.style = 
			"width: 48%;\
	  		position: relative;\
			float: left;\
			min-height: 1px;\
			padding-left: 10px;\
			padding-right: 10px;";
			
	col2.style = 
			"width: 4%;\
	  		position: relative;\
			float: left;\
			min-height: 1px;\
			padding-left: 10px;\
			padding-right: 10px;";
	
	col3.style = 
			"width: 48%;\
	  		position: relative;\
			float: left;\
			min-height: 1px;\
			padding-left: 10px;\
			padding-right: 10px;";
	
	proceedbutton.style =
			"display: block;\
		  	width: 90%;\
			height: auto;\
		  	padding: 8px 5px;\
		  	margin: 5px 5%;\
		  	float: none;\
		  	border: 2px solid #000;\
		  	border-radius: 4px;\
		  	background-color: #00948e;\
		  	color: white;\
		  	font-size: 14px;\
		  	text-decoration: none;\
			cursor: pointer;\
		  	text-align: center;";
	
	cancelbutton.style = 
			"display: block;\
		  	width: 90%;\
			height: auto;\
		  	padding: 8px 5px;\
		  	margin: 5px 5%;\
		  	float: none;\
		  	border: 2px solid #000;\
		  	border-radius: 4px;\
		  	background-color: #00948e;\
		  	color: white;\
		  	font-size: 14px;\
		  	text-decoration: none;\
			cursor: pointer;\
		  	text-align: center;";
	
	col3.appendChild(cancelbutton);
	col1.appendChild(proceedbutton);
	row.appendChild(col1);
	row.appendChild(col2);
	row.appendChild(col3);
	confirmdialog.appendChild(confirmdialogtext);
	confirmdialog.appendChild(row);
	document.body.appendChild(cover);
	document.body.appendChild(confirmdialog);
}


/**
 * Goal: Customized info dialog box that appears in the middle
 * of the screen and follows scrolling by the user. When the 
 * proceed button is pressed, the dialog simply closes.
 * @param text
 * this is string that will be printed as information in the dialog
 * box.
 * @param proceedText
 * The is a string that will be written on the button for closing
 * the dialog box.
 * @returns {DOM element}
 * return the dialog element. It can be appended anywhere, but I 
 * suggest to append it to the body
 */
function InfoDialog(text, proceedText)
{
	var cover = document.createElement("div");
	var confirmdialog = document.createElement("div");
	var confirmdialogtext = document.createElement("div");
	confirmdialogtext.innerHTML = text;
	var row = document.createElement("div");
	var col1 = document.createElement("div");
	var proceedbutton = document.createElement("a");
	proceedbutton.innerHTML = proceedText;
	
	proceedbutton.onclick = function()
	{
		confirmdialog.parentNode.removeChild(cover);
		confirmdialog.parentNode.removeChild(confirmdialog);
	}
	proceedbutton.href = "#";
	var col2 = document.createElement("div");
	var col3 = document.createElement("div");
	
	cover.style =
			"display: block;\
			position: fixed;\
			left: 0px;\
			top: 0px;\
			z-index: 0;\
			background-color: gray;\
			opacity: 0.5;\
			width: 100%;\
			height: 100%;";
	
	confirmdialog.style = 
			"position: fixed;\
		  	left: 50%;\
		  	top: 50%;\
		  	transform: translate(-50%, -50%);\
		  	z-index: 0;\
		  	max-height: 350px;\
		  	width: 20%;\
		  	min-width: 250px;\
		  	height: auto;\
		  	border: 2px solid #e02727;\
		  	border-radius: 2px;\
		  	background-color: #fff;\
			box-shadow: 10px 10px 5px grey;\
		  	font-weight: 500;";
	
	confirmdialogtext.style = 
			"display: block;\
			text-align: left;\
		  	margin: 5px 5%;\
		  	padding-top: 5px;\
		  	padding-bottom: 20px;\
		  	color: black;\
			max-height: 300px;\
		  	font-size: 14px;\
		  	font-weight: 700;\
		  	overflow-y: scroll;";
	
	row.style =
	    	"margin-left: 0;\
	    	margin-right: 0;\
	    	background-color: white;";
	
	col1.style = 
			"width: 48%;\
	  		position: relative;\
			float: left;\
			min-height: 1px;\
			padding-left: 10px;\
			padding-right: 10px;";
			
	col2.style = 
			"width: 4%;\
	  		position: relative;\
			float: left;\
			min-height: 1px;\
			padding-left: 10px;\
			padding-right: 10px;";
	
	col3.style = 
			"width: 48%;\
	  		position: relative;\
			float: left;\
			min-height: 1px;\
			padding-left: 10px;\
			padding-right: 10px;";
	
	proceedbutton.style =
			"display: block;\
		  	width: 90%;\
			height: auto;\
		  	padding: 8px 5px;\
		  	margin: 5px 5%;\
		  	float: none;\
		  	border: 2px solid #000;\
		  	border-radius: 4px;\
		  	background-color: #00948e;\
		  	color: white;\
		  	font-size: 14px;\
		  	text-decoration: none;\
			cursor: pointer;\
		  	text-align: center;";
	
	col1.appendChild(proceedbutton);
	row.appendChild(col1);
	row.appendChild(col2);
	row.appendChild(col3);
	confirmdialog.appendChild(confirmdialogtext);
	confirmdialog.appendChild(row);
	document.body.appendChild(cover);
	document.body.appendChild(confirmdialog);
}

function ProgressDialog(text)
{
	var self = this;
	this.progress = 0;
	this.range = {min:0,max:100};
	var cover = document.createElement("div");
	var progressdialog = document.createElement("div");
	var progressdialogtext = document.createElement("div");
	var frame = document.createElement("div");
	var bar = document.createElement("div");
	progressdialogtext.innerHTML = text;
	
	this.setInnerText = function(text)
	{
		frame.innerHTML = text;
	}
	this.setRange = function(min,max)
	{
		self.range.min = min;
		self.range.max = max;
	}
	this.update = function(value,total)
	{
		var percentage = value/total*100;
		percentage = (percentage * self.range.max / 100);
		if(percentage == self.progress){return;}
		self.progress = percentage;
		
		if(percentage == 100)
		{
			self.close();
		}
		else
		{
			bar.innerHTML = value+"/"+total;
			bar.style.width = percentage+"%";
		}
	}
	this.getProgressBar = function()
	{
		return bar;
	}
	
	this.getProgress = function()
	{
		return self.progress;
	}
	this.show = function()
	{
		cover.style.display = "block";
		progressdialog.style.display = "block";
	}
	this.hide = function()
	{
		cover.style.display = "none";
		progressdialog.style.display = "none";
	}
	this.close = function()
	{
		if(cover !== null && progressdialog !== null)
		{
			progressdialog.parentNode.removeChild(cover);
			progressdialog.parentNode.removeChild(progressdialog);
		}
	}
	
	cover.style =
			"display: none;\
			position: fixed;\
			left: 0px;\
			top: 0px;\
			z-index: 0;\
			background-color: gray;\
			opacity: 0.5;\
			width: 100%;\
			height: 100%;\
			cursor: wait;";
	
	progressdialog.style = 
			"display: none;\
			position: fixed;\
		  	left: 50%;\
		  	top: 50%;\
		  	transform: translate(-50%, -50%);\
		  	z-index: 0;\
		  	max-height: 350px;\
		  	overflow: hidden;\
		  	width: 20%;\
		  	min-width: 250px;\
		  	height: auto;\
		  	border: 2px solid #e02727;\
		  	border-radius: 2px;\
		  	background-color: #fff;\
			box-shadow: 10px 10px 5px grey;\
		  	font-weight: 500;";
	
	progressdialogtext.style = 
			"display: block;\
			text-align: left;\
		  	margin-right: auto;\
		  	margin-left: auto;\
		  	padding-top: 5px;\
		  	padding-left: 10px;\
		  	padding-bottom: 20px;\
		  	height: auto;\
		  	color: black;\
		  	font-size: 14px;\
		  	font-weight: 700;";
	
	frame.style =
			"display: block;\
		  	width: 90%;\
			height: 22px;\
		  	margin: 2px 5%;\
		  	padding: 0px 0px;\
		  	float: none;\
		  	border: 2px solid #000;\
		  	border-radius: 4px;\
		  	background-color: #D5C9B1;";
	
	bar.style =
			"display: block;\
		  	width: "+self.progress+"%;\
			height: 20px;\
			padding-left: 10px;\
		  	float: none;\
		  	margin: -1px -1px;\
		  	border: 1px solid #000;\
		  	border-radius: 2px;\
		  	background-color: #5CC5EF;\
		  	color: black;\
		  	font-size: 14px;\
		  	text-decoration: none;\
		  	text-align: left;";
		
	frame.appendChild(bar);
	progressdialog.appendChild(progressdialogtext);
	progressdialog.appendChild(frame);
	document.body.appendChild(cover);
	document.body.appendChild(progressdialog);
}

/**
 * Goal: Generate a Dynamic motif for online viewing of Recognition motifs
 * @param data
 * it has the form: [[letters at p1],[letters at p2],[letters at p3],[letters at p4],etc...]
 * it is a 2D array of amino acid 1letter code for each position of the motif
 * @param options
 * height: the height as a string
 * width: the width as a string
 * title: the title as a string
 * title_size: the size of the title in "px" as a string
 * columnsTitle: titles as string array in order of the column from left to right
 * folder: folder as a string relative or full path of where the images for the motif are located
 * onhover: function that describes what happen when you hover the column
 */
function createMotif(data,options)
{
	if(options === undefined)
	{
		options = {};
	}
	var motifpackage = document.createElement("div");
	var tolerance = options.tolerance || 10;
	var height = options.height || "100%";
	var width = options.width || "100%";
	var title = options.title || null;
	var title_size = options.title_size || "30px";
	var title_color = options.title_color || "black";
	var coltitles = options.columnsTitle || null;
	var folder = options.folder || "images/";
	var onhover = options.onhover || null;
	var container = document.createElement("div");
	container.style =
			"height: "+height+";\
			width: "+width+";\
			min-width: 300px;\
			min-height: 200px;\
			margin: auto;\
			padding: 5px;";
	if(title !== null)
	{
		var my_title = document.createElement("H2");
		my_title.style =
			"color: "+title_color+";\
		  	font-size: "+title_size+";\
		  	padding: 5px;\
		  	height: 50px;\
			margin: 0px;"
		var title_text = document.createTextNode(title);
		my_title.appendChild(title_text);
		my_title.style.clear = "both";
		container.appendChild(my_title);
	}
	
	
	
	for(var i = 0; i < data.length; i++)
	{
		var column = document.createElement("div")
		column.className = "biomotifColumn";
		column.style.width=100.0/data.length+"%";
		column.style.padding="0px";
		column.style.margin="0px";
		column.style.float="left";
		for(var x = 0; x < data[i].length; x++)
		{
			var image = document.createElement("img");
			var img_height = 100.0/data[i].length;
			image.alt = AMINOACIDS.aaDescription[data[i][x]];
			image.title = AMINOACIDS.aaDescription[data[i][x]];
			image.style= 
				"height: "+img_height+"%;\
				min-height: 0px;\
				width: 100%;\
				padding: 0px;\
				margin: 0px;\
				display: table;\
				float: none;";
			

			if(data[i].length >= tolerance)
			{
				image.alt = AMINOACIDS.aaDescription["X"];
				image.title = AMINOACIDS.aaDescription["X"];
				image.style.height = "100%"
				image.src = folder+"X-large.png";
				column.appendChild(image);
				break;
			}
			else if(img_height < 14){
				image.src = folder+data[i][x]+"-very-small.png";
			}
			else if(img_height < 20){
				image.src = folder+data[i][x]+"-small.png";
			}
			else if(img_height < 50){
				image.src = folder+data[i][x]+".png";
			}
			else{
				image.src = folder+data[i][x]+"-large.png";
			}
			column.appendChild(image);
		}
		container.appendChild(column);
	}
	
	if(coltitles !== null)
	{	
		var titlesdiv = document.createElement("div");
		titlesdiv.style.clear = "both";
		
		for(var i = 0; i < coltitles.length; i++)
		{
			var column = document.createElement("div")
			column.style =
				"height: 25px;\
				width: "+100.0/coltitles.length+"%;\
				padding: 5px;\
				margin: 0px;\
				font: bold 14px arial;\
				color: black;\
				text-align: center;\
				float:left;";
				var text = document.createTextNode(coltitles[i]);
				column.appendChild(text);		
			titlesdiv.appendChild(column);
		}
		container.appendChild(titlesdiv);
	}
	return container;
}

function ReadCSV(URL, callback, arg1,arg2,arg3)
{
	var name = PDButil.stripName(URL);
	console.log("Reading the file: "+name);
	var request = new XMLHttpRequest();
	request.open('GET', URL, true);
	request.onload = function() {
		   var text = request.responseText;
		   loadFileHandler(text);
	};
	request.send();
	
	//When file is read, this function is called
	function loadFileHandler(text)
	{
	    var content = text.split("\n");
	    var processed = [];
	    for(var i = 0; i < content.length; i++)
	    {
	    	if(content[i].includes(","))
	    	{
	    		processed.push(content[i].split(","));
	    	}
	    	else
	    	{
	    		processed.push([content[i]]);
	    	}
	   	}
	    callback(processed,arg1,arg2,arg3);
	};

	function errorFileHandler(event)
	{
	    console.log("Error while reading the file");
	}; 
}
 /**
* February 15th:
* -> Remove all hardcoded DOM element
*getBFactor()
*getSASA()
*etc.
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

function getBfactor()
{
	$.ajax(
	{
	type: "get",
	url: "BfactorProfile",
	success: function(data) 
	{
		console.log(data);
		
		var element = buildScrollingTable(data);
		var header = buildTitle("16","B-factor Report");
		var block = document.getElementById("JmolBlock");
		block.style.display = "block";
		var newdiv = document.createElement("div");
		newdiv.style.cssFloat="left";
		newdiv.appendChild(header);
		var btn = document.createElement("button");
		btn.className = "submit-button";
		btn.style.color="white";
		btn.style.margin="5px";
		btn.style.cssFloat="none";
		btn.innerHTML ="Download";

		newdiv.appendChild(btn);
		var scroll = document.createElement("div");
		scroll.style.overflowY="scroll";
		scroll.style.height="300px";
		scroll.appendChild(element[1]);
		newdiv.appendChild(element[0]);
		newdiv.appendChild(scroll);

		block.appendChild(newdiv);

	},
	error: function(error) 
	{},
	data: {PDB: JOBID+".pdb"}
	});
};


function getSASA()
{
	$.ajax(
	{
		type: "get",
		url: "SasaProfile",
		success: function(data) 
		{
			console.log(data);
	
			var element = buildScrollingTable(data);
			var header = buildTitle("16","Solvent Exposure Report");
			var block = document.getElementById("JmolBlock");
			block.style.display = "block";
			var newdiv = document.createElement("div");
			newdiv.style.cssFloat="left";
			newdiv.appendChild(header);
			var btn = document.createElement("button");
			btn.className = "submit-button";
			btn.style.color="white";
			btn.style.margin="5px";
			btn.style.cssFloat="none";
			btn.innerHTML ="Download";
			//btn.onChange="getSASA(\"sasa\")"; DOESNT WORK??

			newdiv.appendChild(btn);
			var scroll = document.createElement("div");
			scroll.style.overflowY="scroll";
			scroll.style.height="300px";
			scroll.appendChild(element[1]);
			newdiv.appendChild(element[0]);
			newdiv.appendChild(scroll);
			
			block.appendChild(newdiv);
		},
		error: function(error) 
		{},
		data: {PDB: JOBID+".pdb"}
	});
};


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


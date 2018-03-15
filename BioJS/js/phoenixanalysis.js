function ReadANALYSISurl(URL, callback, arg1, arg2, arg3)
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
	
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	//When file is read, this function is called
	function loadFileHandler(text)
	{
	    var content = text.split("\n");
	    var StartDate = new Date();
		var StartTime = StartDate.getTime();
		var parser = new ANALYSISFileParser();
		
		
	    for(var i = 0 ; i < content.length; i++)
	    {
	    	var line = content[i];
	    	parser.LineHandler(line);
		}
		parser.ProcessDone(StartTime,callback,arg1,arg2,arg3);
	}
	function errorFileHandler(event)
	{
	    console.log("Error while reading the file");
	}

}

function ReadANALYSISfile(file, callback, arg1, arg2, arg3)
{
	var name = PDButil.stripName(file.name);
	console.log("Reading the file: "+name);
	var analysisfileReader = new FileReader();
	
	//Reads the file
	analysisfileReader.readAsText(file);
	
	//When file is read, this function is called
	analysisfileReader.onload = loadFileHandler;
	pdbfileReader.onerror = errorFileHandler;
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	//When file is read, this function is called
	function loadFileHandler(event)
	{
	    var content = event.target.result.split("\n");
	    var StartDate = new Date();
		var StartTime = StartDate.getTime();
		var parser = new ANALYSISFileParser();
		
		
	    for(var i = 0 ; i < content.length; i++)
	    {
	    	var line = content[i];
	    	parser.LineHandler(line);
		}
		parser.ProcessDone(StartTime,callback,arg1,arg2,arg3);
	}
	function errorFileHandler(event)
	{
	    console.log("Error while reading the file");
	}

}

function ANALYSISFileParser()
{
	const _PARSE_DESIGNRESIDUE = "Residues Designed: ";
	const _PARSE_WTSEQUENCE = "Wild Type Sequence: ";
	const PARSE_SPLIT = "|";
	const SEQUENCE_INDEX = 1;
	const ENERGY_INDEX = 2;
	const FILE_EXTENSION = ".analysis";
	var Sequences;
	var Design;
	var WT;
	var SequenceInfo;
	var Map;
	var self = this;
	SequenceInfo = [];
	WT = null;
	Design = null;
	Sequences = [];
	Map = {};
	var data = [];
	
	function SequenceHandler(info)
	{
		for(var i = 0; i < SequenceInfo.length; i++)
		{
			var sequence = SequenceInfo[i];
			if(sequence.sequence === (info[1]))
			{
				return new BioSequence();
			}
		}
		var seq = new BioSequence();
		seq.rank = parseInt(info[0]);
		seq.sequence = info[1];
		seq.energy = parseFloat(info[2]);
		seq.boltzEnergy = parseFloat(info[2]);
		seq.deltawtEnergy = parseFloat(info[3]);
		seq.structure =info[4];
		
		if (seq.deltawtEnergy === 0)
		{
			seq.type = "WT";
		}
		else
		{
			seq.type = "Mutant";
		}
		if(Design !== null)
		{
			if(Design.includes("+"))
			{
				var pids = Design.split("\\+");
				seq.residuesPID = pids;
			}
			else
			{
				seq.residuesPID = Design; //Shallow cloning here. Should I worry?
			}
		}
		return seq;
	}
	function WTSeqHandler(line)
	{
		line = line.substring(_PARSE_WTSEQUENCE.length);
		line = line.trim();
		var wt = line;
		return wt;
	}
	function DesignResHandler(line)
	{
		line = line.substring(_PARSE_DESIGNRESIDUE.length);
		line = line.trim();
		var ResDesigned = line;
		return ResDesigned;
	}
	function InfoHandler(line)
	{
		line=line.replace("  ", "");
		var info = line.split("|");
		for(var i = 0; i < info.length; i++)
		{
			info[i] = info[i].trim();
		}
		return info;
	}
	function GetMap(data, Sindex, Eindex)
	{
		var _Map = {};
		//MAKING THE SEQUENCE ARRAY
		for(var i = 0; i < data.length; i++)
		{
			var Seq = data[i][Sindex];
			var Ene = data[i][Eindex];
			_Map[Seq] = parseFloat(Ene); // not sure about this synthax
		}
		return _Map;
	}
	
	/**
	 * PUBLIC FUNCTIONS
	 */
	
	this.ProcessDone = function (StartTime, callback,arg1,arg2,arg3)
	{
		var EndDate = new Date();
		var EndTime = EndDate.getTime();
		console.log("Analyzed file in "+((EndTime - StartTime) /1000) + " seconds");
	    callback(SequenceInfo,arg1,arg2,arg3);
	}
	
	this.LineHandler = function(line)
	{
		if(line.startsWith(_PARSE_DESIGNRESIDUE))
		{
			self.setDesign(DesignResHandler(line));
		}
		if(line.startsWith(_PARSE_WTSEQUENCE))
		{
			self.setWT(WTSeqHandler(line));
		}
		if(line.includes(PARSE_SPLIT))
		{
			var d = InfoHandler(line);
			if(d[0] !== "Rank")
			{
				var seq = SequenceHandler(d);
				if(!seq.isEmpty)
				{
					SequenceInfo.push(seq);
				}
				if (parseFloat(d[2]) !== Number.NaN)
				{
					data.push(d);
				}	
			}	
		}
	}
	this.getSequences = function()
	{
		return Sequences;
	}
	this.getDesign = function() {
		return Design;
	}
	this.getWT = function() {
		return WT;
	}
	this.setWT = function(_wt) {
		WT = _wt;
	}
	this.setDesign=  function(_design) {
		Design = _design;
	}
	this.getSequenceInfo = function() {
		return SequenceInfo;
	}
	this.setSequenceInfo = function(_sequenceInfo) {
		SequenceInfo = _sequenceInfo;
	}
	this.getMap = function()
	{
		return Map;
	}
}

function MakeSortingMap(UnsortedSeqArray, SortedSeqArray)
{
	var map = [];
	for(var i = 0 ; i<UnsortedSeqArray.length; i++)
	{
		for(var x = 0; x < SortedSeqArray.length; x ++)
		{
			if(UnsortedSeqArray[i] === (SortedSeqArray[x]))
			{
				map[i] =  x;
			}
		}
	}
	return map;
}
/**
 * GOAL: Takes an array of sequences and prints an analysis 
 * file as a string format
 * @param sequences
 * array of BioSequence objects as described in phoenixseuquences.js
 * @param type
 * either "html" or "text"
 * @return
 * returns the string representation of a analysis file content
 */
function makeANALYSISstring(sequences, type)
{
	var wtRes = "";
	for(var i = 0; i <sequences.length; i++)
	{
		var sequence = sequences[i];
		if(sequence.type === ("WT"))
		{
			wtRes = sequence.sequence;
		}
	}
		
	var preffix = sequences[0].structure;
	if(preffix.includes("."))
	{
		preffix = preffix.substring(0,preffix.indexOf('.'));
	}
	var name = "";
	var reference = sequences[0].residuesPID;
	for(var i = 0; i < reference.length; i++){
		if(i === reference.length-1){name += reference[i]}
		else{name += reference[i]+ "+";}
	}
	var newLine;
	if(type === "html"){newLine = "<br>";}
	if(type === "text"){newLine = "\n";}
	var _delim = " | ";
	var rowSpacer = "";
	var spacer = "";
	const seqlen = sequences[0].sequence.length;
	const Boltzenergylength = 9;
	const DeltaWTenergylength = 9;
	var rest = seqlen-6;
	
	for(var i = 0 ; i<rest ; i++){
		spacer += " ";}
	var lenstr = ("Rank "+_delim+"Seq.  "+spacer+_delim+"Boltz_E  "+_delim+"DeltaWT_E"+_delim+"Template combinations").length;
	for(var i = 0 ; i<lenstr ; i++){
		rowSpacer += "-";}
	var analType = "Combinatorial";
	if(seqlen == 1){analType = "Single";}
	var info =  		"Type of Analysis :  "+analType+" mutations analysis"+newLine;
	info += 		"Residues Designed: "+name+newLine;
	info += 		"Wild Type Sequence: "+wtRes+newLine+newLine;
	info +=			"Rank "+_delim+"Seq.  "+spacer+_delim+"Boltz_E  "+_delim+"DeltaWT_E"+_delim+"Template combinations"+newLine;
	info +=			rowSpacer+newLine;
	
	for(var i = 0; i <sequences.length; i++)
	{
		var sequence = sequences[i];
		
		var rank = sequence.rank.toString();
		var seq = sequence.sequence;
		var boltzE = RoundNumberTo(sequence.boltzEnergy,3).toString();
		var deltaE = RoundNumberTo(sequence.deltawtEnergy,3).toString();
		
		var lendeltaE = deltaE.length; 
		var lenboltzE = boltzE.length;
		var lenRank = rank.length;
		
		spacer = "";
		rest = 5-lenRank;
		for(var i = 0 ; i<rest ; i++){
			spacer += " ";}
		
		info += rank+spacer+_delim;
		
		spacer = "";
		rest = 6-seqlen;
		for(var i = 0 ; i<rest ; i++){
			spacer += " ";}
		if(parseFloat(boltzE) >=0){_delim = " |  ";}
		info+=			seq+spacer+_delim;
		
		spacer = "";
		rest = Boltzenergylength - lenboltzE;
		for(var i = 0 ; i<rest ; i++){
			spacer += " ";}
		if(parseFloat(boltzE) >=0 && parseFloat(deltaE) >=0){
			_delim = "|  ";}
		else if(parseFloat(boltzE) >=0 && parseFloat(deltaE) < 0){
			_delim = "| ";}
		else if(parseFloat(boltzE) < 0 && parseFloat(deltaE) >=0){
			_delim = " |  ";}
		info += boltzE+spacer+_delim;
		
		if(parseFloat(deltaE) >=0){
			_delim = "| ";}
		spacer = "";
		rest = DeltaWTenergylength - lendeltaE;
		for(var i = 0 ; i<rest ; i++){
			spacer += " ";}
		info += deltaE+spacer+_delim;
		
		info += it.structure+newLine;
	}
	return info;
}
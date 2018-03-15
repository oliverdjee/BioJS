/**
 * FEBRUARY 15th:
 * -> Modify PDBFileReader(structure,event,callback) to 
 *    work with file instead of event
 *    -> DONE
 */

/**
 * Goal:Obtain the download URL for the requested PDB identifier
 * @fourletterID
 * the 4 letter code for RCSB.org identification of pdb file
 * @return {String}
 * returns the download HTTP URL of the PDB file
 */
function RCSBUrl(fourletterID)
{
	return "https://files.rcsb.org/download/"+fourletterID+PDButil.PDBext;
}

/**
 * Goal: Build a molecular structure from a URL pdbfile
 * @param URL
 * the URL to the pdbfile, **uncompressed**
 * @param callback
 * When the file is loader and the structure is built, the function
 * sends a callback to the user with the structure sent as an argument. 
 * This is necessary, since it is an
 * ASYNC ajax get request, and is using an ASYNC file reader object.
 */
function ReadPDBurl(URL,callback)
{
	var name = PDButil.stripName(URL);
	var request = new XMLHttpRequest();
	request.open('GET', URL, true);
	request.onload = function() {
		   var text = request.responseText;
		   loadStructureHandler(text);
	};
	request.send();
	
	//When file is read, this function is called
	function loadStructureHandler(text)
	{
	    var content = text.split("\n");
	    //console.log(content[1]);
	    BuildStructure(name,content,callback, new ProgressDialog("Building Structure: "+name+"..."));
	};

	function errorStructureHandler(event)
	{
	    console.log("Error while reading the file");
	}; 
}

/**
 * Goal: Build a molecular structure from a local pdbfile
 * @param file
 * the local pdbfile (".pdb"), **uncompressed**
 * @param callback
 * When the file is loaded and the structure is built, the function
 * sends a callback to the user. This is necessary, since it is using
 * an ASYNC file reader object
 */

function ReadPDBfile(file,callback)
{
	var self = this;
	var name= PDButil.stripName(file.name);
	
	//Assigning Properties by reading the file
	var pdbfileReader = new FileReader();
	
	//Reads the file
	pdbfileReader.readAsText(file);
	
	//When file is read, this function is called
	pdbfileReader.onload = loadStructureHandler;
	pdbfileReader.onerror = errorStructureHandler;
	
	function loadStructureHandler(event)
	{
	    var content = event.target.result.split("\n");
	    //console.log(content[1]);
	    BuildStructure(name,content,callback, new ProgressDialog("Building Structure: "+name+"..."));
	};

	function errorStructureHandler(event)
	{
	    console.log("Error while reading the file");
	};
    
}

function PDBFileParser()
{
	/**
	 * PDB FILE CONSTANTS
	 */
	var self = this;
	const HEADER 					= "HEADER";
	const TITLE  					= "TITLE";
	const AUTHORS  					= "AUTHORS";
	const ATOM 						= "ATOM";
	const HETATM 					= "HETATM";
	const CONECT 					= "CONECT";
	const PDB_AUTHOR_ASSIGNMENT 	= "PDB_AUTHOR_ASSIGNMENT";
	const HELIX  					= "HELIX";
	const STRAND 					= "STRAND";
	const TURN   					= "TURN";
	const compndFieldValues 		= 
				   ["MOL_ID:", "MOLECULE:", "CHAIN:", "SYNONYM:",
					"EC:", "FRAGMENT:", "ENGINEERED:", "MUTATION:",
					"BIOLOGICAL_UNIT:", "OTHER_DETAILS:"];
	const gnoreCompndFieldValues =
				   ["HETEROGEN:","ENGINEEREED:","FRAGMENT,",
					"MUTANT:","SYNTHETIC:"];
	const sourceFieldValues = 
				   ["ENGINEERED:", "MOL_ID:", "SYNTHETIC:", "FRAGMENT:",
					"ORGANISM_SCIENTIFIC:", "ORGANISM_COMMON:",
					"ORGANISM_TAXID:","STRAIN:",
					"VARIANT:", "CELL_LINE:", "ATCC:", "ORGAN:", "TISSUE:",
					"CELL:", "ORGANELLE:", "SECRETION:", "GENE:",
					"CELLULAR_LOCATION:", "EXPRESSION_SYSTEM:",
					"EXPRESSION_SYSTEM_TAXID:",
					"EXPRESSION_SYSTEM_STRAIN:", "EXPRESSION_SYSTEM_VARIANT:",
					"EXPRESSION_SYSTEM_CELL_LINE:",
					"EXPRESSION_SYSTEM_ATCC_NUMBER:",
					"EXPRESSION_SYSTEM_ORGAN:", "EXPRESSION_SYSTEM_TISSUE:",
					"EXPRESSION_SYSTEM_CELL:", "EXPRESSION_SYSTEM_ORGANELLE:",
					"EXPRESSION_SYSTEM_CELLULAR_LOCATION:",
					"EXPRESSION_SYSTEM_VECTOR_TYPE:",
					"EXPRESSION_SYSTEM_VECTOR:", "EXPRESSION_SYSTEM_PLASMID:",
					"EXPRESSION_SYSTEM_GENE:", "OTHER_DETAILS:"];
	var curent_line				= null;
	var atomCount 				= 0;
	var current_model			= null; //new ArrayList<Chain>();
	var current_chain 			= null;
	var current_group			= null;
	
	/**
	 * PUBLIC VARIABLES
	 */
	this.params 				= null; //new FileParsingParameters();
	this.structure     			= new Structure();
	this.pdbHeader 	  			= new PDBHeader();
	this.crystallographicInfo	= null; //new PDBCrystallographicInfo();
	this.connects     		 	= null; //new ArrayList<Map<String,Integer>>() ;
	this.helixList     			= null; //new ArrayList<Map<String,String>>();
	this.strandList    			= null; //new ArrayList<Map<String,String>>();
	this.turnList      			= null; //new ArrayList<Map<String,String>>();
	this.current_compound 		= null; //new Compound();
	this.dbrefs        			= null; //new ArrayList<DBRef>();
	this.siteMap 				= null;
	this.atomOverflow 			= false;
	this.parseCAonly 			= false;
	this.load_max_atoms 		= 100000; //params.getMaxAtoms();
	this.my_ATOM_CA_THRESHOLD 	= null; //params.getAtomCaThreshold();
	this.linkRecords 			= null; //new ArrayList<LinkRecord>();
	
	/**
	 * PUBLIC FUNCTIONS
	 */
	
	this.LineHandler = function(lineOfPDB)
	{
		current_line = lineOfPDB;
		//Handles the HEADER record
        if(current_line.startsWith(HEADER))
        {
            HeaderHandler();
        }
        else if(current_line.startsWith(TITLE))
        {
            TitleHandler();
        }
        else if(current_line.startsWith(AUTHORS))
        {
            AuthorHandler();
        }
        else if(current_line.startsWith(ATOM) || current_line.startsWith(HETATM))
        {
           AtomHandler();
        }
	}
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	
	function HeaderHandler()
	{
		var line = current_line;
		var len = line.length;
		var pdbHeader = new PDBHeader();
		if(len > 10) 
		{
			pdbHeader.classification = line.substring(10, Math.min(line.length,50)).trim();
		}
		if(len > 50) 
		{
			pdbHeader.depDate = new Date(line.substring (50, Math.min(len,59)).trim()) ;
		}
		if(len > 62) 
		{
			pdbHeader.pdbId  = line.substring (62, Math.min(len,66)).trim() ;
			console.log("Parsing entry " + pdbHeader.pdbId);
			
			self.structure.pdbHeader = pdbHeader;
			self.structure.pdb_id;
		}
		
		//For very old pdb entries
		if (len > 66) 
		{
			if (pdbHeader.pdbId === (line.substring (72, 76)))
			{
				self.structure.legacyFormat = true;
				System.out.println(pdbId + " is a LEGACY entry - this will most likely not parse correctly.");
			}
		}
		
	}

	function TitleHandler() 
	{
		/** Handler for
		*TITLE Record Format
		*
		*COLUMNS        DATA TYPE       FIELD          DEFINITION
		*----------------------------------------------------------------------------------
		*1 -  6        Record name     "TITLE "
		*9 - 10        Continuation    continuation   Allows concatenation of multiple
		*records.
		*11 - 70        String          title          Title of the experiment.
		*/
		var 	title;
		var line =  current_line;
		var len = 	line.length;
		
		if ( len > 79)
		{
			title = line.substring(10,80).trim();
		}
		else
		{
			title = line.substring((Math.min(10,len),len)).trim();
		}

		var 	header = self.structure.pdbHeader;
		var 	t = null;
		
		//Assign PDB title to the Header variable of the self.structure
		if(header != null)
		{
			t = self.structure.pdbHeader.title;
		}
		else
		{
	        self.structure.pdbHeader = new PDBHeader();		
		}
		
		if ( (t != null) && (t !== "") )
		{
			if (t.endsWith("-")) 
			{
				t += ""; // if last line ends with a hyphen then we don't add space
			}
			else 
			{
				t += " ";
			}
		}
		else 
		{
			t = "";
		}
		
		t += title;
		
		self.structure.pdbHeader.title = t;
	}

	function AuthorHandler() 
	{
		var line =  current_line;
		var authors = line.substring(10).trim();

		var auth = pdbHeader.Authors;
		if (auth == null)
		{
			pdbHeader.authors = authors;
		} else 
		{
			auth +=  authors;
			pdbHeader.authors = auth;
		}

	}

	function AtomHandler()	
	{
		//FORMAT:
		//      1         2         3         4         5         6
		//012345678901234567890123456789012345678901234567890123456789
		//ATOM      1  N   MET     1      20.154  29.699   5.276   1.0
		//ATOM    112  CA  ASP   112      41.017  33.527  28.371  1.00  0.00
		//ATOM     53  CA  MET     7      23.772  33.989 -21.600  1.00  0.00           C
		//ATOM    112  CA  ASP   112      37.613  26.621  33.571     0     0

		var line = current_line;
		var len = line.length;
		// build up chains first.
		// headerOnly just goes down to chain resolution.
		
		var chain_id      = line.substring(21,22);
		var myChain = new Chain(self.structure,chain_id);
		if(!self.structure.hasChain(chain_id))
		{
			self.structure.addChain(myChain);
		}
		else
		{
			myChain = self.structure.getChain(chain_id);
		}
		// process group data:
		var groupCode3     = line.substring(17,20);
		var resNum  = line.substring(22,26).trim();
		var iCode = line.substring(26,27).charAt(0);
		if ( iCode == ' ')
		{
			iCode = null;
		}
		
		var myGroup = new Group(myChain,parseInt(resNum),iCode, groupCode3);
		if(!myChain.hasGroup(myGroup.resNum.seqNum))
		{
			//Rethink of that... Maybe taking too much memory?
			//Try to link the array with the one already in memory for the self.structure
			myChain.addGroup(myGroup);
		}
		else
		{
			myGroup = myChain.getGroup(myGroup.resNum.seqNum);
		}

		if (atomCount >= self.load_max_atoms) 
		{
			console.log("more than " + self.load_max_atoms + " atoms in this structure, ignoring the SEQRES lines");
			/**
			 * DO SOMETHING HERE
			 */
			return;
		}
		
		var fullname = line.substring(12, 16);
		var pdbnumber = parseInt(line.substring (6, 11).trim());
		var coords = extractCoordinatesFromLine();
		var element = extractElementFromLine();
		
		var myAtom = new Atom(myGroup,fullname.trim(),element,coords);
		myAtom.pdbserial = pdbnumber ;
		myAtom.occupancy = extractOccupancyFromLine();
		myAtom.bfactor = extractBfactorFromLine();
		
		//CHECK IF IT IS A ALTERNATE ATOM
		var altLoc   = line.substring(16, 17).charAt(0);
		if ( altLoc != " ") 
		{
			var found = false;
			for(var i = 0; i < myGroup.atoms.length; i++)
			{
				if(myGroup.atoms[i].name == myAtom.name)
				{
					myGroup.atoms[i].addAltLoc(myAtom);
					found = true;
					break;
				}		
			}
			if(!found)
			{
				myGroup.addAtom(myAtom);
				atomCount++;
			}
		}
		else
		{
			myGroup.addAtom(myAtom);
			atomCount++;
		}
		
		/**
		 * PRIVATE FUNCTION
		 */
		function extractCoordinatesFromLine()
		{
			var x = parseFloat(line.substring (30, 38).trim());
			var y = parseFloat(line.substring (38, 46).trim());
			var z = parseFloat(line.substring (46, 54).trim());
			return [x,y,z];
		}
		
		function extractElementFromLine()
		{
			var el = "X";
			if ( line.length > 77 ) 
			{
				// parse element from element field
				el = line.substring (76, 78).trim();
			} 
			else 
			{
				// parse the name from the atom name
				var elementSymbol = null;
				// for atom names with 4 characters, the element is
				// at the first position, example HG23 in Valine
				if (fullname.trim().length == 4) 
				{
					elementSymbol = fullname.substring(0, 1);
				} 
				else if ( fullname.trim().length > 1)
				{
					elementSymbol = fullname.substring(0, 2).trim();
				} 
				else 
				{
					// unknown element...
					elementSymbol = "X";
				}
				el = elementSymbol;
				
			}
			if(el.length  == 2)
			{
				el = el[0].toUpperCase() + el[1].toLowerCase();
			}
			return el;
		}
		
		function extractOccupancyFromLine()
		{
			var occ = 1.0;
			if (line.length > 59 ) 
			{
				occ = parseFloat(line.substring (54, 60).trim());
			}
			return occ;
		}
		
		function extractBfactorFromLine()
		{
			var Bfactor = 0.0;
			if ( line.length > 65) 
			{
				Bfactor = parseFloat(line.substring (60, 66).trim());
			}
			return Bfactor;
		}
		
	}
}
/**
 * @function
 * This function is the dispatcher of every line to its
 * corresponding handler
 * @param lines
 * This is an array of lines that were split by '\n'
 */
function getTimeStamp()
{
	var cal = new Date();
	// Get the components of the time
	var time = "time: "+cal;
	return time ;
}

/**
 * @param progressBar
 * Optional: pass the DOM element progress bar as an argument if you want to see the loading progress
 */
function BuildStructure(structureName,lines,onStructureReady,progressBar)
{
	var StartDate = new Date();
	var StartTime = StartDate.getTime();
	var parser = new PDBFileParser();
	parser.structure.name = structureName;
	if(progressBar !== undefined){progressBar.show();}
	/**
	 * CONSTRUCTOR
	 */
	

	var ProcessData = function(lineOfText)
	{
		parser.LineHandler(lineOfText);
	}
	var ProcessDone = function()
	{
		parser.structure.finalizeStructure(6,0.3); //calling a 6 as argument will prevent finding cycle > 6 members
	    var EndDate = new Date();
		var EndTime = EndDate.getTime();
		console.log("Built Structure in "+((EndTime - StartTime) /1000) + " seconds")
	    onStructureReady(parser.structure);
	};
	var startAt = 0;
	
	InterruptedLoop(ProcessData,lines,startAt,0, ProcessDone, progressBar);
	
	/**
     * PRIVATE FUNCTIONS
     */
	
	
}

function PDBHeader()
{
	this.classification = null;
    this.title = null;
    this.description = null;
    this.idCode = null;
    this.depDate = new Date();
    this.modDate = new Date();
	this.resolution = 99.0; //this is DEFAULT RESOLUTION
	this.rFree = 1.0;  // THIS IS DEFAULT R-FREE
	this.bioAssemblies = null; //will be new HashMap<Integer, BioAssemblyInfo>()
	this.crystallographicInfo = null; // will be new PDBCrystallographicInfo()
    this.authors = null;
	/**
	 * To be implemented, but not necessary for now.
	 * 
	 * this.toPDB = function()
     * {
     *     var buf = new StringBuffer();
     *	   printHeader(buf);
	 *	   printTitle(buf);
	 *	   printExpdata(buf);
	 *	   printAuthors(buf);
	 *	   printResolution(buf);
     * }
	 */
}

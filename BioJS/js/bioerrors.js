const BIOERRORS =
{
		//THESE ARE THE LOGTYPES
		LOG_TO_CONSOLE : "console", // shows the error to the console.log(error);
		LOG_TO_ALERT : "alert", // displays error in a window.alert(error);
		LOG_TO_INFO : "info", // shows errors in a InfoDialog(error); as defined in domutils.js;
		LOG_TO_INTERNAL : "internal", // does not show any errors, keep errors in a internal structure
		
		//THESE ARE THE ERRORTYPES
		CUSTOM : "CUSTOM",
		BONDING : "BONDING",
		ANGLE : "ANGLE",
		NAME: "NAME",
		FF: "FORCE FIELD",
		TORSION : "TORSION",
		HYBRIDIZATION : "HYBRIDIZATION",
		COORDINATES : "COORDINATES",
		ATOM : "ATOM",
		GROUP : "GROUP",
		AMINOACID :"AMINOACID",
		STRUCTURE: "STRUCTURE",
		PID : "PID",
		PDB : "PDB",
		
		takeAction : function(log_type,message)
		{
			if(log_type === BIOERRORS.LOG_TO_CONSOLE)
			{
				console.log(message);
			}
			else if(log_type === BIOERRORS.LOG_TO_ALERT)
			{
				alert(message);
			}
			else if(log_type === BIOERRORS.LOG_TO_INFO)
			{
				InfoDialog(message,"I UNDERSTAND");
			}
			else if(log_type === BIOERRORS.LOG_TO_INTERNAL)
			{
				//DO SOMETHING HERE?;
			}
		}
};	

/**
 * GOAL: a way of finding errors when building structure. It can be errors
 * arising from bad use from programmer OR from PDB files that are wrong
 * @param logtype
 * when this error is triggered, how to tell the user it happenned
 * @param errortype
 * the type of errors this is. It is used to displayed a pre-coded error message
 * @param objects
 * the objects that are causing the error
 * @param customMessage
 * A specific message describing the error type in details
 */
function BioError(logtype,errortype,objects,customMessage)
{
	var self = this;
	var log_type = logtype;
	var error_type = errortype;
	var objects = objects;
	var errorMessage = getErrorMessage();
	BIOERRORS.takeAction(logtype,errorMessage);
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	
	function getErrorMessage()
	{
		var message = " (";
		for(var i = 0; i < objects.length; i++)
		{
			var object = objects[i];
			var desc = object.errorlog || typeof object;
			if(i == objects.length-1)
			{
				message += desc+") ";
			}
			else
			{
				message += desc+",";
			}
		}
		return error_type.toUpperCase()+" ERROR: "+(message)+(customMessage||"No Description logged");
	};
	/**
	 * PUBLIC FUNCTIONS
	 */
	this.getErrorMessage = function()
	{
		return errorMessage;
	}
	this.getErrorType = function()
	{
		return error_type;
	}
}
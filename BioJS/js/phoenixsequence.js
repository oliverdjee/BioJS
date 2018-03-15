function BioSequence() 
{
	var self = this;
	
	const SEPARATOR = " | ";
	const POSITIVE_STATE = 1;
	const NEGATIVE_STATE = -1;
	
	this.sequence;
	this.rank;
	this.type; //WT or MUTANT
	
	this.energy 			= Number.NaN;
	this.residuesPID 		= Number.NaN;
	this.structure 			= Number.NaN;
	this.minEnergy 			= Number.NaN;
	this.HBondEnergy 		= Number.NaN;
	this.PbEnergy 			= Number.NaN;
	this.SSpropEnergy 		= Number.NaN;
	this.ElecEnergy 		= Number.NaN;
	this.VdwEnergy 			= Number.NaN;
	this.HbEnergy 			= Number.NaN; //hydrophobic buried
	this.HeEnergy 			= Number.NaN; //hydrophobic exposed
	this.totalEnergy 		= Number.NaN;
	this.boltzEnergy 		= Number.NaN;
	this.wtEnergy 			= Number.NaN;
	this.deltawtEnergy 		= Number.NaN;
	
	var isEmpty 			= true;
	var state 				= 0;
	var visited 			= false;
	var E_Map;
	
	/**
	 * Clones a sequence object
	 */
	this.clone = function(sequence)
	{
		self.sequence = sequence.sequence;
		self.energy=sequence.energy;			
		self.rank=sequence.rank;			
		self.type=sequence.type;		
		self.residuesPID=sequence.residuesPID;	
		self.structure=sequence.structure;
		self.boltzEnergy=sequence.boltzEnergy;			
		self.minEnergy=sequence.minEnergy;
		self.deltawtEnergy=sequence.deltawtEnergy;
		self.wtEnergy=sequence.wtEnergy;
		self.E_Map = sequence.E_Map;
		self.state = sequence.state;
		self.visited = seq.visited;
		self.isEmpty = false;
	}
	this.init = function(structure, sequence, type, pids, options)
	{
		self.structure = structure;
		self.sequence = sequence;
		self.type = type;
		self.residuesPID = pids;
		self.isEmpty = false;
		self.energy = options.energy || Number.NaN;
		self.rank = options.rank || null;
	}
}					

/**
 * Goal: to get only the best sequences (20 possible,-> 20 amino acids)
 * per position of a PHOENIX calculation
 * @param sequences
 * 2D array: array of sequences object per position of the calculation
 * @param bufferPercent
 * Buffer to allow for cutoff in percentage. This makes the cutoff less stringent
 * since you allow energy of sequences to be energy + (energy*buffer)
 */
function applyPerPositionCutOff(sequences, bufferPercent) // BUFFER IN PERCENTAGE
{
	var Result = [];
	for(var i = 0 ; i < sequences.length; i++)
	{
		var pos = applyCutOff(sequences[i],bufferPercent);
		Result.push(pos);
	}
	return Result;
}

function applyPerPositionInverseCutOff(sequences, bufferPercent) // BUFFER IN PERCENTAGE
{
	var Result = [];
	for(var i = 0 ; i < sequences.length; i++)
	{
		var pos = applyInverseCutOff(sequences[i],bufferPercent);
		Result.push(pos);
	}
	return Result;
}

/**
 * Goal apply a cutoff to a list of energy ranked sequences in order to retrieve the best ones
 * @param sequences
 * array of BioSequence as described in phoenixsequence.js
 * @param bufferPercent
 * a buffer to allow more tolerance (in percentage)
 * @returns {Array}
 * returns an array of sequence as strings. Theses strings are the sequences that passed the 
 * cutoff test
 */
function applyCutOff(sequences, bufferPercent) // BUFFER IN PERCENTAGE
{
	var WTEnergy = Number.NaN;
	var Buffer = bufferPercent/100;
	var cutoff = Number.NaN;
	var result = [];
	for(var i = 0; i < sequences.length; i++)
	{
		var sequence=  sequences[i];
		if(sequence.type.includes("WT"))
		{
			WTEnergy = sequence.boltzEnergy;
		}
	}
	cutoff = WTEnergy - (WTEnergy*Buffer);
	for(var i = 0; i < sequences.length; i++)
	{
		var sequence=  sequences[i];
		if(sequence.boltzEnergy <= cutoff)
		{
			result.push(sequence.sequence);
		}
	}
	
	return result;
}

function applyInverseCutOff(sequences, bufferPercent) // BUFFER IN PERCENTAGE
{
	var position = sequences[i];
	var WTEnergy = Number.NaN;
	var Buffer = bufferPercent/100;
	var cutoff = Number.NaN;
	var pos = "";
	
	for(var x = 0; x < position.length; x++)
	{
		var sequence=  position[x];
		if(sequence.type.includes("WT"))
		{
			WTEnergy = sequence.boltzEnergy;
		}
	}
	cutoff = WTEnergy - (WTEnergy*Buffer);
	for(var x = 0; x < position.length; x++)
	{
		var sequence=  position[x];
		if(sequence.boltzEnergy > cutoff)
		{
			Result.push(pos);
		}
	}
	
	return Result;
}
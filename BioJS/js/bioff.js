/**
 * GOAL: this is a general force field. To use this class, you need to add energy terms. Then you
 * call the compute energy function to get an energy value for an atom based the energy terms
 * that were added to the forcefield. You can also add EHterms for hbonding energies when protonating
 * a molecule and to not require full optimization but local h-bond optimization. The function OptimizeHbond
 * can be called and the H atom will be rotated around its parent bonding axis to optimize the energy based
 * on the EHterms you added to the forcefield. Those can be different than the normal forcefield, or the same.
 * You set both variables independently
 */
function ForceField(ffparameters) {
	var Eterms = [];
	var EHterms = [];
	this.params = ffparameters;
	var granularity = 10; // default of 10 degree bins
	this.name = ffparameters.name || 'Default Name';
	this.errorlog = this.name;
	/**
	 * @param intNum
	 * This is an integer number for the optimization procedures. This will allow rotation around
	 * axis for optimization of energy for each intNum degrees. The lower it is the more fine
	 * the optimization is, but the the longer it takes...
	 */
	this.setGranularity = function(intNum) {
		granularity = intNum;
	};

	this.addEterm = function(energy_term) {
		Eterms.push(energy_term);
	};
	this.addEHterm = function(Hbondenergy_term) {
		EHterms.push(Hbondenergy_term);
	};

	/**
	 * REQUIRED FUNCTIONS
	 */
	this.ComputeEnergy = function(atom) {
		var totalE = 0;
		for (var i = 0; i < Eterms.length; i++) {
			totalE += Eterms[i].ComputeEnergy(atom);
		}
		return totalE;
	};

	this.OptimizeHbond = function(Hatom, granularity) {
		if (Hatom.getFunctionalGroup() !== 'Hb') {
			return;
		}
		var bestEnergy = 0;
		var bestAngle = 0;
		for (var i = 0; i < EHterms.length; i++) {
			bestEnergy += EHterms[i].ComputeEnergy(Hatom);
		}

		var Axis = getRotatableHbondAxis(Hatom.structure.atoms[Hatom.bonds[0]]);
		if (Axis === null) {
			return;
		}
		var deviation = granularity || 10;
		deviation = getAllowedGranularity(Axis, deviation);

		for (var i = 1; i <= 360 / deviation; i++) {
			RotateAtoms(Axis.axis, Axis.system, Axis.offset, deviation / 360 * 2 * Math.PI);
			var totalE = 0;
			for (var z = 0; z < EHterms.length; z++) {
				totalE += EHterms[z].ComputeEnergy(Hatom);
			}
			if (totalE < bestEnergy) {
				bestEnergy = totalE;
				bestAngle = i * deviation;
			}
		}
		RotateAtoms(Axis.axis, Axis.system, Axis.offset, bestAngle / 360 * 2 * Math.PI);
	};

	this.getType = function(atom) {
		return self.params.getType(atom);
	};

	/**
	 * Goal: find the axis of rotation for optimizing Hbond, only if the
	 * donor atom is free to rotate (not more that one non-H bond and not SP2 bonded)
	 * @param HetAtom
	 * the heteroAtom object (bioatom.js) that is being queried
	 * @returns {Array}
	 * return [	
	 * 			[axisX,axisY,axisZ],
	 * 			[atomToRotate1,atomToRotate2,atomToRotate3,etc...,
	 * 			[offsetX,offsetY,offsetZ]
	 * 		  ]
	 */
	function getRotatableHbondAxis(HetAtom) {
		var atoms = HetAtom.structure.atoms;
		var axis = [];
		var system = [];
		var bonds = HetAtom.bonds;
		var hyb = null;
		for (var i = 0; i < HetAtom.bonds.length; i++) {
			var bond = HetAtom.bonds[i];
			var atom = atoms[bond];
			if (atom.element === 'H') {
				system.push(atom);
			} else {
				axis.push(atom.coords);
				hyb = atom.hybridization;
			}
		}
		if (axis.length === 1 && system.length > 0) {
			return {
				axis: GEOMETRY.SubstractVectors(axis[0], HetAtom.coords),
				system: system,
				offset: HetAtom.coords,
				hybridization: hyb
			};
		} else {
			return null;
		}
	}

	function getAllowedGranularity(Atomaxis, deviation) {
		var angles = [ 0 ];
		if (Atomaxis.hybridization === 'SP2') {
			return 180;
		} else if (Atomaxis.hybridization === 'SP') {
			return 0;
		} else {
			return deviation;
		}
	}
}

function PhoenixHbondTerm() {
	var self = this;
	this.HbondReq = 2.8;
	const sp3AngleRads = 109.5 / 360 * 2 * Math.PI;
	this.HbondWellDepth = 8.0; //
	this.cutoff = 3.5;

	/**
	 * REQUIRED FUNCTIONS
	 */
	this.ComputeEnergy = function(atom) {
		var totalE = 0;
		var system = getHbondSystems(atom);
		if (system.length != 0) {
			for (var x = 0; x < system.length; x++) {
				var E = ComputeHbondSystem(system[x].acceptor, system[x].H, system[x].donor);
				totalE += E;
			}
		}
		return totalE;
	};

	/**
	 * PUBLIC FUNCTIONS
	 */
	this.setCutoff = function(num) {
		self.cutoff = num;
	};

	/**
	 * PRIVATE FUNCTION
	 */

	/**
	 * Goal: find the H-bonding systems to the H atom queried;
	 * @param Hatom
	 * The Hatom queried for Hbond term. It is an atom object as described in
	 * bioatom.js
	 * @returns {Array}
	 * returns a 2D array of named array {acceptor:acceptor,H:Hatom,donor:donor}.
	 * Each top level named array is a potential H-bond system from the queried "H";
	 */
	function getHbondSystems(Hatom) {
		if (Hatom.element !== 'H') {
			return [];
		}
		if (Hatom.bonds.length < 1) {
			return [];
		}

		var atoms = Hatom.structure.atoms;
		var donor = atoms[Hatom.bonds[0]];
		var acceptors = [];
		var systems = [];
		var nearHatoms = nearAtoms(donor, self.cutoff);
		for (var i = 0; i < nearHatoms.length; i++) {
			var atom = atoms[nearHatoms[i]];
			if (atom.id == donor.id || atom.id == Hatom.id) {
				continue;
			}
			if (atom.element === 'O' || atom.element === 'N') {
				acceptors.push(atom);
			}
		}
		for (var i = 0; i < acceptors.length; i++) {
			var system = { acceptor: acceptors[i], H: Hatom, donor: donor };
			systems.push(system);
		}
		return systems;
	}

	function ComputeHbondSystem(acceptor, Hatom, donor) {
		var theta = ComputeTheta(acceptor, Hatom, donor);
		var phi = ComputePhi(acceptor, Hatom);
		var psi = ComputePsi(acceptor, donor, Hatom);
		var R = ComputeDistance(donor, acceptor);
		var F = ComputeAngleTerm(theta, phi, psi, acceptor, donor);
		if (F === null) {
			new BioError(
				BIOERRORS.LOG_TO_CONSOLE,
				BIOERRORS.CUSTOM,
				[ acceptor, Hatom, donor ],
				'Cannot compute angle dependency of Hbonding Energy for these atoms'
			);
			return 0;
		}
		return self.HbondWellDepth * (5 * Math.pow(self.HbondReq / R, 12) - 6 * Math.pow(self.HbondReq / R, 10)) * F;
	}

	function ComputeDistance(acceptor, donor) {
		return getAtomDistance(donor, acceptor);
	}
	function ComputeTheta(acceptor, Hatom, donor) {
		return AngleBetweenAtoms(acceptor, Hatom, donor, 'radians');
	}
	function ComputePhi(acceptor, Hatom) {
		var bonds = acceptor.bonds;
		var angle = 0;
		var len = 0;
		for (var i = 0; i < bonds.length; i++) {
			var atom = acceptor.structure.atoms[bonds[i]];
			angle += AngleBetweenAtoms(atom, acceptor, Hatom, 'radians');
			len++;
		}
		return angle / len;
	}
	function ComputePsi(acceptor, donor, Hatom) {
		if (donor.hybridization === 'SP2' && acceptor.hybridization === 'SP2') {
			var bonds1 = acceptor.bonds;
			var atoms1 = [];
			atoms1.push(acceptor);
			for (var i = 0; i < bonds1.length; i++) {
				atoms1.push(acceptor.structure.atoms[bonds1[i]]);
			}
			var bonds2 = donor.bonds;
			var atoms2 = [];
			atoms2.push(donor);
			for (var i = 0; i < bonds2.length; i++) {
				var otherAtom = donor.structure.atoms[bonds2[i]];
				if (otherAtom.id == Hatom.id) {
					continue;
				}
				atoms2.push(otherAtom);
			}
			if (atoms1.length >= 3 && atoms2.length >= 3) {
				return Math.abs(
					TorsionBetweenAtomPlanes(
						atoms1[0],
						atoms1[1],
						atoms1[2],
						atoms2[0],
						atoms2[1],
						atoms2[2],
						'radians'
					)
				);
			}
		}
		return null;
	}

	function ComputeAngleTerm(theta, phi, psi, acceptor, donor) {
		F = null;
		if (donor.hybridization === 'SP2' && acceptor.hybridization === 'SP2') {
			F = Math.pow(Math.cos(theta), 2) * Math.pow(Math.cos(Math.max(phi, psi)), 2);
		} else if (donor.hybridization === 'SP3' && acceptor.hybridization === 'SP2') {
			F = Math.pow(Math.cos(theta), 2) * Math.pow(Math.cos(phi), 2);
		} else if (donor.hybridization === 'SP2' && acceptor.hybridization === 'SP3') {
			F = Math.pow(Math.cos(theta), 4);
		} else if (donor.hybridization === 'SP3' && acceptor.hybridization === 'SP3') {
			F = Math.pow(Math.cos(theta), 2) * Math.pow(Math.cos(phi - sp3AngleRads), 2);
		}
		return F;
	}
}

function PhoenixVdwTerm() {
	var self = this;
	this.HbondReq = 2.8;
	const ff = new DreidingParams();
	this.HbondWellDepth = 8.0; //
	this.cutoff = 5;
	this.scaleFactor = 0.9;

	/**
	 * REQUIRED FUNCTIONS
	 */
	this.ComputeEnergy = function(atom) {
		var totalE = 0;

		var near = nearAtoms(atom, self.cutoff); // get near atom ids at 5Ang by default
		for (var i = 0; i < near.length; i++) {
			if (near[i] == atom.id || containsKey(atom.bonds, near[i])) {
				continue;
			}
			var atom2 = atom.structure.atoms[near[i]];
			var R = getAtomDistance(atom, atom2);
			//GEOMETRIC MEAN for both atoms' R0 and D0
			var R01 = atom.R0 || ff.getR0(atom.fftype);
			var R02 = atom2.R0 || ff.getR0(atom2.fftype);
			var R0 = Math.sqrt(R02 * R01);
			//var R0 = 2*Math.sqrt(
			//				ELEMENTS.getVdwRadius(atom.element) *
			//				ELEMENTS.getVdwRadius(atom2.element));
			var D01 = atom.D0 || ff.getD0(atom.fftype);
			var D02 = atom2.D0 || ff.getD0(atom2.fftype);
			var D0 = Math.sqrt(D01 * D02);
			var LN = self.scaleFactor * R0 / R;
			totalE += D0 * (Math.pow(LN, 12) - 2 * Math.pow(LN, 6));
		}
		return totalE;
	};

	/**
	 * PUBLIC FUNCTIONS
	 */

	this.setScaleFactor = function(num) {
		if (num < 0.8 || num > 1.1) {
			new BioERROR(
				BIOERRORS.FF,
				[ self ],
				'Careful!! Scaling Factor for Dreiding FF might be too low or too strong'
			);
		}
		self.scaleFactor = num;
	};

	this.setCutoff = function(num) {
		self.cutoff = num;
	};
}

function DreidingParams() {
	this.name = 'dreiding';
	const Accepted = [
		'H',
		'B',
		'C',
		'N',
		'O',
		'F',
		'Na',
		'Al',
		'Si',
		'Ga',
		'Ge',
		'Se',
		'Sn',
		'Te',
		'Sb',
		'As',
		'In',
		'P',
		'S',
		'Cl',
		'Br',
		'I',
		'Ca',
		'Fe',
		'Mn',
		'Ti',
		'Zn',
		'Ru'
	];

	//X: [0] = Vdw Well Depth (D0) in kcal/mol
	//	 [1] = Vdw Radius at eq (R0} in Angstrom
	const Params = {
		H_: [ 0.0152, 3.2 ],
		H___HB: [ 0.0152, 2.4 ],
		B_3: [ 0.095, 4.02 ],
		B_2: [ 0.095, 4.02 ],
		C_3: [ 0.095, 3.88 ],
		C_2: [ 0.095, 3.88 ],
		C_R: [ 0.095, 3.88 ],
		C_1: [ 0.095, 3.88 ],
		N_3: [ 0.145, 3.695 ],
		N_2: [ 0.145, 3.695 ],
		N_1: [ 0.145, 3.695 ],
		N_R: [ 0.145, 3.695 ],
		O_R: [ 0.215, 3.51 ],
		O_2: [ 0.215, 3.51 ],
		O_3: [ 0.215, 3.51 ],
		F_: [ 0.305, 3.285 ],
		Na: [ 0.5, 3.144 ],
		Mg: [ 0.5, 2.9 ], // added By @Author Olivier Gagnon. Not described in the FF (based on Mg covalent Radii (1.45A) and Na Well Depth (0.5_)
		Al3: [ 0.065, 4.615 ],
		Si3: [ 0.095, 4.435 ],
		Ga3: [ 0.4, 4.39 ],
		Ge3: [ 0.4, 4.27 ],
		As3: [ 0.41, 4.15 ],
		Se3: [ 0.43, 4.03 ],
		In3: [ 0.55, 4.59 ],
		Sn3: [ 0.55, 4.47 ],
		Sb3: [ 0.55, 4.35 ],
		Te3: [ 0.57, 4.23 ],
		P_3: [ 0.215, 4.295 ],
		S_3: [ 0.215, 4.14 ],
		Cl: [ 0.305, 3.915 ],
		Br: [ 0.305, 4.215 ],
		I_: [ 0.51, 4.15 ],
		Ca: [ 0.05, 3.472 ],
		Ti: [ 0.055, 4.54 ],
		Mn: [ 0.055, 4.54 ],
		Fe: [ 0.055, 4.54 ],
		Zn: [ 0.055, 4.54 ],
		Ru: [ 0.055, 4.54 ]
	};
	this.getD0 = function(dreidingType) {
		if (dreidingType === undefined) {
			console.log(dreidingType);
		}
		return Params[dreidingType][0];
	};
	this.getR0 = function(dreidingType) {
		return Params[dreidingType][1];
	};
	this.getType = function(atom) {
		var element = atom.element;
		var arom = atom.isAromatic();
		var hyb = atom.hybridization;
		var deloc = atom.deloc !== null ? true : false;
		var fg = atom.Htype || null;

		if (!containsKey(Accepted, element)) {
			atom.structure.LogError(
				new BioError(
					BIOERRORS.LOG_TO_CONSOLE,
					BIOERRORS.FF,
					[ self ],
					'Cannot Assign Dreiding Atom Type, Element unrecognize'
				)
			);
		} else if (element === 'H' && fg === 'Hb') {
			//In order of priorities
			return 'H___HB';
		} else if (element === 'H') {
			return 'H_';
		} else if (element === 'F') {
			return 'F_';
		} else if (element === 'Na') {
			return 'Na';
		} else if (element === 'Al' && hyb == 'SP3') {
			return 'Al3';
		} else if (element === 'Si' && hyb == 'SP3') {
			return 'Si3';
		} else if (element === 'Ga' && hyb == 'SP3') {
			return 'Ga3';
		} else if (element === 'Ge' && hyb == 'SP3') {
			return 'Ge3';
		} else if (element === 'As' && hyb == 'SP3') {
			return 'As3';
		} else if (element === 'Se' && hyb == 'SP3') {
			return 'Se3';
		} else if (element === 'In' && hyb == 'SP3') {
			return 'In3';
		} else if (element === 'Sn' && hyb == 'SP3') {
			return 'Sn3';
		} else if (element === 'Sb' && hyb == 'SP3') {
			return 'Sb3';
		} else if (element === 'Te' && hyb == 'SP3') {
			return 'Te3';
		} else if (element === 'P' && hyb == 'SP3') {
			return 'P_3';
		} else if (element === 'S' && hyb == 'SP3') {
			return 'S_3';
		} else if (element === 'Cl') {
			return 'Cl';
		} else if (element === 'I') {
			return 'I_';
		} else if (element === 'Br') {
			return 'Br';
		} else if (element === 'Ca') {
			return 'Ca';
		} else if (element === 'Mg') {
			return 'Mg';
		} else if (element === 'Ti') {
			return 'Ti';
		} else if (element === 'Mn') {
			return 'Mn';
		} else if (element === 'Fe') {
			return 'Fe';
		} else if (element === 'Zn') {
			return 'Zn';
		} else if (element === 'Ru') {
			return 'Ru';
		} else if (element === 'C' && deloc === true) {
			//In order of priorities
			return 'C_R';
		} else if (element === 'C' && hyb === 'SP2') {
			return 'C_2';
		} else if (element === 'C' && hyb === 'SP') {
			return 'C_1';
		} else if (element === 'C' && hyb === 'SP3') {
			return 'C_3';
		} else if (element === 'N' && deloc === true) {
			return 'N_R';
		} else if (element === 'N' && hyb === 'SP2') {
			return 'N_2';
		} else if (element === 'N' && hyb === 'SP') {
			return 'N_1';
		} else if (element === 'N' && hyb === 'SP3') {
			return 'N_3';
		} else if (element === 'O' && deloc === true) {
			return 'O_R';
		} else if (element === 'O' && hyb === 'SP2') {
			return 'O_2';
		} else if (element === 'O' && hyb === 'SP3') {
			return 'O_3';
		} else {
			atom.structure.LogError(
				new BioError(
					BIOERRORS.LOG_TO_CONSOLE,
					BIOERRORS.FF,
					[ self ],
					'Cannot Assign Dreiding Atom Type, Element recognized, but do not match any records'
				)
			);
		}
	};
}

function FunctionalGroupHandler() {
	var self = this;
	const PKAS = {
		//ACIDS
		ArCOOH: 4.0,
		RCOOH: 4.76,
		RCO3H: 3.6,
		ROH: 16,
		ArOH: 10,
		RSO3H: -2.6,
		ArSO2H: 2.1,
		ArSH: 7,
		OPO3H: 6.5,
		OPO3H2: 2.1,
		OPO3H3: -2,
		//BASES
		RNH: 50,
		RNH2: 35,
		RNH3: 10.6,
		R2NH2: 11,
		R2NH: 35,
		R3NH: 10.75,
		ArNH3: 4.6,
		ArNH2: 31,
		NCNH2NH2: 13.6, //Guanidine
		R3PH: 9.1,
		RPH3: 2.7,

		//Cycles
		HNAr: 9.2, //Pyridine
		CNHCNHC: 6.95, //Histidine
		CNHCNC: 23 //Histidine
	};

	this.pKa = function(_atom) {
		var myElem = _atom.element;
		if (myElem == 'C' || myElem == 'H') {
			return null;
		}
		var fg = self.getFunctionalGroup(_atom);
		if (fg === null) {
			return null;
		}

		var aromatics = 0;
		var rings = 0;
		var doublebonds = 0;
		var nNum = 0;
		var cNum = 0;
		var sNum = 0;
		var oNum = 0;
		var pNum = 0;
		var charges = 0;
		for (var i = 0; i < fg.length; i++) {
			var atom = fg[i];
			var element = atom.element;
			if (element == 'C') {
				cNum++;
			} else if (element == 'N') {
				nNum++;
			} else if (element == 'O') {
				oNum++;
			} else if (element == 'P') {
				pNum++;
			} else if (element == 'S') {
				sNum++;
			}

			if (atom.isAromatic()) {
				aromatics += 1 / atom.ring.length;
			}
			doublebonds += atom.doublebonds.length;
			if (atom.inRing()[0] == true) {
				rings++;
			}
		}

		if (
			aromatics === 0 &&
			rings === 0 &&
			doublebonds === 2 &&
			nNum === 0 &&
			cNum === 1 &&
			sNum === 0 &&
			oNum === 2 &&
			pNum === 0
		) {
			return PKAS.RCOOH;
		} else if (
			aromatics === 0 &&
			rings === 0 &&
			doublebonds === 0 &&
			nNum === 1 &&
			cNum === 1 &&
			sNum === 0 &&
			oNum === 0 &&
			pNum === 0
		) {
			return PKAS.RNH3;
		} else if (
			aromatics === 0 &&
			rings === 0 &&
			doublebonds === 0 &&
			nNum === 1 &&
			cNum === 2 &&
			sNum === 0 &&
			oNum === 0 &&
			pNum === 0
		) {
			return PKAS.R2NH2;
		} else if (
			aromatics === 0 &&
			rings === 0 &&
			doublebonds === 0 &&
			nNum === 1 &&
			cNum === 3 &&
			sNum === 0 &&
			oNum === 0 &&
			pNum === 0
		) {
			return PKAS.R3NH;
		} else if (
			aromatics === 0 &&
			rings === 0 &&
			doublebonds === 2 &&
			nNum === 3 &&
			cNum > 0 &&
			cNum <= 2 &&
			sNum === 0 &&
			oNum === 0 &&
			pNum === 0
		) {
			return PKAS.NCNH2NH2;
		} else if (
			aromatics === 1 &&
			rings === 5 &&
			doublebonds === 4 &&
			nNum === 2 &&
			cNum === 3 &&
			sNum === 0 &&
			oNum === 0 &&
			pNum === 0
		) {
			// guanidine
			return PKAS.CNHCNHC;
		} else if (
			aromatics === 1 &&
			rings === 6 &&
			doublebonds === 6 &&
			nNum === 1 &&
			cNum === 5 &&
			sNum === 0 &&
			oNum === 0 &&
			pNum === 0
		) {
			// histidine ring
			return PKAS.HNAr;
		} else if (
			aromatics === 1 &&
			rings === 6 &&
			doublebonds === 6 &&
			nNum === 0 &&
			cNum === 6 &&
			sNum === 0 &&
			oNum === 1 &&
			pNum === 0
		) {
			//pyridine
			return PKAS.ArOH;
		} else if (
			aromatics === 0 &&
			rings === 0 &&
			doublebonds === 0 &&
			nNum === 0 &&
			cNum === 1 &&
			sNum === 0 &&
			oNum === 1 &&
			pNum === 0
		) {
			return PKAS.ROH;
		} else if (
			aromatics === 0 &&
			rings === 0 &&
			doublebonds >= 2 * pNum &&
			nNum === 0 &&
			sNum === 0 &&
			oNum >= 3 * pNum &&
			pNum > 0
		) {
			return PKAS.OPO3H;
		} else {
			return null;
		}
	};

	this.getFunctionalGroup = function(atom) {
		var fg = atom.fg;
		if (fg === null) {
			return null;
		}
		var FGatoms = [];
		for (var i = 0; i < atom.fg.length; i++) {
			FGatoms.push(atom.structure.atoms[fg[i]]);
		}
		return FGatoms;
	};

	/**
	 * Goal: This function searches through all HetAtoms to find Functional groups.
	 * Usually, these FGs are made of HetAtoms mainly with addition of Aromatic rings 
	 * and double bond delocalisation. The Idea here is to find hetatom groups that are 
	 * separated by AT MOST 1 Carbon atom that IS NOT SP2 (double bond implied here).
	 * By "re-running" this function, you could also merge simple FGs to more complex FGs,
	 * But this is not implemented yet.
	 * @return
	 * returns an array of atom objects that are in the same FG
	 */
	this.assignFunctionalGroup = function(atom) {
		if (atom.element === 'H') {
			for (var i = 0; i < atom.bonds.length; i++) {
				var atom = atom.structure.atoms[atom.bonds[i]];
				if (ELEMENTS.getAtomicNumber(atom.element) >= 7) {
					atom.Htype = 'Hb';
				}
			}
			return;
		}
		//We only treat HetAtoms here
		if (atom.fg != null || atom.element === 'C') {
			return;
		}

		var fg = [ atom.id ];
		var results = DFS(atom.structure.atoms, atom, fg, true);
		for (var i = 0; i < fg.length; i++) {
			atom.structure.atoms[fg[i]].fg = fg;
		}

		/**
		 * PRIVATE FUNCTION
		 */
		function DFS(atoms, myatom, infg, continueifC) {
			var found = false;
			for (var i = 0; i < myatom.bonds.length; i++) {
				var next = atoms[myatom.bonds[i]];
				if (containsKey(infg, next.id)) {
					continue;
				}
				if (next.element !== 'C') {
					found = true;
					infg.push(next.id);
					found = DFS(atoms, next, infg, true);
				} else if (next.doublebonds.length > 0) {
					found = true;
					infg.push(next.id);
					found = DFS(atoms, next, infg, false);
				} else if (continueifC == true) {
					found = true;
					infg.push(next.id);
				}
			}
			return found;
		}
	};

	function WalkBonds(atom, previous) {
		var list = [];
		for (var i = 0; i < atom.bonds.length; i++) {
			var next = atom.structure.atoms[atom.bonds[i]];
			if (next.id !== previous.id && next.element !== 'H') {
				list.push(next);
			}
		}
		return list;
	}
}

function BioCharter(structure,element,height,width)
{
	var self = this;
	this.element = element;
	this.myChartArea = null;
	this.chart = null;
	
	this.createRamachandran = function(groups) 
	{
		self.element.innerHTML = "";
		
		var canvas = document.createElement("CANVAS");
		canvas.id = "biocharterRamachandranCanvas";
		
		canvas.height = height;
		canvas.width = width;
		
		self.element.appendChild(canvas);
		
		self.myChartArea = canvas.getContext("2d"); // Get the canvas element 
		
		var ChartData = {
	            datasets: [{
	                label: "Phi-Psi Data",
	                borderColor: "black",
	                backgroundColor: "dark grey",
	                data: GenerateData()
	            }]
	        };

		self.chart = new Chart.Scatter(self.myChartArea, {
	        data: ChartData,
	        options: {
	        	maintainAspectRatio: false,
	        	title: {
	                display: true,
	                text: "Ramachandran Plot ("+structure.name+")"
	            },
	            scales: {
	                yAxes: [{
	                    id: 'Psi Angle(Degree)',
	                    type: 'linear',
	                    ticks: {
	                        min: -180,
	                        max: 180
	                    }
	                }],
	                xAxes: [{
	                    id: 'Phi Angle(Degree)',
	                    type: 'linear',
	                    ticks: {
	                        min: -180,
	                        max: 180
	                    }
	                }]
	            },
	            responsive: true,
	            tooltips:{
	                mode: 'nearest',
	                     callbacks: {
	                         label : function(tooltipItem, data) {
	                           var id = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].id;
	                           var type = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].type;
	                           return [id+": "+type, 
	                                   "Phi: "+data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x,
	                                   "Psi: "+data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y];
	                          }
	                    }
	                }
	        }
	    });
		
		function GenerateData()
		{
			var scatterChartData = [];
			for(var i = 0; i < groups.length; i++)
			{
				var group = groups[i];
				var psi = group.getPsiAngle();
				var phi = group.getPhiAngle();
				if(phi != null && psi != null)
				{
					var data = {x:phi,y:psi,id:group.name,type:group.type}
					scatterChartData.push(data);
				}
			}
			return scatterChartData;
		}
	}
	
	/**
	 * Goal: Create a bar chart of any data
	 * @param groups
	 * group array as described in biogroup.js
	 */
	this.createBfactorChart = function(groups) 
	{
		GroupNameSort(groups);
		self.element.innerHTML = "";
		var canvas = document.createElement("CANVAS");
		canvas.id = "biocharterBfactorCanvas";
		
		canvas.height = height;
		canvas.width = width;
		
		self.element.appendChild(canvas);
		
		self.myChartArea = canvas.getContext("2d"); // Get the canvas element 
		
		var Title = "B-factor Plot";
		var Colors = ["grey","blue","red","gold","purple","green","pink","cyan"];
		
		var ChartData = GenerateData().then(function(ret){
			self.chart = new Chart(self.myChartArea, {
		        type: "bar",
				data: ret,
		        options: {
		        	maintainAspectRatio: false,
		        	title: {
		                display: true,
		                text: Title+" ("+structure.name+")"
		            },
		        }
		    });
		});
		
		async function GenerateData()
		{
			 
			var chartdata = {};
			var data = [];
			var labels = GenerateXlabels();
			SeqNumSort(labels);
			var datalabels = GenerateDataLabels();
			for(var l = 0; l<datalabels.length; l++)
			{
				var id = datalabels[l];
				var set = {};
				set.label = id;
                set.borderColor = "black";
                set.backgroundColor = Colors[l];
                set.data = [];
                
                for(var num = 0; num < labels.length; num ++)
                {
                	set.data[num] = 0.0;
                	for(var i = 0; i <groups.length; i++)
        			{
                        if(groups[i].resNum.seqNum == labels[num]&& groups[i].chainID == id)
                    	{
                        	set.data[num] = calcBfactor(groups[i].atoms);
                        	
                    	}
        			}
               	}
                
                data.push(set);
			}
			
			chartdata.labels = labels;
			chartdata.datasets = data;
			return chartdata;
		}
		
		function GenerateDataLabels()
		{
			var chains = UniqueChains(groups);
			var names = [];
			for(var i = 0; i < chains.length;i++)
			{
				names.push(chains[i].chainID);
			}
			
			return names.sort();
		}
		
		function GenerateXlabels()
		{
			return UniqueSeqNum(groups);
		}
		
	}
	
	this.createExposureChart = function(groups) 
	{
		GroupNameSort(groups);
		self.element.innerHTML = "";
		var canvas = document.createElement("CANVAS");
		canvas.id = "biocharterExposureCanvas";
		
		canvas.height = height;
		canvas.width = width;
		
		self.element.appendChild(canvas);
		
		self.myChartArea = canvas.getContext("2d"); // Get the canvas element 
		
		var Title = "Exposure Plot";
		var Colors = ["grey","blue","red","gold","purple","green","pink","cyan"];
		
		var ChartData = GenerateData().then(function(ret){
			self.chart = new Chart(self.myChartArea, {
		        type: "bar",
				data: ret,
		        options: {
		        	maintainAspectRatio: false,
		        	title: {
		                display: true,
		                text: Title+" ("+structure.name+")"
		            },
		        }
		    });
		});
		
		async function GenerateData()
		{
			var asa  = new Asa(structure.atoms);
			var chartdata = {};
			var data = [];
			var labels = GenerateXlabels();
			SeqNumSort(labels);
			var datalabels = GenerateDataLabels();
			for(var l = 0; l<datalabels.length; l++)
			{
				var id = datalabels[l];
				var set = {};
				set.label = id;
                set.borderColor = "black";
                set.backgroundColor = Colors[l];
                set.data = [];
                
                for(var num = 0; num < labels.length; num ++)
                {
                	set.data[num] = 0.0;
                	for(var i = 0; i <groups.length; i++)
        			{
                        if(groups[i].resNum.seqNum == labels[num]&& groups[i].chainID == id)
                    	{
                        	/**
                        	 * PRIVATE FUNCTION
                        	 */
                        	function add(a, b) {
                        	    return a + b;
                        	}	
                        	//var sasa  = new Asa(groups[i].atoms);
                        	var asas = asa.calcAsas(groups[i].atoms,false);
                        	var sasas = asa.calcAsas(groups[i].atoms,true);
                        	var asasum = asas.reduce(add, 0);
                        	var sasasum = sasas.reduce(add, 0);
                        	//var sasasum = sasas.reduce(add, 0);
                        	set.data[num] =  (asasum/sasasum)*100;
                    	}
        			}
               	}
                
                data.push(set);
			}
			
			chartdata.labels = labels;
			chartdata.datasets = data;
			return chartdata;
		}
		
		function GenerateDataLabels()
		{
			var chains = UniqueChains(groups);
			var names = [];
			for(var i = 0; i < chains.length;i++)
			{
				names.push(chains[i].chainID);
			}
			
			return names.sort();
		}
		
		function GenerateXlabels()
		{
			return UniqueSeqNum(groups);
		}
	}
	
	this.createBoundingWatersChart = function(groups)
	{
		GroupNameSort(groups);
		self.element.innerHTML = "";
		var canvas = document.createElement("CANVAS");
		canvas.id = "biocharterWatersCanvas";
		
		canvas.height = height;
		canvas.width = width;
		
		self.element.appendChild(canvas);
		
		self.myChartArea = canvas.getContext("2d"); // Get the canvas element
		
		var Title = "Bounding waters at 4 \u212B";
		var Colors = ["grey","blue","red","gold","purple","green","pink","cyan"];
		
		var ChartData = GenerateData().then(function(ret){
			self.chart = new Chart(self.myChartArea, {
		        type: "bar",
				data: ret,
		        options: {
		        	maintainAspectRatio: false,
		        	title: {
		                display: true,
		                text: Title+" ("+structure.name+")"
		            },
		        }
		    });
		});

		
		
		async function GenerateData()
		{
			var chartdata = {};
			var data = [];
			var labels = GenerateXlabels();
			SeqNumSort(labels);
			var datalabels = GenerateDataLabels();
			for(var l = 0; l<datalabels.length; l++)
			{
				var id = datalabels[l];
				var set = {};
				set.label = id;
                set.borderColor = "black";
                set.backgroundColor = Colors[l];
                set.data = [];
                
                for(var num = 0; num < labels.length; num ++)
                {
                	set.data[num] = 0.0;
                	for(var i = 0; i <groups.length; i++)
        			{
                        if(groups[i].resNum.seqNum == labels[num]&& groups[i].chainID == id)
                    	{
                        	set.data[num] = GetBoundingWaters(groups[i],4).length;
                    	}
        			}
               	}
                
                data.push(set);
			}
			
			chartdata.labels = labels;
			chartdata.datasets = data;
			return chartdata;
		}
		
		function GenerateDataLabels()
		{
			var chains = UniqueChains(groups);
			var names = [];
			for(var i = 0; i < chains.length;i++)
			{
				names.push(chains[i].chainID);
			}
			
			return names.sort();
		}
		
		function GenerateXlabels()
		{
			return UniqueSeqNum(groups);
		}
	}
	
	this.createContactsChart = function(groups) 
	{
		GroupNameSort(groups);
		self.element.innerHTML = "";
		var canvas = document.createElement("CANVAS");
		canvas.id = "biocharterContactsCanvas";
		
		canvas.height = height;
		canvas.width = width;
		
		self.element.appendChild(canvas);
		
		self.myChartArea = canvas.getContext("2d"); // Get the canvas element
		
		var Title = "Interactions Plot at 4 \u212B";
		var Colors = ["grey","blue","red","gold","purple","green","pink","cyan"];
		
		var ChartData = GenerateData().then(function(ret){
			self.chart = new Chart(self.myChartArea, {
		        type: "bar",
				data: ret,
		        options: {
		        	maintainAspectRatio: false,
		        	title: {
		                display: true,
		                text: Title+" ("+structure.name+")"
		            },
		        }
		    });
		});
		
		async function GenerateData()
		{
			 
			var chartdata = {};
			var data = [];
			var labels = GenerateXlabels();
			SeqNumSort(labels);
			var datalabels = GenerateDataLabels();
			for(var l = 0; l<datalabels.length; l++)
			{
				var id = datalabels[l];
				var set = {};
				set.label = id;
                set.borderColor = "black";
                set.backgroundColor = Colors[l];
                set.data = [];
                
                for(var num = 0; num < labels.length; num ++)
                {
                	set.data[num] = 0.0;
                	for(var i = 0; i <groups.length; i++)
        			{
                        if(groups[i].resNum.seqNum == labels[num]&& groups[i].chainID == id)
                    	{
                        	set.data[num] = calcNeighbors(groups[i].atoms,4,false).length;
                        	
                    	}
        			}
               	}
                
                data.push(set);
			}
			
			chartdata.labels = labels;
			chartdata.datasets = data;
			return chartdata;
		}
		
		function GenerateDataLabels()
		{
			var chains = UniqueChains(groups);
			var names = [];
			for(var i = 0; i < chains.length;i++)
			{
				names.push(chains[i].chainID);
			}
			
			return names.sort();
		}
		
		function GenerateXlabels()
		{
			return UniqueSeqNum(groups);
		}
	}
}
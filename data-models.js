//data-models.js 
/*Organization of js files.
hub not spokes
manager.js // manage application state  - TheScenario, ConversationHistory, ArchivedConversations, 
core-services.js // shared utility functions interact with Ollama = coreOllamaRequest, buildOllamaRequestData, 
data-models.js // class definitions - Two_Layer, etc, Six_Plan 
Spokes not hub
main-chat-ui.js // initial generate ui = handleSendPrompt
dynamic-table-renderer.js // DOM manipulation for dynamic table and coalescedplan = renderdynamicScenarioTable 
execution-suite-single-pass.js // single pass table execution - handleExecuteSingleTurn
execution-suite-two-pass.js // the two pass table execution - handleExecuteTwoPassTurn
tools-ui.js // to define/import/export tools.  
*/


//Ollama Model selection

var globalUID = 0; 

function extractCodeBlocks(text){
	console.log("extractCode was called.");
if(typeof text !== 'string' || !text){return "";}
//regex = between ``` and ```,   g finds all matches, s (dotAll) allows . to match newlines 
var regex1 = /```([\s\S]*?)```/gs;
var matches = text.matchAll(regex1);
var codeSnippets = [];
for(match of matches){
	codeSnippets.push(match[1].trim());
}
return codeSnippets.join("\n\n");
}

function truncateThinkingTags(text){
	/* parses a string to find and remove all THINK THINK tags and their inner text. This functino is designed to clean up the model's response, just before the response is used in context, i.e: called by reconstructMessagesFromFourRow(fr) keeping the thinking tags within the actual Three_Cell of the UI.
	@param {string} text - the input string which may contain one or more thinking tags. 
	if param is not valid it will be returned as is. 
	@returns {string} the string with all think blocks and content removed. 
	*/
	//1. perform defensive check? 
	if(typeof text !== 'string' || !text){return text;}
	//2. regex is core of function .  *? makes the match 'non-greedy' 
	const reg3x = /<think>*?<\/think>/g;
	//the replace  method. 
return 	text.replace(reg3x, '').trim();
}

    var processingCallbacks = {
	/* append suffix to prompt instructing performance by model
@param {string}
@returns {string}	*/
  "addCoderSuffix" : (promptContent) => {return promptContent + "Provide your code as a single code block without additional supporting paragraphs."; },
  /* append suffix for mathematical solutions.
@param {string} original prompt
@return {string}   */
	"addMathSuffix" : (promptContent) => {return promptContent + "solve the following math problem step-by-step. Dont use LaTeX.";},
	/* extract code within triple back ticks.  */
  "extractCodeBlocks" : (responseContent) => {return extractCodeBlocks(responseContent);},
  "truncateThinking" : (responseText) => {return removingThinkTags(responseText);},
  };
  var modeloptions = { "Q2 draft":{ supportstools:"true",
  hardmaxctx:"32000",
  value:"qwen2.5-coder:0.5b",
  hasRequestCallback : "true",
  requestCallback : "addCoderSuffix",
  hasResponseCallback : "true",
  responseCallback : "extractCodeBlocks",
  doesThinking: "false",
  }, 
  "JSON structure":{supportstools:"true",
  hardmaxctx:"58000",
  value:"Osmosis/Osmosis-Structure-0.6B:latest",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback :null,
  doesThinking: "false",
  },  
  "MD convert":{supportstools:"true",
  hardmaxctx:"228000",
  value:"reader-lm:1.5b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback :null,
  doesThinking: "false",
  },
  "languageSupport":{supportstools:"true",
  hardmaxctx:"8000",
  value:"command-r7b:7b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback :null,
  doesThinking: "false",
  },
    "Coder":{supportstools:"true",
	hardmaxctx:"128000",
	value:"qwen2.5-coder:7b",
  hasRequestCallback : "true",
  requestCallback : "addCoderSuffix",
  hasResponseCallback : "true",
  responseCallback : "extractCodeBlocks",
  doesThinking: "false",
	},
  "GeNowledge":{supportstools:"true",
  hardmaxctx:"32000",
  value:"falcon3:10b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback : null,
  doesThinking: "false",
  },
  "DeeKoder":{supportstools:"true",
  hardmaxctx:"128000",
  value:"deepcoder:14b",
  hasRequestCallback : "true",
  requestCallback : "addCoderSuffix",
  hasResponseCallback : "true",
  responseCallback : "extractCodeBlocks",
  doesThinking: "false",
  },
  "r1-Planner":{supportstools:"true",
  hardmaxctx:"8000",
  value:"deepseek-R1:14b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback : null,
  doesThinking: "true",
  },
	"q2.5-Maths":{supportstools:"true",
	hardmaxctx:"128000",
	value:"qwen2.5-coder:32b",
  hasRequestCallback : "true",
  requestCallback : "addMathSuffix",
  hasResponseCallback : "false",
  responseCallback : null,
  doesThinking: "false",
	}, 
  
  "Dal coder":{supportstools:"true",
  hardmaxctx:"128000",
  value:"devstral:24b",
  hasRequestCallback : "true",
  requestCallback : "addCoderSuffix",
  hasResponseCallback : "true",
  responseCallback : "extractCodeBlocks",
  doesThinking: "false",
  },
  
  "q3a3-Frayer":{supportstools:"true",
  hardmaxctx:"40000",
  value:"qwen3:30b-a3b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback : null,
  doesThinking: "true",
  },
  "Orchestrator":{supportstools:"true",
  hardmaxctx:"8000",
  value:"deepseek-R1:32b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback : null,
  doesThinking: "true",
  }
  };
  var modelInput = document.getElementById('modelSel'); 
for(var k3y in modeloptions){
	if(modeloptions.hasOwnProperty(k3y)){
		var option = document.createElement('option');
		option.value = modeloptions[k3y].value;
		option.textContent = k3y;
		option.setAttribute('data-supports-tools',modeloptions[k3y].supporttools);
		option.setAttribute('data-hardmaxctx',modeloptions[k3y].hardmaxctx);
		modelInput.appendChild(option);
}
}
 

let messageHistory = [];
	
//Dynamic Table data-models
var textAreaSizeRegistry = new Map();

var TwoLayerArray = [];
function d2(ind){
	if((ind>=0)&&(TwoLayerArray.length > ind)){return TwoLayerArray[ind];}else{return null;}
}
class Two_Layer {
//Two_Layer represents ollama/api/types.go: Message struct 
constructor (r = "", m = "") {
	this.id = `${globalUID++}`; 
	
	this.role = r; 
	this.content = m;
	this.individual_tokens = 0; // the token size of this specific message. 
	this.aggregate_tokens_at_this_point = 0; 
	TwoLayerArray.push(this);
	this.RegId = TwoLayerArray.length - 1; 
}

getJSONstring(){
	var data = {
		id: this.id,
		RegId: this.RegId,
		role: this.role,
		content: this.content,
	};
	return JSON.stringify(data, null, 2);
}


static fromJSON(data){
var newInstance = new Two_Layer(data.role, data.content);
return newInstance;
}


yieldElement(uniqueContextId = this.id){
	/* returns theHTML string or DOM element for a message*/
	var diiv = document.createElement('div');
	//diiv.id = this.id; 
	diiv.className = `message-role-${this.role}`;
	var roleStrong = document.createElement('strong');
	roleStrong.textContent = `Role: ${this.role}: `;
	diiv.appendChild(roleStrong);
	var contentSpan = document.createElement('textarea');
	var stil12 ="";
if	(this.role === 'user'){stil12 = "background-color: #000000; color: #ffffff;"}else{ stil12 = "background-color: #172554; color: #fefce8;";}
contentSpan.class = `${this.RegId}`;
contentSpan.style = stil12;
	contentSpan.value = this.content || ""; contentSpan.placeholder = (this.role ==='user'? "[your turn]" : "[awaiting response...]");
	var elemId = `textarea-${uniqueContextId}-${this.role}`;
	contentSpan.id = elemId;
	var savedSize = textAreaSizeRegistry.get(elemId);
	if(savedSize){
		contentSpan.style.width = savedSize.width;
		contentSpan.style.height= savedSize.height;
	}
	contentSpan.addEventListener('mouseup',()=>{
		textAreaSizeRegistry.set(elemId, { 
		width: contentSpan.style.width,
	height: contentSpan.style.height});});
	var toke = document.createElement('div');
	toke.innerHTML = `Individual Token: ${this.individual_tokens} Aggregate: ${this.aggregate_tokens_at_this_point}`;
	diiv.appendChild(toke);
	/*
	contentSpan.addEventListener('change', (event) => {
		this.setContent(event.target.value);
		recoalesceAndRenderAll();
	});
	*/
	contentSpan.addEventListener('change', (event) => {
		handlerEditedTextArea(event);
		recoalesceAndRenderAll();
	});
	diiv.appendChild(contentSpan);
return diiv;
}

destructor(){
	TwoLayerArray.splice(this.RegId,1);//still need to manage the loose references, which is why dotreg had two arrays. 
}

setContent(newContent){
	this.content = newContent;
}
setRole(newRole){
	this.content = newRole;
}

}

 function createModelSelector(selectedValue, onChangeCallback){
	 var modelz = document.createElement('select');
	 modelz.className = 'cell-model-selector';
	 //the global modeloptions at the DOMContentLoaded is the global repo
 for(var key in modeloptions){
	 if(modeloptions.hasOwnProperty(key)){
		 var opt1 = document.createElement('option');
		 opt1.value = modeloptions[key].value;
		 opt1.textContent = key;
		 modelz.appendChild(opt1);
	 }
 }
 modelz.value = selectedValue;
 modelz.onchange = onChangeCallback;
 return modelz;
 }

var ThreeCellArray = [];
function d3(ind){
if((ind >= 0) && (ThreeCellArray.length > ind)){return ThreeCellArray[ind];}else{return null;}
}
class Three_Cell {
	constructor (p_role = "user", p_content = "", r_role = "assistant", r_content = ""){
		this.id = `${globalUID++}`;
		this.prompt = new Two_Layer(p_role, p_content).RegId;
		this.response = new Two_Layer(r_role, r_content).RegId;
ThreeCellArray.push(this);
this.RegId = ThreeCellArray.length - 1;
this.originalCellId = null;
this.originalRowId = null;
this.individual_tokens = 0; 
this.aggregate_tokens = 0;
this.parentTrackId;

this.model = document.getElementById('modelSel').value;


	}
	
	getJSONstring(){
		var promptData = JSON.parse(d2(this.prompt).getJSONstring());
		var responseData = JSON.parse(d2(this.response).getJSONstring());
		var data = {
			id: this.id,
			RegId: this.RegId,
			model: this.model,
			parentTrackId: this.parentTrackId,
			individual_tokens: this.individual_tokens,
			aggregate_tokens: this.aggregate_tokens,
			prompt: promptData,
		response: responseData
		};
		return JSON.stringify(data, null, 2);
	}


static fromJSON(data){
var newPrompt = Two_Layer.fromJSON(data.prompt);
var newResponse = Two_Layer.fromJSON(data.response);
var newInstance = new Three_Cell();
newInstance.prompt = newPrompt.RegId;
newInstance.response = newResponse.RegId;
newInstance.model = data.model;
newInstance.parentTrackId = data.parentTrackId;
return newInstance;
}
	
	yieldElement( ){	/*returns td DOM element */ 
	//this function is used by the main dynamicscenariotable...
		var tdd = document.createElement('td');
		tdd.classname = 'cell-content';
		tdd.id = this.id;
		
		tdd.appendChild(d2(this.prompt).yieldElement(this.id));
		tdd.appendChild(d2(this.response).yieldElement(this.id));
		
		let controlDiv = document.createElement('div');
		controlDiv.className = 'cell-controls';
		var execAdHoc = document.createElement('button');
		execAdHoc.textContent = "execute ad Hoc";
		execAdHoc.title = "execute the conversation from the root start to here."
		execAdHoc.onclick = () => handleExecuteOnTheFlyToHere(this.RegId);
		controlDiv.appendChild(execAdHoc);
		var modelSelectorLabel = document.createElement('label');
		modelSelectorLabel.textContent = "Model: ";
		//the callback function updates this specific instance's model. 
		var modelSelector = createModelSelector(this.model, (event) => {
			this.model = event.target.value;
		});
		controlDiv.appendChild(modelSelectorLabel);
		controlDiv.appendChild(modelSelector);
		/*
		let makeChoice = document.createElement('button');
		makeChoice.textContent = "Convert into Choice";
		makeChoice.title = "convert this turn into a choice.";
		makeChoice.onclick = () => handleConvertToChoice(parentTrackId, cellIndex);
		controlDiv.appendChild(makeChoice);
		*/
		//24Jun25
	/*	var execToHereBtn = document.createElement('button');
		execToHereBtn.textContent = "execute to here";
		execToHereBtn.title = "set all choices to lead to this point and execute.";
		execToHereBtn.onclick = () => handleExecuteToHere(this.RegId, this.parentTrackId);
controlDiv.appendChild(execToHereBtn);
*/
		tdd.appendChild(controlDiv);
		
		return tdd;
	}
	yieldContentElements(isCoalesced = false){
		var contentFragment = document.createDocumentFragment(); 
		contentFragment.appendChild(d2(this.prompt).yieldElement(this.id));
		contentFragment.appendChild(d2(this.response).yieldElement(this.id));
		return contentFragment;
	}
	
	isEmpty(){
		return (!d2(this.prompt).content || d2(this.prompt).content === "[your turn]")&&(!d2(this.response).content || d2(this.response).content ==="[awaiting response...]");
	}
	
	destructor(){
		d2(this.prompt).destructor();
		d2(this.response).destructor();
		ThreeCellArray.splice(this.RegId,1);
	}
	
	
	
}

var FourRowArray = [];
function d4(ind){
	if((ind >= 0)&&(FourRowArray.length > ind)){return FourRowArray[ind];}else{return null;}
}
class Four_Row {
	constructor(nam = "trax") {
		this.id = `${globalUID++}`; 
		this.name = `${nam}${globalUID++}`;
		this.sequence = [];
		this.terminatingChoice = null;
		this.parentChoiceId = null;
		
	FourRowArray.push(this);
	this.RegId = FourRowArray.length - 1;
	
	}
	
	getJSONstring(){
		var sequenceData = this.sequence.map(cellRegId => JSON.parse(d3(cellRegId).getJSONstring()));
		//serialize the terminating choice, if it exists. 
		let choiceData = null;
		if(this.terminatingChoice !== null){
			choiceData = JSON.parse(d5(this.terminatingChoice).getJSONstring());
		}
		var data = {
			id: this.id, 
			RegId: this.RegId, 
			name: this.name, 
			parentChoiceId: this.parentChoiceId, 
			sequence: sequenceData, 
			terminatingChoice: choiceData
		};
		return JSON.stringify(data, null, 2);
	}
	
	static fromJSON(data){
	var newInstance = new Four_Row(data.name);
	if(data.sequence && Array.isArray(data.sequence)){
	data.sequence.forEach(cellData => {
//console.log(`inside 4row cellData is ${JSON.stringify(cellData)}`);
		var newCellInstance = Three_Cell.fromJSON(cellData);
		newInstance.addCell(newCellInstance.RegId);
	});
	}	
 
	
	if(data.terminatingChoice){
		var newChoice = Five_Choice.fromJSON(data.terminatingChoice);
		//Does this fail? 
		newInstance.terminatingChoice = newChoice.RegId;
	}
	
	
	
	return newInstance;
}	
		
	
//linear sequence of three cells
addCell(cell = new Three_Cell("user", "[Your Turn]", "assistant", "[Awaiting Response...]").RegId){ 
//@param = cell.RegId 
d3(cell).parentTrackId = this.RegId;
this.sequence.push(cell);
//this.cells.push(cell);
}
getCell(ind){return d3(this.sequence[ind]);}
length(){return this.sequence.length;}

destructor(){
	for(let i = 0; i < this.sequence.length; i++){d3(this.sequence[i]).destructor();}
	FourRowArray.splice(this.RegId,1);
}

/*
promotes the end of this track to a branching choice point. 
@param {string} conditional_phrase - the reason for the choice. 
@param {number} numBranches - the number of paths to create (min 2);
*/
addTerminatingChoice(conditional_phrase, numBranches = 2){
	if(d5(this.terminatingChoice) instanceof Five_Choice){
		console.log(`track #{this.id} already has the terminating choice.`);
		return;
	}
	var newChoice = new Five_Choice(conditional_phrase);
	newChoice.parentTrackId = this.RegId;
	for(let i = 0; i < numBranches; i++){
		var branchName = `option ${i + 1}`;
		var newBranchTrack = new Four_Row(branchName);
		newBranchTrack.addCell();
		newChoice.addBranch(newBranchTrack.RegId);	
}
this.terminatingChoice = newChoice.RegId; 
}

setAllModels(modelId){
	if(!modelId){return;}
	this.sequence.forEach(cellRegId => {
		var cell = d3(cellRegId);
		if(cell){
			cell.model = modelId;
		}
	});
recoalesceAndRenderAll();
}

/*
Creates the HTML content for the track's header/control console. 
@returns {HTMLElement} - the <th> element for the row header.
*/
yieldRowHeader(){
	var thd = document.createElement('th');
	thd.className = `row-control-console`;
	var nameSpan = document.createElement(`span`);
	nameSpan.textContent = this.name; 
	var namefiel = document.createElement('input');
	namefiel.name = `trackname${this.id}`;
	var namelbl = document.createElement('label');
	namelbl.for = `trackname${this.id}`;
	namefiel.type = 'text';
	namefiel.onchange = () => {
		this.name = namefiel.value;
		recoalesceAndRenderAll();
	}
	namelbl.textContent = "track's name:"
	thd.appendChild(namelbl);
	thd.appendChild(namefiel);
	thd.appendChild(nameSpan);
	
	var addTurnBt = document.createElement(`button`);
	addTurnBt.textContent = "+ Turn";
	addTurnBt.title = "add new turn to the end of track";
	addTurnBt.onclick = () => {
		this.addCell();
		recoalesceAndRenderAll();
	};

var controlsContainer = document.createElement('div');
	var ChoNam = document.createElement('input');
	ChoNam.type = 'text';
	ChoNam.placeholder = "conditional phrase for the choice";
	var trnoin = document.createElement('input');
	trnoin.type = 'number';
	trnoin.value = '2';
	trnoin.min = '2';
	
	var appendChoiceBt = document.createElement('button');
	appendChoiceBt.textContent = "Terminate with choice";
	appendChoiceBt.title = "terminate track with a choice.";
	appendChoiceBt.onclick = () => {
	var numTracks = parseInt(trnoin.value, 10) || 2 ;
	this.addTerminatingChoice(ChoNam.value, numTracks);
	recoalesceAndRenderAll();
	};
	
	
	controlsContainer.appendChild(addTurnBt);
	controlsContainer.appendChild(document.createElement('hr'));
	controlsContainer.appendChild(ChoNam); 
	controlsContainer.appendChild(trnoin); 
	controlsContainer.appendChild(appendChoiceBt);


	var nesetAllDiv = document.createElement('div');
	var setAllLabel = document.createElement('label');
	setAllLabel.textContent = "Model for whole track:";
	setAllLabel.style.display = 'block';
	var setAllSelector = createModelSelector(this.sequence.length > 0 ? d3(this.sequence[0]).model : modelInput.value, () => {});
	var setallbut = document.createElement('button');
	setallbut.textContent = 'model for all';
	setallbut.onclick = () => {
		var selectedModel = setAllSelector.value;
		this.setAllModels(selectedModel);
	};
	nesetAllDiv.appendChild(setAllLabel);
	nesetAllDiv.appendChild(setAllSelector);
	nesetAllDiv.appendChild(setallbut);


	thd.appendChild(controlsContainer);
	thd.appendChild(nesetAllDiv);

	return thd;
}

}

var FiveChoiceArray = [];
function d5(ind){
	if( (ind >= 0) && (ind < FiveChoiceArray.length)){return FiveChoiceArray[ind];
}else{return null;}
}
 function getHSLPastel(){
 var hue = Math.floor(Math.random() * 360);
 return `hsl(${hue}, 90%, 80%)`;
 }
class Five_Choice{
	constructor( ConditionalPhrase = ""){
		this.id = `${globalUID++}`;
this.conditional_phrase = ConditionalPhrase; 	
	this.branches = [];
	this.favouredBranchId = null;
	this.selectedBranchId = null;
	this.parentTrackId = null;
	this.branchesColour = getHSLPastel();
	FiveChoiceArray.push(this); this.RegId = FiveChoiceArray.length - 1;
	
	}
	
	getJSONstring(){
		var branchesData = this.branches.map(trackRegId => JSON.parse(d4(trackRegId).getJSONstring()));
		var data = {
			id: this.id, 
			RegId: this.RegId, 
			conditional_phrase: this.conditional_phrase, 
			parentTrackId: this.parentTrackid, 
			selectedBranchId: this.selectedBranchId, 
			branches: branchesData
		};
		return JSON.stringify(data, null, 2);
	}
	
	
	static fromJSON(data){
//@param {object} data -  plain object from JSON.parse()
//@returns {number} the RegId of the newly created instance.	 
if(!data || !Array.isArray(data.branches)){
	console.error("five_Choice.fromJSON error#1.0 ");
	return;//return new Five_Choice();
}

var newInstance = new Five_Choice(data.conditional_phrase);
var oldIdToNewIdMap = {};

if(data.branches && Array.isArray(data.branches)){
	data.branches.forEach(branchData => {
//		console.log(`inside 5cchoice branchdata is ${JSON.stringify(branchData)}`);
		var newBranchInstance = Four_Row.fromJSON(branchData);
		newInstance.addBranch(newBranchInstance.RegId);
		oldIdToNewIdMap = newBranchInstance.RegId;
	});
}

 

if(data.selectedBranchId){
	newInstance.selectedBranchId = oldIdToNewIdMap;
}
return newInstance;

}
	
	getOffset(){
		// [this choice] [parentTrack.squence.length]->[parentChoice=1]->[parentTrack.seq.len]
	var retval = 0;//this choice.
	var pres_choi = this; 
	let flag030 = true;
	 
	while(flag030){
		retval += 1;//one for the choice cell. 
		if(pres_choi.parentTrackId != null){
			let paTr = d4(pres_choi.parentTrackId);
			if(paTr === null){flag030 = false;continue;}
			retval += paTr.sequence.length + 1; // plus header
				if(paTr.parentChoiceId != null){
					pres_choi = d5(paTr.parentChoiceId);
			if(pres_choi === null){flag030 = false;continue;}
				}else{flag030 = false;}	
			}else{flag030 = false;}
		} 
return retval;
}
 
	addBranch(branchTrackRegId ){
		var xe3 = d4(branchTrackRegId);
	if(xe3 instanceof Four_Row){		
		xe3.parentChoiceId = this.RegId;
		this.branches.push(xe3.RegId);
		if(!this.selectedBranchId){
			this.selectedBranchId = xe3.RegId;
		}
	}
	}
	
	/* 
	creates and returns the complete table cell (td for the choice hub, including the correct rowspan and all UI elements. 
	@returns {HTMLTableCellElement} the fully constructed td element for
	*/
	yieldElement(){
	//create the cell that will be returned. 
	var ttdd = document.createElement('td');
	ttdd.className = 'five-choice';
	ttdd.style.backgroundColor = this.branchesColour;  
	ttdd.rowSpan = 1; 
	var container = document.createElement('div');
	container.className = 'choice-hub-container';
	
	var phraseInput = document.createElement('input');
	phraseInput.type = 'text';
	phraseInput.value = this.conditional_phrase;
	phraseInput.placeholder = 'condition for this choice.';
	phraseInput.onchange = (e) => { this.conditional_phrase = e.target.value;};
	container.appendChild(phraseInput);
	
	var radioGroup = document.createElement('div');
	radioGroup.className = 'choice-radios';
	
	//Dynamically create a radio button for each branch. 
	this.branches.forEach(brch => {
var branch = d4(brch); if(!(branch instanceof Four_Row)){console.log("Four_Row used without respecting RegId");bhrch = document.createElement("div"); bhrch.innerHTML = "Four_Row used without respecting RegId"; return bhrch;}		
	var id = `radio-${this.RegId}-${branch.id}`;
	var isChecked = (this.selectedBranchId === brch);
	var branchDiv 	= document.createElement('div');
	var radioInput 	= document.createElement('input');
	radioInput.type = 'radio';
	radioInput.id = branch.id;
	radioInput.name = `choice-${this.id}`;

	radioInput.value = parseInt(brch);
	radioInput.checked = isChecked; 
	radioInput.onchange = () => { 

		this.selectedBranchId = parseInt(radioInput.value);  
		recoalesceAndRenderAll(); 
	};
	var label = document.createElement('label');
	label.for = branch.id;
	label.textContent = `${branch.name}`;
	branchDiv.appendChild(radioInput);
	branchDiv.appendChild(label);
	radioGroup.appendChild(branchDiv);
	});
	
	container.appendChild(radioGroup);
	ttdd.appendChild(container);
	return ttdd;
	}
}
 
class Six_Plan {
	constructor(){
 		this.id = `${globalUID++}`;
		this.tracks = [];
		this.steps = [];
		this.initializeDefaultPlan(); 
		}
		
		
		getJSONstring(){
	var stepsData = this.steps.map(choiceRegId => JSON.parse(d5(choiceRegId).getJSONstring()));
			var data = {
				id: this.id, 
			steps: stepsData
			};
return JSON.stringify(data, null, 2);
		}			
	


static fromJSON(jsonString){
	if(!jsonString || typeof jsonString !== 'string'){
		console.error('six_plan.fromJSON argument not string.');
		return;
	}
	try{
	var datum = JSON.parse(jsonString);
	var newInstance = new Six_Plan();
	newInstance.steps = [];
	if(datum.steps && Array.isArray(datum.steps)){
	datum.steps.forEach(choiceData => {
//		console.log(`inside 6plan choiceData is ${JSON.stringify(choiceData)}`);
		var newChoiceInstance = Five_Choice.fromJSON(choiceData);
		newInstance.steps.push(newChoiceInstance.RegId);
	});
	}else{
		console.log('import fail');
	}
return newInstance;

	}catch(er){
	console.error(`six-plan.fromJSON error =: ${er.message}`);	
	}
}

reconnectParentPointers(){
	var traverse = (trackRegId) => {
		var track = d4(trackRegId);
		if(!track) return;
		if(track.terminatingChoice !== null){
			var choice = d5(track.terminatingChoice);
			if(choice){
				choice.parentTrackId = track.RegId;
				choice.branches.forEach(branchRegId => {
					d4(branchRegId).parentChoiceId = choice.RegId;
					traverse(branchRegId);
				});
		}}
	};
	this.steps.forEach(choiceRegId => {
		d5(choiceRegId).branches.forEach(branchRegId => { traverse(branchRegId);
		});
	});
}

	
		initializeDefaultPlan(){
			this.steps = [];
			var firstChoice = new Five_Choice("Start here?");
			var baseTrack = new Four_Row("Start");
			baseTrack.addCell(); //add one empty turn to start with. 
			//Add the base track as the single branch of the first choice. 
			firstChoice.addBranch(baseTrack.RegId);
			//add the first choice as the first step in the plan. 
			this.steps.push(firstChoice.RegId);
		}
		 
	
	parseJSONstring(str){//delete this.
		var sp = JSON.parse(str);
		if(Array.isArray(sp.steps)){
			console.log(` here it is${sp.steps.length} ${JSON.stringify(sp.steps[0])}`);
			
		}
	}
	 
	 
	
}


console.log("data models downloaded");
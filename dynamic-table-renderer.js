//dynamic-table-renderer.js
//This module is entirely accessed through a call to function recoalesceAndRenderAll()
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


// -- DOM REfernces
const dynamicTableTracksContainer = document.getElementById('dynamicTableTracksContainer');//a tbody or div for tracks
const coalescedExecutionRowContainer = document.getElementById('coalescedExecutionRowContainer');//for the bottom row. 
const initDynamicTableBtn = document.getElementById('initDynamicTableBtn'); 



 
//only called by recoalesceAndRenderAll()so parameter is assured.
function renderDynamicScenarioTable(TS ){
	if(!dynamicTableTracksContainer){
		console.error("cant find dyanmic table...");
	return;}
	dynamicTableTracksContainer.innerHTML = "";
	
recursivelyRenderTrack(d5(TS.scenario.steps[0]).branches[0],null);
}


function insertAfter(parentElement, newElement, referenceElement){
	const nextSibling = referenceElement.nextSibling; 
	if(nextSibling){
		parentElement.insertBefore(newElement, nextSibling);
	}else{
		parentElement.appendChild(newElement);
	}
}

//
function recursivelyRenderTrack(trackRegId, parenttr = null){
	const track = d4(trackRegId); 
	if(!(track instanceof Four_Row)){return;}
	// 1. create and indent the row for this track
	const tr = document.createElement('tr');
	tr.id = track.id;
	
	let startColumn = 0;
	const parentChoice = d5(track.parentChoiceId);
	if(parentChoice){
		startColumn = parentChoice.getOffset();
	}
	//add empty padding cells to create the correct indentation. 
	//startColumn--;
	for(let i = 0; i < startColumn; i++){
		const padTd = document.createElement('td');
		padTd.className = 'offset-cell';
		tr.appendChild(padTd);
	}
	 
	if(parentChoice){
	const padTd = document.createElement('td');
	padTd.className = 'choice-connector-cell';
	padTd.style.backgroundColor = parentChoice.branchesColour; 
	tr.appendChild(padTd);
	}
	//2 - render the track's content
	tr.appendChild(track.yieldRowHeader());
 
		track.sequence.forEach(cellRegId => {
			const cell = d3(cellRegId);
			if(cell){
				
				tr.appendChild(cell.yieldElement());
			}
		});
		 
		
	//3 insert this tracks row into the Dom
	if(parenttr){
		//if its a branch insert it after its parents row.
		insertAfter(dynamicTableTracksContainer, tr, parenttr);
	}else{
		//if its not a root track just append it. 
		dynamicTableTracksContainer.appendChild(tr);
	}
	
//4. render the terminating choice and recurse for branches. 
const choice = d5(track.terminatingChoice);
if(choice instanceof Five_Choice){
	const choiceCell = choice.yieldElement();//get the td  
	tr.appendChild(choiceCell);
	//recusivelyrender all branches.
	choice.branches.forEach(branchRegId => {
		recursivelyRenderTrack(branchRegId, tr);
	});
}
	
}


// 1 traverses the scenario tree and populates the coalescedplan object.
//only called by recoalesceAndRenderAll()so parameter is assured.
function coalesceScenarioToPlan(TS){
	CoalescedPlan.sequence = [];
	if(!TS.scenario.steps.length) return;
	
	const traverse = (trk) => {
//		console.log('entered traverse in coalesceScenarioPlan');
	const track = d4(trk);
		//add all three-cells from the current track's sequence
		for (const cellRegId of track.sequence){
			CoalescedPlan.sequence.push(cellRegId);
		}
		//if there is a choice find the selected branch and continue traversal
		const choice = track.terminatingChoice;
		if((d5(choice) instanceof Five_Choice) && d5(choice).selectedBranchId){
 
			if(d4(d5(choice).selectedBranchId) instanceof Four_Row){
				traverse(d5(choice).selectedBranchId);
			}
		}
	};
//	console.log(`coscentoplan  ${JSON.stringify(d5(TS.scenario.steps[0]))} `);
	traverse(d5(TS.scenario.steps[0]).branches[0]);
}
function renderCoalescedPlan(){
	const container = document.getElementById('coalescedExecutionRowContainer');
	if(!container) return;
	container.innerHTML = '';
	const tr = document.createElement('tr');
	CoalescedPlan.sequence.forEach((cellRegId, index) => {
		const td = document.createElement('td');
		const threeCell = d3(cellRegId);
		if(!threeCell)return;
		//use existing function to render the prompt/response textareas. 
		td.appendChild(threeCell.yieldContentElements(true));
		//create the execution controls for this cell. 
		const controlsDiv = document.createElement('div');
		controlsDiv.className = 'execution-controls';

if(typeof handleExecuteSingleTurn === 'function'){	
	const execBtn = document.createElement('button');
		execBtn.textContent = "Execute Turn";
		execBtn.onclick = () => handleExecuteSingleTurn(cellRegId);
		execBtn.style = "background-color:#22c55e ; color:#ffffff; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
	controlsDiv.appendChild(execBtn);
}


	if(typeof handleSequentialConversation === 'function'){
		const execSeqBtn = document.createElement('button');
		execSeqBtn.textContent = "Run to Here";
		execSeqBtn.title = "Execute all turns from the start up to this one."
		execSeqBtn.onclick = () => handleSequentialConversation(index);
		execSeqBtn.style = "background-color:#4ade80; color:#000000; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
	controlsDiv.appendChild(execSeqBtn);

}	


if(typeof handleExecuteTwoPassTurn === 'function'){	
	const execFocusButton = document.createElement('button');
		execFocusButton.textContent = "execute Focused turn";
		execFocusButton.title = "run 2pass execution";
		execFocusButton.onclick = () => handleExecuteTwoPassTurn(cellRegId);
		execFocusButton.style = "background-color:#facc15 ; color:#000000; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
	controlsDiv.appendChild(execFocusButton);	

}

if(typeof handleSequentialTwoPass === 'function'){
	const exec2passSeqBtn = document.createElement('button');
	exec2passSeqBtn.textContent = "Focus Seq2to here.";
	exec2passSeqBtn.title = "2pass sequence to here from 0";
	exec2passSeqBtn.onclick = () =>handleSequentialTwoPass(index);
	exec2passSeqBtn.style = "background-color: #eab308 ; color:#000000; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
	controlsDiv.appendChild(exec2passSeqBtn);
}
		
	
		
		if(index === CoalescedPlan.sequence.length - 1){
if(typeof resumeSequentialConversation === 'function'){		
		const resumeBtn = document.createElement('button');
			resumeBtn.textContent = "resume track";
			resumeBtn.title = "execute all pending or failed on this plan." ;
			resumeBtn.onclick = () => resumeSequentialConversation(index);
			resumeBtn.style = "background-color:#166534 ; color:#ffffff; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
			controlsDiv.appendChild(resumeBtn);
	}
	
if(typeof resume2passtrack === 'function'){
	const resume2pBtn = document.createElement('button');
			resume2pBtn.textContent = "resume 2pass";
			resume2pBtn.title = "ask all undone prompts through 2pass";
			resume2pBtn.onclick = () => resume2passtrack(index);
			resume2pBtn.style = "background-color:#a16207 ; color:#000000; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;"; 
			controlsDiv.appendChild(resume2pBtn);
		}
		}
		
		td.appendChild(controlsDiv);
		tr.appendChild(td);
	});
	container.appendChild(tr);
}

function recoalesceAndRenderAll(TableState = DynamicTableState){
	//FOr Six_Plan - This function is the order of employing the Six_Plan (i.e TheScenario) 
	renderDynamicScenarioTable(TableState); 
coalesceScenarioToPlan(TableState); 
renderCoalescedPlan(); 
}

const paintTracksBtn = document.getElementById('renderbtn'); 
paintTracksBtn.addEventListener('click', () => {recoalesceAndRenderAll(DynamicTableState);}); 

function handlerEditedTextArea(event){
	const texare = event.target; 
	const layId = texare.class;
	let foundCell = d2(layId);
	if(foundCell){
		foundCell.content = texare.value;
	}else{
		console.log("can not find twolayer for this textarea.");
	}
	return;
}

function seetex(){
document.getElementById("scenetext").value = DynamicTableState.scenario.getJSONstring();
}
function emitext(){
DynamicTableState.loadScenarioFromJSON(document.getElementById("scenetext").value);
recoalesceAndRenderAll(DynamicTableState);

}

document.getElementById("seetex").onclick = seetex;
document.getElementById("emitex").onclick = emitext;

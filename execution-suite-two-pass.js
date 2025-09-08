//execution-suite-two-pass.js
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

 
/*
handler for the "exeecute focused turn" button. orchestrates the two-pass execution. 
@param {number} threeCellRegId - the registry ID of the Three_cell to execute
*/
async function handleExecuteTwoPassTurn(threeCellRegId){
	statusDiv.textContent = "executing focused turn";
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = true);
	const success = await coreTwoPassRequest(threeCellRegId);
	if(success){ statusDiv.textContent = "focused turn executed successfully." ; }else{ statusDiv.textContent = "error during focused turn execution.";}
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
	recoalesceAndRenderAll(); 
	
}
 
 
async function handleSequentialTwoPass(upToIndex){
	statusDiv.textContent = "Starting sequential execution...";
	//step1 archive the results of the previous run before restting. 
	DynamicTableState.archiveCurrentHistory();
	DynamicTableState.activeHistory  = new Four_Row(`Run@${new Date().toLocaleTimeString()}`);
	//disable all execution buttons to prevent conflicts.
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = true);
	//step3 loop and execute each turn sequentially.
	//the await is critical to ensure the loop pauses until each turn is complete. 
	for(let i = 0; i <= upToIndex; i++){
		const cellRegId = CoalescedPlan.sequence[i];
		if(!d3(cellRegId)) continue;
		statusDiv.textContent = `Executing turn ${i + 1} of ${upToIndex + 1}...`;
		//handleexecutesingturn no correctly contributes to new clean conversationhisotry.
		await handleExecuteTwoPassTurn(cellRegId);
	}
	statusDiv.textContent = "Sequential execution complete.";

//	recoalesceAndRenderAll();
	//reenable buttons. 
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
}
  
  
 
 //for2pass at end of coalesced plan
 async function resume2passtrack(upToIndex){

	 statusDiv.textContent = "Resuming sequential executor...";
	DynamicTableState.archiveCurrentHistory();
	DynamicTableState.activeHistory  = new Four_Row(`Run@${new Date().toLocaleTimeString()}`);
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = true);
	
for(let i = 0; i <= upToIndex; i++){
	const cellRegId = CoalescedPlan.sequence[i]; 
	const threeCell = d3(cellRegId);
	if(!threeCell) continue;
	const responseContent = d2(threeCell.response).content;
	const needsExecution = (responseContent === "[Awaiting Response...]" || responseContent.startsWith("[ERROR") || responseContent === "" || responseContent === " ");
	if(needsExecution){
		statusDiv.textConetnt = `executing turn ${i + 1} of ${upToIndex + 1}`;
		await handleExecuteTwoPassTurn(cellRegId);
	}else{
		statusDiv.textConetnt = `skipping turn ${i + 1} of ${upToIndex + 1}`;
		DynamicTableState.activeHistory.addCell(cellRegId);
	}
}
calculateAggregateTokensForTwoPass(upToIndex);
statusDiv.textContent = "resume execution complete";
document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
 }
 
function calculateAggregateTokensForTwoPass(upToIndex){
	 var presentAggregate = 0;
	 for(let i = 0; i <= upToIndex;i++){
presentAggregate += d2(d3(DynamicTableState.activeHistory.sequence[i]).prompt).individual_tokens;
d2(d3(DynamicTableState.activeHistory.sequence[i]).prompt).aggregate_tokens_at_this_point = presentAggregate;

presentAggregate += d2(d3(DynamicTableState.activeHistory.sequence[i]).response).individual_tokens;
d2(d3(DynamicTableState.activeHistory.sequence[i]).response).aggregate_tokens_at_this_point = presentAggregate;

	 }
 }
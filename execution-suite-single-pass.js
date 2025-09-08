//execution-suite-single-pass.js 
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
/* 3. handler: execute a single turn from the coaleced plan. */ 
//Depends on coreOllamaRequestTC //core-services?
// // CoreRequestTC requires ConversationHistory which is in state.js 
// // // Does handleExecuteTwoPass also require conversationHistory? 
//depends on renderCoalescedPlan //dynamic-table-renderer. 
async function handleExecuteSingleTurn(threeCellRegId){
	console.log(`executing turn for cell id ${threeCellRegId}`);
	statusDiv.textContent += "<br>executing turn...";
	//disable all buttons during execution. 
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = true);
	const success = await coreOllamaRequestTC(threeCellRegId);
	if(success){
		statusDiv.textContent += "<br>turn executed successfully.";
	}else{
		statusDiv.textContent += "<br>error during turn execution.";
	}
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
	recoalesceAndRenderAll();
}
		
		
		async function handleSequentialConversation(upToIndex){
	statusDiv.textContent = "Starting sequential execution...";
	//step1 archive the results of the previous run before restting. 
	DynamicTableState.archiveCurrentHistory();
	//step2 reset the global conversationhistory for a fresh run. giving it a timestampedname is usefulrfor the archive.
	DynamicTableState.activeHistory = new Four_Row(`Run@${new Date().toLocaleTimeString()}`);
	//disable all execution buttons to prevent conflicts.
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = true);
	//step3 loop and execute each turn sequentially.
	//the await is critical to ensure the loop pauses until each turn is complete. 
	for(let i = 0; i <= upToIndex; i++){
		const cellRegId = CoalescedPlan.sequence[i];
		if(!d3(cellRegId)) continue;
		statusDiv.textContent = `Executing turn ${i + 1} of ${upToIndex + 1}...`;
		//handleexecutesingturn no correctly contributes to new clean conversationhisotry.
		await handleExecuteSingleTurn(cellRegId);
	}
	statusDiv.textContent = "Sequential execution complete.";
	//recoalesceAndRenderAll(); //called by handleExecSingleTurn()
	//reenable buttons. 
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
}



//resumes a sequential execution from coalesced plan skipping any done turns. 
 async function resumeSequentialConversation(upToIndex){
	 statusDiv.textContent = "Resuming sequential executor...";
	 //archiving and resetting the history. ensure correct context. 
	 DynamicTableState.archiveCurrentHistory();
	 DynamicTableState.activeHistory = new Four_Row(`Resume@${new Date().toLocaleTimeString()}`);
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = true);
	
for(let i = 0; i <= upToIndex; i++){
	const cellRegId = CoalescedPlan.sequence[i]; 
	const threeCell = d3(cellRegId);
	if(!threeCell) continue;
	const responseContent = d2(threeCell.response).content;
	const needsExecution = (responseContent === "[Awaiting Response...]" || responseContent.startsWith("[ERROR") || responseContent === "" || responseContent === " ");
	if(needsExecution){
		statusDiv.textContent = `executing turn ${i + 1} of ${upToIndex + 1}`;
		await handleExecuteSingleTurn(cellRegId);
	}else{
		statusDiv.textContent = `skipping turn ${i + 1} of ${upToIndex + 1}`;
		DynamicTableState.activeHistory.addCell(cellRegId);
	}
}
statusDiv.textContent = "resume execution complete";
document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
 }
 
 
 
	sps.onclick = () => SaveMessageHistory(DynamicTableState.archivedRuns);
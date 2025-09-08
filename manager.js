//manager.js
/*Organization of js files.
hub not spokes
core-services.js // shared utility functions interact with Ollama = coreOllamaRequest, buildOllamaRequestData, 
data-models.js // class definitions - Two_Layer, etc, Six_Plan 
manager.js // manage application state  - TheScenario, ConversationHistory, ArchivedConversations, 

Spokes not hub
main-chat-ui.js // initial generate ui = handleSendPrompt
dynamic-table-renderer.js // DOM manipulation for dynamic table and coalescedplan = renderdynamicScenarioTable 
execution-suite-single-pass.js // single pass table execution - handleExecuteSingleTurn
execution-suite-two-pass.js // the two pass table execution - handleExecuteTwoPassTurn
tools-ui.js // to define/import/export tools.  
*/

//var TheScenario = new Six_Plan();  
//var ConversationHistory = new Four_Row("execution history");//DynamicTableState.activeHistory
var CoalescedPlan = new Four_Row("Coalesced plan");
//var ArchivedConversations = [];
//state manager:

//ArchiveOfConversations is here because both SIngle-suite and two-suite may perform runs. 
const conversationHistoryLogContainer = document.getElementById('conversationHistoryLogContainer');
/*
takes the current conversationHistory pushes it to archive, and calls render function to update log display.   
*/
function archiveCurrentConversation(TableState = DynamicTableState) {
//only archive if history has content. 
	//if(ConversationHistory && ConversationHistory.sequence.length > 0){
		//ArchivedConversations.push(ConversationHistory);
		const logser = TableState.scenario.getJSONstring();
		TableState.archivedRuns.push(logser);
		renderArchivedConversations();
//		TheScenario.parseJSONstring(logser);
	//}
}	

const DynamicTableState = {
scenario: new Six_Plan(),
activeHistory: new Four_Row("first state history"),
archivedRuns: [],
loadScenarioFromJSON: function(stri){this.scenario = Six_Plan.fromJSON(stri);},
archiveCurrentHistory: function(){archiveCurrentConversation(this);},getScenario: function(){return this.scenario;},


};       
// DynamicTableState is used by ExecuteSingleTurn-suite. 


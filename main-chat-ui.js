//main-chat-ui.js Tested 1530PM 22Jul2025
//FIX : calculateAndStoreTokenCounts algorithm for aggregate=ind+ind+ind...
//DEPENDS ON data-models.js , core-services.js , tools-ui.js , tools-exec.js 
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


 console.log("main-chat downloaded");
	const disptoken = document.getElementById("tokendisp");
	const promptInput = document.getElementById('prompt');
	const sendButton = document.getElementById('send');	
const responseDiv = document.getElementById('response');

const messageHistoryStackDiv = document.getElementById("messageHistoryStack");
 
	const saveHistoryBut = document.getElementById('saveHistoryButton');

async function handleSaveConversationHistory(){
	//function for server to save the conversation stemming from the handleSendPrompt() 'generate' input.   
	if(messageHistory.length === 0 ){
		statusDiv.textContent = "conversationHistory is empty. nothing to save.";
		return;
	}
	statusDiv.textContent = "MainChat: saving conversationhistory"
	saveHistoryBut.disabled = true;
	try {
		SaveMessageHistory(messageHistory);
	} catch (err) {
		console.log(` error saving conversation history ${err.message}`);
	} finally {
		saveHistoryBut.disabled = false;
	}  
}

 
  
   saveHistoryBut.addEventListener('click', handleSaveConversationHistory);


//displaymessagesinstack should be in core-services.js 
function displayMessageInStack(message, index, isStreaming = false){
	//for handleSendPrompt 
/*appends a message turn (user, assistant, tool) to the visual history stack.
@param {Object} message - the message object (role, content, tool_calls?}
@param {number} index - the index of this message in the canonical messageHIstoryStack
@param {boolean} isStreaming - If true, create placeholder for assistant mesg. 
@returns {HTMLElement} the created textarea element. 	
*/
const turnDiv = document.createElement('div');
turnDiv.className = 'message-turn';
turnDiv.dataset.index = index;
turnDiv.dataset.role = message.role;

const rolelabel = document.createElement("strong");
let roleText = `${message.role.charAt(0).toUpperCase() + message.role.slice(1)};`;
 
turnDiv.appendChild(rolelabel);
message.individual_tokens = message.individual_tokens ?? null;
message.aggregate_tokens = message.aggregate_tokens ?? null;


const contentTextarea = document.createElement('textarea');
contentTextarea.rows = message.role === 'user' ? 3 : 5; 
contentTextarea.dataset.messageIndex = index; //easier lookup later

let displayContent = message.content ?? ""; 

//handle null/empty content, especially for initial assistant
if(displayContent === null || displayContent === undefined){	displayContent = ""; }
//if its an assistant message that requested tools add a note. 
if(message.role === 'assistant' && message.tool_calls && message.tool_calls.length > 0 && !displayContent){
	displayContent = "";
	const toolNotice = document.createElement('div');
	toolNotice.className = 'tool-call-notice';
	toolNotice.textContent = `[Requesting tool call(s); ${message.tool_calls.map(tc => tc.function?.name || 'unknown').join(', ')}]`;
	turnDiv.appendChild(toolNotice);
}else if (message.role === 'tool'){

	//if its a tool result content might be JSON 
	try {
		const parsed = JSON.parse(displayContent);
		displayContent = JSON.stringify(parsed, null, 2);
		contentTextarea.rows = displayContent.split('\n').length + 1;
	} catch(e) { }
}
contentTextarea.value = displayContent;
//only make assitant streaming textarea readonly initially. 


turnDiv.appendChild(contentTextarea);
messageHistoryStackDiv.appendChild(turnDiv);
//return contentTextarea; //return for potential streaming updates. 
 
}



function updateContextSizeInfo() {
	//for handleSendPrompt
     const contextInfoDiv = document.getElementById('contextSizeInfo'); // Get the display element
     if (!contextInfoDiv) return; // Exit if element doesn't exist
	 
     let lastPromptTokens = "N/A";
 if(messageHistory.length > 0){
	 latestAggregateTokens = messageHistory[messageHistory.length - 1].aggregate_tokens ?? "N/A"; 
 }
 contextInfoDiv.textContent = `Context tokens used in last input turn: ${lastPromptTokens}`;
}


function calculateAndStoreTokenCounts(){
	//for handleSendPrompt
	//follow deduced-peculiar Messages[0:3] algorithm for Metrics.eval_count and Metrics.prompt_eval_count 
	//algorithm is under false assumption about messages involvement in promptevalcount - unsure.  
	const historyLength = messageHistory.length;
	if(historyLength <2){
 	return;
	}
	
	const assistantIndex = historyLength - 1;
	const precedingIndex = historyLength - 2;
	
	const assistantMessage = messageHistory[assistantIndex];
	const precedingMessage = messageHistory[precedingIndex];
	console.log(`length${historyLength} == `);
	const promptEvalCount = assistantMessage.promptTokensForTurn; 
	const evalCount = assistantMessage.responseTokens;//assistant output
	if(typeof promptEvalCount !== 'number' || typeof evalCount !== 'number'){
		console.warn(`token counts missing for turn ending at index ${assistantIndex} `);
		assistantMessage.individual_tokens = assistantMessage.individual_tokens ?? null;
		assistantMessage.aggregate_tokens = assistantMessage.aggregate_tokens ?? null; 
		if(precedingMessage){
			precedingMessage.individual_tokens = precedingMessage.individual_tokens ?? null; 
			precedingMessage.aggregate_tokens = precedingMessage.aggregate_tokens ?? null;
		}
		return;
	}
	
	//1. assistant message
	assistantMessage.individual_tokens = evalCount;
	//aggregate cunt (assistant) = aggregatecount(x-1_ individual eval_count 
	//2 preceding messages
	if(precedingIndex === 0){
precedingMessage.individual_tokens = promptEvalCount;
precedingMessage.aggregate_tokens = promptEvalCount;
	}else{
//General: precedingIndex>=1
const prevTurnAggregateTokens = messageHistory[precedingIndex - 1]?.aggregate_tokens ?? 0;
const precedingTurnIndividualTokens = promptEvalCount - prevTurnAggregateTokens;
precedingMessage.individual_tokens = precedingTurnIndividualTokens;
//aggregate count 
precedingMessage.aggregate_tokens = promptEvalCount;
//sanity check. 
if(precedingMessage.individual_tokens < 0){
console.warn(`calculated negative individual tokens ${precedingMessage.individual_tokens} for index ${precedingIndex} previous aggregate ${prevTurnAggregateTokens} might be larger than current prompt eval count ${promptEvalCount} setting individual to 0`);
precedingMessage.individual_tokens = 0;
}
	}
//3. finalize assistant aggregate count. 
const precedingAggregate = precedingMessage?.aggregate_tokens ?? 0;
assistantMessage.aggregate_tokens = precedingAggregate + assistantMessage.individual_tokens;
console.log(`token counts updated for indices: ${precedingIndex} and ${assistantIndex}`);

//updateUI
updateMessageDisplayTokens(precedingIndex);
updateMessageDisplayTokens(assistantIndex);
updateContextSizeInfo();
 
}

function updateMessageDisplayTokens(index){
//helper to update the token display for a specific message turn in the ui
//for handleSendPrompt generate Input. 	 
	const turnDiv = messageHistoryStackDiv.querySelector(`.message-turn[data-index="${index}"]`);
	const message = messageHistory[index];
	if(!turnDiv || !message) return;
	
	const roleLabel = turnDiv.querySelector('strong');
	if(!roleLabel)reutnr;
	let roleText = `${message.role.charAt(0).toUpperCase() + message.role.slice(1)}`;
	let tokenInfo = "";
	//get calculated tokens
	const iTokens = message.individual_tokens;
	const aTokens = message.aggregate_tokens;
	//build token info string
	if(iTokens !== null || aTokens !== null){
		tokenInfo += " (";
if(iTokens !== null) tokenInfo += `Self: ${iTokens} T`;
if(iTokens !== null && aTokens !== null) tokenInfo += " / ";
if(aTokens !== null) tokenInfo += `Total: ${aTokens} T`;
tokenInfo += ")";
	}else{tokenInfo = " (Tokens: N/A) ";}
	
	roleLabel.textContent = roleText + tokenInfo;
 
}





 //reconstructmessagesinstack could be in core-services for history - as coalescedplan = present->future. 
 //dynamic-table = futur   e -> potential futures.  message stack = past <- present .  but archivedConversations also = past <- present. 
function reconstructMessagesFromStack(){
	//for handleSendPrompt 
	const messagesToSend = [];
	console.log("reconstructing messages for sending. current canonical history");
	for(let i = 0; i < messageHistory.length; i++){
		const originalMessage = messageHistory[i];
		const textareaElement = messageHistoryStackDiv.querySelector(`textarea[data-message-index="${i}"]`);
 		let currentContent = originalMessage.content;
		if(textareaElement){
			currentContent = textareaElement.value; 
		}else if (originalMessage.role !== 'system'){
			console.warn(`textarea not found for message index ${i} role${originalMessage.role}. `);
	}
	let cont3; 
	if (originalMessage.role === 'assistant' && Array.isArray(originalMessage.tool_calls) && originalMessage.tool_calls.length > 0 && currentContent === "") {
		cont3 = null;
	}else { cont3 = currentContent;}
	
	const messageForApi = {
		role: originalMessage.role, 
	content: cont3 };
	if(originalMessage.role === 'assistant' && Array.isArray(originalMessage.tool_calls) && originalMessage.tool_calls.length > 0) {
		messageForApi.tool_calls = originalMessage.tool_calls;
	}
	/*if(originalMessage.images && Array.isArray(originalMessage.images)){messageForApi.images = originalMessage.images;}*/
	messagesToSend.push(messageForApi);
	}
 
	return messagesToSend;
	}




 
// Main function for handling conversation turns
async function sendMessagesToOllama(model, messages, toolCapable = false, promptsMessage={role:"", content:""}) { 
    statusDiv.textContent = `Waiting for Ollama (${model})...`; // Updated status
    sendButton.disabled = true;
	toolCapable = true;
	messages.push(promptsMessage);//a messages class can have a getter and setter. 
	const requestData = buildOllamaRequestData(
	model, messages, toolCapable, definedTools ); //core-services.js 
 
    let assistantMessage = null; // To store the response from coreOllamaRequest

    try {
	console.log("4coreOllamaRequest called");
        // ======USER REQUEST TO OLLAMA============= 
        assistantMessage = await coreOllamaRequest(requestData);
        // =====================================  // --- Display the Complete Assistant Message ---
        // Since we sacrificed live streaming, update the UI once with the full message
let i234 = messageHistory.length;
		messageHistory.push(promptsMessage);
displayMessageInStack(promptsMessage, i234);

        // --- Handle Tool Calls ---
if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
 statusDiv.textContent = 'Tool calls received. Executing...';
 const toolResultMessages = await handleToolCalls(assistantMessage.tool_calls);
 HANDLETOOLCALLPRESENT = 0;

   // Add tool result messages to canonical history AND display them
 toolMsg = {role: 'tool', content: toolResultMessages};
const toolMsgIndex = messageHistory.length;
    messageHistory.push(toolMsg);
    displayMessageInStack(toolMsg, toolMsgIndex); 
// Display the tool result textarea

// --- Send tool results back to Ollama ---
 statusDiv.textContent = 'Sending tool results back to Ollama...';
 
 var recurs =  (MAX_RECUR_TOCA > HANDLETOOLCALLPRESENT++) ? true : false;
var tool_call_history = [{role: promptsMessage.role, content: promptsMessage.content}];
//paradigm question - The tool_call is requested to facilitate the response to the prompt,   
 	 
 var afterToolAssist =  await sendMessagesToOllama(model, tool_call_history, recurs, toolMsg);
    
        messageHistory.push(afterToolAssist);
displayMessageInStack(afterToolAssist, ++i234);
calculateAndStoreTokenCounts(); 

        } else {
            console.log(` No tool calls, this ${JSON.stringify(assistantMessage)} turn is finished`);
            statusDiv.textContent = 'Ready.';
            sendButton.disabled = false; // Re-enable button ONLY if no tool calls were made/handled
 
        messageHistory.push(assistantMessage);
displayMessageInStack(assistantMessage, messageHistory.length - 1);
calculateAndStoreTokenCounts(); 
		}

    } catch (error) {
        // Error occurred during coreOllamaRequest or subsequent processing
        console.error('Error in senMessagesToOllama:', error);
        statusDiv.textContent = `Error: ${error.message}`;
        // Optionally display error in the message stack
        const errorIndex = messageHistory.length;
        sendButton.disabled = false; // Re-enable button on error
    }
 	 
}

//all calls accounted for. 
async function handleSendPrompt( ){ 
console.log("handleSendPrompt #1");

const selectedOption = modelInput.options[modelInput.selectedIndex]; 
const model = modelInput.value.trim();
const toolCapable = modelInput.options[modelInput.selectedIndex].dataset.supportsTools === 'true';
const userPrompt = promptInput.value.trim();
const numCtx = parseInt(numCtxSlider.value, 10);

if (!model || !userPrompt){
	console.log('handleSendPrompt() ERROR =please enter borht a model name and a prompt.');
	return;
	}
	let newUserMessage;
	if(userPrompt){
		
		newUserMessage = {role: 'user', content: userPrompt, individual_tokens: null, aggregate_tokens: null };
		promptInput.value = '';
	} else if (messageHistory.length === 0){
		console.log("cannot send empty prompt with no history;");
		return;
	}
	toolOutputArea.textContent = '';
	statusDiv.textContent = "preparing history and sending to ollama";
	sendButton.disabled = true;
	
	console.log("5reconstructmessagesfromstack");
	const messagesToSend = reconstructMessagesFromStack();
//	messagesToSend.push({role: 'user', content: userPrompt});
	await sendMessagesToOllama(model, messagesToSend, toolCapable , newUserMessage );
 

}

if(sendButton ){
	console.log("send button should work");
sendButton.addEventListener('click', handleSendPrompt);
}else{console.log("sendButton doesn't work");}
 
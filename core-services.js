//core-services.js
//PROCESS TO MODULARIZE THE THING;
//1) Test that main-chat-ui.js works.
//1.Expectations: 
//1.a)handleSendPrompt works, and responds.
// 1.b) and message history works 
// 1.c) tokens are counted - even wrongly
//2) Test that execution-suite-single-pass.js works
// 
//3) Test that execution-suite-twopass.js works. 
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
 
 
//it is necessary to move these into state objects. 
const numCtxSlider = document.getElementById('numCtxSlider');
const numCtxValueDisplay = document.getElementById('numCtxValue');
const contextInfoDiv = document.getElementById('contextSizeInfo');
const topkSlide = document.getElementById('topkslider');
const tempSlide = document.getElementById('tempslider');
const topkdisp  = document.getElementById('topkValue');
const tempdisp  = document.getElementById('tempValue');
	 	
const statusDiv = document.getElementById('status');

const sps = document.getElementById("savePresentScenario");
			
		
const DEFAULT_NUM_CTX = 4096; 
const MIN_NUM_CTX = 512; 

function handleModelChange(){
	//for handleSendPrompt 
	const selectedOption = modelInput.options[modelInput.selectedIndex];
	const hardMaxCtx = parseInt(selectedOption.dataset.hardmaxctx, 10) || DEFAULT_NUM_CTX; 
	numCtxSlider.max = hardMaxCtx; 
	numCtxSlider.min = Math.min(MIN_NUM_CTX, hardMaxCtx); 
let currentSliderValue = parseInt(numCtxSlider.value, 10);
if(currentSliderValue > hardMaxCtx){
	numCtxSlider.value = hardMaxCtx;
	currentSliderValud = hardMaxCtx;
}
if(currentSliderValue < parseInt(numCtxSlider.min, 10)){
	numCtxSlider.value = numCtxSlider.min;
	currentSliderValue = parseInt(numCtxSlider.min, 10);
}
numCtxValueDisplay.textContent = numCtxSlider.value; 
 
}


function handleSliderInput(){ 
numCtxValueDisplay.textContent = numCtxSlider.value;

  
}	
function handletopkinput(){
topkdisp.textContent = topkSlide.value;
}
function handletempinput(){
tempdisp.textContent = tempSlide.value;
}


modelInput.addEventListener('change', handleModelChange);
numCtxSlider.addEventListener('input', handleSliderInput);
topkSlide.addEventListener('input',handletopkinput);
tempSlide.addEventListener('input',handletempinput);		
		
 async function SaveMessageHistory(MessHist = messageHistory){
	//@param = array 
	statusDiv.textContent = "Client: saving conversationhistory"
	sps.disabled = true;
	try {
		const historyJsonString = JSON.stringify(MessHist, null, 2);
		const response =  await fetch('/saveHistory', {
			method: 'POST', 
			headers: {'Content-Type': 'application/json',
			},
			body: historyJsonString,
		});
		const responseText = await response.text();
		
		if(response.ok){
			console.log("save history successful");
			statusDiv.textContent = `Saved client: ${responseText}`;
		}else{
			console.log(`error save history failed ${responseText} ${response.status}`);
		}
	} catch (err) {
		console.log(` error saving conversation history ${err.message}`);
	} finally {
		sps.disabled = false;
	}
	

 }
 
//Generate Interface with messageHistory xxxRRR

function buildOllamaRequestData(model, messages, toolCapable, availableTools ){
//immutable function (UI independent.) 
//@param model {string} - the name of the model. i.e: 'ollama run model'
//@param messages []{types.go/messages struct} - from reconstructMessages_*()
//@param toolCapable {bool} - necessary because if tools sent to incapable model = fail. (in modelinputs) 
//@param availableTools {JSON} - see "Tool Definition Functions" , namely handleImportTools() .  
//prepare the tools array suitable for the API (filtering out code
//this logic remains important for preparing the tools parameter. 
const toolsForApi = Object.values(availableTools).map(tool => {
if(!tool?.function){return null;}
const {code, ...definition} = tool.function;
return {type: tool.type, function: definition };
 }).filter(tool => tool !== null);
 
// let topkselec = parseInt(topkSlide.value, 10);
//let  tempselec = parseFloat(tempSlide.value, 10);
 
 const requestData = {
	 model: model, 
	 messages: messages, 
 stream: true, 
 options: {
 num_ctx: parseInt(numCtxSlider.value, 10),
 temperature: parseFloat(tempSlide.value, 10),
 top_k: parseInt(topkSlide.value, 10)
 }
 };
 
 if(toolCapable && toolsForApi.length > 0) {
	 requestData.tools = toolsForApi;
 }
 /*important: check ollama documnetation for whether num_ctx should be top level , or inside options. assuming options for now as in common. adjust if needed. 
 if num_ctx shuld be top-level; requestData.num_ctx = numCtx; and deetel requestdata.options. */ 
 return requestData;
}


/**
 * Sends a request to the Ollama API via the proxy and returns the
 * complete, accumulated assistant response object OR throws an error.
 * Handles fetch, HTTP errors, and stream processing internally.
 * Does NOT interact with UI or messageHistory.
 *
 * @param {object} requestData - The data payload for the Ollama API
 * (e.g., { model, messages, tools?, stream: true })
 * @returns {Promise<object>} A promise that resolves to the final assistant
 * message object (e.g., { role: 'assistant', content: '...', tool_calls: [...] })
 * or rejects with an error.
 */
async function coreOllamaRequest(requestData) { // only called through handleSendPrompt()
	//@param {object} object created by buildOllamaRequestData(z,z,z,z )
	//@returns structure of object, not stringified. 


        let finalAssistantMessage = { role: 'assistant', content: '', tool_calls: [] };
    try {
   const response = await fetch('/api/ollama', {  
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestData), 
        });

        if (!response.ok) {
            // Attempt to get error details from response body
            let errorBody = `(Status: ${response.status})`;
            try {
                errorBody = await response.text();
            } catch (_) { /* Ignore error reading body */ }
            console.error(`CoreOllamaRequest HTTP Error: ${response.status}`, errorBody);
            throw new Error(`Ollama API request failed: ${response.status} - ${errorBody}`);
        }

        if (!response.body) {
            throw new Error('Ollama API response body is null.');
        }

        // Process the stream internally to accumulate the result
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamDone = false;
        let receivedContent = ""; // Accumulator for content
        let receivedToolCalls = []; // Accumulator for tool calls
let finalPromptEvalCount = null;
let finalEvalCount = null; 
let finalchunk = null;
let buffer = '';
        while (!streamDone) {
            const { done, value } = await reader.read();
            if (done) {
				if(buffer){try{
					let parsedLine = JSON.parse(buffer);
					
					             // Accumulate content
                    if (parsedLine.message?.content) {
						
console.log(`the BUFFER's line ${parsedLine.message.content}`);
                        receivedContent += parsedLine.message.content;
                    }
                    // Accumulate tool calls
  if (Array.isArray(parsedLine.message?.tool_calls)) {
                        receivedToolCalls.push(...parsedLine.message.tool_calls);
                    } else if (Array.isArray(parsedLine.tool_calls)) {
                        receivedToolCalls.push(...parsedLine.tool_calls);
                    }
                    // Check for Ollama's explicit done flag
                    if (parsedLine.done === true) {
                        streamDone = true;
 finalPromptEvalCount = parsedLine.prompt_eval_count ?? null; 
 finalEvalCount = parsedLine.eval_count ?? null; 
 finalchunk = parsedLine;
					}
				}catch(e){
					console.warn("stream ended with imcomplete buffer",buffer);
				}
                streamDone = true;
                break;
            }
			}

            const chunkText = decoder.decode(value, { stream: true });
			buffer += chunkText;
    const lines = buffer.split('\n');//.filter(line => line.trim() !== '');
buffer = lines.pop();
//let bugspare = ""; let falt = false;
//for(let i3 = 0; i3 < lines.length; i3++){	let line = lines[i3];
            lines.forEach(line => {
				let parsedLine;
                try {
//if(falt){line = bugspare + line; bugspare = ""; falt = false;}
                    parsedLine = JSON.parse(line);
					
                       // Accumulate content
                    if (parsedLine.message?.content) {
//console.log(`chunk line ${parsedLine.message.content}`);
                        receivedContent += parsedLine.message.content;
                    }
                    // Accumulate tool calls
  if (Array.isArray(parsedLine.message?.tool_calls)) {
                        receivedToolCalls.push(...parsedLine.message.tool_calls);
                    } else if (Array.isArray(parsedLine.tool_calls)) {
                        receivedToolCalls.push(...parsedLine.tool_calls);
                    }
                    // Check for Ollama's explicit done flag
                    if (parsedLine.done === true) {
                        streamDone = true;
 finalPromptEvalCount = parsedLine.prompt_eval_count ?? null; 
 finalEvalCount = parsedLine.eval_count ?? null; 
 finalchunk = parsedLine;
				}
				
				} catch (e) {
//	   falt = true; bugspare = line;
                    console.warn("CoreOllamaRequest: Could not parse JSON line:", line, e); 
                }

				
//}              
          });
        } // End while loop

        // Construct the final message object
 finalAssistantMessage.content = receivedContent;
 finalAssistantMessage.tool_calls = receivedToolCalls;
 // Handle Ollama's convention for null content when only tool calls are present
 if (finalAssistantMessage.tool_calls.length > 0 && finalAssistantMessage.content === "") {
 finalAssistantMessage.content = null; }
finalAssistantMessage.promptTokensForTurn = finalPromptEvalCount; 
finalAssistantMessage.responseTokens = finalEvalCount; 

//XXX5 console.log("CoreOllamaRequest :", finalAssistantMessage); 
 return finalAssistantMessage; 
 // Return the complete message object
    } catch (error) {
        // Log and re-throw network or parsing errors for the caller to handle
        console.error("Error in coreOllamaRequest:", error);
        // Ensure the error is propagated
        throw error; // Re-throw the error after logging
    } 
}
 

/* executes special two pass request for a single turn. 
@param {number} threeCellReferenceId 
@returns {bool} promise that resolves to true upon success. */
async function  coreTwoPassRequest(threeCellReference){
	const threeCellInstance = d3(threeCellReference);
	if(!(threeCellInstance instanceof Three_Cell)){return false;}
	const promptMessage = d2(threeCellInstance.prompt);
	if(!(promptMessage instanceof Two_Layer)){return false;}
	const originalPromptContent = promptMessage.content; 
	const modelToUse = threeCellInstance.model || modelInput.value;

//Pass 1 - deterministic. 
	const originalTemp = tempSlide.value; const originalTopK = topkSlide.value;
	const focusedOptions = {num_ctx: parseInt(numCtxSlider.value, 10), temperature: 0.0, top_k: 1,};
	const requestData1 = buildOllamaRequestData(modelToUse, [{role: promptMessage.role, content: originalPromptContent}],false,{});
	requestData1.options = focusedOptions;
	let response1_obj;
	try { response1_obj = await coreOllamaRequest(requestData1);
	}finally { tempSlide.value = originalTemp; topkSlide.value = originalTopK;
	handletempinput(); handletopkinput();
	}
	const focusedprompttokens = response1_obj.promptTokensForTurn;

//Pass 2 - Creative
	const prompt2 = `${originalPromptContent}\n${response1_obj.content}`;
	const messageHistoryForContext = reconstructMessagesFromFourRow(DynamicTableState.activeHistory.RegId);
	messageHistoryForContext.push({role: 'user', content: prompt2});
	const requestData2 = buildOllamaRequestData(modelToUse, messageHistoryForContext, false, {});
	const response2_obj = await coreOllamaRequest(requestData2);
//update cell 
console.log(`inside 2pass after request 2nd pass- ${JSON.stringify(response2_obj)}`);
	d2(threeCellInstance.prompt).setContent(originalPromptContent);
	d2(threeCellInstance.response).setContent(response2_obj.content);
	//manually set token count without calling calculateAndStore (which may be wrong algorithm).
	if(focusedprompttokens){//XX34 
console.log(`HERE IN TWO PASS: prompt individual token`);
d2(threeCellInstance.prompt).individual_tokens = focusedprompttokens; 
}else{
console.log("here in two pass, individual fail");
}
	if(response2_obj.responseTokens){
console.log(`HERE IN 2 PASS: RESPONSE individual token`);
d2(threeCellInstance.response).individual_tokens = response2_obj.responseTokens;

}else{
	console.log("response token fail");
	}
	//history
	DynamicTableState.activeHistory.addCell(threeCellReference);
//	calculateTokensFromHistory(DynamicTableState.activeHistory.RegId);
	return true;
}

   
/* calculate token counts on the prompt and response two_layer or complete three cell turn. */  
//25jun25
function calculateAndStoreFourRowTokens(fourRowReference, completedTurnIndex, finalChunkData){
	const fourRowInstance = d4(fourRowReference);
console.log(`XX98 inside calculateAnd4rowTokens ${JSON.stringify(finalChunkData)}`);
	if(!fourRowInstance || completedTurnIndex < 0 || !finalChunkData) {	
	console.error("calculateAndStoreTokens invalid arguments." ); return;
	}
const promptEvalCount = finalChunkData.prompt_eval_count; //size of messages + response
const evalCount = finalChunkData.eval_count; //size of response
if(typeof promptEvalCount !== 'number' || typeof evalCount !== 'number'){
	console.warn("Token counts not available in final response chunk");
	return;
}
const completedTurnCell = d3(fourRowInstance.sequence[completedTurnIndex]);
if(!(completedTurnCell instanceof Three_Cell)){ console.log(`calculateandstore XX92  `); return;}

const promptMessage = d2(completedTurnCell.prompt);
const responseMessage = d2(completedTurnCell.response);
if(!(promptMessage instanceof Two_Layer)||!(responseMessage instanceof Two_Layer)) { console.log(`calculateandstore XX93  `);
console.log(`calculateandstore XX93   `); return;}


//1. Set toekn counts for the turn's assistant's message. 
//2. set token counts for the turn's prompt message. this requires deduction. 
if(completedTurnIndex === 0){
	//special case: for the very first turn, the prompt_eval_count is it. 
	if(promptMessage.individual_tokens === 0){promptMessage.individual_tokens = promptEvalCount;} 
promptMessage.aggregate_tokens_at_this_point = promptMessage.individual_tokens; 
responseMessage.individual_tokens = evalCount ;
responseMessage.aggregate_tokens_at_this_point = promptEvalCount + evalCount;

} else if (completedTurnIndex > 0) {  //completedTurnIndex > 1 
//general case: for subsequent turns deduce the prompt's size.
//get the turn before this one to find the previous aggregate total. 
	const prevTurnCell = d3(fourRowInstance.sequence[completedTurnIndex - 1]);
	if(prevTurnCell instanceof Three_Cell){
		const prevAggregateTokens = d2(prevTurnCell.response).aggregate_tokens_at_this_point;
		if(typeof prevAggregateTokens === `number`){
			//the size of this turn's prompt context which includes user.prompt + tool responses.  
			//is the total prompt's Eval context ollama saw minus the aggregate from the previous turn
			promptMessage.individual_tokens = promptEvalCount - prevAggregateTokens; 
		}else{
			console.warn ("couldn't find previous aggregatetokens to calculate.");
			promptMessage.individual_tokens = 0;
		}
	}
	
		promptMessage.aggregate_tokens_at_this_point = promptEvalCount;
	//3. finalize the AGGREGATE token count for the assitant repsonse. 
	//this is the aggregate total from the prompt turn + the indivudal tokens. 
	if(typeof promptMessage.aggregate_tokens_at_this_point === 'number'){
		responseMessage.individual_tokens = evalCount;
		responseMessage.aggregate_tokens_at_this_point = promptMessage.aggregate_tokens_at_this_point + evalCount;
		/*
		for(let i = 0; i < completedTurnIndex; i++){
			let curpromind = d2(d3(fourRowInstance.sequence[i]).prompt).individual_tokens;
			let currespind = d2(d3(fourRowInstance.sequence[i]).response).individual_tokens;
		responseMessage.aggregate_tokens_at_this_point += curpromind;
		responseMessage.aggregate_tokens_at_this_point += currespind;
		promptMessage.aggregate_tokens_at_this_point += curpromind;
		promptMessage.aggregate_tokens_at_this_point += currespind;
		}		
		*/ 

	} else{
		responseMessage.aggregate_tokens_at_this_point = 0;
	}

	
	}
	
console.log(`token updatated for turn at index ${completedTurnIndex}: -prompt:${promptMessage.id}): indivual=${promptMessage.individual_tokens}, aggregate=${promptMessage.aggregate_tokens_at_this_point}\n -response:${responseMessage.id}: individual=${responseMessage.individual_tokens} aggregate=${responseMessage.aggregate_tokens_at_this_point}`);
}

/*
Create the ChatRequest.messages[] array from a Four_Row instance. 
@param fourRowInstance is not coalescedPlan, but historicalRecord of recently sent (i.e: if play is pushed then fourRowInstance is new relative to push of play.) 
@returns array messagesForApi[]{role, content}  

IS FOR ? 
*/
//25jun25
function reconstructMessagesFromFourRow(fourRowReference){
	const fourRowInstance = d4(fourRowReference);
	const messagesForApi = [];
	if(!fourRowInstance || !(fourRowInstance instanceof Four_Row)){
		console.error("invalid argument: a four_row instance is required.");
		return messagesForApi;
	}
	for(const threeCellRegId of fourRowInstance.sequence){
		const turn = d3(threeCellRegId);
		if(!turn) continue;
		
		const promptMessage = d2(turn.prompt);
		const responseMessage = d2(turn.response);
		
		if(promptMessage && promptMessage.content && promptMessage.content !== "[Your turn]"){
			messagesForApi.push({ role: promptMessage.role, content: promptMessage.content});
		}else{
		break;
		}
		var respcontext = responseMessage.content;
		if(responseMessage && respcontext && respcontext !== "[Awaiting Response...]"){
			const modelch = turn.model;
			for(let keyin in modeloptions){
				if(modeloptions[keyin].value === modelch){
					if(modeloptions[keyin].doesThinking){
						respcontext = truncateThinkingTags(respcontext);
				}}
			}
			messagesForApi.push({ role: responseMessage.role, 
			content: respcontext } ) ;
		}else{
			break;
		}
	}
	return messagesForApi;
	
}



/* Takes a Three_cell instance, sends its prompt to Ollama, streams the response back into the cell's response object, and calculates token counts for the turn. @param {three_cell} threeCellInstance the conversational turn object to process. 
@returns {Promise<boolean>} a Promise that resolves to true on success or false on failures. 
 */
//25jun25
async function coreOllamaRequestTC(threeCellReference){
	//called by only 
	const threeCellInstance = d3(threeCellReference);
	if(!threeCellInstance || !(threeCellInstance instanceof Three_Cell)){
		console.error("coreOllamaRequest: Invalid parameter. a three_cell instance is required.");
		return false;
	}
	
	//1. prepare request data
	//dereference the prompt's two layer object using its RegId
//XX34fetch prompt from 3cell
	const promptMessage = d2(threeCellInstance.prompt);
	if(!promptMessage || !promptMessage.content){
		console.error(`coreOllamaRequest ${threeCellInstance.id} is empty.`);return false;
	}
//XX34construct messages[] from DynamicTableState.activeHistory 	
	const messagehist = reconstructMessagesFromFourRow(DynamicTableState.activeHistory.RegId);
	//getmodel and context
	const modelch 	=  threeCellInstance.model ||	modelInput.value;
	const cntch		=	numCtxSlider.value;	
	//model callbacks
	let rules = null;
	for(let keyin in modeloptions){
		if(modeloptions[keyin].value === modelch){
			rules = modeloptions[keyin];
		}
	}
	let finalpromptMessage = promptMessage.content;
	if(rules && rules.hasRequestCallback && processingCallbacks[rules.requestCallback]){
		console.log("prompt prefix processor here");
		const requestProcessor = processingCallbacks[rules.requestCallback];
		finalpromptMessage = requestProcessor(finalpromptMessage);
	}
	
//XX34push prompt to messages[] 
	messagehist.push({role: promptMessage.role, content: finalpromptMessage });
	//3rd argument is true and 4th is tools
	
	const requestData = buildOllamaRequestData(modelch, messagehist, false,{});
	
	//2. PRocess the Requeset and stream response ---
	let finalChunkData = null; //stores the final chunk done=true 
	try {
		//reset the call's response content before streaming. 
//XX34fetch response 
		const responseMessage = d2(threeCellInstance.response);
		responseMessage.content = ""; 
		
		const response = await fetch('/api/ollama',{method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(requestData)});
		
		if(!response.ok){
			const errorText = await response.text();
			throw new Error(`CORXXX1 Ollama API request failed: ${response.status} - ${errorText}`);
		}
		if(!response.body){ 
			throw new Error('CORXXX1 ollama API response body is null.');
		}
		
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let streamDone = false;
		let buffer = '';
		let receivedToolCalls = [];
		while(!streamDone){
			const {done, value} = await reader.read();
			if(done){
				if(buffer != ''){ try{
					let parsedLine = JSON.parse(buffer);
					if(parsedLine.message?.content){
						receivedContent += parsedLine.message.content;
					}
					if(Array.isArray(parsedLine.message?.tool_calls)){
						receivedToolCalls.push(...parsedLine.message.tool_calls);
					}else if(Array.isArray(parsedLine.tool_calls)){
						receivedToolCalls.push(...parsedLine.tool_calls);
					}
					if(parsedLine.done === true){
						streamDone = true;
						finalChunkData = parsedLine;
					}
				}catch (e){
					console.warn(`stream in coreRequestTC imcomplete=${buffer}`);
				}
				}
				streamDone = true;
				break;
			}
			
		const chunkText = decoder.decode(value, { stream: true });
		buffer += chunkText;
		const lines = buffer.split('\n');
		buffer = lines.pop();
		
		lines.forEach(line => {
			try {
				const parsedLine = JSON.parse(line);
				if(parsedLine.message?.content){
//stream response directly into the three cell response object
responseMessage.content += parsedLine.message.content;
				}
				//capture the final data chunk when done is true
				if(parsedLine.done === true){
					finalChunkData = parsedLine;
				}
			} catch(e){
				console.warn("coreOllamaRequestTC: couldn't not parse JSON line",line,e);
			}
		});
		//plaseholder for UI updata during streaming if needed. 
		}//end whlie loop.
		
		//3. finalize turn and calculate tokens --- 
		if(finalChunkData){
			//token size and messages come from history, which is conversationhistory. 
			var lne2 = DynamicTableState.activeHistory.sequence.length;
			DynamicTableState.activeHistory.addCell(threeCellReference);
console.log(`XX98 within coreOllamaTC ${DynamicTableState.activeHistory.sequence.length} `);
			calculateAndStoreFourRowTokens(DynamicTableState.activeHistory.RegId,DynamicTableState.activeHistory.sequence.length-1,finalChunkData);
		}else{
			console.warn("ollama stream finished without a done true");
		}
		
		if(rules && rules.hasResponseCallback && processingCallbacks[rules.responseCallback]){
			
			const responseProcessor = processingCallbacks[rules.responseCallback];
			const affext  = responseProcessor(responseMessage.content);
			responseMessage.setContent(affext); 
		}
		//place holder for UI update after streaming. 
return true;
	} catch (error){

console.error("error in coreOllama request", error);
const responseMessage = d2(threeCellInstance.response);
responseMessage.content = `[error ${error.message}]`;
return false;
	}

}	


console.log("Core-services.js downloaded");




/*
renders all archived conversations into the history log table. 
*/
function renderArchivedConversations(TableState = DynamicTableState){
	if(!conversationHistoryLogContainer) {return;}
	conversationHistoryLogContainer.innerHTML = '';
	
	TableState.archivedRuns.forEach(archivedRu => {
		const tr = document.createElement('tr');
		const td = document.createElement('td'); 
		td.innerHTML = archivedRu  ; 
		tr.appendChild(td);
		conversationHistoryLogContainer.prepend(tr);
	});
}



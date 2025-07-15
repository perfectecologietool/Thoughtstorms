//@changelog = handleExecuteTwoPassTurn -> etc  
function match_it(arg1, arry) {
 // Check if arg1 is a key of the arry
const ke3 = Object.keys(arry);
    for (let i = 0; i < ke3.length; i++) {
        if (arg1 === ke3[i]) {
            return true;
        }
    }

    // Check if arg1 is a value of the array
	const val3 = Object.values(arry);
    for (let i = 0; i < val3.length; i++) {
        if (arg1 === val3[i]) {
            return true;
        }
    }

    return false;
}
var StackTrace = []; 
function popStackTrace (ind){
	StackTrace.splice(ind,1);
}

function pushStackTrace(nameofun){ 

let v1 = StackTrace.push(nameofun);
return v1 - 1;
}

function LogStackTrace(){
	let str1 = "+";
	for(let i1 = 0; i1 < StackTrace.length; i1++){
str1 += "<br>+";	
	for(let i1c = 0; i1c < i1; i1c++){
			str1 += "-";
		}
		str1 += StackTrace[i1];
	}
	str1 += "<br>";
console.log(str1);
}

 
let messageHistory = [];
	
	
async function SaveMessageHistory(){
 	const saveHistoryBut = document.getElementById('saveHistoryButton');
const statusDiv = document.getElementById('status');
	if(messageHistory.length === 0 ){
		statusDiv.textContent = "conversationHistory is empty. nothing to save.";
		return;
	}
	statusDiv.textContent = "Client: saving conversationhistory"
	saveHistoryBut.disabled = true;
	try {
		const historyJsonString = JSON.stringify(messageHistory, null, 2);
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
		saveHistoryBut.disabled = false;
	}
	

 };

 document.addEventListener('beforeunload', async () => { await SaveMessageHistory();} );
	

document.addEventListener('DOMContentLoaded',  () => {
	//console.log(`FUNCTION IS ${outsource.toString()}`);
	const disptoken = document.getElementById("tokendisp");
	const promptInput = document.getElementById('prompt');
	const sendButton = document.getElementById('send');
	const saveHistoryBut = document.getElementById('saveHistoryButton');
	

const responseDiv = document.getElementById('response');
//+
const messageHistoryStackDiv = document.getElementById("messageHistoryStack");
const statusDiv = document.getElementById('status');
//tiik
const toolOutputArea = document.getElementById('tool_output_area');
const functionNameInput = document.getElementById('function_name');
const functionDescInput = document.getElementById('function_description');
const functionCodeInput = document.getElementById('function_code');
const numParamsSelect = document.getElementById('number_parameters');
const paramsArea = document.getElementById('parameters_area');
const addFunctionButton = document.getElementById('add_function');
const definedFunctionsList = document.getElementById('defined_functions_list').querySelector('ul');
//importexport tools
const toolsJsonArea = document.getElementById("tools_json_area");
const exportToolsButton = document.getElementById("export_tools_button");
const importToolsButton = document.getElementById("import_tools_button");
const importExportStatus = document.getElementById("import_export_status");
const numCtxSlider = document.getElementById('numCtxSlider');
const numCtxValueDisplay = document.getElementById('numCtxValue');
const contextInfoDiv = document.getElementById('contextSizeInfo');
const topkSlide = document.getElementById('topkslider');
const tempSlide = document.getElementById('tempslider');
const topkdisp  = document.getElementById('topkValue');
const tempdisp  = document.getElementById('tempValue');
//5Dtracks
const paintTracksBtn = document.getElementById('renderbtn'); 
//

  const modelInput = document.getElementById('modelSel'); 
  
  const processingCallbacks = {
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
  };
  
  var modeloptions = { "Q2 draft":{ supportstools:"true",
  hardmaxctx:"32000",
  value:"qwen2.5-coder:0.5b",
  hasRequestCallback : "true",
  requestCallback : "addCoderSuffix",
  hasResponseCallback : "true",
  responseCallback : "extractCodeBlocks",
  }, 
  "JSON structure":{supportstools:"true",
  hardmaxctx:"58000",
  value:"Osmosis/Osmosis-Structure-0.6B:latest",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback :null
  },  
  "MD convert":{supportstools:"true",
  hardmaxctx:"228000",
  value:"reader-lm:1.5b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback :null
  },
  "languageSupport":{supportstools:"true",
  hardmaxctx:"8000",
  value:"command-r7b:7b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback :null
  },
    "Coder":{supportstools:"true",
	hardmaxctx:"128000",
	value:"qwen2.5-coder:7b",
  hasRequestCallback : "true",
  requestCallback : "addCoderSuffix",
  hasResponseCallback : "true",
  responseCallback : "extractCodeBlocks",
	},
  "GeNowledge":{supportstools:"true",
  hardmaxctx:"32000",
  value:"falcon3:10b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback : null
  },
  "DeeKoder":{supportstools:"true",
  hardmaxctx:"128000",
  value:"deepcoder:14b",
  hasRequestCallback : "true",
  requestCallback : "addCoderSuffix",
  hasResponseCallback : "true",
  responseCallback : "extractCodeBlocks"
  },
  "r1-Planner":{supportstools:"true",
  hardmaxctx:"8000",
  value:"deepseek-R1:14b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback : null
  },
	"q2.5-Maths":{supportstools:"true",
	hardmaxctx:"128000",
	value:"qwen2.5-coder:32b",
  hasRequestCallback : "true",
  requestCallback : "addMathSuffix",
  hasResponseCallback : "false",
  responseCallback : null
	}, 
  
  "Dal coder":{supportstools:"true",
  hardmaxctx:"128000",
  value:"devstral:24b",
  hasRequestCallback : "true",
  requestCallback : "addCoderSuffix",
  hasResponseCallback : "true",
  responseCallback : "extractCodeBlocks"
  },
  
  "q3a3-Frayer":{supportstools:"true",
  hardmaxctx:"40000",
  value:"qwen3:30b-a3b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback : null
  },
  "Orchestrator":{supportstools:"true",
  hardmaxctx:"8000",
  value:"deepseek-R1:32b",
  hasRequestCallback : "false",
  requestCallback : null,
  hasResponseCallback : "false",
  responseCallback : null
  }
  };
  
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
//savehistory 
if(saveHistoryBut){
   saveHistoryBut.addEventListener('click', handleSaveConversationHistory);
}

async function handleSaveConversationHistory(){
	//function for server to save the conversation stemming from the handleSendPrompt() 'generate' input.  
let vidid =	 pushStackTrace("DOM.handleSaveConversationHistory");/* LogStackTrace(); */
	if(messageHistory.length === 0 ){
		statusDiv.textContent = "conversationHistory is empty. nothing to save.";
		return;
	}
	statusDiv.textContent = "Client: saving conversationhistory"
	saveHistoryBut.disabled = true;
	try {
		const historyJsonString = JSON.stringify(messageHistory, null, 2);
		const response = await fetch('/saveHistory', {
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
		saveHistoryBut.disabled = false;
	}
popStackTrace(vidid);	 
}

		


// -- State ---
let definedTools = {};
//messagehistory remains the structured source of truth driving the display... did it just hack me? truth is truth - does display drive source?
//let messageHistory = [];
let nextMessageIndex = 0;
const DEFAULT_NUM_CTX = 4096; 
const MIN_NUM_CTX = 512; 

// --- Event LIsteners ---
numParamsSelect.addEventListener('change', renderParameterInputs);
addFunctionButton.addEventListener('click', handleAddFunction);
sendButton.addEventListener('click', handleSendPrompt);

exportToolsButton.addEventListener('click', handleExportTools);
importToolsButton.addEventListener('click',handleImportTools);

modelInput.addEventListener('change', handleModelChange);
numCtxSlider.addEventListener('input', handleSliderInput);
topkSlide.addEventListener('input',handletopkinput);
tempSlide.addEventListener('input',handletempinput);

paintTracksBtn.addEventListener('click', recoalesceAndRenderAll); 

handleModelChange();
function handleModelChange(){
	//for handleSendPrompt
let vidid =	 pushStackTrace("Dom.handleModelChange");/* LogStackTrace(); */
	const selectedOption = modelInput.options[modelInput.selectedIndex];
	const hardMaxCtx = parseInt(selectedOption.dataset.hardmaxctx, 10) || DEFAULT_NUM_CTX; 
	numCtxSlider.max = hardMaxCtx; 
	numCtxSlider.min = Math.min(MIN_NUM_CTX, hardMaxCtx);
	
//clamp current slider value if it exceeds the max. 
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
//console.log(`model changed, slider max set to ${hardMaxCtx}, value: ${numCtxSlider.value}`);

 
popStackTrace(vidid);	 
}


function handleSliderInput(){
let vidid =	 pushStackTrace("Dom.handleSliderInput");/* LogStackTrace(); */
numCtxValueDisplay.textContent = numCtxSlider.value;


popStackTrace(vidid);	 
}	
function handletopkinput(){
topkdisp.textContent = topkSlide.value;
}
function handletempinput(){
tempdisp.textContent = tempSlide.value;
}


// --- Tool Definition functions ---
function renderParameterInputs() {
	const numParams = parseInt(numParamsSelect.value, 10);
	paramsArea.innerHTML = '';
for (let i = 1; i <= numParams; i++){
	const div1 = document.createElement('div');
	div1.className = 'parameter-definition';
	div1.innerHTML = `
	<h4>Parameter${i}</h4>
	<label for="param_name_${i}">Name:</label>
	<input type="text" id="param_name_${i}" placeholder="parameter name">
	<label for="param_type_${i}">Type:</label>
	<select id="param_type_${i}">
	<option value="string">string</option>
	<option value="number">number</option>
	<option value="boolean">boolean</option>
	<option value="object">object</option>
	<option value="array">array</option>
	</select>
	<label for="param_desc_${i}">Description:</label>
	<textarea id="param_desc_${i}" rows="2" placeholder="description for the LLM"></textarea>
	<label><input type="checkbox" id="param_req_${i}" value="required">Required</label>`;
paramsArea.appendChild(div1);
}
}

function handleAddFunction(){
const name = functionNameInput.value.trim();
const description = functionDescInput.value.trim();
const code = functionCodeInput.value.trim();
const numParams = parseInt(numParamsSelect.value,10);

if(!name || !description || !code){
console.log('please fill in function name, descriptionk and code.');
return;
}
if(!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)){
	console.log('function name nmust be a valid javascript identifier (letters numbers');
	return;
}
const parameters = {
	type: 'object',
	properties: {},
	required: []
};
for(let o = 1; o <= numParams;o++){
	
const paramName = document.getElementById(`param_name_${o}`).value.trim();
const paramType = document.getElementById(`param_type_${o}`).value;
const paramDesc = document.getElementById(`param_desc_${o}`).value.trim();
const paramReq = document.getElementById(`param_req_${o}`).checked;
if(!paramName || !paramDesc){
	console.log(`please fill in name and description for parameter ${o}`);
return ;
}
parameters.properties[paramName] = {
	type: paramType,
description: paramDesc
};
if(paramReq){
	parameters.required.push(paramName);
}
}
//store the tool definition in the formate ollama expects. 
definedTools[name] = {
	type: 'function',
	function: {
		name: name,
		description: description,
		parameters: parameters, 
	code: code}
};
console.log(`function "${name}" added/updated`);
updateDefinedFunctionsUI();
clearFunctionForm();
console.log("defined tools: ", definedTools);
}
	
function updateDefinedFunctionsUI(){
	definedFunctionsList.innerHTML = '';
	for(const name in definedTools){
		const li = document.createElement('li');
		const descriptionSnippet = definedTools[name]?.function?.description ? definedTools[name].function.description.substring(0,50) + '...' : '[no description]';
		li.textContent = `${name} (...) - ${descriptionSnippet}...`;
		definedFunctionsList.appendChild(li);
	}
}

function clearFunctionForm(){
	functionNameInput.value = "";
	functionDescInput.value = "";
	functionCodeInput.value = "";
	numParamsSelect.value = '0';
	renderParameterInputs();
}
 
function handleExportTools(){
	try{
		//use null,2 for pretty-printing the json
		const toolsJson = JSON.stringify(definedTools,null,2);
		toolsJsonArea.value = (toolsJson);
		importExportStatus.textContent = 'tools exported to text area below.';
		importExportStatus.style.color = 'green';
		console.log("exported tools:", definedTools);
	}catch(err){
		importExportStatus.textContent = "error exporting tools: " + err.message;
		importExportStatus.style.color = "red";
		console.error("export error:", err);
	}
}

function handleImportTools(){
	
	const jsonText = toolsJsonArea.value.trim();
	
	if(!jsonText){
		importExportStatus.textContent = "text area is empty. nothing to import.";
		importExportStatus.style.color = "orange";
		return;
	}
	try { 
	const parsedData = JSON.parse(jsonText);
	// -- basic validation --
	if(typeof parsedData !== 'object' || parsedData === null || Array.isArray(parsedData)){
		throw new Error(`imprted data is not valid JSON (expeceted formatL {\"toolname\": { ... } } ). ${jsonText} \nTYPEOF: ${typeof parsedData} \n ISARRAY ${Array.isArray(parsedData)}\n STRINGIFY ${JSON.parse(jsonText)}`);
	}
	const validatedTools = {};
	for(const toolName in parsedData){
	// -- detailed validation --
	const tool = parsedData[toolName];
	if(typeof tool !== 'object' || tool === null || tool.type !== 'function' || typeof tool.function !== 'object' || tool.function === null){
		throw new Error(`invalid structuire for tool"${toolName}" missing type or function object. \n TYPEOF ${typeof tool} \n type: ${tool.type}\n TYPEOF ${typeof tool.function} `);
	}
	const funcData = tool.function;
	//check function properties
	if(typeof funcData.name !== 'string' || !funcData.name || typeof funcData.description !== 'string' || typeof funcData.code !== 'string' || !funcData.code || typeof funcData.parameters != 'object' || funcData.parameters === null){
	throw new Error(`invalid structure for tool "${toolName}" missing invalid name, description, code or parameters object.`);
	}
	//check parameters structure.
	if(funcData.parameters.type !== 'object' || typeof funcData.parameters.properties !== 'object' || funcData.parameters.properties === null || !Array.isArray(funcData.parameters.required)){
		throw new Error(`invalid parameters for ${toolName}`);
	}
	//optional: deeper validation of parameter properties array contents if 
	//if valid, now add to tempoerary validated object. 
	validatedTools[toolName] = tool;
}
// -- success --
definedTools = validatedTools;
updateDefinedFunctionsUI();
clearFunctionForm();
importExportStatus.textContent = `successfully imported ${Object.keys(definedTools).length} tools`;
importExportStatus.style.color = "Green";
console.log("imported Tools:", definedTools);
	}catch (err){
		importExportStatus.textContent = "import error " + err.message;
		importExportStatus.style.color = "red";
		console.error("import error:", err);
	}

	}


//Generate Interface with messageHistory xxxRRR

function buildOllamaRequestData(model, messages, toolCapable, availableTools ){
//immutable function (UI independent.) 
//@param model {string} - the name of the model. i.e: 'ollama run model'
//@param messages []{types.go/messages struct} - from reconstructMessages_*()
//@param toolCapable {bool} - necessary because if tools sent to incapable model = fail. (in modelinputs) 
//@param availableTools {JSON} - see "Tool Definition Functions" , namely handleImportTools() . 
let vidid =	 pushStackTrace("Dom.buildOllamaRequestData");/* LogStackTrace(); */
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
popStackTrace(vidid);	 
 return requestData;
}


function calculateAndStoreTokenCounts(){
	//for handleSendPrompt
	//follow deduced-peculiar Messages[0:3] algorithm for Metrics.eval_count and Metrics.prompt_eval_count 
	//algorithm is under false assumption about messages involvement in promptevalcount - unsure. 
let vidid =	 pushStackTrace("Dom.calculateAndStoreTokenCounts");/* LogStackTrace(); */
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

popStackTrace(vidid);	 
}

function updateMessageDisplayTokens(index){
//helper to update the token display for a specific message turn in the ui
//for handleSendPrompt generate Input. 	
let vidid =	 pushStackTrace("Dom.updateMessageDisplayTokens");/* LogStackTrace(); */
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

popStackTrace(vidid);
}





function displayMessageInStack(message, index, isStreaming = false){
	//for handleSendPrompt
let vidid =	 pushStackTrace("Dom.displayMessageInStack");/* LogStackTrace(); */
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

popStackTrace(vidid);
}


function reconstructMessagesFromStack(){
	//for handleSendPrompt
let vidid =	 pushStackTrace("reconstructMessagesFromStack");/* LogStackTrace(); */
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
popStackTrace(vidid);
	return messagesToSend;
	}


async function executeToolSafely(toolDefinition, functionArgs, functionName){
//@returns message = {role:'tool',content:'text'}
//@param toolDefinition calls coreOllamaRequest so returns message with prompt_eval_count etc. 
let vidid =	 pushStackTrace("executeToolSafely");/* LogStackTrace(); */

if(functionName === 'delegate'){
		const definedParamNames = Object.keys(toolDefinition.function.parameters.properties);
	const callArgValues = definedParamNames.map(pName => functionArgs[pName]);
	//"modelName",   "promptContent"
var retstr = await outsource(functionArgs["modelName"], functionArgs["promptContent"]);
popStackTrace(vidid);
return retstr;
}

		if(toolDefinition && toolDefinition.function.code){
try{
	codeToRun = toolDefinition.function.code;
	const isAsync = codeToRun.trim().startsWith('async');
	const funcConstructor = isAsync ? Object.getPrototypeOf(async function(){}).constructor : Function;
	const definedParamNames = Object.keys(toolDefinition.function.parameters.properties);
	const callArgValues = definedParamNames.map(pName => functionArgs[pName]);
	console.log(`Executing ${functionName} with ordered args: ${JSON.stringify(definedParamNames)} `);
	const func = new funcConstructor(...definedParamNames, extractImportedToolBody(codeToRun));
	const output = await func.apply(null, callArgValues);
 
popStackTrace(vidid); 
//return {role: 'tool', content: output};
return output;
} catch (ex_er){
console.error(`Error executing tool ${functionName}: \n `, ex_er);

	
popStackTrace(vidid);
return {role: 'tool', content: ''};
	}
} else{
	console.error(`Tool Function "${functionName}" has no code.`);
	
popStackTrace(vidid);
	return {role: 'tool', content: ''};
} 
}
 
 
function extractImportedToolBody(imporcode = "" ){
	var PLB =  imporcode.indexOf('(');
	var PEB = imporcode.indexOf(')');
	var BLC = imporcode.indexOf('{',PEB + 1);
	var BEC = imporcode.lastIndexOf('}');
	var disd = imporcode.substr(BLC + 1, BEC -2);
	console.log(` THE BODY ${BLC} IS = \n ${disd} \n END${BEC} OF BOD`);
	return disd;
	
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
async function coreOllamaRequest(requestData) {
	//@param {object} object created by buildOllamaRequestData(z,z,z,z )
	//@returns structure of object, not stringified.
let vidid =	 pushStackTrace("coreOllamaRequest");/* LogStackTrace(); */


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
        let finalAssistantMessage = { role: 'assistant', content: '', tool_calls: [] };
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
popStackTrace(vidid);	 
 return finalAssistantMessage; 
 // Return the complete message object
    } catch (error) {
        // Log and re-throw network or parsing errors for the caller to handle
        console.error("Error in coreOllamaRequest:", error);
        // Ensure the error is propagated
        throw error; // Re-throw the error after logging
    }
popStackTrace(vidid);	 
}


function updateContextSizeInfo() {
	//for handleSendPrompt
     const contextInfoDiv = document.getElementById('contextSizeInfo'); // Get the display element
     if (!contextInfoDiv) return; // Exit if element doesn't exist

     let lastPromptTokens = "N/A";
     // Find the last message from the assistant that has token info
/*
     for (let i = messageHistory.length - 1; i >= 0; i--) {
         if (messageHistory[i].role === 'assistant' && messageHistory[i].promptTokensForTurn !== null) {
             lastPromptTokens = messageHistory[i].promptTokensForTurn;
             break;
         }
     }
 */
 if(messageHistory.length > 0){
	 latestAggregateTokens = messageHistory[messageHistory.length - 1].aggregate_tokens ?? "N/A"; 
 }
 contextInfoDiv.textContent = `Context tokens used in last input turn: ${lastPromptTokens}`;
}


/* @function handleTool_Calls
@param the tool_call array from the LLM 
@return the response for tool_calls sent to outsource() whose content aggregated into a single string
*/
const MAX_RECUR_TOCA = 3;
var HANDLETOOLCALLPRESENT = 0;
var recurhist = [];
//issue is how the aggregate response gets relayed.
//user calls sendMessageToOllama
//sendMessageToOllama calls handleToolCalls
/* sendMessagesToOllama calls handleToolCalls(TC) 
== handleToolCalls fetches the arguments for outsource; 
(that is to say that handleToolCalls is specific to my use case. )
outsource returns the entire response object that coreOllamaRequest returns.
handleToolCalls checks if response object contains tool_calls itself,
if yes, then 
recursion checks are incremented, and the new tool_calls is sent to a recursion of 
 */
async function handleToolCalls(TC){
	let localrecupre = HANDLETOOLCALLPRESENT;
	var aggtoores = "";
	for (const toolCall of TC) {
		 var functionName;
		var functionArgs; 
         if (!toolCall.function?.name || typeof toolCall.function.arguments !== 'object') {aggtoores += "ilformed tool request;"; continue;}
	functionName = toolCall.function.name;
	functionArgs = toolCall.function.arguments;
	const modsel = functionArgs['modelName']? functionArgs['modelName'] : 'draft';
	var promptfortool = ""; 
		for(ke of Object.keys(functionArgs)){
			promptfortool += ` ${ke} : ${functionArgs[ke]} ;`;
		}
		console.log(`inside handleToolCalls (RECURSION = ${HANDLETOOLCALLPRESENT}), outsource(m,p) ${modsel} and ${promptfortool}`);
		var ores = await outsource(modsel, promptfortool, recurhist);
		console.log(`after outsource response: ${JSON.stringify(ores)}`);
		if((modsel == 'Coder')||(modsel == 'Math')||(modsel == 'draft')){
			aggtoores += extractsnippets(ores.content);
		}else{aggtoores += ores.content;} 
		if(ores.tool_calls.length > 0){
			HANDLETOOLCALLPRESENT++;
		if( localrecupre < MAX_RECUR_TOCA){
			recurhist.push(promptfortool);
			handleToolCalls(ores.tool_calls)
		}else{
//			HANDLETOOLCALLPRESENT = 0;
			recurhist = [];
			break;		
		}
		
	}
	}
		return aggtoores;
}

// Main function for handling conversation turns
async function sendMessagesToOllama(model, messages, toolCapable = false, promptsMessage={role:"", content:""}) {
let vidid =	 pushStackTrace("senMessagesToOllama");/* LogStackTrace(); */
    statusDiv.textContent = `Waiting for Ollama (${model})...`; // Updated status
    sendButton.disabled = true;
	toolCapable = true;
	messages.push(promptsMessage);//a messages class can have a getter and setter. 
	const requestData = buildOllamaRequestData(
	model, messages, toolCapable, definedTools );
 
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
popStackTrace(vidid);	 
}

 

async function handleSendPrompt( ){
let vidid =	 pushStackTrace("handleSendPrompt");/* LogStackTrace(); */

const selectedOption = modelInput.options[modelInput.selectedIndex]; 
const model = modelInput.value.trim();
const toolCapable = modelInput.options[modelInput.selectedIndex].dataset.supportsTools === 'true';
const userPrompt = promptInput.value.trim();
const numCtx = parseInt(numCtxSlider.value, 10);



if (!model || !userPrompt){
	console.log('please enter borht a model name and a prompt.');
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

popStackTrace(vidid);	 

}

//\xxxRRR

	async function outsource( modelName, promptContent, MOShistory = []) { 
 /* tool call
 @calls another LLM
 @returns the whole response incase it too has tool_calls[] not just content string of the assistant's response. 
 */
 var targetModel;
 if(!match_it(modelName, modeloptions)){
 targetModel = modeloptions['draft'].value;
 }else{targetModel = modeloptions[modelName].value;}
 
 const delegatePrompt = promptContent;
 if (!targetModel || !delegatePrompt) {
 return ` `;
 }
 console.log(`Delegate Tool: Sending prompt ${targetModel}t`);

const numCtx = parseInt(numCtxSlider.value, 10);
 try { 
 MOShistory.push({ role: 'user', content: promptContent});
 const delegateRequestData = {
 model: targetModel,
 messages: MOShistory,
 stream: true,
 options: {
 num_ctx: numCtx,
 temperature: 0.5,
 top_k: 10
 }
 };
  
 
 
 const delegateResult = await coreOllamaRequest(delegateRequestData); 
 delegateResult.role = `tool`;
 return delegateResult;
 
 } catch (error) {
 return `Task too difficult.${error.message}`;
 }
}

function extractsnippets(textcorporum) {
	/* UI call for code editing*/
    var redactedstring = "";
    var starttick = 0;
    var endtick = 0;

    while (starttick !== -1 && endtick !== -1) {
        // Find the next occurrence of ``` starting from the current position
        starttick = textcorporum.indexOf("```", endtick);
        
        if (starttick === -1) break; // No more triple backticks found, exit loop

        // Find the next occurrence of ``` after the opening one
        endtick = textcorporum.indexOf("```", starttick + 3);

        if (endtick === -1) break; // No closing triple backticks found, exit loop

        // Extract the snippet and add it to redactedstring
        redactedstring += textcorporum.substring(starttick, endtick + 3) + " ";

        // Move past the current snippet for the next iteration
        endtick += 3;
    }

    return redactedstring.trim(); // Remove any trailing whitespace
}


	 
renderParameterInputs();
updateDefinedFunctionsUI();
sendButton.addEventListener('click', handleSendPrompt);
/////////////////////
// START OF TABLATURE 
/////////////////////
//--global state
var responsesOnly = false; 
var globalUID = 0; 
var allFiveRows = [];//array of all five_row instances. 
var allFiveChoiceSets = [];//array of all Five_Choice instances. 
var coalescedExecutionPlan = [];//Array of {originalCellId, OringalRow,iD, promptContent, promptRole, ResponseContent, reponseRole}

// -- DOM REfernces
const dynamicTableTracksContainer = document.getElementById('dynamicTableTracksContainer');//a tbody or div for tracks
const coalescedExecutionRowContainer = document.getElementById('coalescedExecutionRowContainer');//for the bottom row. 
const initDynamicTableBtn = document.getElementById('initDynamicTableBtn');
const addDefaultTrackBtn = document.getElementById('addDefaultTrackBtn');



 function getHSLPastel(){
 const hue = Math.floor(Math.random() * 360);
 return `hsl(${hue}, 90%, 80%)`;
 }
 
function handleConvertToChoice(tRegId, cellIndex){
const track = d4(tRegId);
//	const track = TheScenario.findTrackById(trackId);
	if(track){
		track.convertToChoice(cellIndex);
		renderDynamicScenarioTable();
	}else{
		console.error("XXX432couldn't find track with id to convert cell.");
	}
}
		
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
	
	 
const textAreaSizeRegistry = new Map();
// -- Classes (simplified for focus ---
//All Layers (2,3,4,5r,5) initialization should return RegId, and be used accordingly. 
const TwoLayerArray = [];
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
	const data = {
		id: this.id,
		RegId: this.RegId,
		role: this.role,
		content: this.content,
	};
	return JSON.stringify(data, null, 2);
}

yieldElement(uniqueContextId = this.id){
	/* returns theHTML string or DOM element for a message*/
	const diiv = document.createElement('div');
	//diiv.id = this.id; 
	diiv.className = `message-role-${this.role}`;
	const roleStrong = document.createElement('strong');
	roleStrong.textContent = `Role: ${this.role}: `;
	diiv.appendChild(roleStrong);
	const contentSpan = document.createElement('textarea');
	var stil12 ="";
if	(this.role === 'user'){stil12 = "background-color: #000000; color: #ffffff;"}else{ stil12 = "background-color: #172554; color: #fefce8;";}
contentSpan.class = `${this.RegId}`;
contentSpan.style = stil12;
	contentSpan.value = this.content || ""; contentSpan.placeholder = (this.role ==='user'? "[your turn]" : "[awaiting response...]");
	const elemId = `textarea-${uniqueContextId}-${this.role}`;
	contentSpan.id = elemId;
	const savedSize = textAreaSizeRegistry.get(elemId);
	if(savedSize){
		contentSpan.style.width = savedSize.width;
		contentSpan.style.height= savedSize.height;
	}
	contentSpan.addEventListener('mouseup',()=>{
		textAreaSizeRegistry.set(elemId, { 
		width: contentSpan.style.width,
	height: contentSpan.style.height});});
	const toke = document.createElement('div');
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


 //24th HELPER FUNCTION - Create new select dropdown for model selection. 
 //@param (string) selectedValue - the value of the model that should be preselected. 
 //@param (function) onChangeCallback - the function called when the selection happens.
 //@return (HTMLSelectElement) fully constructedselectelement 
 function createModelSelector(selectedValue, onChangeCallback){
	 const modelz = document.createElement('select');
	 modelz.className = 'cell-model-selector';
	 //the global modeloptions at the DOMContentLoaded is the global repo
 for(const key in modeloptions){
	 if(modeloptions.hasOwnProperty(key)){
		 const opt1 = document.createElement('option');
		 opt1.value = modeloptions[key].value;
		 opt1.textContent = key;
		 modelz.appendChild(opt1);
	 }
 }
 modelz.value = selectedValue;
 modelz.onchange = onChangeCallback;
 return modelz;
 }

const ThreeCellArray = [];
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
		const promptData = JSON.parse(d2(this.prompt).getJSONstring());
		const responseData = JSON.parse(d2(this.response).getJSONstring());
		const data = {
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
	
	yieldElement( ){	/*returns td DOM element */ 
	//this function is used by the main dynamicscenariotable...
		var tdd = document.createElement('td');
		tdd.classname = 'cell-content';
		tdd.id = this.id;
		
		tdd.appendChild(d2(this.prompt).yieldElement(this.id));
		tdd.appendChild(d2(this.response).yieldElement(this.id));
		
		let controlDiv = document.createElement('div');
		controlDiv.className = 'cell-controls';
		const execAdHoc = document.createElement('button');
		execAdHoc.textContent = "execute ad Hoc";
		execAdHoc.title = "execute the conversation from the root start to here."
		execAdHoc.onclick = () => handleExecuteOnTheFlyToHere(this.RegId);
		controlDiv.appendChild(execAdHoc);
		const modelSelectorLabel = document.createElement('label');
		modelSelectorLabel.textContent = "Model: ";
		//the callback function updates this specific instance's model. 
		const modelSelector = createModelSelector(this.model, (event) => {
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
	/*	const execToHereBtn = document.createElement('button');
		execToHereBtn.textContent = "execute to here";
		execToHereBtn.title = "set all choices to lead to this point and execute.";
		execToHereBtn.onclick = () => handleExecuteToHere(this.RegId, this.parentTrackId);
controlDiv.appendChild(execToHereBtn);
*/
		tdd.appendChild(controlDiv);
		
		return tdd;
	}
	yieldContentElements(isCoalesced = false){
		const contentFragment = document.createDocumentFragment(); 
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

const FourRowArray = [];
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
		const sequenceData = this.sequence.map(cellRegId => JSON.parse(d3(cellRegId).getJSONstring()));
		//serialize the terminating choice, if it exists. 
		let choiceData = null;
		if(this.terminatingChoice !== null){
			choiceData = JSON.parse(d5(this.terminatingChoice).getJSONstring());
		}
		const data = {
			id: this.id, 
			RegId: this.RegId, 
			name: this.name, 
			parentChoiceId: this.parentChoiceId, 
			sequence: sequenceData, 
			terminatingChoice: choiceData
		};
		return JSON.stringify(data, null, 2);
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
	const newChoice = new Five_Choice(conditional_phrase);
	newChoice.parentTrackId = this.RegId;
	for(let i = 0; i < numBranches; i++){
const branchName = `option ${i + 1}`;
const newBranchTrack = new Four_Row(branchName);
newBranchTrack.addCell();
newChoice.addBranch(newBranchTrack.RegId);	
//XXXX
// TRAVERSE BACK THROUGH THE CHOICES (ie: ROW,CHOICE,ROW,CHOICE,RoW==0 to find the offset. 
	
//newChoice.offset += this.sequence.length+1;
}
this.terminatingChoice = newChoice.RegId; 
}

setAllModels(modelId){
	if(!modelId){return;}
	this.sequence.forEach(cellRegId => {
		const cell = d3(cellRegId);
		if(cell){
			cell.model = modelId;
		}
	});
renderDynamicScenarioTable();
}

/*
Creates the HTML content for the track's header/control console. 
@returns {HTMLElement} - the <th> element for the row header.
*/
yieldRowHeader(){
	const thd = document.createElement('th');
	thd.className = `row-control-console`;
	const nameSpan = document.createElement(`span`);
	nameSpan.textContent = this.name; 
	const namefiel = document.createElement('input');
	namefiel.name = `trackname${this.id}`;
	const namelbl = document.createElement('label');
	namelbl.for = `trackname${this.id}`;
	namefiel.type = 'text';
	namefiel.onchange = () => {
		this.name = namefiel.value;
		renderDynamicScenarioTable();
	}
	namelbl.textContent = "track's name:"
	thd.appendChild(namelbl);
	thd.appendChild(namefiel);
	thd.appendChild(nameSpan);
	
	const addTurnBt = document.createElement(`button`);
	addTurnBt.textContent = "+ Turn";
	addTurnBt.title = "add new turn to the end of track";
	addTurnBt.onclick = () => {
		this.addCell();
		recoalesceAndRenderAll();
	};

const controlsContainer = document.createElement('div');
	const ChoNam = document.createElement('input');
	ChoNam.type = 'text';
	ChoNam.placeholder = "conditional phrase for the choice";
	const trnoin = document.createElement('input');
	trnoin.type = 'number';
	trnoin.value = '2';
	trnoin.min = '2';
	
	const appendChoiceBt = document.createElement('button');
	appendChoiceBt.textContent = "Terminate with choice";
	appendChoiceBt.title = "terminate track with a choice.";
	appendChoiceBt.onclick = () => {
	const numTracks = parseInt(trnoin.value, 10) || 2 ;
	this.addTerminatingChoice(ChoNam.value, numTracks);
	recoalesceAndRenderAll();
	};
	
	
	controlsContainer.appendChild(addTurnBt);
	controlsContainer.appendChild(document.createElement('hr'));
	controlsContainer.appendChild(ChoNam); 
	controlsContainer.appendChild(trnoin); 
	controlsContainer.appendChild(appendChoiceBt);


	const nesetAllDiv = document.createElement('div');
	const setAllLabel = document.createElement('label');
	setAllLabel.textContent = "Model for whole track:";
	setAllLabel.style.display = 'block';
	const setAllSelector = createModelSelector(this.sequence.length > 0 ? d3(this.sequence[0]).model : modelInput.value, () => {});
	const setallbut = document.createElement('button');
	setallbut.textContent = 'model for all';
	setallbut.onclick = () => {
		const selectedModel = setAllSelector.value;
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



const FiveChoiceArray = [];
function d5(ind){
	if( (ind >= 0) && (ind < FiveChoiceArray.length)){return FiveChoiceArray[ind];
}else{return null;}}

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
		const branchesData = this.branches.map(trackRegId => JSON.parse(d4(trackRegId).getJSONstring()));
		const data = {
			id: this.id, 
			RegId: this.RegId, 
			conditional_phrase: this.conditional_phrase, 
			parentTrackId: this.parentTrackid, 
			selectedBranchId: this.selectedBranchId, 
			branches: branchesData
		};
		return JSON.stringify(data, null, 2);
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
	/*
	@param {four_row}.RegId branchTrack - the track to add. 
	@param {boolean} is New Line Track. 
	*/
	addBranch(branchTrack ){
		d4(branchTrack).parentChoiceId = this.RegId; 
		this.branches.push(branchTrack);
		if(!this.selectedBranchId){
			this.selectedBranchId = branchTrack;
		}
	
	}
	
	/* 
	creates and returns the complete table cell (td for the choice hub, including the correct rowspan and all UI elements. 
	@returns {HTMLTableCellElement} the fully constructed td element for
	*/
	yieldElement(){
	//create the cell that will be returned. 
	const ttdd = document.createElement('td');
	ttdd.className = 'five-choice';
	ttdd.style.backgroundColor = this.branchesColour;  
	ttdd.rowSpan = 1; 
	const container = document.createElement('div');
	container.className = 'choice-hub-container';
	
	const phraseInput = document.createElement('input');
	phraseInput.type = 'text';
	phraseInput.value = this.conditional_phrase;
	phraseInput.placeholder = 'condition for this choice.';
	phraseInput.onchange = (e) => { this.conditional_phrase = e.target.value;};
	container.appendChild(phraseInput);
	
	const radioGroup = document.createElement('div');
	radioGroup.className = 'choice-radios';
	
	//Dynamically create a radio button for each branch. 
	this.branches.forEach(brch => {
const branch = d4(brch); if(!(branch instanceof Four_Row)){console.log("Four_Row used without respecting RegId");bhrch = document.createElement("div"); bhrch.innerHTML = "Four_Row used without respecting RegId"; return bhrch;}		
	const id = `radio-${this.RegId}-${branch.id}`;
	const isChecked = (this.selectedBranchId === brch);
	const branchDiv 	= document.createElement('div');
	const radioInput 	= document.createElement('input');
	radioInput.type = 'radio';
	radioInput.id = branch.id;
	radioInput.name = `choice-${this.id}`;

	radioInput.value = parseInt(brch);
	radioInput.checked = isChecked; 
	radioInput.onchange = () => { 

		this.selectedBranchId = parseInt(radioInput.value);  
		recoalesceAndRenderAll(); 
	};
	const label = document.createElement('label');
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
		//GlobalUID can be held inside Six_Plan and all components due stored within this instance can be straight referenced to this.components[component.id] instanceof Two_Layer etc. ?
		this.id = `${globalUID++}`;
		this.tracks = [];
		this.steps = [];
		this.initializeDefaultPlan();
	//	this.initializeDefaultTrack();
		}
		
		
		getJSONstring(){
	const stepsData = this.steps.map(choiceRegId => JSON.parse(d5(choiceRegId).getJSONstring()));
			const data = {
				id: this.id, 
			steps: stepsData
			};
return JSON.stringify(data, null, 2);
		}			
		
		initializeDefaultPlan(){
			this.steps = [];
			const firstChoice = new Five_Choice("Start here?");
			const baseTrack = new Four_Row("Start");
			baseTrack.addCell(); //add one empty turn to start with. 
			//Add the base track as the single branch of the first choice. 
			firstChoice.addBranch(baseTrack.RegId);
			//add the first choice as the first step in the plan. 
			this.steps.push(firstChoice.RegId);
		}
		 
	
	parseJSONstring(str){
		const sp = JSON.parse(str);
		if(Array.isArray(sp.steps)){
			console.log(` here it is${sp.steps.length} ${JSON.stringify(sp.steps[0])}`);
			
		}
	}
	 
	 
	
}

// --- rendering, coalescing, execution ---
//SIX SCENARIO
/* SCHEMA := 
software has TheScenario for RAM. //label=TheScenario.
HTML has DynamicScenarioTable for UI .  //label=DynamicScenarioTable
software has CoalescedPlan=Four_Row for Execution .// execplan traverses 4row,//label=CoalescedPlan
HTML has ShowPlan which employs references to shadow TheScenario's DynamicScenarioTable's coallescedPlan. (i.e: editing showplan edits only Two_Layer. ) //label=ShowPlan 
software has ConversationHistory=Four_Row  //label=ConversationHistory
 */
var TheScenario = new Six_Plan(); 
var ConversationHistory = new Four_Row("execution history");
var CoalescedPlan = new Four_Row("Coalesced plan");
var ArchivedConversations = [];

//23Jun helper function
function insertAfter(parentElement, newElement, referenceElement){
	const nextSibling = referenceElement.nextSibling; 
	if(nextSibling){
		parentElement.insertBefore(newElement, nextSibling);
	}else{
		parentElement.appendChild(newElement);
	}
}
/*
//13/06/2025
0)coreOllamaRequest should deal with Three_Cell reference, so that the tokens can be stored. 
1) 
2)DONE// initializeTheScenario with base Four_Row and 1 Three_Cell 
3)primary function to render the entire scenario table. first builds and ordered list of tracks then renders them.
	3.a) WHy are all of the text fields blanking out with each render? 
*/
/*23Jun clears table and calls rescusvive renderer*/
function renderDynamicScenarioTable(){
	if(!dynamicTableTracksContainer){
		console.error("cant find dyanmic table...");
	return;}
	dynamicTableTracksContainer.innerHTML = "";
//root tracks (assume more than one six_plan scenario?)
//const rootTracks = FourRowArray.filter(track => d5(track.parentChoiceId) === null);
//rootTracks.forEach(track => { recusivelyRenderTrack(track.RegId);});


//No point writing a recursivelyRenderChoice - because one track per one line. 
recursivelyRenderTrack(d5(TheScenario.steps[0]).branches[0],null);
}
//23Jun renders a track and its subsequent branches, ensuring corrent indentation. use choice.getOffset() 
//@param {number} trackRegId - the .RegId of the four-row instance to render. 
//@param {HTMLTableRowElement | null} tr - the tr to append to if this is an inline branch. 
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


/*
*The main orchestrator for the "execute to Here" feature. 
@param (number) targetCellRegId - the RegId of the target three_cell
@param (string) targetTrackId - The ID of the track containing the target cell.
*/
 
  
/* 1 traverses the scenario tree and populates the coalescedplan object. */
//25jun25  fix the id to regid to save search 
function coalesceScenarioToPlan(){
	CoalescedPlan.sequence = [];
	if(!TheScenario.steps.length) return;
	
	const traverse = (trk) => {
	const track = d4(trk);
		//add all three-cells from the current track's sequence
		for (const cellRegId of track.sequence){
			CoalescedPlan.sequence.push(cellRegId);
		}
		//if there is a choice find the selected branch and continue traversal
		const choice = track.terminatingChoice;
		if((d5(choice) instanceof Five_Choice) && d5(choice).selectedBranchId){
			//const selectedBranch = d5(choice).selectedBranchId//d5(choice).branches.find(b => d4(b).id === d5(choice).selectedBranchId);
			if(d4(d5(choice).selectedBranchId) instanceof Four_Row){
				traverse(d5(choice).selectedBranchId);
			}
		}
	};
	traverse(d5(TheScenario.steps[0]).branches[0]);
}
/* 2 renders the coalescedpalnan into tits dedicated table. 
"background-color:# ; color:#ffffff; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;"
*/
//25jun25
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
		const execBtn = document.createElement('button');
		execBtn.textContent = "Execute Turn";
		execBtn.onclick = () => handleExecuteSingleTurn(cellRegId);
		execBtn.style = "background-color:#22c55e ; color:#ffffff; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
	
	const execFocusButton = document.createElement('button');
		execFocusButton.textContent = "execute Focused turn";
		execFocusButton.title = "run 2pass execution";
		execFocusButton.onclick = () => handleExecuteTwoPassTurn(cellRegId);
		execFocusButton.style = "background-color:#facc15 ; color:#000000; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
	const exec2passSeqBtn = document.createElement('button');
	exec2passSeqBtn.textContent = "Focus Seq2to here.";
	exec2passSeqBtn.title = "2pass sequence to here from 0";
	exec2passSeqBtn.onclick = () =>handleSequentialTwoPass(index);
	exec2passSeqBtn.style = "background-color: #eab308 ; color:#000000; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
	
	
		const execSeqBtn = document.createElement('button');
		execSeqBtn.textContent = "Run to Here";
		execSeqBtn.title = "Execute all turns from the start up to this one."
		execSeqBtn.onclick = () => handleSequentialConversation(index);
		execSeqBtn.style = "background-color:#4ade80; color:#000000; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
		controlsDiv.appendChild(execBtn);
	controlsDiv.appendChild(execSeqBtn);
	controlsDiv.appendChild(execFocusButton);	
	controlsDiv.appendChild(exec2passSeqBtn);
		
	
		
		if(index === CoalescedPlan.sequence.length - 1){
			const resumeBtn = document.createElement('button');
			resumeBtn.textContent = "resume track";
			resumeBtn.title = "execute all pending or failed on this plan." ;
			resumeBtn.onclick = () => resumeSequentialConversation(index);
			resumeBtn.style = "background-color:#166534 ; color:#ffffff; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
			controlsDiv.appendChild(resumeBtn);
			const resume2pBtn = document.createElement('button');
			resume2pBtn.textContent = "resume 2pass";
			resume2pBtn.title = "ask all undone prompts through 2pass";
			resume2pBtn.onclick = () => resume2passtrack(index);
			resume2pBtn.style = "background-color:#a16207 ; color:#000000; border-width: 1px; border-style: solid; border-color: #1d4ed8; font-weight: 500; border-radius: 0.5rem; padding-left: 1.25rem;padding-right: 1.25rem;padding-bottom: 1.25rem;padding-top: 1.25rem;";
			
			controlsDiv.appendChild(resume2pBtn);
		}
		
		td.appendChild(controlsDiv);
		tr.appendChild(td);
	});
	container.appendChild(tr);
}
/* 3. handler: execute a single turn from the coaleced plan. */ 
//25jun25
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
	renderCoalescedPlan();
}
		

//25jun25
function recoalesceAndRenderAll(){
	//FOr Six_Plan - This function is the order of employing the Six_Plan (i.e TheScenario) 
	renderDynamicScenarioTable(); 
coalesceScenarioToPlan(); 
renderCoalescedPlan(); 
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

} else if (completedTurnIndex > 0) { //completedTurnIndex > 1 
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
		responseMessage.aggregate_tokens_at_this_point = promptMessage.individual_tokens + evalCount;
		for(let i = 0; i < completedTurnIndex; i++){
			let curpromind = d2(d3(fourRowInstance.sequence[i]).prompt).individual_tokens;
			let currespind = d2(d3(fourRowInstance.sequence[i]).response).individual_tokens;
		responseMessage.aggregate_tokens_at_this_point += curpromind;
		responseMessage.aggregate_tokens_at_this_point += currespind;
		promptMessage.aggregate_tokens_at_this_point += curpromind;
		promptMessage.aggregate_tokens_at_this_point += currespind;
		
		}		

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
		
		if(responseMessage && responseMessage.content && responseMessage.content !== "[Awaiting Response...]"){
			messagesForApi.push({ role: responseMessage.role, 
			content: responseMessage.content } ) ;
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
	//XX34fetch 3cell
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
//XX34construct messages[] from ConversationHistory 	
	const messagehist = reconstructMessagesFromFourRow(ConversationHistory.RegId);
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
		
		while(!streamDone){
			const {done, value} = await reader.read();
			if(done){
				streamDone = true;
				break;
			}
			
		const chunkText = decoder.decode(value, { stream: true });
		const lines = chunkText.split('\n').filter(line => line.trim() !== '');
		
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
			var lne2 = ConversationHistory.sequence.length;
			ConversationHistory.addCell(threeCellReference);
console.log(`XX98 within coreOllamaTC ${ConversationHistory.sequence.length} `);
			calculateAndStoreFourRowTokens(ConversationHistory.RegId,ConversationHistory.sequence.length-1,finalChunkData);
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


/* calculates the aggregate token count for a fourrow history 
@param {number}  fourrowreference regid */
function calculateTokensFromHistory(fourrowref){
	const fourRowInstance = d4(fourrowref);
	if(!(fourRowInstance instanceof Four_Row)){return;}
let cumulativeTokens = 0;
for(const cellRegId of fourRowInstance.sequence){
const turn = d3(cellRegId); if(!(turn instanceof Three_Cell)){ continue;}
const promp = d2(turn.prompt);
const respo = d2(turn.response);
if(promp instanceof Two_Layer){
cumulativeTokens += promp.individual_tokens;
promp.aggregate_tokens_at_this_point = cumulativeTokens;
}
if(respo instanceof Two_Layer){
cumulativeTokens += respo.individual_tokens;
respo.aggregate_tokens_at_this_point = cumulativeTokens;
}
}	

}

  
/* 9 July 25 two pass request to ascertain prompt count  */
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
	const messageHistoryForContext = reconstructMessagesFromFourRow(ConversationHistory.RegId);
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
d2(threeCellInstance.prompt).individual_tokens = focusedprompttokens; }else{
console.log("here in two pass, individual fail");}
	if(response2_obj.responseTokens){
console.log(`HERE IN 2 PASS: RESPONSE individual token`);d2(threeCellInstance.response).individual_tokens = response2_obj.responseTokens;}else{
	console.log("response token fail");
	}
	//history
	ConversationHistory.addCell(threeCellReference);
	calculateTokensFromHistory(ConversationHistory.RegId);
	return true;
}

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
	renderCoalescedPlan(); 
	
}

async function handleSequentialTwoPass(upToIndex){
	statusDiv.textContent = "Starting sequential execution...";
	//step1 archive the results of the previous run before restting. 
	archiveCurrentConversation();
	//step2 reset the global conversationhistory for a fresh run. giving it a timestampedname is usefulrfor the archive.
	ConversationHistory = new Four_Row(`Run@${new Date().toLocaleTimeString()}`);
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
	renderDynamicScenarioTable();
	//reenable buttons. 
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
}
  
  
  
const conversationHistoryLogContainer = document.getElementById('conversationHistoryLogContainer');
/*
takes the current conversationHistory pushes it to archive, and calls render function to update log display.   
*/
function archiveCurrentConversation() {
//only archive if history has content. 
	//if(ConversationHistory && ConversationHistory.sequence.length > 0){
		//ArchivedConversations.push(ConversationHistory);
		const logser = TheScenario.getJSONstring();
		ArchivedConversations.push(logser);
		renderArchivedConversations();
		TheScenario.parseJSONstring(logser);
	//}
}	

/*
renders all archived conversations into the history log table. 
*/
function renderArchivedConversations(){
	if(!conversationHistoryLogContainer) {return;}
	conversationHistoryLogContainer.innerHTML = '';
	
	ArchivedConversations.forEach(archivedRun => {
		const tr = document.createElement('tr');
		const td = document.createElement('td'); 
		td.innerHTML = archivedRun; 
		tr.appendChild(td);
		conversationHistoryLogContainer.prepend(tr);
	});
}


function seetex(){
document.getElementById("scenetext").innerHTML = TheScenario.getJSONstring();
}
document.getElementById("seetex").onclick = seetex;

/*
executes turns from the coalescedplan sequentially up to a given index. manages the converwsationhistory lifescycle for the duration of the run. 
@param {number} upToIndex - The idnex in CoalescedPlan.seqwuence to execute up to. 
*/ 
async function handleSequentialConversation(upToIndex){
	statusDiv.textContent = "Starting sequential execution...";
	//step1 archive the results of the previous run before restting. 
	archiveCurrentConversation();
	//step2 reset the global conversationhistory for a fresh run. giving it a timestampedname is usefulrfor the archive.
	ConversationHistory = new Four_Row(`Run@${new Date().toLocaleTimeString()}`);
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
	renderDynamicScenarioTable();
	//reenable buttons. 
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
}

//resumes a sequential execution from coalesced plan skipping any done turns. 
 async function resumeSequentialConversation(upToIndex){
	 statusDiv.textContent = "Resuming sequential executor...";
	 //archiving and resetting the history. ensure correct context. 
	 archiveCurrentConversation();
	 conversationHistory = new Four_Row(`Resume@${new Date().toLocaleTimeString()}`);
	document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = true);
	
for(let i = 0; i <= upToIndex; i++){
	const cellRegId = CoalescedPlan.sequence[i]; 
	const threeCell = d3(cellRegId);
	if(!threeCell) continue;
	const responseContent = d2(threeCell.response).content;
	const needsExecution = (responseContent === "[Awaiting Response...]" || responseContent.startsWith("[ERROR") || responseContent === "" || responseContent === " ");
	if(needsExecution){
		statusDiv.textConetnt = `executing turn ${i + 1} of ${upToIndex + 1}`;
		await handleExecuteSingleTurn(cellRegId);
	}else{
		statusDiv.textConetnt = `skipping turn ${i + 1} of ${upToIndex + 1}`;
		ConversationHistory.addCell(cellRegId);
	}
}
statusDiv.textContent = "resume execution complete";
document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
 }
		
 //for2pass at end of coalesced plan
 async function resume2passtrack(upToIndex){

	 statusDiv.textContent = "Resuming sequential executor...";
	 archiveCurrentConversation();
	 	 conversationHistory = new Four_Row(`Resume@${new Date().toLocaleTimeString()}`);
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
		ConversationHistory.addCell(cellRegId);
	}
}
statusDiv.textContent = "resume execution complete";
document.querySelectorAll(`.execution-controls button`).forEach(b => b.disabled = false);
 }
 
/*
pass 1 traces the path from a target track up to the root and sets the favoured branch property on all intervening fivec hoice instances. 
@param {number} targetTrackRegId - the RegId of the FourRow containing the target cell
*/ 
function setFavouredPathToCell(targetTrackRegId){
	//first clear any previous favouredBranch settings from the entire scenario. 
FiveChoiceArray.forEach(choice => {if(choice instanceof Five_Choice){choice.favouredBranch = null;}});
let currentTrack = d4(targetTrackRegId);
if(!(currentTrack instanceof Four_Row)){
console.error("path finding failed: target track not found.");return;}
//loop backwards. 
while((currentTrack instanceof Four_Row) && (currentTrack.parentChoiceId != null)){
	const parentChoice = d5(currentTrack.parentChoiceId);
	if(parentChoice instanceof Five_Choice){
		parentChoice.favouredBranch = currentTrack.RegId;
		//move up the heirarchy. 
		currentTrack = d4(parentChoice.parentTrackId);
	}else{
		break;
	}
}
//option for later - colour in the favoured track. 
renderDynamicScenarioTable();
}
	
/* 
pass 2. traverses the scenario from the root executing turns and verifying that the selected path matches the favoured barnch path. 
@param {number} targetCellRegId - the ultimate destination cell.
@returns {promise<boolean>} true if the target was reached, false if execution stopped. 
*/
async function executeOnTheFlyToTarget(targetCellRegId){
	//this executorneeds its own temporary history and plan. managed turnbyturn. 
	const tempHistory = new Four_Row("Ad_Hoc Run");
	const traverseAndExecute = async(trackRegId) => { const track = d4(trackRegId);if(!(track instanceof Four_Row)){return false;}
	//execute all turns in the currentrack segment
	for( const cellRegId of track.sequence){
		//add the cell to our temporary history for content before executing it. 
		tempHistory.addCell(cellRegId);
		//execute the turn handleexecutesingeturn uses the global conversationhiostyr so we must temporarily assignt our temp history ot it. 
		const originalHistory = ConversationHistory;
		ConversationHistory = tempHistory;
		await handleExecuteSingleTurn(cellRegId);
		ConversationHistory = originalHistory;
		
		if(cellRegId === targetCellRegId){statusDiv.textContent = "tearget cell reached and executed."
		return true;
		}
	}
	//after process the sequnce check of a terminating choice. 
	const choice = d5(track.terminatingChoice);
	if(choice instanceof Five_Choice){
		//CHECKPOINT
		if(choice.selectedBranchId === choice.favouredBranch){
			return await traverseAndExecute(choice.selectedBranchId);
		}else{//divergent path 
			const selected = d4(choice.selectedBranchId)?.name || 'None';
			statusDiv.textContent = `exeuction stopped . path diverged at choice ${choice.conditional_phrase}`;
			return false;
		}
	}
	return ( d3(track.sequence[track.sequence.length - 1])?.RegId === targetCellRegId);
	};
	const rootTrackRegId = d5(TheScenario.steps[0]).branches[0];
	return await traverseAndExecute(rootTrackRegId);
}
 
 
/* main orchestrator function called by the ui button. 
@param {number} targetCellRegId - regid of the cell to execute to. */
async function handleExecuteOnTheFlyToHere(targetCellRegId){
	const targetCell = d3(targetCellRegId);
	if(!(targetCell instanceof Three_Cell)){return;}
	statusDiv.textContent = "configuring required path...";
	document.querySelectorAll('.cell-controls button, .row-control-console button').forEach(b => b.disabled = true);
	//pass 1 - set the favoured path. 
	setFavouredPathToCell(targetCell.parentTrackId);
	//pass 2 - start the onflyhexecution
	await executeOnTheFlyToTarget(targetCellRegId);
	//clean up 
	FiveChoiceArray.forEach(choice => { if(choice instanceof Five_Choice) choice.favouredBranch = null; });
	renderDynamicScenarioTable();
	document.querySelectorAll('.cell-controls button, .row-control-console button').forEach(b => b.disabled = false);
}
	
 
//initializeDynamicTableSystem(true);
 recoalesceAndRenderAll();
 
	const sab = document.getElementById("saveArchiveBut");
	const sps = document.getElementById("savePresentScenario");
	sab.onclick = () => saveArchive();
	sps.onclick = () => archiveCurrentConversation(); 
async function saveArchive(){
	if(ArchivedConversations.length ===0)return;
	statusDiv.textContent = "Server saving archive";
	try {
	const jsonstrngarch = JSON.stringify(ArchivedConversations, null, 2);
		const response =  await fetch('/saveHistory', {
			method: 'POST', 
			headers: {'Content-Type': 'application/json',
			},
			body: jsonstrngarch
		});
		const responseText = await response.text();
		if(response.ok){
			console.log("archive saved.");
		statusDiv.textContent = "Ready...";
		return;
		}
		
	}catch(err){
		console.log(` error saving conversation history ${err.message}`);	
	}
		console.log("archive save FAIL .");
	}



});
///
 
function extractCodeBlocks(text){
	console.log("extractCode was called.");
if(typeof text !== 'string' || !text){return "";}
//regex = between ``` and ```,   g finds all matches, s (dotAll) allows . to match newlines 
const regex1 = /```([\s\S]*?)```/gs;
const matches = text.matchAll(regex1);
const codeSnippets = [];
for(match of matches){
	codeSnippets.push(match[1].trim());
}
return codeSnippets.join("\n\n");
}

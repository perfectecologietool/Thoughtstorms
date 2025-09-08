
const MAX_RECUR_TOCA = 3;
var HANDLETOOLCALLPRESENT = 0;
var recurhist = [];
 
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


async function executeToolSafely(toolDefinition, functionArgs, functionName){
//@returns message = {role:'tool',content:'text'}
//@param toolDefinition calls coreOllamaRequest so returns message with prompt_eval_count etc.  

if(functionName === 'delegate'){
		const definedParamNames = Object.keys(toolDefinition.function.parameters.properties);
	const callArgValues = definedParamNames.map(pName => functionArgs[pName]);
	//"modelName",   "promptContent"
var retstr = await outsource(functionArgs["modelName"], functionArgs["promptContent"]); 
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
  
//return {role: 'tool', content: output};
return output;
} catch (ex_er){
console.error(`Error executing tool ${functionName}: \n `, ex_er);

	 
return {role: 'tool', content: ''};
	}
} else{
	console.error(`Tool Function "${functionName}" has no code.`);
	 
	return {role: 'tool', content: ''};
} 
}
 
 
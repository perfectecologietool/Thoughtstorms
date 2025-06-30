# Thoughtstorms
HTML interface for Ollama. Plus http proxy for browser's cross origin concerns
## Contents : 
Summary; Usage; Files; Installation ; Running; User Interface; How it works; 
## Summary:
A browser-based client for Ollama. To avoid Cross-domain security, we can use an Go proxy HTTP server that serves only the one webpage and its javascript inclusion.
 ## usage 
1) type in your prompt. 2) click +turn to set second or subsequent prompt turn. 3) click "execute ad hoc" or in the coalescedPlan, click "run to here" .  4) to add a forking choice, click 'terminate with choice.' 
## Files:
### source.go	-
This simple webserver has two API endpoints.
### UX_.html - 
the file seen from the proxy's endpoint.
### script.js - 
the javascript file src'd by the UX.html webpage. 

# Installation -  
1) create a working directory for your proxy webserver to sit
2) Compile using "go build source.go".
3) Place the UX.html and script.js files into the same directory as source.exe
4) make this specific folder within the same working directory,  'mkdir conversation_history'
Running - 
1) execute the webserver (if you have 
2) In your web browser's addressbar send an default index request to "http://localhost:8587" and you should see the webpage come up nicely. 

# USER INTERFACE - ux.html 
(From top to bottom)
### Desired Context Size
 sets the num_ctx parameter. The values are set according to each model's official documentation by its creators. Selecting a different model from any of the model select elements will alter this scale automatically. 
### Temperature
 sets the temperature parameter. 
### Top_K
 sets the top_K parameter. (model independant, so enlargen yourself, by editing ux.html.)

## 6D Plan
This is the Dynamic table that is where you can plan out a conversation, in 4D, 5D, and 6D. It is a temporally directed acyclic graph, where 5D choices are nodes, and 4D tracks are edges.
Whenever you change the plan, the plan coalesces (waveform collapses) into the Coalesced Execution Plan.


1. Each row of the table represents one temporal track or sequence of conversation turns. 
2. Each table cell represents one conversational turn. You type in your prompt, and then click anywhere outside of the textbox. You are free to edit the Response textarea of a turn's cell. Editing the response will affect the 'remembered' context of subsequent prompts along the same row or path. 

### 1.2 Each row has a track header cell:  
1.2.1 "Track's name" field allows you to edit the name of the track. 
1.2.3 "+ Turn" button adds a 'conversation turn' cell to the end of this particular row of the table.
#### 1.2.4 button " Terminate the Track with a Choice." 
Each 5D Choice sits at the end of a particular row's 4D track. Thus there is always only one choice per row, at max. When a choice is added from this first cell, the last cell is created to house the choice. It would break the system to 'convert a cell into a choice, midway through a track, just like edges surround surfaces.
1.2.4.1 text input for Conditional Phrase, is a string associated with the choice.
1.2.4.2 number selector is the number of new tracks that will start after this choice. It is a way of saying "This choice has 3 options."
1.2.4.3 Button "Terminate with choice"  - creates the choice. Once a track has its choice, the choice is not removable.
#### 1.2.5 Model selector - this allows every turn within a track to be sent to the same model.
1.2.5.1 button "model for all" - executes the function to send this row's cells to the particular model. 

### 2 The Table Cell holds a prompt, and a response. It also holds an "Ad hoc" button and a model sellector.
2.1 Role: User - this is you. type in your prompt.
2.2 Assistant - this is Ollama. read or edit their reply.
2.3 "Execute ad Hoc" - this execute every turn, from the root, to this particular cell, assuming all choices are condusive. This conversation will stop when disagreement arises. 
2.4 model selector - selects the model for this particular turn. Allowing you to mix and match models along your sequence. 


### 3 Coalesced Execution Plan: 
The 6D tree must collapse into a single 4D sequence to be executed. This table holds only 1 row, where each cell is a conversational turn.
3.1 Each turn's cell has a Prompt textfield, a reponse textfield, an 'execute turn' button, and a 'run to here' button. When you edit this textfield, it is shared by other textfields that will be replaced as well.
3.2 response textfield is always responsed by the assistant.
3.3 Execute Turn button - this sends only this particular cell's prompt to Ollama. The context may include the past conversation.
3.4 Run to Here - this executes every conversation turn from the start of the coalescedPlan to this particular cell. The context reflects the history of the conversation.

### Conversation history log - 
Incomplete attempt to serialize/deserialize the TheScenario plan incase it gets complicated by storing it in JSON. 
The archive contains all conversations turns for this webpage's lifetime. the Conversation represents all turns sent and unsent, which are scheduled in the 5D plan. 
#### There are two buttons. 
4.1 The button "Save full archive to file" uses the proxy's second API to open a file , and timestamp the name of the file. The file can be found in the working Directory/conversation_history 
4.2 The button "save present Scenario" just converts this message from this plan, and pushes it onto the archive.
The button "See the Scenario" sends the Six_Dimension plan into textfield to the right of the button. 
4.3 The button "see the Scenario" is a quick view of the JSON of TheScenario. 


### 5 - Single prompt turns. 
5.1 Select model - selects model for Ollama to run. 
5.2 "enter your prompt" textarea - for you to write your prompt. 
5.3 "SendPrompt" button - click to send the prompt to Ollama and elicit a response. The past turns are sent to Ollama, as ChatRequest.messages[] context. There is little ability for the UI to prune the context in light of the num_ctx slider.
5.4 Response div - here the turns appear for this single prompt console.
5.5 status - this status is used throughout the UI. It just happens to be down here.
5.6 Save conversation button. - This button calls the proxy webserver to save the entire conversation's history to file on the harddrive, in the folder ./conversation_history. It wont be saved if the folder doesn't exist. 

### 6 - Tools
Describe tools here, including the javascript code for the tool. If the Ollama model asks for the tool, then it will or rather should execute that tool as per the assumed tool_call protocol of your UI. I can't recall it working too great. 

6.1 Function name - the name of your tool. 
6.2 Function description - the description of your tool for the model to understand. 
6.3 Number of parameters - You select the number of parameters that your tool takes, and the console changes to accomodate. 
6.4 Parameter name: The name of the parameter.
6.5 parameter type: The javascript native type of the parameter. 
6.6 Parameter description: the description of the parameter for the model to understand. 
6.7 Function Code: Here, you write the javascript function definition, for the tool, with the name and its parameters. 
6.8 Add/Update function - When the fields are filled, you click this button, and if the function doesn't exist it is added as a tool[] otherwise if the function does exist, then it is overwritten in tool[]. 
6.9 Defined tools - This shows a list of the available tools that will be sent with each prompt to Ollama. 

### 7 - Import/Export tools. 
To avoid filling out all the tools all of the time, this little textarea exports the tools[] array, into JSON.stringify format. 
This exported string can then be pasted into the box, imported into the UI for usage with Ollama. 
7.1 - Tool Definition textarea - the box for the properly formed array of Ollama tool definitions. 
7.2 - Export current tools button - this button exports the page's tools to this textarea, ready for you to save externally. 
7.3 - Import tools - this button imports the full set of tools defined in the JSON string of the tool array, that you have pasted from export into the Tool Definition textarea. If successful, then You should see the tools displayed in the 6.9 defined functions area.
7.4 - I dumped some 'generic' tools there for easy copy pasting. 

# HOW IT WORKS: 
The function coreOllamaRequest is the HTTP endpoint between the script.js and the proxy webserver. You can trace all the functions between this function coreOllamaRequestTC() and the user interface. 
The proxy simply relays the messages from the User's webpage and the Ollama server. The webserver has a keepalive timeout. The proxy doesn't keep state nor deal with concurrent requests, so it is for personal use. 
The 6D table is based on the interpretation of Genesis 1 according to Ephesians 3:18 , with a hope to have 7D tablature as a bare minimum for being loving. 

const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/0a68b7f4-66c3-4ffb-8e4e-5777c874822d/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
const toolResponses = lines.filter(l => l.includes('default_api:view_file') && l.includes('The following code has been modified') && l.includes('TOOL_RESPONSE'));
if (toolResponses.length) {
    const obj = JSON.parse(toolResponses[0]);
    fs.writeFileSync('original_nail.txt', obj.tool_responses[0].response.output);
} else {
    // Try to find any line that has TOOL_RESPONSE and NailConfigurator
    const anyToolResponse = lines.filter(l => l.includes('NailConfigurator.jsx') && l.includes('The following code has been modified'));
    if (anyToolResponse.length) {
         console.log('Found generic:', JSON.parse(anyToolResponse[0]).type);
         const obj = JSON.parse(anyToolResponse[0]);
         if (obj.tool_responses) {
             fs.writeFileSync('original_nail.txt', obj.tool_responses[0].response.output);
         } else if (obj.content) {
             fs.writeFileSync('original_nail.txt', obj.content);
         }
    }
}

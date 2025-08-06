export function formatConvHistory(messages){
    return messages.map((message, index)=>{
        if(i%2 === 0){
            return `Human: ${message}`;
        } else {
            return `AI: ${message}`;
        }
    }).join('\n');
}
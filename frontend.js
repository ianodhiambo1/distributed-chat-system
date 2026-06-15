// @ts-nocheck
async function connectWebSocket(){
    const ws_url = document.getElementById('ws-url')
    const ws = new WebSocket(ws_url.value)
    ws.onopen = (event) => {
        console.log(`Connected successfully on ${ws} with event: ${event}`)
    }
    ws.onerror = (event) => {
        console.log(`NOT Connected with error: ${event}`)
        console.log(ws.readyState)
    }
    ws.addEventListener("open", (event) => {
        ws.send(JSON.stringify(
            {
                user: "Alice",
                text: "hello2"

            }
        ))
    })
    
}

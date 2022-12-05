/* support message passing in browser */

class BrowserMessaging {
    public connected: Boolean
    public localMessagesStore: Array<string>
    public connection: RTCPeerConnection
    public dataChannel: RTCDataChannel
    public url: string

    public constructor(url: string) {
        this.connected = false
        this.localMessagesStore = []
        this.url = url
    }

    public async connect() {
        try {
            const dataChannelParams = {ordered: true, "iceServers": [{ "url": this.url }] }
            this.connection = new RTCPeerConnection()
            console.log("RTCPeerConnection created")

            this.connection.addEventListener('icecandidate', async e => {
                console.log('local connection ICE candidate: ', e.candidate)
                // await this.remoteConnection.addIceCandidate(e.candidate)
            })

            this.connection.onicecandidate = ({ candidate }) => {
                let curConnectedTo = connectedRef.current
                if (candidate && !curConnectedTo) {
                    this.sendMessage({
                        name: curConnectedTo,
                        type: "candidate",
                        candidate
                    })
                }
            }

            this.connection.ondatachannel = event => {
                let receiveChannel = event.channel
                receiveChannel.onopen = () => {
                    console.log('channel open')
                    receiveChannel.onmessage = this.onDataChannelMessage
                    // update channel(receivechannel)
                    this.connected= true
                }
            }
    
            this.dataChannel = this.connection.createDataChannel('chat-channel', dataChannelParams)
            
            
            this.dataChannel.binaryType = 'arraybuffer'
            this.dataChannel.addEventListener('open', () => {
                console.log('channel open')
                this.connected = true
            })
            this.dataChannel.addEventListener('close', () => {
                console.log('channel closed')
                this.connected = false
            })
            this.dataChannel.addEventListener('message', () => this.onLocalMessageReceived)
        } catch (e) {
            console.log(e)
        }
    }
    
    /* receive message */
    public async onLocalMessageReceived(event: MessageEvent) {
        try {
            const msg = JSON.parse(event.data)
            this.localMessagesStore.push(msg)
            return msg
        } catch (e) {
            console.log("Invalid msg JSON")
        }
    }
    
    /* send message */
    public async sendMessage(msg: JSON) {
        if (msg == '') {
            console.log('Cannot send empty message')
            return
        }
        console.log(`Sending remote message: ${msg}`)
        this.dataChannel.send(msg)
    }
    
    public disconnect() {
        this.connection.close()
    }
}

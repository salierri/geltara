import { Component } from 'react';
import { w3cwebsocket as WebSocket } from "websocket";
import React from 'react';
import { Message, CommandType, VideoRole } from '../api';

let address = isAdmin() ? process.env.REACT_APP_URL + '/geltaradmin' : process.env.REACT_APP_URL ?? "";
let client: WebSocket;

interface MessageState {
    messages: Array<string>
}

let subscriptions: { [key in Message["type"]]?: ((message: Message) => void)[] };

class Communication extends Component<{}, MessageState> {

    lastLogEvent? : HTMLDivElement | null;

    constructor(props: {}) {
        super(props);

        this.state = {
            messages: []
        }
    }

    componentDidMount() {
        this.connect();
        setInterval(this.heartbeat, 3000);
    }

    connect() {
        client = new WebSocket(address);
        client.onopen = () => {
            this.log("Connected to Socket");
        }
        client.onmessage = (message) => {
            console.log(message);
            let parsedMessage: Message = JSON.parse(message.data.toString());
            if(subscriptions[parsedMessage.type]) {
                subscriptions[parsedMessage.type]?.forEach((callback) => {
                    callback(parsedMessage);
                });
            }
            else if(parsedMessage.type === 'feedback') {
                this.log(parsedMessage.sender + " - " + parsedMessage.message);
            }
        }
        client.onerror = (error) => {
            console.log("error: " + error);
            client.close();
        }
        client.onclose = (e) => {
            setTimeout(() => {
                this.connect();
            }, 1000);
        }
    }

    static sendCommand(command: CommandType, role: VideoRole, param: string) {
        Communication._send({type: "command", command: command, role: role, param: param});
    }

    static sendFeedback(message: string) {
        Communication._send({type: "feedback", message: message});
    }

    heartbeat() {
        Communication._send({type: "heartbeat"});
    }

    static _send(message: Message) {
        if(client.readyState === 1 /* Ready */) {
            client.send(JSON.stringify(message));
        }
    }

    static subscribe(type: Message["type"], callback: (message: Message) => void) {
        if(!subscriptions) {
            subscriptions = {};
        }
        if(!subscriptions[type]) {
            subscriptions[type] = [];
        }
        subscriptions[type]?.push(callback);
    }

    componentDidUpdate() {
        this.lastLogEvent?.scrollIntoView({behavior: 'smooth'});
    }

    log(message: string) {
        this.state.messages.push((new Date()).toLocaleTimeString() + " - " + message);
        this.forceUpdate();
    }

    render() {
        if(!isAdmin()) {
            return null;
        }
        return (
            <div id="log-area">
                {this.state.messages.map(message => {
                    return <p className="log-message">{message}</p>
                })}
                <div ref={(el) => this.lastLogEvent = el}></div>
            </div>
        );
    }
}

function isAdmin() {
    return window.location.href.includes('geltaradmin');
}

export default Communication;

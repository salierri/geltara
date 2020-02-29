import { Component } from 'react';
import { w3cwebsocket as WebSocket } from "websocket";
import * as VideoPlayer from './videoPlayer';
import { Command, Message, VideoType } from '../server';
import React from 'react';

let address = isAdmin() ? process.env.REACT_APP_URL + '/geltaradmin' : process.env.REACT_APP_URL ?? "";
const client = new WebSocket(address);

export enum CommandType {
    LoadVideo = 'loadVideo',
    Volume = 'volume',
    SeekTo = 'seekTo',
    Pause = 'pause',
    Resume = 'resume'
}

interface MessageState {
    messages: Array<string>
}

class Communication extends Component<{}, MessageState> {

    lastLogEvent? : HTMLDivElement | null;

    constructor(props: {}) {
        super(props);

        this.state = {
            messages: []
        }
    }

    componentDidMount() {
        client.onopen = () => {
            this.log("Connected to Socket");
        }
        client.onmessage = (message) => {
            console.log(message);
            let parsedMessage: Message = JSON.parse(message.data.toString());
            if(parsedMessage.type == 'command') {
                executeCommand(parsedMessage);
            }
            else if(parsedMessage.type == 'state') {
                VideoPlayer.receivedState(parsedMessage.state);
            }
            else if(parsedMessage.type == 'feedback') {
                this.log(parsedMessage.sender + " - " + parsedMessage.message);
            }
        }
        client.onerror = (error) => {
            console.log("error: " + error);
        }
    }

    static sendCommand(command: CommandType, video: VideoType, param: string) {
        client.send(JSON.stringify({type: "command", command: command, video: video, param: param}));
    }

    static sendFeedback(message: string) {
        client.send(JSON.stringify({type: "feedback", message: message}));
    }

    componentDidUpdate() {
        this.lastLogEvent?.scrollIntoView({behavior: 'smooth'});
    }

    log(message: string) {
        this.state.messages.push((new Date()).toLocaleTimeString() + " - " + message);
        this.setState({messages: this.state.messages});
    }

    render() {
        if(!isAdmin())
            return null;
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

function executeCommand(command: Command) {
    if(command.command === CommandType.LoadVideo) {
        VideoPlayer.loadVideo(command.video, command.param);
    } else if(command.command === CommandType.Volume) {
        VideoPlayer.setVolume(command.video, command.param);
    } else if(command.command === CommandType.SeekTo) {
        VideoPlayer.seekTo(command.video, command.param);
    } else if(command.command === CommandType.Pause) {
        VideoPlayer.pause(command.video);
    } else if(command.command === CommandType.Resume) {
        VideoPlayer.resume(command.video);
    }
}

function isAdmin() {
    return window.location.href.includes('geltaradmin');
}

export default Communication;
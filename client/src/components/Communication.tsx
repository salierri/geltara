import { Component } from 'react';
import { w3cwebsocket as WebSocket } from "websocket";

const client = new WebSocket('wss://echo.websocket.org');

interface Players {
    music?: YT.Player
    ambience?: YT.Player
}

let players: Players = { };

export function VideosReady() {
    players.music = new YT.Player('musicPlayer', {
        height: '243',
        width: '400',
        videoId: 'm_8QMAChwtg',
        events: {
          'onReady': onPlayerReady
        }
    });
    players.ambience = new YT.Player('ambiencePlayer', {
        height: '243',
        width: '400',
        videoId: 'sGkh1W5cbH4',
        events: {
          'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event: YT.PlayerEvent) {
    //event.target.playVideo();
}

class Communication extends Component {
    componentDidMount() {
        client.onopen = () => {
            console.log("client connected");
        }
        client.onerror = (error) => {
            console.log("error: " + error);
        }
    }

    render() {
        return null
    }
}

export default Communication;
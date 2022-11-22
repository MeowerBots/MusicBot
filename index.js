import WebSocket from "ws";
import fetch from "node-fetch";
import {exec} from "child_process";
import * as dotenv from "dotenv";
import Musixmatch from "./musixmatch.js";

dotenv.config();

const username = process.env["MB_USERNAME"];
const password = process.env["MB_PASSWORD"];

const help = [":help", ":search", ":song", ":lyrics"];

const musixmatch = new Musixmatch(process.env["MB_APIKEY"]);

async function fetchURL(url) {
    return await fetch(url).then(res => res.text());
}

async function handlePost(user, message) {
    if (user == "Discord") {
        if (message.split(": ")[0] && message.split(": ")[1]) {
            handlePost(message.split(": ")[0], message.split(": ")[1]);
        }
    }

    if (user === username) {
        return;
    }

    if (message.startsWith(":") && !(help.includes(message.split(" ")[0]))) {
        post("That command doesn't exist! Use :help to see a list of commands.");
        return;
    }

    if (message.startsWith(":help")) {
        post(`Commands: ${help.join(", ")}`);
    }

    if (message.startsWith(":search")) {
        const results = await musixmatch.search(message.split(" ").slice(1, message.split(" ").length).join(" "));
        if (results === "") {
            post("No results found.");
        } else {
            post(`Search results for "${message.split(" ").slice(1, message.split(" ").length).join(" ")}":\n\t${results[0].track.track_name} by ${results[0].track.artist_name} (${results[0].track.commontrack_id})\n\t${results[1].track.track_name} by ${results[1].track.artist_name} (${results[1].track.commontrack_id})\n\t${results[2].track.track_name} by ${results[2].track.artist_name} (${results[2].track.commontrack_id})\n\t${results[3].track.track_name} by ${results[3].track.artist_name} (${results[3].track.commontrack_id})\n\t${results[4].track.track_name} by ${results[4].track.artist_name} (${results[4].track.commontrack_id})`);
        }
    }

    if (message.startsWith(":song")) {
        const song = await musixmatch.song(message.split(" ")[1]);
        if (song === "") {
            post("No results found.");
        } else {
            post(`${song.track_name} by ${song.artist_name}:\n\tRating: ${song.track_rating}`);
        }
    }

    if (message.startsWith(":lyrics")) {
        const lyrics = await musixmatch.lyrics(message.split(" ")[1]);
        if (lyrics === "") {
            post("No results found.");
        } else {
            post(`${lyrics.split("\n").slice(0, 4).join("\n")}`);
        }
    }
}

function post(content) {
    ws.send(JSON.stringify({"cmd": "direct", "val": {"cmd": "post_home", "val": content}}));
}

async function connect() {
    console.log("Connected");
    ws.send('{"cmd": "direct", "val": {"cmd": "type", "val": "js"}}');
    ws.send(`{"cmd": "direct", "val": {"cmd": "ip", "val": "${await fetchURL("https://api.meower.org/ip")}"}}`);
    ws.send('{"cmd": "direct", "val": "meower"}');
    ws.send('{"cmd": "direct", "val": {"cmd": "version_chk", "val": "scratch-beta-5-r7"}}');
    ws.send(`{"cmd": "direct", "val": {"cmd": "authpswd", "val": {"username": "${username}", "pswd": "${password}"}}}`);
    setTimeout(function() {
        post(`${username} is now online! Use :help to see a list of commands.`);
    }, 1000);
}

console.log("Connecting...");
var ws = new WebSocket("wss://server.meower.org/");

ws.on("open", connect);
ws.on("close", function() {
    console.error("Disconnected");
    var command = exec("npm run start");
    command.stdout.on("data", output => {
        console.log(output.toString());
    });
});

ws.on("message", function message(data) {
    var messageData = JSON.parse(data);
    if (messageData.val.type === 1) {
        console.log(`${messageData.val.u}: ${messageData.val.p}`);
        if (messageData.val.post_origin === "home") {
            handlePost(messageData.val.u, messageData.val.p);
        } else {
            return;
        }
    } else if (messageData.cmd === "ping") {
        if (messageData.val === "I:100 | OK") {
            console.log("Ping is OK");
        } else {
            console.error("Ping is not OK");
        }
    } else if (messageData.val.state === 101 || messageData.val.state === 100) {
        console.log(`${messageData.val.u} is typing...`);
    } else if (messageData.cmd === "ulist") {
        console.log(`Users online: ${messageData.val.split(";").join(", ")}`);
    } else if (messageData.cmd === "statuscode") {
        if (messageData.val.startsWith("E")) {
            console.error(`Status: ${messageData.val}`);
        } else if (messageData.val.startsWith("I:100")) {
            console.log(`Status: ${messageData.val}`);
        } else {
            console.log(`Status: ${messageData.val}`);
        }
    } else if (messageData.val.cmd === "motd") {
        console.log(`MOTD: ${messageData.val.val}`);
    } else if (messageData.val.cmd === "vers") {
        console.log(`Meower Server Version: ${messageData.val.val}`);
    } else if (messageData.val.state === 1) {
        console.log(`${messageData.val.u} joined ${messageData.val.chatid}`);
    } else if (messageData.val.state === 0) {
        console.log(`${messageData.val.u} left ${messageData.val.chatid}`);
    } else if (messageData.val.mode === "auth") {
        console.log(`Logged in as "${messageData.val.payload.username}" (${messageData.val.payload.token})`);
    } else {
        console.log(`New message: ${data}`);
    }
});

setInterval(function() {
    if (ws.readyState == 1) {
        ws.send('{"cmd": "ping", "val": ""}');
    }
}, 10000);

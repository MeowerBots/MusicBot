import Bot from "meowerbot";
import {exec} from "child_process";
import * as dotenv from "dotenv";
import Musixmatch from "../lib/musixmatch.js";
import { toRelative } from "../lib/relative.js";
import { shorten } from "../lib/shorten.js";

dotenv.config();

const username = process.env["MB_USERNAME"];
const password = process.env["MB_PASSWORD"];
const help = [":help", ":search", ":find", ":lyrics"];
const musixmatch = new Musixmatch(process.env["MB_APIKEY"]);
const bot = new Bot(username, password);

bot.onPost(async (user, message, origin) => {
    if (message.startsWith(":") && !(help.includes(message.split(" ")[0]))) {
        bot.post("That command doesn't exist! Use :help to see a list of commands.", origin);
        return;
    }

    if (message.startsWith(":help")) {
        bot.post(`Commands:
    ${help.join(", ")}`, origin);
    }

    if (message.startsWith(":search")) {
        let results = await musixmatch.search(message.split(" ").slice(1, message.split(" ").length).join(" "));
        if (results.length === 0) {
            bot.post("No results found.", origin);
        } else {
            bot.post(`Search results for "${message.split(" ").slice(1, message.split(" ").length).join(" ")}":
        ${results[0].track.track_name} by ${results[0].track.artist_name} (${results[0].track.commontrack_id})
        ${results[1].track.track_name} by ${results[1].track.artist_name} (${results[1].track.commontrack_id})
        ${results[2].track.track_name} by ${results[2].track.artist_name} (${results[2].track.commontrack_id})`, origin);
        }
    }

    if (message.startsWith(":find")) {
        let song = await musixmatch.song(message.split(" ")[1]);
        if (song === "") {
            bot.post("Couldn't get info about this song.", origin);
        } else {
            bot.post(`${song.track_name} by ${song.artist_name}:
        Rating: ${song.track_rating}
        Last updated: ${toRelative(new Date(song.updated_time).getTime())}
        Genre: ${(song.primary_genres.music_genre_list[0] ? song.primary_genres.music_genre_list[0].music_genre.music_genre_name : "None")}
        Times Favorited: ${song.num_favourite}
        URL: ${shorten(song.track_share_url)}
        Score: ${(0 > song.track_rating ? "🟥" : (50 > song.track_rating ? "🟨" : (100 > song.track_rating ? "🟩" : "🟩")))}`, origin);
        }
    }

    if (message.startsWith(":lyrics")) {
        let lyrics = await musixmatch.lyrics(message.split(" ")[1]);
        if (lyrics === "") {
            bot.post("Couldn't find the lyrics for this song.", origin);
        } else {
            bot.post(`${lyrics.split("\n").slice(0, 4).join("\n")}`, origin);
        }
    }
});

bot.onClose(() => {
    console.error("Disconnected");
    let command = exec("npm run start");
    command.stdout.on("data", output => {
        console.log(output.toString());
    });
});

bot.onLogin(() => {
    bot.post(`${username} is now online! Use :help to see a ist of commands.`);
});
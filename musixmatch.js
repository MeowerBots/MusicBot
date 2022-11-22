import fetch from "node-fetch";

export default class Musixmatch {
    constructor(key) {
        this.key = key;
    }
    
    async search(query) {
        var url = encodeURIComponent(`https://api.musixmatch.com/ws/1.1/track.search?q=${query}&apikey=${this.key}`);
        var tracks = await fetch(`https://api.allorigins.win/get?url=${url}`).then(res => res.text());
        var tracks = JSON.parse(tracks);
        var tracks = JSON.parse(tracks.contents);
        if (tracks.message.body.track_list.length == 0) {
            return "";
        } else {
            return tracks.message.body.track_list;
        }
    }

    async lyrics(id) {
        var url = encodeURIComponent(`https://api.musixmatch.com/ws/1.1/track.lyrics.get?commontrack_id=${id}&apikey=${this.key}`);
        var track = await fetch(`https://api.allorigins.win/get?url=${url}`).then(res => res.text());
        var track = JSON.parse(track);
        var lyrics = JSON.parse(track.contents);
        if (lyrics.message.header.status_code != 200) {
            return "";
        } else {
            console.log(lyrics.message.body.lyrics.lyrics_body.split("\n"));
            return lyrics.message.body.lyrics.lyrics_body;
        }
    }

    async song(id) {
        var url = encodeURIComponent(`https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=${id}&apikey=${this.key}`);
        var song = await fetch(`https://api.allorigins.win/get?url=${url}`).then(res => res.text());
        var song = JSON.parse(song);
        var song = JSON.parse(song.contents);
        if (song.message.header.status_code != 200) {
            return "";
        } else {
            return song.message.body.track;
        }
    }
}
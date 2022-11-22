import fetch from "node-fetch";

export default class Musixmatch {
    constructor(key) {
        this.key = key;
    }
    
    async search(query) {
        var url = encodeURIComponent(`https://api.musixmatch.com/ws/1.1/track.search?q=${query}&f_lyrics_language=en&apikey=${this.key}`);
        var tracks = await fetch(`https://api.allorigins.win/get?url=${url}`).then(res => res.json());
        var tracks = JSON.parse(tracks.contents);
        if (tracks.message.body.track_list.length == 0) {
            return "";
        } else {
            return tracks.message.body.track_list;
        }
    }

    async lyrics(id) {
        var url = encodeURIComponent(`https://api.musixmatch.com/ws/1.1/track.lyrics.get?commontrack_id=${id}&apikey=${this.key}`);
        var track = await fetch(`https://api.allorigins.win/get?url=${url}`).then(res => res.json());
        var lyrics = JSON.parse(track.contents);
        if (lyrics.message.header.status_code != 200 || lyrics.message.body.lyrics.explicit === 1) {
            return "";
        } else {
            return lyrics.message.body.lyrics.lyrics_body;
        }
    }

    async song(id) {
        var url = encodeURIComponent(`https://api.musixmatch.com/ws/1.1/track.get?commontrack_id=${id}&apikey=${this.key}`);
        var song = await fetch(`https://api.allorigins.win/get?url=${url}`).then(res => res.json());
        var song = JSON.parse(song.contents);
        if (song.message.header.status_code != 200 || song.message.body.track.explicit === 1) {
            return "";
        } else {
            return song.message.body.track;
        }
    }
}

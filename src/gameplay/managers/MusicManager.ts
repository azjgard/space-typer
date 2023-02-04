import { Howl } from "howler";
import soundManager from "./SoundManager";

export function createMusicManager() {
  let songs = [
    soundManager.get("song1"),
    soundManager.get("song2"),
    soundManager.get("song3"),
  ];

  let songsSorted: Howl[] = [];

  while (songs.length) {
    const i = Math.floor(Math.random() * songs.length);
    songsSorted.push(songs.splice(i, 1)[0]);
  }

  let currentPlayingSong:
    | { song: Howl; id: number; songIndex: number; onEnd: () => void }
    | undefined;

  const getNextSongIndex = (currentIndex: number) =>
    currentIndex >= songsSorted.length ? 0 : currentIndex + 1;

  function playEndlessly(songIndex = 0) {
    const song = songsSorted[songIndex];
    currentPlayingSong = {
      id: song.play(),
      song,
      songIndex,
      onEnd: () => playEndlessly(getNextSongIndex(songIndex)),
    };
    song.on("end", currentPlayingSong.onEnd);
  }

  return {
    start: () => playEndlessly(0),
    nextSong: () => {
      if (!currentPlayingSong) return;

      currentPlayingSong.song.off("end", currentPlayingSong.onEnd);
      currentPlayingSong.song.stop(currentPlayingSong.id);
      playEndlessly(getNextSongIndex(currentPlayingSong.songIndex));
    },
    togglePaused: () => {
      if (!currentPlayingSong) return;

      const { song, id } = currentPlayingSong;
      if (song.playing(id)) song.pause(id);
      else song.play(id);
    },
  };
}

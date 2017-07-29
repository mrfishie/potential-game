/**
 * Sound Manager
 */

var Sound = window.Sound || {};
(function() {
	var sounds = {};
	
	Sound.add = function(name, path, types) {
		types = types || ["mp3", "ogg"];
		var audio = document.createElement("audio");
		for (var i in types) {
			var source = document.createElement("source");
			source.src = path + "." + types[i];
			source.type = "audio/" + types[i];
			audio.appendChild(source);
		}
		sounds[name] = audio;
	}
	
	Sound.get = function(name) {
		if (!(name in sounds)) throw new Error("The sound called '" + name + "' does not exist");
		return sounds[name];
	}
	
	Sound.play = function(name, repeat) {
		Sound.playFrom(name, 0, repeat);
	}
	
	Sound.stop = function(name) {
		var audio = Sound.get(name);
		
		audio.__isPlaying = false;
		audio.pause();
		audio.currentTime = 0;
	}
	
	Sound.volume = function(name, vol) {
		var audio = Sound.get(name);
		
		audio.volume = vol;
	}
	
	var onAudioPlay = function() {
		//console.log(this, this.currentTime, this.__start);
		//this.currentTime = this.__start;
		this.play();
	}
	var onAudioEnd = function() {
		if (this.__repeat && this.__isPlaying) onAudioPlay.apply(this);
		else this.removeEventListener('ended', onAudioEnd);
	}
	Sound.playFrom = function(name, start, repeat) {
		var audio = Sound.get(name);
		
		audio.__repeat = repeat || false;
		audio.__isPlaying = true;
		audio.__start = Math.min(start || 0, audio.startTime || 0);
		
		audio.removeEventListener('ended', onAudioEnd);
		audio.addEventListener('ended', onAudioEnd);
		
		onAudioPlay.apply(audio);
	}
}());
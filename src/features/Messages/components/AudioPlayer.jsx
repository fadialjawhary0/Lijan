import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, Download } from 'lucide-react';
import { formatDuration } from '../../../utils/audioRecorder';

const AudioPlayer = ({ audioUrl, fileName, duration, isOwnMessage }) => {
  const { t } = useTranslation('messages');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setLoadedDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = e => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = fileName || 'audio-message.webm';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const progressPercent = loadedDuration > 0 ? (currentTime / loadedDuration) * 100 : 0;
  const displayDuration = duration || loadedDuration || 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <button
        onClick={togglePlayPause}
        className={`p-2 rounded-full flex-shrink-0 transition-colors ${
          isOwnMessage ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-primary/10 hover:bg-primary/20 text-primary'
        }`}
        title={isPlaying ? t('pause') : t('play')}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className={`h-2 rounded-full cursor-pointer relative ${isOwnMessage ? 'bg-white/20' : 'bg-gray-200'}`} onClick={handleProgressClick}>
          <div className={`h-full rounded-full transition-all ${isOwnMessage ? 'bg-white' : 'bg-primary'}`} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs font-mono ${isOwnMessage ? 'text-white/70' : 'text-gray-600'}`}>
            {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(displayDuration))}
          </span>
          {fileName && (
            <button
              onClick={handleDownload}
              className={`p-1 rounded transition-colors ${isOwnMessage ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title={t('download')}
            >
              <Download className={`w-3 h-3 ${isOwnMessage ? 'text-white/70' : 'text-gray-600'}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;

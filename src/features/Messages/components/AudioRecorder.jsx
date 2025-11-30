import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Square, X } from 'lucide-react';
import { AudioRecorder, formatDuration } from '../../../utils/audioRecorder';

const AudioRecorderComponent = ({ onRecordingComplete, onCancel }) => {
  const { t } = useTranslation('messages');
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const recorderRef = useRef(null);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (recorderRef.current) {
        recorderRef.current.cancelRecording();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      
      await recorder.startRecording();
      setIsRecording(true);

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        setDuration(recorder.getDuration());
      }, 1000);
    } catch (err) {
      setError(err.message || t('audioRecordingFailed'));
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (recorderRef.current) {
        const result = await recorderRef.current.stopRecording();
        setIsRecording(false);
        setDuration(0);
        onRecordingComplete(result);
      }
    } catch (err) {
      setError(err.message || t('audioRecordingFailed'));
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.cancelRecording();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setIsRecording(false);
    setDuration(0);
    setError(null);
    onCancel();
  };

  return (
    <div className="p-4 bg-[var(--color-background-hover)] rounded-lg border border-[var(--color-border)]">
      {error && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isRecording ? (
          <>
            <button
              onClick={startRecording}
              className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              title={t('startRecording')}
            >
              <Mic className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium">{t('clickToRecord')}</p>
            </div>
            <button
              onClick={cancelRecording}
              className="p-2 rounded-lg hover:bg-[var(--color-background-hover)] transition-colors"
              title={t('cancel')}
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono font-medium">{formatDuration(duration)}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm">{t('recording')}...</p>
            </div>
            <button
              onClick={stopRecording}
              className="p-3 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              title={t('stopRecording')}
            >
              <Square className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioRecorderComponent;


import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, X } from 'lucide-react';
import AudioRecorder from './AudioRecorder';

const MessageInput = ({ onSendMessage, onSendAudio, disabled }) => {
  const { t } = useTranslation('messages');
  const [message, setMessage] = useState('');
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAudioRecordingComplete = async (result) => {
    setShowAudioRecorder(false);
    if (onSendAudio) {
      await onSendAudio(result);
    }
  };

  const handleCancelAudioRecording = () => {
    setShowAudioRecorder(false);
  };

  return (
    <div className="space-y-2">
      {showAudioRecorder ? (
        <AudioRecorder
          onRecordingComplete={handleAudioRecordingComplete}
          onCancel={handleCancelAudioRecording}
        />
      ) : (
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setShowAudioRecorder(true)}
            disabled={disabled}
            className="
              p-2 rounded-lg bg-gray-100 hover:bg-gray-200
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors flex-shrink-0
            "
            title={t('recordAudio')}
          >
            <Mic className="w-5 h-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('typeMessage')}
            disabled={disabled}
            rows={1}
            className="
              flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)]
              bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-primary/50
              resize-none overflow-hidden max-h-32
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            style={{ minHeight: '40px' }}
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="
              p-2 rounded-lg bg-primary text-white
              hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors flex-shrink-0
            "
            title={t('send')}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}
    </div>
  );
};

export default MessageInput;


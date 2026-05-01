import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonFooter,
  IonAvatar, IonButton, IonIcon, IonSpinner,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { arrowBackOutline, sendOutline, ellipsisVertical } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../models/Conversation';
import * as ConversationService from '../../services/ConversationService';
import './ChatPage.css';

interface ChatParams {
  conversationId: string;
  helperName: string;
  helperAvatar: string;
}

const ChatPage: React.FC = () => {
  const { conversationId, helperName, helperAvatar } =
    useParams<{ conversationId: string; helperName: string; helperAvatar: string }>();
  const { currentUser } = useAuth();
  const history = useHistory();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const decodedHelperName = decodeURIComponent(helperName);
  const decodedHelperAvatar = decodeURIComponent(helperAvatar);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;
    const unsub = ConversationService.subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => contentRef.current?.scrollToBottom(250), 80);
    });
    return () => unsub();
  }, [conversationId]);

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => contentRef.current?.scrollToBottom(250), 80);
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !currentUser || sending) return;

    setSending(true);
    setInputText('');
    try {
      await ConversationService.sendMessage(
        conversationId,
        currentUser.uid,
        text,
        false, // from user, not helper
      );
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: any): string => {
    if (!ts?.toDate) return '';
    const d: Date = ts.toDate();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <IonPage>
      {/* ── Header ── */}
      <IonHeader className="ion-no-border chat-header">
        <IonToolbar className="chat-toolbar">
          <div className="chat-header-inner">
            <IonButton fill="clear" className="chat-back-btn" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>

            <IonAvatar className="chat-helper-avatar">
              <img
                src={decodedHelperAvatar || 'https://www.gravatar.com/avatar?d=mp'}
                alt={decodedHelperName}
              />
            </IonAvatar>

            <div className="chat-helper-info">
              <p className="chat-helper-name">{decodedHelperName}</p>
              <p className="chat-helper-status">Quote request</p>
            </div>

            <IonButton fill="clear" className="chat-menu-btn">
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* ── Messages ── */}
      <IonContent ref={contentRef} className="chat-content">
        {loading ? (
          <div className="chat-loading">
            <IonSpinner name="dots" />
          </div>
        ) : (
          <div className="chat-messages-wrap">
            {/* Welcome notice */}
            <div className="chat-notice">
              <span>This is the start of your conversation with <strong>{decodedHelperName}</strong></span>
            </div>

            {messages.length === 0 && (
              <div className="chat-empty">
                <p>👋 Send a message to request a quote!</p>
                <div className="chat-quick-prompts">
                  {[
                    `Hi, I'd like to get a quote for your services.`,
                    `What are your availability and rates?`,
                    `Do you offer free estimates?`,
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      className="quick-prompt-chip"
                      onClick={() => setInputText(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = !msg.isFromHelper;
              const showTime = i === messages.length - 1 ||
                messages[i + 1]?.isFromHelper !== msg.isFromHelper;
              return (
                <div key={msg.id} className={`chat-msg-wrap ${isUser ? 'user' : 'helper'}`}>
                  {!isUser && (
                    <IonAvatar className="msg-avatar">
                      <img
                        src={decodedHelperAvatar || 'https://www.gravatar.com/avatar?d=mp'}
                        alt={decodedHelperName}
                      />
                    </IonAvatar>
                  )}
                  <div className="msg-col">
                    <div className={`chat-bubble ${isUser ? 'user' : 'helper'}`}>
                      <p>{msg.text}</p>
                    </div>
                    {showTime && (
                      <span className="msg-time">{formatTime(msg.createdAt)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </IonContent>

      {/* ── Input bar ── */}
      <IonFooter className="ion-no-border chat-footer">
        <div className="chat-input-bar">
          <textarea
            ref={inputRef}
            className="chat-textarea"
            placeholder="Message..."
            value={inputText}
            rows={1}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? <IonSpinner name="dots" style={{ width: 16, height: 16 }} /> : <IonIcon icon={sendOutline} />}
          </button>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default ChatPage;

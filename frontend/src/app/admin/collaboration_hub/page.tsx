"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, FileText, Users, RefreshCw, X, MessageSquare, Clock } from 'lucide-react';
import { useGetAllMessagesQuery, useGetCommunicationUsersQuery, useSendMessageMutation } from '@/lib/redux/slices/CommunicationSlices';
import { toast } from "sonner";

interface MessageFormData {
  receiver: number;
  subject: string;
  message_content: string;
  message_type: 'general' | 'alert' | 'instruction' | 'report' | 'request';
  priority: 'high' | 'medium' | 'low';
}

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  profile_picture?: string;
  is_active?: boolean;
  full_name?: string;
}

interface Message {
  id: number;
  sender: number;
  receiver: number;
  sender_details: { id: number; username: string; full_name: string; email: string; };
  receiver_details: { id: number; username: string; full_name: string; email: string; };
  message_content: string;
  subject: string;
  message_type: string;
  priority: string;
  timestamp: string;
  time_since: string;
  is_read: boolean;
}

const defaultForm: MessageFormData = {
  receiver: 0,
  subject: '',
  message_content: '',
  message_type: 'general',
  priority: 'medium',
};

const priorityStyle = (p: string): React.CSSProperties => {
  if (p === 'high') return { background: 'var(--status-danger-bg)', color: 'var(--status-danger)', border: '1px solid var(--status-danger)' };
  if (p === 'medium') return { background: 'var(--status-warning-bg)', color: 'var(--status-warning)', border: '1px solid var(--status-warning)' };
  return { background: 'var(--status-success-bg)', color: 'var(--status-success)', border: '1px solid var(--status-success)' };
};

export default function CollaborationHub() {
  const { data: usersData = [], isLoading: usersLoading } = useGetCommunicationUsersQuery({});
  const { data: messagesData = [], isLoading: messagesLoading, refetch } = useGetAllMessagesQuery({});
  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();

  const [showComposeForm, setShowComposeForm] = useState(false);
  const [messageForm, setMessageForm] = useState<MessageFormData>(defaultForm);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  useEffect(() => {
    if (isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesData, isNearBottom]);

  const handleSendMessage = async () => {
    if (!messageForm.receiver || !messageForm.subject || !messageForm.message_content) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await sendMessage(messageForm).unwrap();
      setMessageForm(defaultForm);
      setShowComposeForm(false);
      refetch();
      toast.success("Message sent.");
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const field = <K extends keyof MessageFormData>(k: K, v: MessageFormData[K]) =>
    setMessageForm((p) => ({ ...p, [k]: v }));

  const unread = messagesData.filter((m: Message) => !m.is_read).length;

  if (usersLoading || messagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Collaboration Hub
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Team communications and messaging
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Users panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <Users size={16} style={{ color: 'var(--accent)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Users ({usersData.length})
                </h3>
              </div>
              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {usersData.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--text-tertiary)' }}>No users found</p>
                ) : (
                  usersData.map((user: User) => (
                    <div key={user.id} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                        {(user.full_name || user.username).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {user.full_name || user.username}
                        </p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                          {user.role || 'User'}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--status-success)' }} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Overview</h3>
              {[
                { label: 'Total Messages', value: messagesData.length },
                { label: 'Users', value: usersData.length },
                { label: 'Unread', value: unread },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
              </div>
              <div className="p-2 space-y-1">
                <button onClick={() => setShowComposeForm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{ color: 'var(--accent)' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-elevated)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
                >
                  <Send size={14} /> Compose Message
                </button>
                <button onClick={() => refetch()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-elevated)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
                >
                  <RefreshCw size={14} /> Refresh Messages
                </button>
              </div>
            </div>
          </div>

          {/* Messages panel */}
          <div className="lg:col-span-3 flex flex-col rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minHeight: 600 }}>
            {/* Messages header */}
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <MessageSquare size={16} color="#fff" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Team Communications</h3>
                  <p className="text-xs text-white/60">
                    {messagesData.length} messages · {unread} unread
                  </p>
                </div>
              </div>
              <button onClick={() => setShowComposeForm((p) => !p)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'}
              >
                {showComposeForm ? 'Hide Form' : 'Compose'}
              </button>
            </div>

            {/* Messages list */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 480 }}>
              {messagesData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText size={40} style={{ color: 'var(--text-tertiary)' }} className="mb-3" />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messagesData.map((msg: Message) => (
                  <div key={msg.id} className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold"
                          style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                          {msg.sender_details.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {msg.sender_details.full_name}
                          </span>
                          <span className="text-xs mx-1" style={{ color: 'var(--text-tertiary)' }}>→</span>
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {msg.receiver_details.full_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase"
                          style={priorityStyle(msg.priority)}>
                          {msg.priority}
                        </span>
                        {!msg.is_read && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--status-warning)' }} />
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>{msg.subject}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.message_content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-overlay)', color: 'var(--text-tertiary)' }}>
                        {msg.message_type}
                      </span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                        <Clock size={10} /> {msg.time_since}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Compose form */}
            {showComposeForm && (
              <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>New Message</h4>
                  <button onClick={() => setShowComposeForm(false)} style={{ color: 'var(--text-tertiary)' }} aria-label="Close">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Receiver</label>
                    <select value={messageForm.receiver}
                      onChange={(e) => field('receiver', parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }}
                    >
                      <option value={0}>Select receiver</option>
                      {usersData.map((u: User) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name || u.username} ({u.role || 'User'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Type</label>
                    <select value={messageForm.message_type}
                      onChange={(e) => field('message_type', e.target.value as MessageFormData['message_type'])}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }}
                    >
                      <option value="general">General</option>
                      <option value="alert">Alert</option>
                      <option value="instruction">Instruction</option>
                      <option value="report">Report</option>
                      <option value="request">Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Priority</label>
                    <select value={messageForm.priority}
                      onChange={(e) => field('priority', e.target.value as MessageFormData['priority'])}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                    <input type="text" value={messageForm.subject}
                      onChange={(e) => field('subject', e.target.value)}
                      placeholder="Enter subject"
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Message</label>
                  <textarea value={messageForm.message_content}
                    onChange={(e) => field('message_content', e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSendMessage} disabled={sendingMessage}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-all"
                    style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}
                  >
                    {sendingMessage ? (
                      <><RefreshCw size={14} className="animate-spin" /> Sending...</>
                    ) : (
                      <><Send size={14} /> Send Message</>
                    )}
                  </button>
                  <button onClick={() => setShowComposeForm(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

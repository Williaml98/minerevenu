"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Users, Clock } from 'lucide-react';
import { useGetAllUsersQuery } from '@/lib/redux/slices/AuthSlice';
import { useGetAllMessagesQuery, useSendMessageMutation } from '@/lib/redux/slices/CommunicationSlices';
import Image from 'next/image';

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
  role: string;
  profile_picture?: string;
  is_active: boolean;
}

interface Message {
  id: number;
  sender: number;
  receiver: number;
  sender_details: {
    id: number;
    username: string;
    full_name: string;
    email: string;
  };
  receiver_details: {
    id: number;
    username: string;
    full_name: string;
    email: string;
  };
  message_content: string;
  subject: string;
  message_type: string;
  priority: string;
  timestamp: string;
  time_since: string;
  is_read: boolean;
  read_at?: string;
}

const CollaborationHubChat = () => {
  const { data: usersData = [], isLoading: usersLoading } = useGetAllUsersQuery({});
  const { data: messagesData = [], isLoading: messagesLoading, refetch: refetchMessages } = useGetAllMessagesQuery({});
  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();

  const [showComposeForm, setShowComposeForm] = useState(false);
  const [messageForm, setMessageForm] = useState<MessageFormData>({
    receiver: 0,
    subject: '',
    message_content: '',
    message_type: 'general',
    priority: 'medium',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50';
      case 'low':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    if (!messageForm.receiver || !messageForm.subject || !messageForm.message_content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await sendMessage(messageForm).unwrap();
      setMessageForm({
        receiver: 0,
        subject: '',
        message_content: '',
        message_type: 'general',
        priority: 'medium',
      });
      setShowComposeForm(false);
      refetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleInputChange = <K extends keyof MessageFormData>(field: K, value: MessageFormData[K]) => {
    setMessageForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const activeUsers = usersData.filter((user: User) => user.is_active && user.id !== 1);

  if (usersLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading chat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Active Users
                </h3>
              </div>

              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {activeUsers.map((user: User) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      {user.profile_picture ? (
                        <Image src={user.profile_picture} alt={user.username} className="w-8 h-8 rounded-full" width={32} height={32} />
                      ) : (
                        <span className="text-sm font-medium text-indigo-600">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-900 to-indigo-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Team Communications</h3>
                      <p className="text-sm text-white/70">
                        {messagesData.length} messages � {activeUsers.length} active users
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowComposeForm(true)}
                    className="px-4 py-2 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Compose
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '500px' }}>
                {messagesData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messagesData.map((message: Message) => (
                    <div key={message.id} className="space-y-2">
                      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-white">{message.sender_details.full_name}</span>
                            <span className="text-xs text-white/70">? {message.receiver_details.full_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </span>
                            <span className="text-xs text-white/70">{formatTimestamp(message.timestamp)}</span>
                          </div>
                        </div>

                        <div className="mb-2">
                          <p className="text-sm font-medium text-white/90">{message.subject}</p>
                        </div>

                        <p className="text-sm text-white/95">{message.message_content}</p>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                          <span className="text-xs text-white/70">{message.time_since}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-white/70">{message.message_type}</span>
                            {!message.is_read && <div className="w-2 h-2 bg-yellow-400 rounded-full" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {showComposeForm && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Compose Message</h4>
                      <button onClick={() => setShowComposeForm(false)} className="text-gray-500 hover:text-gray-700">
                        �
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Receiver</label>
                        <select
                          value={messageForm.receiver}
                          onChange={(e) => handleInputChange('receiver', parseInt(e.target.value, 10))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value={0}>Select receiver</option>
                          {activeUsers.map((user: User) => (
                            <option key={user.id} value={user.id}>
                              {user.username} ({user.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                        <select
                          value={messageForm.message_type}
                          onChange={(e) => handleInputChange('message_type', e.target.value as MessageFormData['message_type'])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="general">General</option>
                          <option value="alert">Alert</option>
                          <option value="instruction">Instruction</option>
                          <option value="report">Report</option>
                          <option value="request">Request</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={messageForm.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value as MessageFormData['priority'])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                          type="text"
                          value={messageForm.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="Enter message subject"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                      <textarea
                        value={messageForm.message_content}
                        onChange={(e) => handleInputChange('message_content', e.target.value)}
                        placeholder="Enter your message"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={handleSendMessage}
                        disabled={sendingMessage}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-lg hover:from-indigo-800 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                      >
                        {sendingMessage ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => setShowComposeForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">System Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Messages</span>
                    <span className="font-medium">{messagesData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Active Users</span>
                    <span className="font-medium">{activeUsers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Unread Messages</span>
                    <span className="font-medium">{messagesData.filter((m: Message) => !m.is_read).length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>

                <div className="p-4 space-y-2">
                  <button
                    onClick={() => setShowComposeForm(true)}
                    className="w-full text-left px-3 py-2 text-sm text-indigo-900 hover:bg-indigo-50 rounded-md flex items-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </button>
                  <button
                    onClick={() => refetchMessages()}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Refresh Messages
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationHubChat;

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { WHATSAPP_NUMBER, CONTACT_PHONE } from '@/lib/constants';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
}

export default function ChatWidget() {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Comment puis-je vous aider ?',
      sender: 'support',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    // Auto-reply (placeholder - will be replaced with Supabase Realtime)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Merci pour votre message ! Notre equipe vous repondra tres bientot. Pour une reponse plus rapide, contactez-nous par WhatsApp.',
          sender: 'support',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-nature-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-nature-green-dark transition-all hover:scale-105"
        aria-label={t('title')}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-nature-green text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t('title')} Cali-T</h3>
                  <span className="text-xs text-white/70">En ligne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-nature-green text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[10px] mt-1 block ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div className="px-4 pb-2 flex gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full hover:bg-green-100 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              WhatsApp
            </a>
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors"
            >
              <Phone className="w-3 h-3" />
              Appeler
            </a>
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('placeholder')}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-2 bg-nature-green text-white rounded-xl hover:bg-nature-green-dark disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

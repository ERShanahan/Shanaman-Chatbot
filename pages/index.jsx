import React, { useState, useEffect, useRef } from 'react';
import BlurText from "../components/BlurText";
import ShinyText from '../components/ShinyText';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatboxRef = useRef(null);

  const API = process.env.CHAT_API_URL;

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const { reply } = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <div className="home">
      <div className="header">
        <BlurText
        text="Shanaman"
        delay={300}
        animateBy="letters"
        direction="top"
        onAnimationComplete={handleAnimationComplete}
        className="text-2xl mb-8"
        />
      </div>

      <div className='home__chatbox-wrapper'>
        <div ref={chatboxRef} className="home__chatbox">
            {messages.map((msg, idx) => (
            <div
                key={idx}
                className={`home__message home__message--${msg.sender}`}
            >
                <p className="message__text">{msg.text}</p>
            </div>
            ))}
            {loading && (
            <div className="home__message home__message--bot">
                <div className="spinner" />
            </div>
            )}
        </div>
      </div>

      <footer className="home__footer">
        <input
          className="home__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button
          className="home__send-button"
          onClick={handleSend}
        >
            <ShinyText text="Send" speed={3} />
        </button>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/history').then(res => setHistory(res.data));
  }, []);

  const sendMessage = async () => {
    if (!message) return;
    const res = await axios.post('http://localhost:5000/chat', { message });
    setResponse(res.data.reply);
    setHistory([...history, { user_input: message, ai_response: res.data.reply }]);
    setMessage('');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Chat avec Homer Simpson 🍩</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tape un message..."
        className="p-2 border rounded w-1/2"
      />
      <button onClick={sendMessage} className="mt-2 p-2 bg-yellow-400 rounded">
        Envoyer
      </button>
      <div className="mt-6 w-1/2">
        {history.map((item, index) => (
          <div key={index} className="p-2 border-b">
            <p><strong>Toi:</strong> {item.user_input}</p>
            <p><strong>Homer:</strong> {item.ai_response}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

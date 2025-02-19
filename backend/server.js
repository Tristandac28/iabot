
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('❌ Erreur de connexion à MySQL:', err);
    return;
  }
  console.log('✅ MySQL connecté');
});

// API pour discuter avec Homer
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message requis" });
  }

  try {
    const response = await axios.post(
      'https://api.aimlapi.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Tu es Homer Simpson. Réponds avec son style unique.' },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIML_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    // Sauvegarde dans MySQL
    db.query(
      'INSERT INTO messages (user_input, ai_response) VALUES (?, ?)', 
      [message, reply],
      (err) => {
        if (err) {
          console.error("❌ Erreur SQL:", err);
        }
      }
    );

    res.json({ reply });
  } catch (error) {
    console.error("❌ Erreur API:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Erreur API", details: error.response ? error.response.data : error.message });
  }
});

// Récupération de l'historique
app.get('/history', (req, res) => {
  db.query('SELECT * FROM messages ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error("❌ Erreur SQL:", err);
      return res.status(500).json({ error: "Erreur SQL" });
    }
    res.json(results);
  });
});

console.log("🔑 Clé API AIML chargée :", process.env.AIML_API_KEY ? "OK" : "NON TROUVÉE");

app.listen(port, () => console.log(`🚀 Serveur démarré sur http://localhost:${port}`));

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
var DiamSdk = require("diamante-sdk-js");


const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
// Wrapper for Diamante SDK functions

const diamante = {
    createWallet: async () => {const fetch = require('node-fetch');
        const { Keypair, Horizon } = require("diamante-sdk-js");
        
        (async function createAccount() {
          try {
            const pair = Keypair.random();
            const response = await fetch(`https://friendbot.diamcircle.io?addr=${encodeURIComponent(pair.publicKey())}`);
            const responseJSON = await response.json();
            console.log("SUCCESS! You have a new account :)\n", responseJSON);
            console.log("New Account Public Key:", pair.publicKey());
            console.log("New Account Secret Key:", pair.secret());
          } catch (e) {
            console.error("ERROR!", e);
          }
        })();
        return  responseJSON;        
    },
    getBalance: async (address) => {
        const { Keypair, Horizon } = require("diamante-sdk-js");

        (async function checkBalance() {
          const pair = Keypair.fromSecret("YOUR_SECRET_KEY"); // Replace with your secret key
          const server = new Horizon.Server("https://diamtestnet.diamcircle.io/");
        
          try {
            const account = await server.loadAccount(pair.publicKey());
            console.log("Balances for account: " + pair.publicKey());
            account.balances.forEach(function (balance) {
              console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
            });
          } catch (e) {
            console.error("ERROR!", e);
          }
        })();
        return balance;        
    },
    transfer: async (address, amount) => {const {
        Keypair,
        Horizon,
        TransactionBuilder,
        Networks,
        Operation,
        Asset,
        BASE_FEE,
      } = require("diamante-sdk-js");
      
      const transferAssets = async () => {
        const sender = Keypair.fromSecret("YOUR_SECRET_KEY"); // Replace with your secret key
        const receiverPublicKey = "RECEIVER_PUBLIC_KEY"; // Replace with receiver's public key
      
        const server = new Horizon.Server("https://diamtestnet.diamcircle.io/");
      
        try {
          const senderAccount = await server.loadAccount(sender.publicKey());
      
          const transaction = new TransactionBuilder(senderAccount, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet",
          })
            .addOperation(
              Operation.payment({
                destination: receiverPublicKey,
                asset: Asset.native(),
                amount: "10", // Amount to transfer
              })
            )
            .setTimeout(30)
            .build();
      
          transaction.sign(sender);
      
          const res = await server.submitTransaction(transaction);
          console.log(`Transaction Successful! Hash: ${res.hash}`);
        } catch (error) {
          console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`);
        }
      };
      
      transferAssets();
      
    },
    burn: async (address, amount) => {
      // Implement token burning logic here
      // This is a placeholder implementation
      return { hash: 'sample_tx_hash_' + Math.random().toString(36).substring(7) };
    }
  };
// Diamante SDK setup

// Database setup
const db = new sqlite3.Database('./rewards.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
    initDatabase();
  }
});

function initDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    loyalty_points INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    amount INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    tx_hash TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
}

// Routes

// Create a new user
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'An internal server error occurred.' });
  });

  
app.post('/users', async (req, res) => {
  const { username } = req.body;
  try {
    const wallet = await diamante.createWallet();
    db.run('INSERT INTO users (username, wallet_address) VALUES (?, ?)', [username, wallet.address], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, username, wallet_address: wallet.address });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user balance
app.get('/users/:id/balance', async (req, res) => {
  const { id } = req.params;
  db.get('SELECT wallet_address, loyalty_points FROM users WHERE id = ?', [id], async (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    try {
      const balance = await diamante.getBalance(row.wallet_address);
      res.json({ tokens: balance, loyalty_points: row.loyalty_points });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Issue tokens to a user
app.post('/users/:id/issue-tokens', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  db.get('SELECT wallet_address FROM users WHERE id = ?', [id], async (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    try {
      const tx = await diamante.transfer(row.wallet_address, amount);
      db.run('INSERT INTO transactions (user_id, type, amount, tx_hash) VALUES (?, ?, ?, ?)', [id, 'issue', amount, tx.hash]);
      res.json({ message: 'Tokens issued successfully', tx_hash: tx.hash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Redeem tokens
app.post('/users/:id/redeem-tokens', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  db.get('SELECT wallet_address FROM users WHERE id = ?', [id], async (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    try {
      const balance = await diamante.getBalance(row.wallet_address);
      if (balance < amount) {
        res.status(400).json({ error: 'Insufficient tokens' });
        return;
      }
      const tx = await diamante.burn(row.wallet_address, amount);
      db.run('INSERT INTO transactions (user_id, type, amount, tx_hash) VALUES (?, ?, ?, ?)', [id, 'redeem', amount, tx.hash]);
      res.json({ message: 'Tokens redeemed successfully', tx_hash: tx.hash });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Add loyalty points
app.post('/users/:id/add-loyalty-points', (req, res) => {
  const { id } = req.params;
  const { points } = req.body;
  db.run('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?', [points, id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    db.run('INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)', [id, 'loyalty', points]);
    res.json({ message: 'Loyalty points added successfully' });
  });
});

// Get transaction history
app.get('/users/:id/transactions', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC', [id], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Rewards and loyalty platform backend running on port ${port}`);
});
module.exports = app;
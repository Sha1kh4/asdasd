const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Wrapper for Diamante SDK functions
let diamSdk;

(async () => {
  diamSdk = await import('diamante-sdk-js');

  const diamante = {
    createWallet: async () => {
      try {
        const pair = diamSdk.Keypair.random();
        const response = await fetch(`https://friendbot.diamcircle.io?addr=${encodeURIComponent(pair.publicKey())}`);
        const responseJSON = await response.json();
        return {
          address: pair.publicKey(),
          secret: pair.secret(),
        };
      } catch (e) {
        console.error("ERROR!", e);
        throw new Error('Failed to create wallet');
      }
    },

    getBalance: async (secret) => {
      try {
        const pair = diamSdk.Keypair.fromSecret(secret);
        const server = new diamSdk.Horizon.Server("https://diamtestnet.diamcircle.io/");
        const account = await server.loadAccount(pair.publicKey());
        let balance = 0;
        account.balances.forEach(function (bal) {
          if (bal.asset_type === 'native') {
            balance = bal.balance;
          }
        });
        return balance;
      } catch (e) {
        console.error("ERROR!", e);
        throw new Error('Failed to get balance');
      }
    },

    transfer: async (senderSecret, receiverAddress, amount) => {
      const sender = diamSdk.Keypair.fromSecret(senderSecret);
      const server = new diamSdk.Horizon.Server("https://diamtestnet.diamcircle.io/");
     
      try {
        const senderAccount = await server.loadAccount(sender.publicKey());
        const transaction = new diamSdk.TransactionBuilder(senderAccount, {
          fee: diamSdk.BASE_FEE,
          networkPassphrase: "Diamante Testnet",
        })
          .addOperation(
            diamSdk.Operation.payment({
              destination: receiverAddress,
              asset: diamSdk.Asset.native(),
              amount: amount.toString(),
            })
          )
          .setTimeout(30)
          .build();
        transaction.sign(sender);
        const res = await server.submitTransaction(transaction);
        return res;
      } catch (error) {
        console.error("ERROR!", error);
        throw new Error('Failed to transfer tokens');
      }
    },

    burn: async (address, amount) => {
      // Implement token burning logic here
      // This is a placeholder implementation
      return { hash: 'sample_tx_hash_' + Math.random().toString(36).substring(7) };
    }
  };

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
      secret_key TEXT UNIQUE,
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
  app.post('/users', async (req, res) => {
    const { username } = req.body;
    try {
      const wallet = await diamante.createWallet();
      db.run('INSERT INTO users (username, wallet_address, secret_key) VALUES (?, ?, ?)', [username, wallet.address, wallet.secret], function(err) {
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

  app.get('/users/:id/balance', async (req, res) => {
    const { id } = req.params;
    db.get('SELECT wallet_address, secret_key, loyalty_points FROM users WHERE id = ?', [id], async (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      try {
        const balance = await diamante.getBalance(row.secret_key);
        res.json({ tokens: balance, loyalty_points: row.loyalty_points });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });

  app.post('/users/:id/issue-tokens', async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    db.get('SELECT wallet_address, secret_key FROM users WHERE id = ?', [id], async (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      try {
        const tx = await diamante.transfer(row.secret_key, row.wallet_address, amount);
        db.run('INSERT INTO transactions (user_id, type, amount, tx_hash) VALUES (?, ?, ?, ?)', [id, 'issue', amount, tx.hash]);
        balance = await diamante.getBalance(row.secret_key);
        res.json({ message: 'Tokens issued successfully', tx_hash: tx.hash,balance:balance });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });

  app.post('/users/:id/redeem-tokens', async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    db.get('SELECT wallet_address, secret_key FROM users WHERE id = ?', [id], async (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      try {
        const balance = await diamante.getBalance(row.secret_key);
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

})().catch(err => {
  console.error("Failed to load Diamante SDK", err);
  process.exit(1);
});

module.exports = app;

# Token-Based Rewards and Loyalty Platform

This project implements a token-based rewards and loyalty platform using Express.js for the backend, SQLite for local data storage, and the Diamante SDK for blockchain interactions.

## Features

- User management with blockchain wallets
- Token issuance and redemption
- Loyalty points tracking
- Transaction history

## Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)

## Installation

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/Sha1kh4/asdasd.git
   cd rewards-platform/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

The server will start on `http://localhost:5000`.

## API Endpoints

- **POST /users**: Create a new user
- **GET /users/:id/balance**: Get user balance
- **POST /users/:id/issue-tokens**: Issue tokens to a user
- **POST /users/:id/redeem-tokens**: Redeem tokens from a user
- **POST /users/:id/add-loyalty-points**: Add loyalty points to a user
- **GET /users/:id/transactions**: Get user's transaction history

## Frontend

### Features

- User management (create new users, select existing users)
- Display token balances and loyalty points
- Issue and redeem tokens
- Add loyalty points
- View transaction history

### Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)
- The backend server should be running (see backend README for instructions)

### Installation

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/Sha1kh4/asdasd.git
   cd /frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```


### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or another port if 3001 is in use).

### Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `build` directory.

### Project Structure

```plaintext
frontend/
|   .eslintrc.json
|   .gitignore
|   components.json
|   next-env.d.ts
|   next.config.mjs
|   package-lock.json
|   package.json
|   postcss.config.mjs
|   README.md
|   tailwind.config.ts
|   tree.txt
|   tsconfig.json
|
+---app
|       favicon.ico
|       globals.css
|       layout.tsx
|       page.tsx
|
+---components
|   +---component
|   |       component.tsx
|   |
|   \---ui
|           button.tsx
|           card.tsx
|           dropdown-menu.tsx
|           table.tsx
|
+---lib
|       utils.ts
|
\---public
        next.svg
        vercel.svg
```

### Available Scripts

In the project directory, you can run:

- `npm npm run dev`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
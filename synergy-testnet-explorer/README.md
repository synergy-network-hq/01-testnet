# Synergy Testnet Explorer

A blockchain explorer for the Synergy Network testnet, built with React (frontend) and Rust (backend).

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Rust (latest stable)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd synergy-testnet-explorer
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Build backend dependencies**
   ```bash
   cd backend
   cargo build
   cd ..
   ```

## 🏃‍♂️ Running the Application

### Start Backend (Rust API Server)
```bash
cd backend
cargo run
```
The backend will start on `http://localhost:8080` and create a SQLite database at `/tmp/synergy/explorer.db`

### Start Frontend (React Development Server)
Open a new terminal and run:
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

## 🛠️ Development

### API Endpoints

The backend provides the following endpoints:

- `GET /blocks` - Retrieve blockchain blocks
- `GET /transactions` - Retrieve blockchain transactions

### Database

The application uses SQLite for local development. The database file is automatically created at:
```
/tmp/synergy/explorer.db
```

### Project Structure

```
synergy-testnet-explorer/
├── frontend/          # React TypeScript application
│   ├── src/
│   ├── package.json
│   └── public/
├── backend/           # Rust API server
│   ├── src/
│   ├── Cargo.toml
│   └── target/
└── README.md
```

## 🔧 Configuration

### Backend Configuration

The backend uses the following default configuration:
- **Port**: 8080
- **Database**: SQLite (`/tmp/synergy/explorer.db`)
- **CORS**: Enabled for `http://localhost:3000`

### Frontend Configuration

The frontend is configured to connect to the backend API at:
- **API Base URL**: `http://localhost:8080`

## 🐛 Troubleshooting

### Backend Issues

1. **Database connection failed**
   - Ensure the `/tmp/synergy/` directory exists and is writable
   - Check that no other instance is using the database file

2. **Port 8080 already in use**
   - Kill any existing process using the port: `lsof -ti:8080 | xargs kill`

### Frontend Issues

1. **Port 3000 already in use**
   - Kill any existing process: `lsof -ti:3000 | xargs kill`
   - Or use a different port: `PORT=3001 npm start`

2. **Module not found errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 📝 Development Notes

- The backend automatically creates database tables on first run
- The frontend includes hot-reload for development
- Both services should be running simultaneously for full functionality
- The application is designed for local development and testing

## 🔄 Production Deployment

For production deployment, consider:

1. **Backend**: Use PostgreSQL instead of SQLite
2. **Frontend**: Run `npm run build` for optimized production build
3. **Docker**: Use the provided `docker-compose.yml` for containerized deployment
4. **Environment Variables**: Configure proper database URLs and API endpoints

## 📄 License

See LICENSE file for details.

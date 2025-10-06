# Daily Workload Dashboard - Backend

Node.js Express API server with MySQL database for the Daily Workload Dashboard.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your database credentials:
```bash
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=web_dashboard
DB_USER=root
DB_PASS=your_password
```

3. Run migration (creates database, table, and imports CSV):
```bash
npm run migrate
```

4. Start the server:
```bash
npm run dev
```

API will be available at http://localhost:3000

## Structure

- `src/` - Source code
  - `config/` - Configuration and environment setup
  - `controllers/` - API route handlers
    - `metrics.controller.js` - Daily metrics endpoint
  - `models/` - Sequelize database models
  - `routes/` - Express route definitions
  - `migrations/` - Database migration scripts
  - `scripts/` - Utility scripts
    - `importer.js` - CSV data import logic

## API Endpoints

- `GET /api/metrics/daily?date=YYYY-MM-DD` - Get daily metrics with optional date filter

Response example:
```json
{
  "date": "2024-04-19",
  "metrics": [
    { "label": "DOCUMENTS RECEIVED", "value": 60, "highlight": false },
    { "label": "ON HOLD-QA", "value": 25, "highlight": true }
  ]
}
```

## Database

- Uses MySQL with Sequelize ORM
- Table: `registration_statuses`
- Auto-creates database and imports CSV data on first migration

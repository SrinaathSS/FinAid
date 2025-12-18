# FinAid Backend API

Django REST API backend for FinAid financial management application.

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Database
Create a `.env` file in the backend directory:
```
DB_NAME=finaid_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

### 3. Create MySQL Database
```sql
CREATE DATABASE finaid_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 6. Run Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `GET /api/auth/user/` - Get current user info (requires authentication)

### Transactions
- `POST /api/transactions/upload/` - Upload monthly transaction data
- `GET /api/transactions/monthly/` - Get all monthly summaries
- `GET /api/transactions/monthly/{month_key}/` - Get specific month data
- `DELETE /api/transactions/monthly/{month_key}/` - Delete month data

## Authentication
All transaction endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

# Database Migration Fix Instructions

## Problem
The MySQL database `finaid_db` exists but has no tables, causing registration to fail.

## Solution Steps

### 1. Stop Django Server
Press `Ctrl+C` in the terminal running `python manage.py runserver`

### 2. Recreate Database
```bash
mysql -u root -p"mega s 975" -e "DROP DATABASE finaid_db; CREATE DATABASE finaid_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Run Migrations
```bash
cd backend
python manage.py migrate
```

### 4. Verify Tables Created
```bash
mysql -u root -p"mega s 975" finaid_db -e "SHOW TABLES;"
```

Expected output should show tables like:
- auth_user
- auth_group
- transactions_transaction
- transactions_monthlystats
- django_migrations
- etc.

### 5. Restart Django Server
```bash
python manage.py runserver
```

### 6. Test Registration
Go to http://localhost:5173 and try creating an account again.

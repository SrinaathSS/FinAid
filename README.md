# FinAid - AI-Powered Financial Assistant 💰

FinAid is an intelligent financial management application that helps you track, analyze, and optimize your spending habits using AI-powered insights.

## 🌟 Features

- **Smart Transaction Analysis**: Upload bank statements (Excel/CSV) and get instant categorization
- **AI-Powered Insights**: Get personalized financial advice and spending recommendations using Google's Gemini AI
- **Interactive Dashboard**: Beautiful visualizations of your spending patterns with Chart.js
- **Category Breakdown**: Automatic categorization of expenses (Food, Transport, Entertainment, etc.)
- **Monthly Trends**: Track your spending over time with detailed monthly reports
- **Top Merchants**: Identify where you spend the most
- **Secure Authentication**: JWT-based user authentication with Django REST Framework

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Lightning-fast build tool
- **TailwindCSS 4** - Utility-first CSS framework
- **Chart.js** - Beautiful, responsive charts
- **Axios** - HTTP client for API calls
- **Google Generative AI** - Gemini AI integration

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - RESTful API
- **MySQL** - Relational database
- **JWT Authentication** - Secure token-based auth
- **python-dotenv** - Environment variable management

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MySQL** (v8.0 or higher)
- **Gemini API Key** - Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/FinAid.git
cd FinAid
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your database credentials and Django secret key

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start the backend server
python manage.py runserver
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your Gemini API key

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Backend (.env)
```
DB_NAME=finaid_db
DB_USER=root
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=3306
SECRET_KEY=your_django_secret_key_here
```

## 📊 Usage

1. **Register/Login**: Create an account or login to access the dashboard
2. **Upload Statement**: Upload your bank statement (Excel/CSV format)
3. **View Insights**: Get AI-powered analysis of your spending habits
4. **Track Trends**: Monitor your financial health over time
5. **Get Suggestions**: Receive personalized recommendations to save money

## 🎨 Screenshots

*Coming soon...*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Srinaath**

## 🙏 Acknowledgments

- Google Gemini AI for intelligent insights
- Chart.js for beautiful visualizations
- The Django and React communities

---

**Note**: This is a development project. For production deployment, ensure you:
- Use a production-ready database
- Enable HTTPS
- Set `DEBUG=False` in Django settings
- Use environment-specific configuration
- Implement proper error handling and logging

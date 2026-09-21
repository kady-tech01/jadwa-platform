# Jadwa Platform

A full-stack web platform for creating and analyzing **financial feasibility studies** for business projects.

Jadwa helps users organize project financial data, analyze investment feasibility, and generate financial indicators through a modern web interface.

## Features

* User registration and authentication
* JWT-based authentication
* Project management
* CAPEX, OPEX, and revenue management
* Cash-flow analysis
* Financial indicators such as:

  * NPV
  * IRR
  * Payback Period
  * Profitability Index
* Sensitivity analysis
* Financial analytics
* Transaction management
* Project feedback
* Django administration dashboard

## Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* SimpleJWT
* Pandas
* NumPy
* SciPy
* NumPy Financial
* MySQL

### Frontend

* React.js
* Axios
* JavaScript
* HTML
* CSS

## Project Structure

```text
jadwa-platform/
│
├── backend/
│   ├── apps/
│   │   ├── authentication/
│   │   ├── projects/
│   │   ├── analytics/
│   │   ├── transactions/
│   │   └── feedback/
│   │
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── services/
    │   ├── context/
    │   ├── pages/
    │   └── components/
    │
    └── package.json
```

## Architecture

```text
React.js
    │
    │ Axios + JWT
    ▼
Django REST Framework
    │
    ├── Authentication
    ├── Projects
    ├── Analytics
    ├── Transactions
    └── Feedback
    │
    ▼
Financial Services
    │
    ├── Cash Flow
    ├── NPV
    ├── IRR
    ├── Payback Period
    └── Sensitivity Analysis
    │
    ▼
MySQL
```

## Installation

### Backend

```bash
cd backend

python -m venv venv
```

Activate the virtual environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the database and environment variables, then run:

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend communicates with the Django REST API through Axios.

## Authentication

The API uses **JWT authentication**.

Main endpoints:

```text
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/refresh/
GET  /api/auth/profile/
```

Protected endpoints require:

```text
Authorization: Bearer <access_token>
```

## Main API Modules

```text
/api/auth/          Authentication
/api/projects/      Projects and financial inputs
/api/analytics/     Financial analysis
/api/transactions/  Transactions
/api/feedback/      User feedback
```

## Financial Analysis

The financial engine processes project inputs such as:

* Initial investment
* Capital expenditures
* Operating expenses
* Revenue streams
* Project duration
* Discount rate
* Tax rate

It can then calculate financial indicators and perform sensitivity analysis.

## Development Status

Jadwa Platform is currently under development.

The architecture is designed to support future improvements such as advanced financial modeling, additional analysis tools, reporting, and scalable project management.

## License

This project is currently intended for development and portfolio purposes.

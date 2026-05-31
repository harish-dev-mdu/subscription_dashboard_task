# Subscription Management Dashboard

A complete production-ready **Full Stack SaaS Subscription Management Dashboard** built with the MERN stack (MongoDB, Express, React, Node.js). This project showcases modern web development practices, secure authentication, payment integration, and professional UI/UX design.

![Project Banner](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop)

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Secure password hashing with bcryptjs
- Role-based access control (Admin/User)
- Token refresh mechanism for seamless session management
- Auto-logout on token expiration

### Subscription Management
- Multiple subscription plans (Starter, Professional, Business, Enterprise)
- Razorpay payment integration (Test mode)
- Real-time subscription status tracking
- Subscription history and analytics
- Plan upgrade/downgrade capabilities

### Dashboard Features
- Modern, responsive UI with dark/light mode
- Real-time analytics and statistics
- Interactive charts and data visualization
- User-friendly subscription management
- Admin dashboard for comprehensive control

### Admin Panel
- View all subscriptions across users
- Search and filter functionality
- Export data to CSV
- User management capabilities
- Dashboard analytics with key metrics

### UI/UX
- Modern design inspired by Stripe, Clerk, and Vercel
- Fully responsive layout
- Loading skeletons for better UX
- Toast notifications for feedback
- Beautiful pricing cards
- Empty and error states

## 📸 Screenshots

### Login Page
![Login](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop)

### Dashboard
![Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop)

### Plans Page
![Plans](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop)

### Admin Dashboard
![Admin](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop)

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Toastify** - Toast notifications
- **Lucide React** - Beautiful icons
- **Date-fns** - Date manipulation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Input validation
- **CORS** - Cross-origin resource sharing

### Payment Integration
- **Razorpay** - Payment gateway (Test mode)

## 📁 Project Structure

```
subscription-dashboard-task/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── auth/         # Authentication components
│   │   │   └── layout/       # Layout components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Plans.tsx
│   │   ├── store/            # Redux store
│   │   │   └── slices/       # Redux slices
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                    # Backend application
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── scripts/           # Utility scripts
│   │   ├── utils/             # Helper utilities
│   │   ├── validations/       # Zod schemas
│   │   └── server.js          # Entry point
│   ├── package.json
│   └── .env
│
├── package.json               # Root package.json
├── .env.example              # Environment variables example
├── vercel.json               # Vercel deployment config
├── render.yaml               # Render deployment config
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.x
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/subscription-dashboard-task.git
cd subscription-dashboard-task
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Create `.env` file in the server directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/subscription_db
JWT_ACCESS_SECRET=your-super-secret-access-token-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_SvnC2Ek4vlsb40
RAZORPAY_KEY_SECRET=QQHJxMESizWlbAp22WPFg5y4
```

Create `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

4. **Seed the database**
```bash
cd server
npm run seed
```

5. **Start the development servers**
```bash
# From root directory
npm run dev
```

Or start separately:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Demo Credentials

**Admin Account:**
- Email: admin@gmail.com
- Password: admin123

**User Account:**
- Register a new account

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login user
POST /api/auth/refresh      - Refresh access token
POST /api/auth/logout       - Logout user
GET  /api/auth/me           - Get current user
PUT  /api/auth/profile      - Update profile
PUT  /api/auth/password     - Change password
```

### Plans
```
GET  /api/plans             - Get all plans
GET  /api/plans/:id         - Get plan by ID
POST /api/plans             - Create plan (Admin)
PUT  /api/plans/:id         - Update plan (Admin)
DELETE /api/plans/:id       - Deactivate plan (Admin)
```

### Subscriptions
```
POST /api/subscriptions/:planId  - Create subscription
POST /api/subscriptions/verify   - Verify payment
GET  /api/subscriptions/me        - Get user subscription
DELETE /api/subscriptions/cancel  - Cancel subscription
```

### Admin
```
GET  /api/admin/subscriptions   - Get all subscriptions
GET  /api/admin/users           - Get all users
GET  /api/admin/stats           - Get dashboard stats
DELETE /api/admin/users/:id     - Delete user
PUT  /api/admin/users/:id/role  - Update user role
```

## 🌍 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set root directory to `client`
4. Add environment variables
5. Deploy!

### Backend (Render)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables
7. Deploy!

### MongoDB Atlas

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Add database user and whitelist your IP
4. Get connection string
5. Add to backend environment variables

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum['user', 'admin'],
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Plans Collection
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  currency: String,
  duration: Number,
  durationUnit: String,
  features: Array[String],
  isActive: Boolean,
  maxUsers: Number,
  maxProjects: Number,
  storageLimit: Number
}
```

### Subscriptions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  planId: ObjectId (ref: Plan),
  startDate: Date,
  endDate: Date,
  status: Enum['active', 'expired', 'cancelled', 'pending'],
  paymentId: String,
  orderId: String,
  paymentMethod: String,
  amount: Number,
  currency: String,
  autoRenew: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Refresh token rotation
- HTTP-only cookies (production)
- CORS protection
- Rate limiting (recommended)
- Input validation with Zod
- XSS protection
- MongoDB injection prevention

## 🔮 Future Improvements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Password reset via email
- [ ] Two-factor authentication
- [ ] Stripe payment integration
- [ ] Real-time notifications
- [ ] Advanced analytics with charts
- [ ] Invoice generation
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Webhook integrations
- [ ] Team collaboration features
- [ ] Role-based permissions
- [ ] Audit logs
- [ ] Data export features
- [ ] API rate limiting
- [ ] Caching with Redis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- GitHub: [https://github.com/harish-dev-mdu]
- LinkedIn: [https://www.linkedin.com/in/harish-kumar-a-45a60a260/]
- Email: harishmdu26@gmail.com

## 🙏 Acknowledgments

- Design inspiration from [Stripe](https://stripe.com), [Clerk](https://clerk.com), and [Vercel](https://vercel.com)
- Icons by [Lucide](https://lucide.dev)
- Images from [Unsplash](https://unsplash.com)

---

⭐ Star this repository if you found it helpful!

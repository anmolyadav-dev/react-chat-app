# Modern Secure Chat Application

A feature-rich, real-time chat application built with React, Node.js, and Socket.IO, featuring end-to-end encryption, Redis caching, and modern UI design.

## 🚀 Features

### Core Features
- **Real-time Messaging**: Instant messaging with Socket.IO
- **End-to-End Encryption**: Messages are encrypted using AES encryption
- **Modern UI**: Beautiful glassmorphic design with Tailwind CSS
- **User Authentication**: Secure JWT-based authentication
- **Online Status**: See who's online in real-time
- **Responsive Design**: Works seamlessly on desktop and mobile

### Advanced Features
- **Redis Caching**: Improved performance with intelligent caching
- **Rate Limiting**: Protection against spam and abuse
- **Performance Monitoring**: Built-in metrics and health checks
- **Security Headers**: Comprehensive security measures
- **Error Handling**: Robust error handling and logging
- **Scalable Architecture**: Designed for high-traffic applications

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Socket.IO Client**: Real-time communication
- **Crypto-JS**: Client-side encryption

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Socket.IO**: Real-time bidirectional communication
- **MongoDB**: NoSQL database with Mongoose ODM
- **Redis**: In-memory data structure store
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Crypto-JS**: Server-side encryption

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Redis

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the services**
   ```bash
   # Start MongoDB and Redis
   # Then start the application
   npm run server
   ```

5. **Development mode**
   ```bash
   # Backend
   npm run server
   
   # Frontend (in separate terminal)
   cd frontend && npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/chat-app
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🏗️ Architecture

### Backend Architecture
```
backend/
├── controllers/     # Request handlers
├── models/         # Database models
├── routes/         # API routes
├── middlewares/    # Custom middlewares
├── socket/         # Socket.IO handlers
├── utils/          # Utility functions
└── dbConfig/       # Database configuration
```

### Frontend Architecture
```
frontend/src/
├── components/     # Reusable components
├── pages/         # Page components
├── hooks/         # Custom hooks
├── context/       # React context
├── zustand/       # State management
└── utils/         # Utility functions
```

## 🔒 Security Features

- **End-to-End Encryption**: Messages encrypted with AES-256
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive input sanitization
- **Security Headers**: OWASP recommended headers
- **Password Hashing**: bcrypt with salt rounds

## 📊 Performance Features

- **Redis Caching**: Intelligent caching for users and messages
- **Connection Pooling**: Optimized database connections
- **Performance Monitoring**: Real-time metrics tracking
- **Health Checks**: Application health monitoring
- **Graceful Shutdown**: Proper resource cleanup

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Messages
- `POST /api/messages/send/:id` - Send message
- `GET /api/messages/:id` - Get conversation messages

### Users
- `GET /api/users` - Get all users

### Monitoring
- `GET /health` - Health check endpoint
- `GET /metrics` - Performance metrics (dev only)

## 🔌 Socket Events

### Client to Server
- `sendMessage` - Send a message
- `typing` - User is typing
- `stopTyping` - User stopped typing
- `markAsRead` - Mark message as read

### Server to Client
- `newMessage` - New message received
- `getOnlineUsers` - Updated online users list
- `userTyping` - User is typing indicator
- `messageRead` - Message read receipt

## 🎨 UI Features

- **Glassmorphic Design**: Modern frosted glass effect
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Micro-interactions and transitions
- **Responsive Layout**: Mobile-first design
- **Dark Theme**: Easy on the eyes
- **Encryption Indicators**: Visual security feedback

## 📈 Monitoring

The application includes comprehensive monitoring:

- **Request Tracking**: API request/response times
- **Error Logging**: Structured error logging
- **Performance Metrics**: Memory, CPU, and response times
- **Socket Metrics**: Connection and message statistics
- **Health Status**: Application health indicators

## 🚀 Deployment

### Production Setup

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Support
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the health endpoint: `/health`
- Review logs for error details
- Ensure all services (MongoDB, Redis) are running

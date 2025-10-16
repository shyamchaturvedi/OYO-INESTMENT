#!/bin/bash

echo "🚀 PowerOYO MLM Platform Setup Script"
echo "===================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-$(date +%s)"
NEXTAUTH_SECRET="your-nextauth-secret-$(date +%s)"
EOL
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Setup database
echo "🗄️ Setting up database..."
npm run setup

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo ""
echo "👤 Login Credentials:"
echo "Admin: admin@poweroyo.in / admin123"
echo "User1: john@example.com / password123"
echo "User2: jane@example.com / password123"
echo "User3: mike@example.com / password123"
echo ""
echo "🔧 Useful Commands:"
echo "npm run dev     - Start development server"
echo "npm run build   - Build for production"
echo "npm run roi     - Run ROI distribution manually"
echo "npm run lint    - Check code quality"
echo ""
echo "📚 For more information, check the README.md file"
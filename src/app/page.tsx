'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  Gift, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, loading, login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ 
    fullName: '', 
    email: '', 
    mobile: '', 
    password: '', 
    referredBy: '' 
  })
  const [loadingAction, setLoadingAction] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Get referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')
    if (refCode) {
      setRegisterData(prev => ({ ...prev, referredBy: refCode }))
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAction(true)
    setMessage({ type: '', text: '' })

    // Basic frontend validation
    if (!loginData.email || !loginData.email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      setLoadingAction(false)
      return
    }

    if (!loginData.password) {
      setMessage({ type: 'error', text: 'Please enter your password' })
      setLoadingAction(false)
      return
    }

    console.log('Submitting login form with:', { email: loginData.email, password: '***' })

    try {
      const result = await login(loginData.email, loginData.password)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' })
        console.log('Login successful, user state should be updated')
        setTimeout(() => {
          console.log('Redirecting to dashboard...')
          router.push('/dashboard')
        }, 1000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Login failed' })
      }
    } catch (error) {
      console.error('Login form error:', error)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    }
    
    setLoadingAction(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAction(true)
    setMessage({ type: '', text: '' })

    // Basic frontend validation
    if (!registerData.fullName || registerData.fullName.length < 2) {
      setMessage({ type: 'error', text: 'Please enter a valid full name (minimum 2 characters)' })
      setLoadingAction(false)
      return
    }

    if (!registerData.email || !registerData.email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      setLoadingAction(false)
      return
    }

    if (!registerData.mobile || registerData.mobile.length !== 10 || !/^[6-9]/.test(registerData.mobile)) {
      setMessage({ type: 'error', text: 'Please enter a valid 10 digit mobile number starting with 6-9' })
      setLoadingAction(false)
      return
    }

    if (!registerData.password || registerData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      setLoadingAction(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration successful! Please login.' })
        // Clear form
        setRegisterData({ fullName: '', email: '', mobile: '', password: '', referredBy: '' })
        // Switch to login tab
        setTimeout(() => {
          document.getElementById('login-tab')?.click()
        }, 1500)
      } else {
        if (data.details && Array.isArray(data.details)) {
          // Show specific validation errors
          const errorMessages = data.details.map((detail: any) => detail.message).join(', ')
          setMessage({ type: 'error', text: errorMessages })
        } else {
          setMessage({ type: 'error', text: data.error || 'Registration failed' })
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' })
    } finally {
      setLoadingAction(false)
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold text-red-600">PowerOYO</h1>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              Trusted Investment Platform
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Invest Smart,
              <span className="text-red-600"> Earn Daily</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join PowerOYO - India's most trusted investment platform with daily returns and 5-level referral income.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Daily ROI</h3>
                  <p className="text-sm text-gray-600">Up to 15% daily</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">5 Level MLM</h3>
                  <p className="text-sm text-gray-600">Unlimited earning</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure</h3>
                  <p className="text-sm text-gray-600">100% safe</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Instant Withdraw</h3>
                  <p className="text-sm text-gray-600">Quick payout</p>
                </div>
              </div>
            </div>

            {/* Investment Plans Preview */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Popular Investment Plans</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Basic Plan</h4>
                    <p className="text-sm text-gray-600">₹50 → ₹7.5/day × 30 days</p>
                  </div>
                  <Badge className="bg-red-600">15% ROI</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Standard Plan</h4>
                    <p className="text-sm text-gray-600">₹100 → ₹15/day × 30 days</p>
                  </div>
                  <Badge className="bg-red-600">15% ROI</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Premium Plan</h4>
                    <p className="text-sm text-gray-600">₹200 → ₹30/day × 30 days</p>
                  </div>
                  <Badge className="bg-red-600">15% ROI</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Login/Register Form */}
          <div>
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome to PowerOYO</CardTitle>
                <CardDescription>
                  Start your investment journey today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {message.text && (
                  <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                    <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" id="login-tab">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            value={loginData.email}
                            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loadingAction}>
                        {loadingAction ? 'Please wait...' : 'Login'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            className="pl-10"
                            value={registerData.fullName}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regEmail">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="regEmail"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            value={registerData.email}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="mobile"
                            type="tel"
                            placeholder="Enter 10 digit mobile number"
                            className="pl-10"
                            value={registerData.mobile}
                            onChange={(e) => {
                              // Only allow numbers and limit to 10 digits
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                              setRegisterData(prev => ({ ...prev, mobile: value }))
                            }}
                            pattern="[6-9][0-9]{9}"
                            maxLength={10}
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">10 digit mobile number starting with 6-9</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regPassword">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="regPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="pl-10 pr-10"
                            value={registerData.password}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                        <Input
                          id="referralCode"
                          type="text"
                          placeholder="Enter referral code"
                          value={registerData.referredBy}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, referredBy: e.target.value }))}
                        />
                      </div>

                      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loadingAction}>
                        {loadingAction ? 'Please wait...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <h3 className="text-xl font-bold">PowerOYO</h3>
              </div>
              <p className="text-gray-400">
                Your trusted partner for daily investment returns and secure financial growth.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Investment Plans</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
                <li><a href="#" className="hover:text-white">Support Ticket</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@poweroyo.in</li>
                <li>Phone: +91 98765 43210</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="text-center text-gray-400">
            <p>&copy; 2024 PowerOYO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
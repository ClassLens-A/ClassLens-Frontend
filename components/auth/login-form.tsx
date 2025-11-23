// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card } from "@/components/ui/card"
// import { AlertCircle } from "lucide-react"

// interface LoginFormProps {
//   onLogin: (token: string) => void
// }

// export function LoginForm({ onLogin }: LoginFormProps) {
//   const [username, setUsername] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState("")
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError("")
//     setLoading(true)

//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/admin/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         setError(data.error || "Login failed")
//         return
//       }

//       if (data.access) {
//         onLogin(data.access)
//       } else {
//         setError("No token received")
//       }
//     } catch (err) {
//       setError("Network error. Check if backend is running.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-2">ClassLens</h1>
//           <p className="text-muted-foreground">Education Management System</p>
//         </div>

//         <Card className="p-6 shadow-lg">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
//               <Input
//                 type="email"
//                 placeholder="admin@example.com"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//                 disabled={loading}
//                 className="w-full"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
//               <Input
//                 type="password"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 disabled={loading}
//                 className="w-full"
//               />
//             </div>

//             {error && (
//               <div className="flex gap-2 items-start p-3 bg-destructive/10 text-destructive rounded-md text-sm">
//                 <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//                 <span>{error}</span>
//               </div>
//             )}

//             <Button type="submit" disabled={loading} className="w-full">
//               {loading ? "Signing in..." : "Sign in"}
//             </Button>
//           </form>

//           <div className="mt-6 pt-6 border-t border-border">
//             <p className="text-xs text-muted-foreground text-center">Demo credentials: admin@example.com / password</p>
//           </div>
//         </Card>
//       </div>
//     </div>
//   )
// }






"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, UserPlus, LogIn } from "lucide-react"

interface LoginFormProps {
  onLogin: (token: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  // State to toggle between Login and Register views
  const [isLogin, setIsLogin] = useState(true)
  
  const [email, setEmail] = useState("") // Acts as username
  const [password, setPassword] = useState("")
  
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setLoading(true)

    // API ENDPOINTS
    // 1. Endpoint for getting the Token (Login)
    const loginUrl = "http://127.0.0.1:8000/api/admin/login/" 
    // 2. Endpoint for Creating User (Register) - Matches your URL path
    const registerUrl = "http://127.0.0.1:8000/api/admin/create-user/"

    const url = isLogin ? loginUrl : registerUrl
    
    // PAYLOAD
    // Your serializer expects 'username', so we map email to username here
    const payload = { 
      username: email, 
      password: password 
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle errors (e.g., "username already exists")
        const errorMsg = data.detail || data.username?.[0] || data.password?.[0] || "Action failed"
        setError(errorMsg)
        return
      }

      if (isLogin) {
        // --- LOGIN SUCCESS ---
        if (data.access) {
          onLogin(data.access)
        } else {
          setError("No token received")
        }
      } else {
        // --- REGISTRATION SUCCESS ---
        setSuccessMsg("Account created successfully! Please sign in.")
        // Switch to login view automatically
        setIsLogin(true) 
        // We keep the email filled in, but clear password for security
        setPassword("") 
      }

    } catch (err) {
      setError("Network error. Check if backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">ClassLens</h1>
          <p className="text-muted-foreground">
            {isLogin ? "Education Management System" : "Create Admin Account"}
          </p>
        </div>

        <Card className="p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Input (Mapped to Username) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="flex gap-2 items-start p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message Display */}
            {successMsg && (
              <div className="flex gap-2 items-start p-3 bg-green-500/10 text-green-600 rounded-md text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading 
                ? (isLogin ? "Signing in..." : "Creating Account...") 
                : (isLogin ? "Sign in" : "Register")
              }
            </Button>
          </form>

          {/* Toggle Link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setSuccessMsg("")
              }}
              className="text-sm text-primary hover:underline flex items-center justify-center gap-2 w-full"
            >
              {isLogin ? (
                <>
                  <UserPlus className="w-4 h-4" /> Need an account? Register
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Already have an account? Login
                </>
              )}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

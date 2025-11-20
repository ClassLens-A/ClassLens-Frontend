"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [adminToken, setAdminToken] = useState<string | null>("jijijerg")

  const handleLogin = (token: string) => {
    setAdminToken(token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAdminToken(null)
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard adminToken={adminToken} onLogout={handleLogout} />
}

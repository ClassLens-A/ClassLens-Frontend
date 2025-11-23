"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface AdminUserFormProps {
  token: string | null
  admin?: { id: string; username: string; is_active: boolean } | null
  onClose: () => void
}

export function AdminUserForm({ token, admin, onClose }: AdminUserFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username,
        password: "",
        is_active: admin.is_active,
      })
    }
  }, [admin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = admin
        ? `http://127.0.0.1:8000/api/admin/admin-users/${admin.id}/`
        : "http://127.0.0.1:8000/api/admin/admin-users/"

      const method = admin ? "PUT" : "POST"

      // For updates, only include password if it's not empty
      const body =
        admin && !formData.password ? { username: formData.username, is_active: formData.is_active } : formData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.detail || data.password?.[0] || "Failed to save admin user")
        return
      }

      onClose()
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">{admin ? "Edit Admin User" : "Add New Admin User"}</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Username</label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Password 
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!admin}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="rounded border-input"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-foreground">
            Active
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Admin"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

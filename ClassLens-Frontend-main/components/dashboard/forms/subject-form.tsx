"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface SubjectFormProps {
  token: string | null
  subject?: { id: string; name: string; code: string; description: string } | null
  onClose: () => void
}

export function SubjectForm({ token, subject, onClose }: SubjectFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description,
      })
    }
  }, [subject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = subject
        ? `http://127.0.0.1:8000/api/admin/subjects/${subject.id}`
        : "http://127.0.0.1:8000/api/admin/subjects"

      const method = subject ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.detail || "Failed to save subject")
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
        <h2 className="text-xl font-semibold text-foreground">{subject ? "Edit Subject" : "Add New Subject"}</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Code</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Subject"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

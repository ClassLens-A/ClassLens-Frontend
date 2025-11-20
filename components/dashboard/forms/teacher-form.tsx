"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface TeacherFormProps {
  token: string | null
  teacher?: { id: string; name: string; email: string; phone?: string; department?: number | string } | null
  onClose: () => void
}

type Dept = { id: number; name: string }

export function TeacherForm({ token, teacher, onClose }: TeacherFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "", 
    department: "" as string | number,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [departments, setDepartments] = useState<Dept[]>([])
  const [deptsLoading, setDeptsLoading] = useState(false)
  const [deptsError, setDeptsError] = useState("")

  useEffect(() => {
  
    if (teacher) {
      setFormData({
        name: teacher.name || "",
        email: teacher.email || "", 
        department: (teacher.department ?? "") as string | number,
      })
    }
  }, [teacher])

  useEffect(() => {
    // Fetch departments list on mount
    const fetchDepts = async () => {
      setDeptsLoading(true)
      setDeptsError("")
      try {
        const res = await fetch("http://127.0.0.1:8000/api/getDepartments/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // include auth header if required to access departments
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch departments (${res.status})`)
        }
        const data = await res.json()
        // Expecting data to be an array of { id, name } or { pk, name }
        const normalized: Dept[] = (data || []).map((d: any) => ({
          id: d.id ?? d.pk ?? d.pk_id ?? d.ID ?? d.department_id ?? d.pk,
          name: d.name ?? d.department_name ?? d.title ?? String(d),
        }))

        setDepartments(normalized)

        // If teacher.department was provided as a name (string), try to find and set id
        if (teacher && teacher.department && typeof teacher.department === "string") {
          const found = normalized.find((x) => x.name === teacher.department)
          if (found) {
            setFormData((s) => ({ ...s, department: found.id }))
          }
        } else if (teacher && teacher.department && typeof teacher.department === "number") {
          // ensure department id exists in the fetched list; if not, keep it
          const found = normalized.find((x) => x.id === teacher.department)
          if (!found) {
            // keep the numeric id as string so select shows nothing but still submits id
            setFormData((s) => ({ ...s, department: String(teacher.department) }))
          }
        }
      } catch (err: any) {
        setDeptsError(err?.message || "Failed to load departments")
      } finally {
        setDeptsLoading(false)
      }
    }
    fetchDepts()
  }, [token, teacher])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = teacher
        ? `http://127.0.0.1:8000/api/admin/teachers/${teacher.id}/`
        : "http://127.0.0.1:8000/api/admin/teachers/"

      const method = teacher ? "PUT" : "POST"

      // build payload: ensure department is a number if possible
      const payload: any = {
        name: formData.name,
        email: formData.email,
      }
      if (formData.department !== "" && formData.department !== null) {
        payload.department = Number(formData.department)
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        // try to read JSON errors from DRF
        let data: any = {}
        try {
          data = await response.json()
        } catch {
          // not JSON
        }
        // DRF returns field errors as object; show helpful message
        const detail = data.detail || JSON.stringify(data) || "Failed to save teacher"
        setError(detail)
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
        <h2 className="text-xl font-semibold text-foreground">{teacher ? "Edit Teacher" : "Add New Teacher"}</h2>
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
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>


          <div >
            <label className="block text-sm font-medium text-foreground mb-1">Department</label>

            {deptsLoading ? (
              <div className="p-2 border rounded">Loading departments…</div>
            ) : deptsError ? (
              <div className="p-2 text-sm text-destructive">Failed to load departments: {deptsError}</div>
            ) : (
              <select
                className="w-full p-2 border rounded"
                value={String(formData.department ?? "")}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">— Select department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Teacher"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

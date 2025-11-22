"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface SubjectDetail {
  id: number
  code: string
  name: string
}

interface Department {
  id: number
  name: string
}

interface SubjectFromDeptFormProps {
  token: string | null
  mapping?: {
    id: number
    department: number
    department_name: string
    year: number
    semester: number
    subject_details: SubjectDetail[]
  } | null
  onClose: () => void
}

export function SubjectFromDeptForm({ token, mapping, onClose }: SubjectFromDeptFormProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects, setSubjects] = useState<SubjectDetail[]>([])

  const [formData, setFormData] = useState({
    department: mapping?.department || "",
    year: mapping?.year?.toString() || "",
    semester: mapping?.semester?.toString() || "",
    subject_ids: mapping?.subject_details?.map((s) => s.id.toString()) || [],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Load departments & subjects from backend
  useEffect(() => {
    if (!token) return

    const fetchInitialData = async () => {
      try {
        const deptRes = await fetch("http://127.0.0.1:8000/api/getDepartments/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const subsRes = await fetch("http://127.0.0.1:8000/api/admin/subjects/", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (deptRes.ok) setDepartments(await deptRes.json())
        if (subsRes.ok) setSubjects(await subsRes.json())
      } catch (err) {
        console.log("[v0] Load dept/subjects error")
      }
    }

    fetchInitialData()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setLoading(true)
    setError("")

    try {
      const method = mapping ? "PUT" : "POST"
      const url = mapping
        ? `http://127.0.0.1:8000/api/admin/subject-from-dept/${mapping.id}/`
        : "http://127.0.0.1:8000/api/admin/subject-from-dept/"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onClose()
      } else {
        const errData = await response.json()
        setError(errData.detail || "Failed to save mapping")
      }
    } catch (err) {
      console.log(err)
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const toggleSubject = (id: string) => {
    setFormData((prev) => {
      const exists = prev.subject_ids.includes(id)
      return {
        ...prev,
        subject_ids: exists ? prev.subject_ids.filter((x) => x !== id) : [...prev.subject_ids, id],
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{mapping ? "Edit Mapping" : "Add Mapping"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DEPARTMENT */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full border rounded p-2 bg-background"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* YEAR */}
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <Input
              required
              type="number"
              min={1}
              max={4}
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            />
          </div>

          {/* SEMESTER */}
          <div>
            <label className="block text-sm font-medium mb-1">Semester</label>
            <Input
              required
              type="number"
              min={1}
              max={8}
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
          </div>

          {/* SUBJECT MULTI SELECT */}
          <div>
            <label className="block text-sm font-medium mb-1">Subjects</label>
            <div className="border rounded p-2 max-h-44 overflow-auto space-y-1">
              {subjects.map((s) => (
                <label key={s.id} className="flex gap-2 items-center cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={formData.subject_ids.includes(s.id.toString())}
                    onChange={() => toggleSubject(s.id.toString())}
                  />
                  {s.code} — {s.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

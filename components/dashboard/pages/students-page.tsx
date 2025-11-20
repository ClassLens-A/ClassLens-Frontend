"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Upload } from "lucide-react"
import { StudentForm } from "../forms/student-form"
import { BulkUploadDialog } from "../dialogs/bulk-upload-dialog"

interface StudentsPageProps {
  token: string | null
}

interface Student {
  id: string
  name: string
  email: string
  roll_number: string
  class: string
}

export function StudentsPage({ token }: StudentsPageProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [token])

  const fetchStudents = async () => {
    if (!token) return
    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (err) {
      console.log("[v0] Students fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setStudents(students.filter((s) => s.id !== id))
      }
    } catch (err) {
      console.log("[v0] Delete error:", err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingStudent(null)
    fetchStudents()
  }

  const filteredStudents = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">Manage student records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Bulk Upload
          </Button>
          <Button
            onClick={() => {
              setEditingStudent(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>
      </div>

      {showForm && <StudentForm token={token} student={editingStudent} onClose={handleFormClose} />}

      {showBulkUpload && (
        <BulkUploadDialog
          token={token}
          type="students"
          onClose={() => {
            setShowBulkUpload(false)
            fetchStudents()
          }}
        />
      )}

      <Card>
        <div className="p-6 border-b border-border">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-6 font-semibold text-foreground">Name</th>
                <th className="text-left p-6 font-semibold text-foreground">Email</th>
                <th className="text-left p-6 font-semibold text-foreground">Roll Number</th>
                <th className="text-left p-6 font-semibold text-foreground">Class</th>
                <th className="text-right p-6 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="p-6 font-medium text-foreground">{student.name}</td>
                    <td className="p-6 text-muted-foreground">{student.email}</td>
                    <td className="p-6 text-muted-foreground">{student.roll_number}</td>
                    <td className="p-6 text-muted-foreground">{student.class}</td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingStudent(student)
                            setShowForm(true)
                          }}
                          className="text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

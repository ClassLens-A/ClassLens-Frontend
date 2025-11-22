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
  prn: string
  year: number | string
  department?: number | string | null
  department_name?: string | null
}

interface DepartmentItem {
  id: number
  name: string
}

export function StudentsPage({ token }: StudentsPageProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("")
  const [deptFilter, setDeptFilter] = useState<string | number>("")
  const [departments, setDepartments] = useState<DepartmentItem[]>([])
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  // pagination
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 25 // should match StudentPagination.page_size on backend

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1

  // fetch students whenever token or page changes
  useEffect(() => {
    if (!token) return
    fetchStudents(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page])

  // fetch departments once per token
  useEffect(() => {
    if (!token) return
    fetchDepartments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchStudents = async (pageToLoad: number) => {
    if (!token) return
    setLoading(true)

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/students/?page=${pageToLoad}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.ok) {
        const json = await response.json()

        // DRF pagination -> { count, results, next, previous }
        const rawList = Array.isArray(json) ? json : json.results ?? []
        const countFromApi = typeof json.count === "number" ? json.count : rawList.length
        setTotalCount(countFromApi)

        const normalized: Student[] = rawList.map((s: any) => ({
          id: String(s.id ?? s.pk ?? s.student_id ?? ""),
          name: s.name ?? "",
          email: s.email ?? "",
          prn: String(s.prn ?? s.roll_number ?? s.roll_no ?? ""),
          year: s.year ?? s.class ?? s.year_of ?? "",
          department: s.department ?? s.department_id ?? "",
          department_name:
            s.department_name ??
            s.department?.name ??
            (typeof s.department === "string" ? s.department : ""),
        }))

        setStudents(normalized)
      } else {
        console.error("Failed to fetch students", response.status)
      }
    } catch (err) {
      console.log("[v0] Students fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    if (!token) return
    try {
      const res = await fetch("http://127.0.0.1:8000/api/getDepartments/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      const normalized = (data || []).map((d: any) => ({
        id: d.id ?? d.pk ?? d.department_id ?? d.pk,
        name: d.name ?? d.department_name ?? d.title ?? String(d),
      }))
      setDepartments(normalized)
    } catch (err) {
      console.error("failed to fetch departments", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return

    const confirmDelete = window.confirm("Are you sure you want to delete this student?")
    if (!confirmDelete) return

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/students/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id))
        // optionally, you can refetch the current page:
        // fetchStudents(page)
      } else {
        console.error("Delete failed", response.status)
        const text = await response.text().catch(() => "")
        alert(`Delete failed: ${response.status} ${text}`)
      }
    } catch (err) {
      console.log("[v0] Delete error:", err)
      alert("Network error while deleting")
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingStudent(null)
    fetchStudents(page)
  }

  const filteredStudents = students.filter((s) => {
    if (yearFilter) {
      const sy = String(s.year ?? "").toLowerCase()
      if (sy !== String(yearFilter).toLowerCase()) return false
    }

    if (deptFilter) {
      const df = String(deptFilter)
      if (String(s.department) === df) {
        // match by id, ok
      } else {
        if (
          !(
            (s.department_name ?? "").toLowerCase().includes(df.toLowerCase()) ||
            String(s.department ?? "").toLowerCase() === df.toLowerCase()
          )
        ) {
          return false
        }
      }
    }

    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim()
      const nameMatch = s.name?.toLowerCase().includes(q)
      const emailMatch = s.email?.toLowerCase().includes(q)
      const prnMatch = String(s.prn ?? "").toLowerCase().includes(q)
      const deptNameMatch = (s.department_name ?? "").toLowerCase().includes(q)
      return Boolean(nameMatch || emailMatch || prnMatch || deptNameMatch)
    }

    return true
  })

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1)
  }

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">Manage student records</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2"
          >
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
            fetchStudents(page)
          }}
        />
      )}

      <Card>
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              placeholder="Search by name, email, roll number or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="p-2 border rounded bg-background"
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>

            <select
              value={String(deptFilter ?? "")}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="p-2 border rounded bg-background"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages} • Showing {filteredStudents.length} of {totalCount} students
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-6 font-semibold text-foreground">Name</th>
                <th className="text-left p-6 font-semibold text-foreground">Email</th>
                <th className="text-left p-6 font-semibold text-foreground">Roll Number</th>
                <th className="text-left p-6 font-semibold text-foreground">Year</th>
                <th className="text-left p-6 font-semibold text-foreground">Department</th>
                <th className="text-right p-6 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border hover:bg-muted/50 transition"
                  >
                    <td className="p-6 font-medium text-foreground">{student.name}</td>
                    <td className="p-6 text-muted-foreground">{student.email}</td>
                    <td className="p-6 text-muted-foreground">{student.prn}</td>
                    <td className="p-6 text-muted-foreground">{student.year}</td>
                    <td className="p-6 text-muted-foreground">
                      {student.department_name ?? String(student.department ?? "-")}
                    </td>
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

        {/* Pagination controls */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button variant="outline" onClick={handlePrev} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" onClick={handleNext} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  )
}

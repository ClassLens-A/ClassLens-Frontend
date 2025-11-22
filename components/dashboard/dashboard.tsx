"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { TeachersPage } from "./pages/teachers-page"
import { StudentsPage } from "./pages/students-page"
import { SubjectsPage } from "./pages/subjects-page"
import { OverviewPage } from "./pages/overview-page"
import { SubjectFromDeptPage } from "./pages/subject-from-dept-page"
import { StudentEnrollmentsPage } from "./pages/student-enrollments-page"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"

interface DashboardProps {
  adminToken: string | null
  onLogout: () => void
}

type Page = "overview" | "teachers" | "students" | "subjects" | "subject-from-dept" | "student-enrollments"

export function Dashboard({ adminToken, onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <OverviewPage token={adminToken} />
      case "teachers":
        return <TeachersPage token={adminToken} />
      case "students":
        return <StudentsPage token={adminToken} />
      case "subjects":
        return <SubjectsPage token={adminToken} />
      case "subject-from-dept":
        return <SubjectFromDeptPage token={adminToken} />
      case "student-enrollments":
        return <StudentEnrollmentsPage token={adminToken} />
      default:
        return <OverviewPage token={adminToken} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-md transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-semibold text-foreground">ClessLens</h1>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">{renderPage()}</div>
        </main>
      </div>
    </div>
  )
}

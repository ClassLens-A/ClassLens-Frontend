"use client"

import { LayoutDashboard, Users, BookOpen } from "lucide-react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: any) => void
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ currentPage, onPageChange, isOpen }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "teachers", label: "Teachers", icon: Users },
    { id: "students", label: "Students", icon: Users },
    { id: "subjects", label: "Subjects", icon: BookOpen },
  ]

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-0"
      } hidden lg:block lg:w-64 bg-card border-r border-border transition-all duration-300 overflow-hidden`}
    >
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-primary">ClessLens</h2>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

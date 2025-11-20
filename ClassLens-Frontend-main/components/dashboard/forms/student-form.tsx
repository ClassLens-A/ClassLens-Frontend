"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface StudentFormProps {
  token: string | null;
  student?: {
    id: string;
    name: string;
    email: string;
    prn: string;
    year: number;
  } | null;
  onClose: () => void;
}

export function StudentForm({ token, student, onClose }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    prn: "",
    year: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        prn: student.prn,
        year: Number(student.year).toString(),
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = student
        ? `http://127.0.0.1:8000/api/admin/students/${student.id}/`
        : "http://127.0.0.1:8000/api/admin/students/";

      const method = student ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || "Failed to save student");
        return;
      }

      onClose();
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {student ? "Edit Student" : "Add New Student"}
        </h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Roll Number
            </label>
            <Input
              value={formData.prn}
              onChange={(e) =>
                setFormData({ ...formData, prn: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Class
            </label>
            <Input
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Student"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

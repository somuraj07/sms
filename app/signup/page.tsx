"use client";

import { useState } from "react";

/* =======================
   FORM TYPE (DTO-like)
======================= */
type SignupForm = {
  name: string;
  email: string;
  password: string;
  role:
    | "SUPERADMIN"
    | "ADMIN"
    | "PRINCIPAL"
    | "HOD"
    | "EXAMINER"
    | "ACCOUNTANT"
    | "TEACHER"
    | "STUDENT"
    | "PARENT";
};

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    role: "STUDENT", // default role
  });

  /* =======================
     HANDLE CHANGE
  ======================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================
     HANDLE SUBMIT
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      alert(data.message || "User created successfully");
      // Optionally redirect to login
      window.location.href = "/login";
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />

      <select name="role" value={form.role} onChange={handleChange}>
        <option value="SUPERADMIN">Super Admin</option>
        <option value="ADMIN">Admin</option>
        <option value="PRINCIPAL">Principal</option>
        <option value="HOD">HOD</option>
        <option value="EXAMINER">Examiner</option>
        <option value="ACCOUNTANT">Accountant</option>
        <option value="TEACHER">Teacher</option>
        <option value="STUDENT">Student</option>
        <option value="PARENT">Parent</option>
      </select>

      <button type="submit">Sign Up</button>
    </form>
  );
}

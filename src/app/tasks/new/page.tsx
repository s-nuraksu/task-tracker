"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate, priority }),
    });
    if (res.ok) {
      router.push("/"); // ana sayfaya dön
    }
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-black">Yeni Görev Oluştur</h1>

      <form onSubmit={addTask} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Görev başlığı"
          className="w-full border p-2 rounded text-black"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Görev açıklaması"
          className="w-full border p-2 rounded text-black"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border p-2 rounded text-black"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border p-2 rounded text-black"
        >
          <option value="low">Düşük</option>
          <option value="medium">Orta</option>
          <option value="high">Yüksek</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Kaydet
        </button>
      </form>
    </main>
  );
}

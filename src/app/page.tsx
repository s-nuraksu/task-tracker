"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";

type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  completed: boolean;
  createdAt: string;
};

export default function Home() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Form state'leri
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  async function fetchTasks() {
    if (!session) return;

    const res = await fetch("/api/tasks");
    if (!res.ok) {
      console.error("API Hatası:", res.status);
      setTasks([]);
      return;
    }

    const data = await res.json();
    setTasks(data);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !session) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate, priority }),
    });

    if (!res.ok) {
      console.error("Görev eklenemedi:", res.status);
      return;
    }

    // Formu sıfırla
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");

    fetchTasks();
  }

  async function toggleTask(id: number, completed: boolean) {
    if (!session) return;

    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });

    if (!res.ok) {
      console.error("Görev güncellenemedi:", res.status);
      return;
    }

    fetchTasks();
  }

  useEffect(() => {
    fetchTasks();
  }, [session]);

  if (!session) {
    return (
      <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Görev Takip Uygulaması</h1>
        <p className="mb-6">Görevlerinizi görmek ve eklemek için giriş yapın:</p>
        <button
          onClick={() => signIn("github")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg transition"
        >
          GitHub ile Giriş Yap
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Görev Listesi</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Görev ekleme formu */}
      <form onSubmit={addTask} className="space-y-4 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Görev başlığı..."
          className="w-full border border-gray-400 p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Görev açıklaması..."
          className="w-full border border-gray-400 p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border border-gray-400 p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border border-gray-400 p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="low">Düşük</option>
          <option value="medium">Orta</option>
          <option value="high">Yüksek</option>
        </select>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg transition w-full"
        >
          Ekle
        </button>
      </form>

      {/* Görev listesi */}
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <span
                onClick={() => toggleTask(task.id, task.completed)}
                className={`flex-1 cursor-pointer ${
                  task.completed
                    ? "line-through text-gray-400"
                    : "text-gray-800"
                }`}
              >
                {task.title}
              </span>

              <button
                onClick={async () => {
                  if (!confirm("Bu görevi silmek istediğinizden emin misiniz?"))
                    return;

                  const res = await fetch(`/api/tasks/${task.id}`, {
                    method: "DELETE",
                  });
                  if (!res.ok) throw new Error("Silme başarısız");

                  setTasks((prev) => prev.filter((t) => t.id !== task.id));
                }}
                className="ml-3 bg-red-400 hover:bg-red-500 text-white p-2 rounded-lg transition flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Yeni alanların gösterimi */}
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
            {task.dueDate && (
              <p className="text-xs text-gray-500">
                Son tarih: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
            <p
              className={`text-xs font-semibold ${
                task.priority === "high"
                  ? "text-red-500"
                  : task.priority === "medium"
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}
            >
              Öncelik: {task.priority}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}

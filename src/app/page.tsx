"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Trash2, Plus } from "lucide-react";
import Link from "next/link";

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

  async function fetchTasks() {
    if (!session) return;
    const res = await fetch("/api/tasks");
    if (res.ok) {
      setTasks(await res.json());
    }
  }

  async function toggleTask(id: number, completed: boolean) {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
    fetchTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    fetchTasks();
  }, [session]);

  if (!session) {
    return (
      <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-600">Görev Takip Uygulaması</h1>
        <button
          onClick={() => signIn("github")}
          className="bg-blue-500 text-white px-5 py-3 rounded-lg"
        >
          GitHub ile Giriş Yap
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Görevlerim</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Çıkış
        </button>
      </div>

      {/* Yeni görev sayfasına link */}
      <Link
        href="/tasks/new"
        className="mb-6 inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        <Plus className="w-5 h-5 mr-2" /> Görev Oluştur
      </Link>

      <ul className="space-y-3 mt-4">
        {tasks.length === 0 && (
          <p className="text-gray-500">Henüz görev yok.</p>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span
                onClick={() => toggleTask(task.id, task.completed)}
                className={`cursor-pointer ${
                  task.completed
                    ? "line-through text-gray-400"
                    : "text-gray-800"
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-400 text-white p-2 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
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

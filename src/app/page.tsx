"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
};

export default function Home() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  async function fetchTasks() {
    if (!session) return;
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !session) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    fetchTasks();
  }

  async function toggleTask(id: number, completed: boolean) {
    if (!session) return;
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
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

      <form onSubmit={addTask} className="flex gap-3 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Yeni görev ekle..."
          className="border border-gray-400 p-3 flex-1 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg transition"
        >
          Ekle
        </button>
      </form>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <span
              onClick={() => toggleTask(task.id, task.completed)}
              className={`flex-1 ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}
            >
              {task.title}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type Task = {
  id: number;
  customer?: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
  createdAt: string;
  department?: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Görevleri API’den çek
  async function fetchTasks() {
    if (!session) return;
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
  }

  useEffect(() => {
    fetchTasks();
  }, [session]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl text-center shadow-lg border border-gray-300">
          <h1 className="text-2xl font-bold mb-4 text-gray-600">
            Görev Takip Uygulaması
          </h1>
          <button
            onClick={() => signIn("github")}
            className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 rounded-lg transition"
          >
            GitHub ile Giriş Yap
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex gap-6 p-6">
      {/* Sol Panel */}
      <aside className="w-1/4 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-black">Talep Durum</h2>
        </div>
        <div className="space-y-2">
          {/* İşlemde */}
          <div className="flex justify-between items-center border rounded px-3 py-2 bg-white">
            <span className="text-black">İşlemde</span>
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
              3
            </span>
          </div>
          {/* Çözüldü */}
          <div className="flex justify-between items-center border rounded px-3 py-2 bg-white">
            <span className="text-black">Çözüldü</span>
            <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
              7644
            </span>
          </div>
          {/* İptal */}
          <div className="flex justify-between items-center border rounded px-3 py-2 bg-white">
            <span className="text-black">İptal</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
              84
            </span>
          </div>
        </div>
      </aside>

      {/* Sağ taraf */}
      <section className="flex-1 bg-white p-4 rounded-lg shadow">
        {/* Arama */}
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="Ara"
            className="border rounded-lg px-3 py-2"
          />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm text-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">Talep Id</th>
                <th className="px-3 py-2 border">Müşteri</th>
                <th className="px-3 py-2 border">Talep Eden</th>
                <th className="px-3 py-2 border">Talep Kategorisi</th>
                <th className="px-3 py-2 border">Talep Konusu</th>
                <th className="px-3 py-2 border">Talep Tarihi</th>
                <th className="px-3 py-2 border">Atanan</th>
                <th className="px-3 py-2 border">Öncelik</th>
                <th className="px-3 py-2 border">Durum</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} 
                className="hover:bg-gray-50 cursor-pointer" 
                onClick={() => (window.location.href = `/tasks/${task.id}`)}>
                  <td className="px-3 py-2 border">{task.id}</td>
                  <td className="px-3 py-2 border">{task.customer || "-"}</td>
                  <td className="px-3 py-2 border">—</td>
                  <td className="px-3 py-2 border">{task.department || "-"}</td>
                  <td className="px-3 py-2 border truncate max-w-[200px]">
                    {task.title}
                  </td>
                  <td className="px-3 py-2 border">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 border">—</td>
                  <td className="px-3 py-2 border">{task.priority}</td>
                  <td className="px-3 py-2 border">
                    {task.completed ? "Çözüldü" : "İşlemde"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

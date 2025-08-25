"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);

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
    <main className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Görevlerim</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Çıkış
        </button>
      </div>

      {/* Yeni görev sayfasına gitmek için buton */}
      <Link
        href="/tasks/new"
        className="inline-block mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Görev Oluştur
      </Link>

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="table-fixed w-full border border-gray-200 text-sm text-black">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="w-16 px-2 py-2 border">ID</th>
              <th className="w-40 px-2 py-2 border">Başlık</th>
              <th className="w-60 px-2 py-2 border">Açıklama</th>
              <th className="w-32 px-2 py-2 border">Son Tarih</th>
              <th className="w-24 px-2 py-2 border">Öncelik</th>
              <th className="w-24 px-2 py-2 border">Durum</th>
              <th className="w-32 px-2 py-2 border">Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => (window.location.href = `/tasks/${task.id}`)}
              >
                <td className="px-2 py-2 border">{task.id}</td>
                <td className="px-2 py-2 border truncate">{task.title}</td>
                <td className="px-2 py-2 border truncate">{task.description}</td>
                <td className="px-2 py-2 border">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-2 py-2 border">{task.priority}</td>
                <td className="px-2 py-2 border">
                  {task.completed ? "Tamamlandı" : "Bekliyor"}
                </td>
                <td className="px-2 py-2 border">
                  {new Date(task.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Trash2, Plus } from "lucide-react";
import Link from "next/link";

// Task tipini tanımlıyoruz
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
  const { data: session } = useSession(); // Kullanıcının giriş yapıp yapmadığını kontrol eder
  const [tasks, setTasks] = useState<Task[]>([]); // Görevler listesi state
  const [sortBy, setSortBy] = useState("createdAt"); // Sıralama kriteri state

  // API'den görevleri çeker
  async function fetchTasks(sort: string = "createdAt") {
    if (!session) return;
    const res = await fetch(`/api/tasks?sort=${sort}`);
    if (res.ok) {
      setTasks(await res.json());
    }
  }

  // Görev tamamlandı/tamamlanmadı durumunu değiştirir
  async function toggleTask(id: number, completed: boolean) {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
    fetchTasks(sortBy); // Güncel sıralamaya göre tekrar görevleri çek
  }

  // Görev silme fonksiyonu
  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    // Silinen görevi ekranda listeden çıkarıyoruz
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // Sayfa ilk açıldığında ve sıralama değiştiğinde görevleri yükle
  useEffect(() => {
    fetchTasks(sortBy);
  }, [session, sortBy]);

  // Eğer kullanıcı giriş yapmamışsa giriş ekranını göster
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl text-center shadow-lg border border-gray-300">
          <h1 className="text-2xl font-bold mb-4 text-gray-600">
            Görev Takip Uygulaması
          </h1>
          {/* GitHub ile giriş yapma butonu */}
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

  // Eğer kullanıcı giriş yaptıysa görevler sayfasını göster
  return (
    <main className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Görevlerim</h1>
        {/* Çıkış butonu */}
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Çıkış
        </button>
      </div>

      {/* Yeni görev ekleme butonu ve sıralama menüsü */}
      <div className="flex justify-between items-center mb-4">
        {/* Yeni görev sayfasına yönlendiren buton */}
        <Link
          href="/tasks/new"
          className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5 mr-2" /> Görev Oluştur
        </Link>

        {/* Görev sıralama dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-gray-600 font-medium">Sırala:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg p-2 text-black"
          >
            <option value="createdAt">Oluşturulma Tarihi</option>
            <option value="priority">Öncelik</option>
            <option value="dueDate">Son Tarih</option>
          </select>
        </div>
      </div>

      {/* Görev listesi */}
      <ul className="space-y-3 mt-4">
        {tasks.length === 0 && (
          <p className="text-gray-500">Henüz görev yok.</p>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              {/* Görev başlığı - tamamlandıysa üstü çizili */}
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

              {/* Silme butonu */}
              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-400 hover:bg-red-500 text-white p-2 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Görev açıklaması */}
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}

            {/* Görev son tarihi */}
            {task.dueDate && (
              <p className="text-xs text-gray-500">
                Son tarih: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}

            {/* Görev önceliği */}
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

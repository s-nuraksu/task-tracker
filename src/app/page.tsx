"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "inProgress" | "completed">("all"); // ✅ Durum filtresi

  // Görevleri API’den çek
  async function fetchTasks() {
    if (!session) return;
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
  }

  useEffect(() => {
    fetchTasks();
  }, [session]);

  const inProgressCount = tasks.filter((t) => !t.completed).length; // İşlemde olan görevler
  const completedCount = tasks.filter((t) => t.completed).length; // Çözülen görevler
  // iptal edilen görevler eklenecek

// ✅ Arama + Durum filtresi
  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.customer?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (task.department?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    .filter((task) => {
      if (statusFilter === "inProgress") return !task.completed;
      if (statusFilter === "completed") return task.completed;
      return true; // all
    });

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
          {/* İşlemde buton */}
          <button
            onClick={() => setStatusFilter("inProgress")}
            className={`flex justify-between items-center border rounded px-3 py-2 w-full ${
              statusFilter === "inProgress" ? "bg-blue-100" : "bg-white"
            }`}
          >
            <span className="text-black">İşlemde</span>
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
              {inProgressCount}
            </span>
          </button>

          {/* Çözüldü buton */}
          <button
            onClick={() => setStatusFilter("completed")}
            className={`flex justify-between items-center border rounded px-3 py-2 w-full ${
              statusFilter === "completed" ? "bg-green-100" : "bg-white"
            }`}
          >
            <span className="text-black">Çözüldü</span>
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
              {completedCount}
            </span>
          </button>

          {/* İptal (şimdilik işlevsiz, örnek) */}
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
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              className="p-2 border rounded-lg border-blue-700 text-blue-700 hover:bg-blue-100"
              aria-label="Önceki"
              onClick={() => {}}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-2 border rounded-lg border-blue-700 text-blue-700 hover:bg-blue-100"
              aria-label="Sonraki"
              onClick={() => {}}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-3 py-2 w-64 border-gray-600 text-black"
            />
            <button
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center justify-center"
              aria-label="Ara"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
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
                <th className="px-3 py-2 border">Talep Durumu</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => (window.location.href = `/tasks/${task.id}`)}
                >
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
                  <td className="px-3 py-2 border font-bold">{task.priority}</td>
                  <td className="px-3 py-2 border font-semibold">
                    {task.completed ? (
                      <span className="text-green-500">Çözüldü</span>
                    ) : (
                      <span className="text-blue-500">İşlemde</span>
                    )}
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

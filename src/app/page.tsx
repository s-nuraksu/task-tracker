"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type Task = {
  id: number;
  title: string;
  customer?: string;
  department?: string;
  priority: string;
  completed: boolean;
  createdAt: string;
  createdById: string;
  claimedById: string | null;
  createdBy?: { name: string | null } | null;
  claimedBy?: { name: string | null } | null;
  isCanceled: boolean;
};

export default function Dashboard() {
  const { data: session, status } = useSession();

  // iki ayrı kaynak: aktif ve iptal görevleri
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [canceledTasks, setCanceledTasks] = useState<Task[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "waiting" | "inProgress" | "completed">("all");
  const [showCanceled, setShowCanceled] = useState(false);

  // her zaman iki listeyi de çek
  async function fetchAllTasks() {
    if (!session) return;

    const [activeRes, canceledRes] = await Promise.all([
      fetch("/api/tasks"),               // aktifler (isCanceled=false)
      fetch("/api/tasks?show=canceled"), // iptaller (isCanceled=true)
    ]);

    if (activeRes.ok) setActiveTasks(await activeRes.json());
    if (canceledRes.ok) setCanceledTasks(await canceledRes.json());
  }

  useEffect(() => {
    fetchAllTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // sayaçlar (liste görünümünden bağımsız)
  const waitingCount    = activeTasks.filter(t => !t.completed && t.claimedById === null).length; // beklemede
  const inProgressCount = activeTasks.filter(t => !t.completed && t.claimedById !== null).length; // işlemde
  const completedCount  = activeTasks.filter(t =>  t.completed).length;                            // çözüldü
  const canceledCount   = canceledTasks.length;                                                    // iptal

  // Gösterilecek listeyi seç
  const displayTasks = showCanceled ? canceledTasks : activeTasks;

  // Arama + durum filtreleri
  const filteredTasks = displayTasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.customer?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (task.department?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    .filter((task) => {
      if (showCanceled) {
        // iptal görünümünde durum filtresi uygulanmaz
        return task.isCanceled;
      } else {
        // aktif görünüm
        if (statusFilter === "waiting")    return !task.completed && task.claimedById === null;
        if (statusFilter === "inProgress") return !task.completed && task.claimedById !== null;
        if (statusFilter === "completed")  return  task.completed;
        return true; // all
      }
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
          <h1 className="text-2xl font-bold mb-4 text-gray-600">Görev Takip Uygulaması</h1>
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
      <aside className="w-[250px] shrink-0 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-black">Talep Durum</h2>

          {/* ✅ Tümü butonu */}
          <button
            onClick={() => { setShowCanceled(false); setStatusFilter("all"); }}
            className={`px-2 py-1 text-xs rounded border transition
              ${
                !showCanceled && statusFilter === "all"
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            title="Tüm aktif görevleri göster"
          >
            Tümü
          </button>
        </div>

        <div className="space-y-2">
          {/* Beklemede */}
          <button
            onClick={() => { setShowCanceled(false); setStatusFilter("waiting"); }}
            className={`flex justify-between items-center border rounded px-3 py-2 w-full ${
              !showCanceled && statusFilter === "waiting" ? "bg-amber-100" : "bg-white"
            }`}
          >
            <span className="text-black">Beklemede</span>
            <span className="bg-amber-500 text-white px-2 py-1 rounded text-sm">{waitingCount}</span>
          </button>

          {/* İşlemde */}
          <button
            onClick={() => { setShowCanceled(false); setStatusFilter("inProgress"); }}
            className={`flex justify-between items-center border rounded px-3 py-2 w-full ${
              !showCanceled && statusFilter === "inProgress" ? "bg-blue-100" : "bg-white"
            }`}
          >
            <span className="text-black">İşlemde</span>
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">{inProgressCount}</span>
          </button>

          {/* Çözüldü */}
          <button
            onClick={() => { setShowCanceled(false); setStatusFilter("completed"); }}
            className={`flex justify-between items-center border rounded px-3 py-2 w-full ${
              !showCanceled && statusFilter === "completed" ? "bg-green-100" : "bg-white"
            }`}
          >
            <span className="text-black">Çözüldü</span>
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">{completedCount}</span>
          </button>

          {/* İptal */}
          <button
            onClick={() => { setShowCanceled(true); setStatusFilter("all"); }}
            className={`flex justify-between items-center border rounded px-3 py-2 w-full ${
              showCanceled ? "bg-red-100" : "bg-white"
            }`}
          >
            <span className="text-black">İptal</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">{canceledCount}</span>
          </button>
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
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-2 border rounded-lg border-blue-700 text-blue-700 hover:bg-blue-100"
              aria-label="Sonraki"
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
                  <td className="px-3 py-2 border">{task.createdBy?.name || "-"}</td>
                  <td className="px-3 py-2 border">{task.department || "-"}</td>
                  <td className="px-3 py-2 border truncate max-w-[200px]">{task.title}</td>
                  <td className="px-3 py-2 border">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 border">
                    {task.claimedBy ? (task.claimedBy.name || "—") : "Boşta"}
                  </td>
                  <td className="px-3 py-2 border font-bold">{task.priority}</td>
                  <td className="px-3 py-2 border font-semibold">
                    {task.isCanceled ? (
                      <span className="text-red-500">İptal</span>
                    ) : task.completed ? (
                      <span className="text-green-500">Çözüldü</span>
                    ) : task.claimedById === null ? (
                      <span className="text-amber-600">Beklemede</span>
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

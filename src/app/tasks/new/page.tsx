"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NewTaskPage() {
  const router = useRouter();

  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customer, setCustomer] = useState("");
  const [priority, setPriority] = useState("low");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department, title, description, customer, priority }),
    });

    if (res.ok) {
      router.push("/"); 
    }
  }

    return (
    <main className="px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Form kartı - Başlık buraya taşındı */}
        <div className="bg-white rounded-lg shadow border border-slate-200">
          {/* Başlık satırı - beyaz div içinde */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center">
              {/* 🔙 Geri Dön Butonu - sadece ok */}
              <button
                onClick={() => router.push("/")}
                className="flex items-center text-gray-600 hover:text-blue-600 mr-3"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-blue-900">Talep Ekle</h2>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 space-y-4"
          >
            {/* Departman */}
            <div>
              <label className="block mb-1 text-sm text-slate-500">Departman</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3 py-2 text-black"
              >
                <option value="">Seçiniz</option>
                <option>System Support Team</option>
                <option>System Analysis Team</option>
              </select>
            </div>

            {/* Talep Konusu */}
            <div>
              <label className="block mb-1 text-sm text-slate-500">Talep Konusu</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3 py-2 text-black"
                placeholder="Staj İçin Bir Örnek Bildirim"
                required
              />
            </div>

            {/* Talep Açıklama */}
            <div>
              <label className="block mb-1 text-sm text-slate-500">Talep Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3 py-2 h-36 text-black"
                placeholder="xyz sisteminde destek istiyoruz."
              />
            </div>

            {/* Müşteri */}
            <div>
              <label className="block mb-1 text-sm text-slate-500">Müşteri</label>
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3 py-2 text-black"
                placeholder="CommitUp"
              />
            </div>

            {/* Talep Öncelik */}
            <div>
              <label className="block mb-2 text-sm text-slate-500">Talep Öncelik</label>
              <div className="flex gap-2">
                {["low", "medium", "high", "urgent"].map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setPriority(level)}
                    className={`px-3 py-1 rounded border transition font-medium ${
                      priority === level
                        ? level === "low"
                          ? "bg-green-700 text-white"
                          : level === "medium"
                          ? "bg-yellow-500 text-white"
                          : level === "high"
                          ? "bg-orange-500 text-white"
                          : "bg-red-600 text-white"
                        : "bg-white text-blue-600 border-blue-500"
                    }`}
                  >
                    {level === "low" && "Düşük"}
                    {level === "medium" && "Orta"}
                    {level === "high" && "Yüksek"}
                    {level === "urgent" && "Acil"}
                  </button>
                ))}
              </div>
            </div>

            {/* Kaydet */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

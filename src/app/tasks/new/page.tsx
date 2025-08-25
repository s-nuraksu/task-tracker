"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      body: JSON.stringify({
        department,
        title,
        description,
        customer,
        priority,
      }),
    });

    if (res.ok) {
      router.push("/"); // Kaydettikten sonra ana sayfaya dön
    }
  }

  return (
    <main className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">Görev Ekle</h1>
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        {/* Departman */}
        <div>
          <label className="block mb-1 font-medium text-black">Departman</label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border border-black p-2 rounded text-black"
            placeholder="Departman adı girin"
          />
        </div>

        {/* Görev Konusu */}
        <div>
          <label className="block mb-1 font-medium text-black">
            Görev Konusu
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-black p-2 rounded text-black"
            placeholder="Görev başlığı"
            required
          />
        </div>

        {/* Görev Açıklaması */}
        <div>
          <label className="block mb-1 font-medium text-black">
            Görev Açıklaması
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-black p-2 rounded h-24 text-black"
            placeholder="Detaylı açıklama girin..."
          />
        </div>

        {/* Müşteri */}
        <div>
          <label className="block mb-1 font-medium text-black">Müşteri</label>
          <input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full border border-black p-2 rounded text-black"
            placeholder="Müşteri adı"
          />
        </div>

        {/* Öncelik */}
        <div>
          <label className="block mb-1 font-medium text-black">Öncelik</label>
          <div className="flex gap-2">
            {["low", "medium", "high", "urgent"].map((level) => (
              <button
                type="button"
                key={level}
                onClick={() => setPriority(level)}
                className={`px-3 py-1 rounded border  ${
                  priority === level
                    ? "bg-blue-500 text-white border-blue-700"
                    : "bg-gray-100 text-black "
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

        {/* Kaydet Butonu */}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg border border-blue-700"
        >
          Kaydet
        </button>
      </form>
    </main>
  );
}

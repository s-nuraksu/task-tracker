"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function NewTaskPage() {
  const router = useRouter();

  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customer, setCustomer] = useState("");
  const [priority, setPriority] = useState("low");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append("department", department);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("customer", customer);
    formData.append("priority", priority);
    
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch("/api/tasks", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/"); 
    } else {
      console.error("Görev oluşturma hatası");
      setIsUploading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <main className="px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow border border-slate-200">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center">
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
            encType="multipart/form-data"
          >
          
            <div>
              <label className="block mb-1 text-sm text-slate-500">Departman</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3 py-2 text-black"
                required
              >
                <option value="">Seçiniz</option>
                <option>System Support Team</option>
                <option>System Analysis Team</option>
              </select>
            </div>

          
            <div>
              <label className="block mb-1 text-sm text-slate-500">Talep Konusu</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3 py-2 text-black"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-slate-500">Talep Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3 py-2 h-36 text-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-slate-500">Müşteri</label>
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-slate-500">Dosya Ekle</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-blue-500" />
                    <p className="mb-2 text-sm text-blue-500">
                      <span className="font-semibold">Dosyaları tıklayarak seçin veya sürükleyip bırakın</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG (Max. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Seçilen Dosyalar:</h3>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-2 bg-slate-100 rounded">
                        <div className="flex items-center">
                          <span className="text-sm text-slate-700 truncate max-w-xs">{file.name}</span>
                          <span className="ml-2 text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yükleniyor...
                  </>
                ) : (
                  "Kaydet"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
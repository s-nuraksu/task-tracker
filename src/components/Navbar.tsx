"use client";

import Link from "next/link";
import { Sun, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
      {/* Sol taraf (Logo + Menü) */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-wide">
          COMMITUP
        </Link>

        {/* Menü */}
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/requests" className="hover:underline">
            Talepler
          </Link>
          <Link href="/tasks" className="hover:underline">
            Görevler
          </Link>
          <Link href="/reports" className="hover:underline">
            Raporlar
          </Link>
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
        </div>
      </div>

      {/* Sağ taraf (Butonlar) */}
      <div className="flex items-center gap-4">
        <Link
          href="/tasks/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          Talep Ekle
        </Link>
        <button className="p-2 rounded-full hover:bg-blue-800">
          <Sun className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-blue-800">
          <User className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

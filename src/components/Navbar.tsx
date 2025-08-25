"use client";

import Link from "next/link";
import { Sun, User } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md relative">
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

        {/* Kullanıcı Menüsü */}
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-blue-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <User className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Profil
              </Link>
              <button
              onClick={() => signOut({ callbackUrl: "/" })} 
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
              Çıkış
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

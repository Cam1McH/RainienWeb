"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Brain, BarChart2, Settings, LogOut, Bell, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Ensure correct import for useRouter

const tabs = [
  { name: "Overview", icon: Home },
  { name: "Your AI", icon: Brain },
  { name: "Analytics", icon: BarChart2 },
  { name: "Settings", icon: Settings },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // For flash effect
  const router = useRouter();

  useEffect(() => {
    const validateUser = async () => {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.loggedIn) {
        setUser(data.user);
        setIsVisible(true); // Set visibility to true when user is valid
      } else {
        router.push("/AccessDenied"); // Redirect if not logged in
      }
    };

    validateUser(); // Call the function
  }, [router]);

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    document.documentElement.classList.toggle("light");
  };

  const dummyData = [
    { name: 'Mon', usage: 30 },
    { name: 'Tue', usage: 50 },
    { name: 'Wed', usage: 70 },
    { name: 'Thu', usage: 40 },
    { name: 'Fri', usage: 90 },
    { name: 'Sat', usage: 60 },
    { name: 'Sun', usage: 80 },
  ];

  return (
    <div className={`flex h-screen w-screen ${theme === "dark" ? "bg-gradient-to-br from-[#0a0a0a] via-[#101010] to-[#1a1a1a]" : "bg-gradient-to-br from-white via-gray-100 to-gray-200"} overflow-hidden`}>
      {/* Sidebar */}
      <aside className="fixed left-4 top-4 bottom-4 w-20 flex flex-col justify-between items-center bg-white/5 backdrop-blur-lg rounded-3xl shadow-xl p-4">
        <div className="flex flex-col gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`p-3 rounded-2xl transition hover:bg-white/10 ${activeTab === tab.name ? "bg-white/10" : ""}`}
            >
              <tab.icon className="h-6 w-6 text-white" />
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4 mb-2">
          <button onClick={toggleTheme} className="p-3 rounded-2xl hover:bg-white/10">
            {theme === "dark" ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-blue-500" />}
          </button>
          <button onClick={logout} className="p-3 rounded-2xl hover:bg-red-500/20 transition">
            <LogOut className="h-6 w-6 text-red-400" />
          </button>
        </div>
      </aside>

      {/* Topbar */}
      <header className="fixed left-28 right-4 top-4 h-16 bg-white/5 backdrop-blur-lg rounded-3xl shadow-xl flex items-center justify-between px-8">
        <h1 className="text-xl font-bold text-white tracking-wide">{activeTab}</h1>
        <div className="flex items-center gap-6">
          <button className="relative">
            <Bell className="h-6 w-6 text-white" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-pink-500" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 5 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-4 w-48 bg-white/5 backdrop-blur-lg rounded-3xl shadow-xl p-4 flex flex-col gap-3 z-50"
                >
                  <Link href="/profile" className="text-white hover:text-pink-400 transition text-sm">Profile Settings</Link>
                  <button onClick={logout} className="text-red-400 hover:text-red-500 transition text-sm text-left">Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ml-32 mt-24 p-8 overflow-y-auto transition-opacity ${isVisible ? "opacity-100" : "opacity-0"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {activeTab === "Overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <div className="col-span-2 bg-white/5 p-10 rounded-3xl border border-white/10 shadow-xl">
                  <h2 className="text-3xl font-bold text-white mb-2">🎉 Welcome back, <span className="text-pink-400">{user?.fullName}</span>!</h2>
                  <p className="text-gray-400">Ready to build your next AI?</p>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-2">📈 Plan Usage</h3>
                  <div className="text-pink-400 text-2xl font-bold">87%</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-pink-400 h-2 rounded-full" style={{ width: "87%" }}></div>
                  </div>
                  <p className="text-gray-400 mt-2">API Usage</p>
                  <p className="text-gray-400">🧠 Bots: 5/10</p>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-2">⚡ Quick Actions</h3>
                  <button className="mt-2 text-pink-400 hover:underline">Create New AI</button>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-2">📦 Recent Activity</h3>
                  <p className="text-gray-400">🔄 Updated "SupportBot" - 1hr ago</p>
                  <p className="text-gray-400">🚀 Deployed "VisionBot" - 2 days ago</p>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-2">🔔 Notifications</h3>
                  <p className="text-gray-400">New feature available! Check Settings ⚙️</p>
                </div>
              </div>
            )}
            {/* Other Tabs (Coming Next) */}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
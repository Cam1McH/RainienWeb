"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Users, FileText, Settings, Bell } from "lucide-react";

const tabs = [
  { name: "Overview", icon: Users },
  { name: "User Management", icon: Users },
  { name: "Reports", icon: FileText },
  { name: "Settings", icon: Settings },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [user, setUser] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false); // For flash effect
  const [userList, setUserList] = useState<any>([]); // List of users for management
  const [searchQuery, setSearchQuery] = useState(""); // For the search feature
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      const data = await res.json();
      if (data.loggedIn && data.user.role === "admin") {
        setUser(data.user);
        setIsVisible(true);
        fetchUsers();
      } else {
        router.push("/AccessDenied");
      }
    });
  }, [router]);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin"); // Endpoint for fetching users
    const data = await res.json();
    setUserList(data.users); // Assume API returns an array of users
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  };

  const filteredUsers = userList.filter((user: any) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  ); // Filtering users based on search

  return user ? (
    <div className="flex h-screen w-screen bg-gradient-to-br from-[#0a0a0a] via-[#101010] to-[#1a1a1a]">
      {/* Admin Sidebar */}
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
        <button onClick={logout} className="p-3 rounded-2xl hover:bg-red-500/20 transition">
          <LogOut className="h-6 w-6 text-red-400" />
        </button>
      </aside>

      {/* Admin Panel Top Bar */}
      <header className="fixed left-28 right-4 top-4 h-16 bg-white/5 backdrop-blur-lg rounded-3xl shadow-xl flex items-center justify-between px-8">
        <h1 className="text-xl font-bold text-white tracking-wide">{activeTab}</h1>
        <div className="flex items-center gap-6">
          <button className="relative">
            <Bell className="h-6 w-6 text-white" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <button onClick={logout} className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-pink-500" />
          </button>
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
          >
            {activeTab === "Overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-2">📊 Total Users</h3>
                  <div className="text-pink-400 text-3xl font-bold">1,245</div>
                  <p className="text-gray-400 mt-2">Total registered users across the platform.</p>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-2">📈 Active Users</h3>
                  <div className="text-pink-400 text-3xl font-bold">342</div>
                  <p className="text-gray-400 mt-2">Users currently active on the platform.</p>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-2">🚀 New Sign-Ups</h3>
                  <div className="text-pink-400 text-3xl font-bold">53</div>
                  <p className="text-gray-400 mt-2">New users registered in the last week.</p>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-2">🔔 Service Alerts</h3>
                  <p className="text-gray-400">All systems are operational. No ongoing issues detected.</p>
                </div>
              </div>
            )}

            {activeTab === "User Management" && (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-white">Manage Users</h2>
                <input
                  type="text"
                  placeholder="Search users..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-4 mb-4 p-2 rounded-full bg-white/10 text-white border border-white/20 focus:border-pink-400 focus:outline-none transition"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white/5 p-4 rounded-3xl border border-white/10 shadow-xl flex flex-col hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-bold text-white flex items-center">
                        {user.role === "admin" ? "👨‍💼" : "👤"} {user.fullName.charAt(0).toUpperCase() + user.fullName.slice(1)}
                      </h3>
                      <p className="text-gray-400">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                      <div className="mt-2 flex-grow">
                        <p className="text-gray-400">Email: {user.email}</p>
                      </div>
                      <button className="mt-4 p-2 bg-pink-400 rounded-full text-white transition hover:bg-pink-500">Manage</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Reports" && (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-white">View Reports</h2>
                <p className="text-gray-400 mt-2">Access various reports for user activity or sales performance.</p>
              </div>
            )}

            {activeTab === "Settings" && (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <p className="text-gray-400 mt-2">Manage your admin settings here.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  ) : null; // Return null while loading or if access is denied
}
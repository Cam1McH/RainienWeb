// app/AccessDenied/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AccessDenied = () => {
  const router = useRouter();
  const redirectTime = 5; // Countdown time in seconds

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/"); // Redirect to homepage after the countdown
    }, redirectTime * 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0a0a0a] via-[#101010] to-[#1a1a1a] text-white">
      <h1 className="text-5xl font-bold mb-4">🚫 Oops!</h1>
      <p className="text-xl mb-6">You don’t seem to have access to this page...</p>
      <p className="text-lg mb-4">We’re sending you back in <span id="countdown">{redirectTime}</span> seconds!</p>
      <p className="text-lg">In the meantime, enjoy this view:</p>
      <img src="/path/to/funny-image.gif" alt="Funny Access Denied" className="mt-4 w-64" /> {/* Replace with your funny image */}
    </div>
  );
};

export default AccessDenied;
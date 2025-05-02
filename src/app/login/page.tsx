"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Define shake animation
const shakeAnimation = "animate-shake";

const TwoFactorInput = ({
  value,
  onChange,
  isShaking,
}: {
  value: string;
  onChange: (val: string) => void;
  isShaking: boolean;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const newValue = value.split("");
    newValue[i] = val[0];
    onChange(newValue.join("").slice(0, 6));
    if (i < 5 && inputRefs.current[i + 1]) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        const newValue = value.split("");
        newValue[i] = "";
        onChange(newValue.join(""));
      } else if (i > 0) {
        const newValue = value.split("");
        newValue[i - 1] = "";
        onChange(newValue.join(""));
        inputRefs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted);
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          ref={(el) => (inputRefs.current[i] = el)}
          className={`bg-white text-black text-2xl font-bold text-center w-14 h-14 rounded-2xl border border-gray-300 focus:outline-none focus:border-pink-500 transition-all ${isShaking ? shakeAnimation : ''}`}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState(0); // Track login attempts
  const router = useRouter();

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();

        if (data.loggedIn) {
          setLoggedIn(true);
          router.push("/dashboard"); // Redirect to dashboard if logged in
        }
      } catch (err) {
        console.error("Login check failed", err);
      }
    }

    checkLogin();
  }, [router]);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleNext = () => {
    if (!email.trim()) return triggerError("Please enter your email");
    setStep(2);
    setError("");
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
  };

  const handleLogin = async () => {
    if (!password.trim()) return triggerError("Please enter your password");

    if (rateLimit >= 10) {
      triggerError("Too many login attempts. Please try again later.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setRateLimit((prev) => prev + 1); // Increment rate limit
        triggerError(data.error || "Login failed");
        return;
      }

      setUserId(data.userId);
      setStep(3); // Go to 2FA input step

      // Check if the user needs to set up 2FA
      if (data.requires2FA) {
        if (data.twoFactorVerified === 0) {
          const qrRes = await fetch("/api/2fa/setup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }), // Use email to set up the QR code
          });
          const qrData = await qrRes.json();
          if (qrRes.ok) {
            setQrCode(qrData.qrCode);
          } else {
            triggerError(qrData.error || "Failed to set up 2FA");
            return;
          }
        } else {
          setQrCode(null); // If they were verified previously
        }
      }
    } catch {
      setLoading(false);
      triggerError("Failed to connect to server.");
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode.trim()) return triggerError("Enter the 6-digit code");
    try {
      setLoading(true);
  
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, token: twoFactorCode }),
      });
  
      const data = await res.json();
      setLoading(false);
  
      if (!res.ok) {
        triggerError(data.error || "Invalid code");
      } else {
        setLoggedIn(true);
        router.push("/dashboard");
      }
    } catch {
      setLoading(false);
      triggerError("Verification failed");
    }
  };
  
  const inputStyle =
    "w-full p-4 rounded-xl bg-[#1b1b1b] border border-gray-700 placeholder-gray-500 text-white focus:outline-none";

  if (loggedIn) return null;

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#0a0a0a] to-[#121212] text-white px-4 relative">
      <div className="absolute top-6 left-6">
        {step > 1 && (
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </motion.button>
        )}
      </div>

      <div
        className={`w-full max-w-md mx-auto flex-grow flex flex-col justify-center items-center space-y-6 ${
          shake ? "animate-shake" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4 text-center w-full"
            >
              <h2 className="text-3xl font-bold">Welcome Back!</h2>
              <p className="text-gray-400">Enter your email to continue</p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleNext}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4 text-center w-full"
            >
              <h2 className="text-3xl font-bold">Almost There</h2>
              <p className="text-gray-400">Enter your password to login</p>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputStyle}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="text-white" size={20} /> : <Eye className="text-white" size={20} />}
                </button>
              </div>
              <div className="w-full text-right">
                <a href="#" className="text-sm text-gray-400 hover:text-pink-400 transition">Forgot Password?</a>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleLogin}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold flex justify-center items-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Log In"}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4 text-center w-full"
            >
              <h2 className="text-3xl font-bold">Two-Factor Authentication</h2>
              {qrCode ? (
                <>
                  <p className="text-gray-400">Scan this QR code to set up 2FA:</p>
                  <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 mx-auto" />
                </>
              ) : (
                <p className="text-gray-400">Enter the 6-digit code from your authenticator app</p>
              )}
              <TwoFactorInput value={twoFactorCode} onChange={setTwoFactorCode} isShaking={shake} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleVerify2FA}
                className="w-full py-3 mt-2 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold flex justify-center items-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify"}
              </button>
              <p className="text-sm text-gray-400 mt-2">
                Don’t have a code? <a href="#" className="text-pink-400 hover:underline">Get Help</a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="py-6 text-center text-gray-500 text-sm">
        <div className="flex gap-6 justify-center">
          <a href="#" className="hover:text-pink-400 transition">Privacy Policy</a>
          <a href="#" className="hover:text-pink-400 transition">Terms of Service</a>
          <a href="#" className="hover:text-pink-400 transition">Support</a>
        </div>
        <p className="mt-4">© 2025 Ventra. All rights reserved.</p>
      </footer>
    </main>
  );
}
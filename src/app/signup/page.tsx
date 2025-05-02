"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [isBusiness, setIsBusiness] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const router = useRouter();

  const businessTypes = [
    "Agency",
    "E-commerce",
    "Consultancy",
    "Education",
    "Healthcare",
    "Media",
    "Technology",
    "Other",
  ];

  const passwordStrength = () => {
    if (password.length > 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return "strong";
    if (password.length > 8) return "medium";
    return "weak";
  };

  const strengthColors = { weak: "bg-red-500", medium: "bg-yellow-500", strong: "bg-green-500" };

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleNext = async () => {
    if (step === 2 && !fullName.trim()) return triggerError("Please enter your full name");
    if (step === 3 && isBusiness && (!businessName.trim() || !businessType.trim()))
      return triggerError("Please complete your business info");
    if (step === (isBusiness ? 4 : 3) && (!email.trim() || email !== confirmEmail))
      return triggerError("Emails do not match");
    
    if (step === (isBusiness ? 5 : 4)) {
      if (password !== confirmPassword) return triggerError("Passwords do not match");
      if (passwordStrength() !== "strong") return triggerError("Password not strong enough");
  
      const signupPayload = {
        fullName,
        email,
        password,
        businessName: isBusiness ? businessName : null,
        businessType: isBusiness
          ? businessType === "Other"
            ? customBusinessType
            : businessType
          : null,
        accountType: isBusiness ? "business" : "personal",
      };
  
      console.log("📦 Submitting signup payload:", signupPayload);
  
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupPayload),
        });
  
        const data = await res.json();
        console.log("📥 Signup response:", res.status, data);
  
        if (!res.ok) return triggerError(data.error || "Something went wrong");
  
        // Proceed to 2FA setup
        console.log("✅ Signup successful, requesting 2FA QR code for:", email);
        const qrRes = await fetch("/api/2fa/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
  
        const qrData = await qrRes.json();
        console.log("📥 QR setup response:", qrRes.status, qrData);
  
        if (!qrRes.ok) return triggerError(qrData.error || "Failed to get QR code");
        setQrCode(qrData.qrCode);
      } catch (error) {
        console.error("❌ Network or unknown error during signup or 2FA setup:", error);
        return triggerError("Unable to complete registration or initiate 2FA setup.");
      }
    }
  
    setStep(prev => prev + 1);
    setError("");
  };
  

  const handleSubmit = async () => {
    if (twoFactorCode.length !== 6) return triggerError("Enter a valid 6-digit 2FA code");
  
    console.log("📨 Submitting 2FA code:", { email, token: twoFactorCode });
  
    try {
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: twoFactorCode }),
      });
  
      const data = await res.json();
      console.log("📥 2FA verification response:", res.status, data);
  
      if (!res.ok) return triggerError(data.error || "2FA verification failed");
  
      // Redirect to dashboard
      router.push("/dashboard"); // ✅ Now works with `useRouter`
    } catch (error) {
      console.error("❌ Network or unknown error during 2FA verification:", error);
      triggerError("Failed to verify 2FA.");
    }
  };
  

  const inputStyle = "w-full p-4 rounded-xl bg-[#1b1b1b] border border-gray-700 placeholder-gray-500 text-white focus:outline-none";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#121212] text-white flex flex-col justify-center items-center px-4">
      <div className={`w-full max-w-md space-y-6 ${shake ? "animate-shake" : ""}`}>
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="flex flex-col gap-6 text-center">
              <h2 className="text-3xl font-bold">Are you signing up as a business?</h2>
              <div className="flex gap-4">
                <button onClick={() => { setIsBusiness(false); handleNext(); }} className="flex-1 py-3 bg-[#1b1b1b] rounded-xl hover:bg-pink-600 transition">No</button>
                <button onClick={() => { setIsBusiness(true); handleNext(); }} className="flex-1 py-3 bg-[#1b1b1b] rounded-xl hover:bg-pink-600 transition">Yes</button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 - NAME */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="flex flex-col gap-4">
              <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputStyle} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleNext} className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold">Continue</button>
            </motion.div>
          )}

          {/* STEP 3 - BUSINESS INFO */}
          {step === 3 && isBusiness && (
            <motion.div key="step3b" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="flex flex-col gap-4">
              <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputStyle} />
              <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={`${inputStyle} text-gray-400`}>
                <option value="">Select Business Type</option>
                {businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              {businessType === "Other" && (
                <input type="text" placeholder="Specify Business Type" value={customBusinessType} onChange={(e) => setCustomBusinessType(e.target.value)} className={inputStyle} />
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleNext} className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold">Continue</button>
            </motion.div>
          )}

          {/* STEP 4 - EMAIL */}
          {step === (isBusiness ? 4 : 3) && (
            <motion.div key="step4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="flex flex-col gap-4">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} />
              <input type="email" placeholder="Confirm Email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} className={inputStyle} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleNext} className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold">Continue</button>
            </motion.div>
          )}

          {/* STEP 5 - PASSWORD */}
          {step === (isBusiness ? 5 : 4) && (
            <motion.div key="step5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="flex flex-col gap-4">
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} />
                <button type="button" className="absolute top-1/2 right-4 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="text-white" size={20} /> : <Eye className="text-white" size={20} />}
                </button>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${strengthColors[passwordStrength()]}`} style={{ width: password.length > 0 ? passwordStrength() === "strong" ? "100%" : passwordStrength() === "medium" ? "66%" : "33%" : "0%" }} />
              </div>
              <p className="text-sm">Strength: <span className={`${strengthColors[passwordStrength()]}`}>{passwordStrength()}</span></p>
              <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputStyle} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleNext} className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold">Continue</button>
            </motion.div>
          )}

          {/* STEP 6 - 2FA */}
          {step === (isBusiness ? 6 : 5) && (
            <motion.div key="step6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="flex flex-col gap-4 text-center">
              <h3 className="text-xl font-semibold mb-2">Scan this QR Code with your Authenticator App</h3>
              {qrCode ? (
                <img src={qrCode} alt="2FA QR Code" className="mx-auto w-40 h-40" />
              ) : (
                <p>Loading QR Code...</p>
              )}
              <input type="text" placeholder="Enter 6-digit code" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} className={inputStyle + " text-center tracking-widest"} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleSubmit} className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-semibold">Sign Up</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="py-12 text-center text-gray-500 text-sm">
        <div className="flex gap-6 justify-center">
          <a href="#" className="hover:text-pink-400 transition">Privacy Policy</a>
          <a href="#" className="hover:text-pink-400 transition">Terms of Service</a>
          <a href="#" className="hover:text-pink-400 transition">Support</a>
        </div>
        <p className="mt-4">&copy; 2025 Ventra. All rights reserved.</p>
      </footer>
    </main>
  );
}

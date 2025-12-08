"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"

const hardwareImages = {
  one: "/images/top-right-login.png",
  two: "/images/top-left-login.png",
  three: "/images/bottom-left-login.png",
  four: "/images/bottom-right-login.png",
}

const sanitizeNext = (value?: string | null) => {
  if (!value) return "/"
  return value.startsWith("/") ? value : "/"
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const nextDestination = useMemo(
    () => sanitizeNext(searchParams?.get("next") ?? searchParams?.get("returnTo")),
    [searchParams]
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [logoLabel, setLogoLabel] = useState("MODIQ")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const result = login(email, password)

    if (!result.success) {
      setLogoLabel("MODIQ")
      setError("Invalid email or password. Use the mock credentials below to sign in.")
      setLoading(false)
      return
    }

    const roleText = result.user.role === "admin" ? "ADMIN" : "CUSTOMER"
    setLogoLabel(roleText)
    setSuccessMessage(`Welcome ${result.user.displayName}. Redirecting you in a moment…`)
    setLoading(false)

    setTimeout(() => {
      router.replace(nextDestination)
    }, 1200)
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #3d3d3d 100%);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
        }

        .floating-hardware-1,
        .floating-hardware-2,
        .floating-hardware-3,
        .floating-hardware-4 {
          position: absolute;
          filter: blur(2px) opacity(0.55);
          animation-duration: 18s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          pointer-events: none;
        }

        .floating-hardware-1 {
          width: 250px;
          height: 400px;
          top: 15%;
          right: 8%;
          filter: blur(3px) opacity(0.6);
          animation-name: floatDiagonal;
        }

        .floating-hardware-2 {
          width: 200px;
          height: 80px;
          bottom: 20%;
          left: 5%;
          animation-name: floatReverse;
        }

        .floating-hardware-3 {
          width: 180px;
          height: 300px;
          top: 25%;
          left: 12%;
          animation-name: floatWild;
        }

        .floating-hardware-4 {
          width: 220px;
          height: 100px;
          bottom: 15%;
          right: 10%;
          animation-name: floatChaotic;
        }

        @keyframes floatDiagonal {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-80px, 60px) rotate(5deg); }
          50% { transform: translate(-40px, -70px) rotate(-3deg); }
          75% { transform: translate(70px, -40px) rotate(4deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        @keyframes floatReverse {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(90px, -50px) rotate(-4deg) scale(1.1); }
          66% { transform: translate(-60px, 80px) rotate(6deg) scale(0.95); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }

        @keyframes floatWild {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(100px, -80px) rotate(8deg); }
          40% { transform: translate(-90px, 60px) rotate(-6deg); }
          60% { transform: translate(80px, 90px) rotate(5deg); }
          80% { transform: translate(-70px, -70px) rotate(-7deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        @keyframes floatChaotic {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(-110px, 70px) rotate(-10deg) scale(1.15); }
          50% { transform: translate(90px, -90px) rotate(8deg) scale(0.9); }
          75% { transform: translate(-80px, -60px) rotate(12deg) scale(1.05); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }

        .container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 450px;
          width: 100%;
          padding: 60px 50px;
          position: relative;
          z-index: 1;
        }

        .logo {
          font-size: 48px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
          letter-spacing: 2px;
          text-align: center;
        }

        .logo span {
          color: #c4d677;
        }

        .tagline {
          color: #c4d677;
          font-size: 13px;
          margin-bottom: 40px;
          letter-spacing: 1.5px;
          text-align: center;
          text-transform: uppercase;
        }

        .welcome-text {
          color: white;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 15px;
          text-align: center;
          line-height: 1.3;
        }

        .welcome-subtext {
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 30px;
        }

        .mock-credentials {
          display: grid;
          gap: 10px;
          margin-bottom: 24px;
        }

        .mock-credentials button {
          width: 100%;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          padding: 10px 16px;
          color: white;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-transform: uppercase;
        }

        .mock-credentials button span {
          color: #c4d677;
          font-size: 11px;
          letter-spacing: 0.2em;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .input-group input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.08);
          color: white;
          backdrop-filter: blur(10px);
        }

        .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .input-group input:focus {
          outline: none;
          border-color: #a8b965;
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 0 4px rgba(168, 185, 101, 0.15);
        }

        .forgot-password {
          text-align: right;
          margin-bottom: 24px;
        }

        .forgot-password a {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .forgot-password a:hover {
          color: #c4d677;
        }

        .btn-login {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #a8b965 0%, #c4d677 100%);
          color: #2a2a2a;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(168, 185, 101, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-login:hover:enabled {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(168, 185, 101, 0.5);
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .status-message {
          margin-bottom: 16px;
          text-align: center;
          font-size: 14px;
          line-height: 1.5;
        }

        .status-message.error {
          color: #ffb5b5;
        }

        .status-message.success {
          color: #c4d677;
        }

        @media (max-width: 768px) {
          .container {
            padding: 40px 30px;
          }
          .logo {
            font-size: 36px;
          }
        }
      `}</style>

      <div className="login-wrapper">
        <div className="floating-hardware-1">
          <Image
            src={hardwareImages.one}
            alt="Premium hinge"
            width={250}
            height={400}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
            priority
          />
        </div>

        <div className="floating-hardware-2">
          <Image
            src={hardwareImages.two}
            alt="Channel"
            width={200}
            height={80}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div className="floating-hardware-3">
          <Image
            src={hardwareImages.three}
            alt="Drawer system"
            width={180}
            height={300}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div className="floating-hardware-4">
          <Image
            src={hardwareImages.four}
            alt="Channel detail"
            width={220}
            height={100}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div className="container">
          <div className="logo">
            {logoLabel === "MODIQ" ? (
              <>
                MODI<span>Q</span>
              </>
            ) : (
              logoLabel
            )}
          </div>
          <div className="tagline">modern & unique</div>

          <div className="welcome-text">Welcome to Luxury</div>
          <div className="welcome-subtext">Enter your access credentials to explore the partner showroom.</div>

          {error && (
            <p className="status-message error" role="alert">
              {error}
            </p>
          )}
          {successMessage && !error && <p className="status-message success">{successMessage}</p>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="name@studio.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="forgot-password">
              <Link href="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Signing you in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

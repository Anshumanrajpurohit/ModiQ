"use client"

import { SignIn, SignUp, useUser } from "@clerk/nextjs"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

const hardwareImages = {
  one: "/images/top-right-login.png",
  two: "/images/top-left-login.png",
  three: "/images/bottom-left-login.png",
  four: "/images/bottom-right-login.png",
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoaded, isSignedIn, user } = useUser()
  const [isFlipped, setIsFlipped] = useState(false)

  const nextParam = useMemo(() => {
    const next = searchParams?.get("next")
    return next?.startsWith("/") ? next : null
  }, [searchParams])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    const role = user?.publicMetadata?.role
    const safeDestination =
      nextParam && (!nextParam.startsWith("/admin") || role === "admin")
        ? nextParam
        : role === "admin"
          ? "/admin"
          : "/"

    router.replace(safeDestination)
  }, [isLoaded, isSignedIn, user, nextParam, router])

  const clerkAppearance = {
    variables: {
      colorPrimary: "#a5b867",
      colorText: "#3f3a34",
      colorTextSecondary: "#6f685f",
      colorBackground: "#fffdf8",
      colorInputBackground: "#f8f5ec",
      colorInputText: "#3f3a34",
      colorNeutral: "#d8d3c8",
      borderRadius: "16px",
    },
    elements: {
      card: { background: "transparent", boxShadow: "none", border: "none", padding: "0" },
      header: { display: "none" },
      footer: { display: "none" },
      formButtonPrimary: {
        background: "#a5b867",
        color: "#2f3224",
        borderRadius: "16px",
        boxShadow: "0 14px 30px rgba(148, 164, 85, 0.22)",
      },
      formButtonPrimary__hover: {
        background: "#96a65b",
        color: "#2f3224",
      },
      formFieldLabel: {
        color: "#5f5951",
        fontWeight: 600,
      },
      formFieldInput: {
        background: "#f8f5ec",
        borderColor: "#d9d4c8",
        color: "#3f3a34",
        borderRadius: "16px",
        boxShadow: "inset 0 1px 2px rgba(63, 58, 52, 0.04)",
      },
      formFieldInputShowPasswordButton: {
        color: "#7a746b",
      },
      identityPreviewText: {
        color: "#6f685f",
      },
      identityPreviewEditButton: {
        color: "#94a455",
      },
      footerActionLink: {
        color: "#94a455",
        fontWeight: 600,
      },
      formResendCodeLink: {
        color: "#94a455",
        fontWeight: 600,
      },
      otpCodeFieldInput: {
        background: "#f8f5ec",
        borderColor: "#d9d4c8",
        color: "#3f3a34",
      },
      alertText: {
        color: "#b42318",
      },
      alert: {
        background: "#fff3f2",
        borderColor: "#f3c6c3",
      },
      socialButtonsBlockButton: {
        background: "#fbf8f1",
        borderColor: "#ddd7ca",
        color: "#3f3a34",
      },
      dividerLine: {
        background: "#e2ddd2",
      },
      dividerText: {
        color: "#8a847a",
      },
    },
  } as const

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
          background:
            radial-gradient(circle at top, rgba(255, 255, 255, 0.95) 0%, rgba(247, 244, 236, 0.96) 32%, rgba(239, 234, 224, 0.98) 100%),
            linear-gradient(135deg, #fcfaf3 0%, #f2ede2 50%, #ece6db 100%);
          min-height: 100vh;
          overflow-x: hidden;
          color: #3f3a34;
        }

        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          position: relative;
        }

        .floating-hardware-1,
        .floating-hardware-2,
        .floating-hardware-3,
        .floating-hardware-4 {
          position: absolute;
          filter: blur(1.5px) opacity(0.46);
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
          filter: blur(2px) opacity(0.52);
        }

        .floating-hardware-2 {
          width: 200px;
          height: 80px;
          bottom: 20%;
          left: 5%;
        }

        .floating-hardware-3 {
          width: 180px;
          height: 300px;
          top: 25%;
          left: 12%;
        }

        .floating-hardware-4 {
          width: 220px;
          height: 100px;
          bottom: 15%;
          right: 10%;
        }

        .container {
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 1;
        }

        .card {
          background: rgba(255, 253, 248, 0.86);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          border: 1px solid rgba(217, 211, 200, 0.92);
          box-shadow:
            0 24px 60px rgba(63, 58, 52, 0.12),
            0 2px 0 rgba(255, 255, 255, 0.72) inset;
          padding: 40px 32px;
        }

        .logo {
          font-size: 48px;
          font-weight: 700;
          color: #3f3a34;
          margin-bottom: 8px;
          letter-spacing: 2px;
          text-align: center;
        }

        .logo span {
          color: #94a455;
        }

        .tagline {
          color: #94a455;
          font-size: 13px;
          margin-bottom: 32px;
          letter-spacing: 1.5px;
          text-align: center;
          text-transform: uppercase;
        }

        .welcome-text {
          color: #3f3a34;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 15px;
          text-align: center;
          line-height: 1.3;
        }

        .welcome-subtext {
          color: #6f685f;
          font-size: 15px;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 24px;
        }

        .flip-helper {
          margin-top: 20px;
          text-align: center;
          color: #776f65;
          font-size: 13px;
        }

        .flip-helper button {
          border: none;
          background: transparent;
          color: #94a455;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          margin-left: 6px;
        }

        .flip-helper button:hover {
          color: #7e8f43;
        }

        @media (max-width: 768px) {
          .card {
            padding: 32px 20px;
          }

          .logo {
            font-size: 36px;
          }
        }
      `}</style>

      <div className="login-wrapper">
        <div className="floating-hardware-1">
          <Image src={hardwareImages.one} alt="Premium hinge" width={250} height={400} style={{ width: "100%", height: "auto", objectFit: "contain" }} priority />
        </div>
        <div className="floating-hardware-2">
          <Image src={hardwareImages.two} alt="Channel" width={200} height={80} style={{ width: "100%", height: "auto", objectFit: "contain" }} />
        </div>
        <div className="floating-hardware-3">
          <Image src={hardwareImages.three} alt="Drawer system" width={180} height={300} style={{ width: "100%", height: "auto", objectFit: "contain" }} />
        </div>
        <div className="floating-hardware-4">
          <Image src={hardwareImages.four} alt="Channel detail" width={220} height={100} style={{ width: "100%", height: "auto", objectFit: "contain" }} />
        </div>

        <div className="container">
          <div className="card">
            <div className="logo">
              MODI<span>Q</span>
            </div>
            <div className="tagline">modern & unique</div>
            <div className="welcome-text">Welcome to Luxury</div>
            <div className="welcome-subtext">
              {isFlipped ? "Lets be a part of community" : "Enter your access credentials to explore the partner showroom."}
            </div>

            {!isFlipped ? (
              <>
                <SignIn
                  routing="hash"
                  signUpUrl="/login"
                  forceRedirectUrl="/"
                  appearance={clerkAppearance}
                />
                <div className="flip-helper">
                  Dont have an account?
                  <button type="button" onClick={() => setIsFlipped(true)}>
                    Create Account
                  </button>
                </div>
              </>
            ) : (
              <>
                <SignUp
                  routing="hash"
                  signInUrl="/login"
                  forceRedirectUrl="/"
                  appearance={clerkAppearance}
                />
                <div className="flip-helper">
                  Already a part?
                  <button type="button" onClick={() => setIsFlipped(false)}>
                    Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

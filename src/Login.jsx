

import { useState, useEffect } from "react";
// Import your assets - ensure paths are correct
import logo from "./assets/logo.png"; 
import loginLogo from "./assets/user.png";

export default function Login() {
  const [form, setForm] = useState({ user: "", pass: "", captcha: "" });
  const [captchaValue, setCaptchaValue] = useState("");

  const generateCaptcha = () => Math.floor(100000 + Math.random() * 900000).toString();

  useEffect(() => {
    setCaptchaValue(generateCaptcha());
  }, []);

const handleSubmit = async (e)=>{
 e.preventDefault();
 console.log("SUBMIT", form);
 if(form.captcha !== captchaValue){
   alert("Wrong captcha");
   return;
 }

 const res = await fetch("http://localhost:5000/login",{
   method:"POST",
   headers:{ "Content-Type":"application/json"},
   body: JSON.stringify({
     username: form.user,
     password: form.pass
   })
 });

 const data = await res.json();

 if(res.ok){
   localStorage.setItem("token",data.token);
    localStorage.setItem("role",data.role);

   if(data.role === "admin")
    window.location.href="/admin";
    else
    window.location.href="/dashboard";

 }else{
   alert(data);
 }
};

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const refreshCaptcha = () => setCaptchaValue(generateCaptcha());

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#e9ecef" }}>
      
      {/* 1. TOP YELLOW STRIP (4px height from your code) */}
      <div style={{ backgroundColor: "#FECD0B", height: "4px" }}></div>

      {/* 2. BLUE MAIN HEADER */}
        <header style={{ backgroundColor: "#003A6A", width: "100%" }}>
        <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">

      {/* LOGO */}
      <img
        src={logo}
        alt="NIT Jalandhar"
        style={{ height: "90px", width: "auto" }}
      />

      {/* TITLE */}
      <div className="text-white">
        <p
          style={{
            fontFamily: "Times New Roman",
            letterSpacing: "1px",
            fontSize: "22px",
            lineHeight: "30px",
            margin: 0
          }}
        >
          डॉ बी आर अम्बेडकर राष्ट्रीय प्रौद्योगिकी संस्थान, जालंधर<br />
          Dr B R Ambedkar National Institute of Technology, Jalandhar
        </p>
      </div>

    </div>
  </div>
</header>


      {/* 3. NAVBAR (navbar-inverse style) */}
      <nav style={{ backgroundColor: "#222", border: "none", padding: "10px 0" }}>
        <div className="container mx-auto px-4">
          <span style={{ 
            color: "#F7DC6F", 
            fontFamily: "Trebuchet MS", 
            fontSize: "22px",
            cursor: "pointer" 
          }}>
            | ERP - NITJ |
          </span>
        </div>
      </nav>

      {/* 4. LOGIN SECTION (Centered precisely like your code) */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div className="fade-in" style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          margin: "auto"
        }}>
          
          {/* Login Header with specific 30px spacing */}
          <div style={{ display: "flex", alignItems: "center", textAlign: "center", marginBottom: "2rem" }}>
            <img src={loginLogo} alt="Login Logo" style={{ width: "60px", display: "block" }} />
            <h1 style={{ 
              fontSize: "26px", 
              color: "#003a6a", 
              fontWeight: "bold", 
              fontFamily: "Arial, sans-serif",
              marginLeft: "30px" 
            }}>
              NITJ Mess Login
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Username:</label>
              <input
                type="text"
                name="user"
                value={form.user}
                onChange={handleChange}
                placeholder="Enter Username"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }}
                />

            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Password:</label>
              <input
                type="password"
                name="pass"
                value={form.pass}
                onChange={handleChange}
                placeholder="Enter Password"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }}
                />

            </div>

            <div className="flex items-center gap-4 pt-2">
              {/* LABEL */}
                <span style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#000"
                }}>
                  Captcha
                </span>

               <div style={{
                  backgroundColor: "#fff", 
                  borderRadius: "10px", 
                  border: "2px solid #Addaff",
                  padding: "5px 15px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  fontFamily: "serif italic"
               }}>
                 {captchaValue}
               </div>
            </div>

            <div style={{ display: "flex", marginTop: "10px" }}>
              <input
                type="text"
                name="captcha"
                value={form.captcha}
                onChange={handleChange}
                placeholder="Enter Captcha Here"
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px 0 0 4px" }}
                />

              <button 
                type="button"
                onClick={refreshCaptcha}
                style={{ padding: "0 15px", border: "1px solid #ccc", borderLeft: "none", borderRadius: "0 4px 4px 0", backgroundColor: "#eee" }}
              >
                ↻
              </button>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: "#337ab7",
                color: "white",
                padding: "10px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "bold",
                marginTop: "15px",
                border: "none",
                cursor: "pointer"
              }}
            >
              Login
            </button>
              <p style={{textAlign:"center"}}>
                New user? <a href="/register">Create account</a>
                </p>

            <div style={{ textAlign: "right", marginTop: "15px", marginRight: "20px" }}>
              <a href="#" style={{ color: "#990000", fontSize: "14px", textDecoration: "none" }}>Forgot Password?</a>
            </div>
          </form>
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer style={{ backgroundColor: "#003A6A", width: "100%", padding: "10px 0" }}>
        <p style={{ 
          color: "white", 
          fontFamily: "verdana", 
          fontSize: "13px", 
          textAlign: "center", 
          margin: 0,
          lineHeight: "20px"
        }}>
          Copyright 2026 © NIT Jalandhar<br />
          Developed by: Computer Centre, Dr. B.R. Ambedkar National Institute of Technology, Jalandhar
        </p>
      </footer>

      <style>{`
        .fade-in {
          animation: fadeIn 0.8s forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
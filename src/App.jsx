// import { useState } from "react";
// import logo from "./assets/logo.png";
// import user from "./assets/user.jpg";

// export default function App() {
//   const [form, setForm] = useState({ user: "", pass: "", captcha: "" });
//   const [captcha, setCaptcha] = useState(generateCaptcha());

//   function generateCaptcha() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   }

//   const handleChange = e => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const refreshCaptcha = () => setCaptcha(generateCaptcha());

//   const handleSubmit = e => {
//     e.preventDefault();

//     if (form.captcha !== captcha) {
//       alert("Invalid captcha");
//       refreshCaptcha();
//       return;
//     }

//     console.log("LOGIN DATA →", form);
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-200">

//       {/* HEADER */}
//       <header className="bg-[#0c3b66] text-white border-t-4 border-yellow-400">
//         <div className="max-w-6xl mx-auto flex items-center gap-4 p-4">
//           <img src={logo} className="h-14 w-14 object-contain"/>
//           <div>
//             <h1 className="text-xl font-semibold leading-tight">
//               Dr B R Ambedkar National Institute of Technology Jalandhar
//             </h1>
//             <p className="text-sm opacity-80">ERP Portal</p>
//           </div>
//         </div>
//       </header>

//       {/* STRIP */}
//       <div className="bg-black text-yellow-400 py-2 px-6 font-semibold">
//         | ERP - NITJ |
//       </div>

//       {/* LOGIN SECTION */}
//       <main className="flex-grow flex items-center justify-center">
//         <div className="bg-gray-100 shadow-xl rounded-xl w-[380px] p-8">

//           <div className="flex items-center gap-3 mb-6 justify-center">
//             <img src={user} className="w-24 h-24 object-contain"/>
//             <h2 className="text-xl font-bold text-[#0c3b66]">NITJ ERP Login</h2>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">

//             <div>
//               <label className="text-sm font-semibold">Username:</label>
//               <input
//                 name="user"
//                 value={form.user}
//                 onChange={handleChange}
//                 required
//                 placeholder="Enter Username"
//                 className="w-full border rounded px-3 py-2 mt-1"
//               />
//             </div>

//             <div>
//               <label className="text-sm font-semibold">Password:</label>
//               <input
//                 type="password"
//                 name="pass"
//                 value={form.pass}
//                 onChange={handleChange}
//                 required
//                 placeholder="Enter Password"
//                 className="w-full border rounded px-3 py-2 mt-1"
//               />
//             </div>

//             {/* CAPTCHA */}
//             <div>
//               <label className="text-sm font-semibold">Captcha</label>

//               <div className="flex items-center gap-2 mt-1">
//                 <div className="bg-white border rounded px-4 py-2 text-lg tracking-widest font-bold select-none">
//                   {captcha}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={refreshCaptcha}
//                   className="border px-3 py-2 rounded hover:bg-gray-200"
//                 >
//                   ↻
//                 </button>
//               </div>

//               <input
//                 name="captcha"
//                 value={form.captcha}
//                 onChange={handleChange}
//                 required
//                 placeholder="Enter Captcha Here"
//                 className="w-full border rounded px-3 py-2 mt-2"
//               />
//             </div>

//             <button className="w-full bg-[#2f6fa5] hover:bg-[#245c89] text-white py-2 rounded font-semibold">
//               Login
//             </button>

//             <p className="text-right text-sm text-red-600 cursor-pointer hover:underline">
//               Forgot Password?
//             </p>
//           </form>
//         </div>
//       </main>

//       {/* FOOTER */}
//       <footer className="bg-[#0c3b66] text-white text-center py-4 text-sm">
//         Copyright 2026 © NIT Jalandhar <br />
//         Developed by Computer Centre
//       </footer>
//     </div>
//   );
// }










import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Register from "./Register";
import Admin from "./Admin";

export default function App(){
 return(
  <BrowserRouter>
   <Routes>
     <Route path="/" element={<Login/>}/>
     <Route path="/dashboard" element={<Dashboard/>}/>
     <Route path="/register" element={<Register/>}/>
     <Route path="/admin" element={<Admin/>}/>
   </Routes>
  </BrowserRouter>
 )
}

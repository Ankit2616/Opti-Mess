import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import profile from "./assets/user1.jpeg";
import QRCode from "react-qr-code";

export default function Dashboard(){

  const [page,setPage] = useState(
  localStorage.getItem("dashboardPage") || "profile"
);


  const student = {
    name:"ANKIT SINGLA",
    roll:"23103015",
    branch:"Computer Science and Engineering",
    course:"B.Tech",
    batch:"2023",
    room:"B-203",
    email:"ankit@nitj.ac.in"
    
  };
  const [month,setMonth] = useState("2026-02");

const mealData = {
 "2026-02":[
  {date:"2026-02-01", breakfast:true, lunch:true, snacks:false, dinner:true},
  {date:"2026-02-02", breakfast:false, lunch:true, snacks:true, dinner:false},
  {date:"2026-02-03", breakfast:true, lunch:false, snacks:false, dinner:true},
  {date:"2026-02-04", breakfast:true, lunch:true, snacks:true, dinner:true}
 ],

 "2026-01":[
  {date:"2026-01-01", breakfast:true, lunch:false, snacks:false, dinner:true},
  {date:"2026-01-02", breakfast:false, lunch:false, snacks:false, dinner:false}
 ]
};


  return(
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
                  | MESS PORTAL - NITJ |
                </span>
              </div>
            </nav>


      {/* BODY */}
      <div style={{display:"flex"}}>

        {/* SIDEBAR */}
        <div style={{
          width:"260px",
          background:"#f4f6f9",
          minHeight:"100vh",
          borderRight:"1px solid #ddd"
        }}>

          <div style={{
            background:"#3c78a8",
            color:"white",
            padding:"15px",
            fontWeight:"bold"
          }}>
            Academic Menu
          </div>

          <MenuItem title="Profile" setPage={setPage} id="profile" current={page}/>
          <MenuItem title="Meal History" setPage={setPage} id="meals" current={page}/>
          <MenuItem title="Complaints" setPage={setPage} id="complaints" current={page}/>
          <MenuItem title="Feedback" setPage={setPage} id="feedback" current={page}/>
          <MenuItem title="Mess Manager" setPage={setPage} id="manager" current={page}/>


        </div>


        {/* MAIN CONTENT */}
        <div style={{flex:1,padding:"30px",background:"#eef2f7"}}>

          {page === "profile" && <Profile student={student}/>}

          {page === "meals" &&
            <MealHistory
                month={month}
                setMonth={setMonth}
                data={mealData}
            />
            }

          {page === "complaints" && <Complaints/>}

          {page === "feedback" && <Page title="Feedback Page"/>}

          {page === "manager" && <Page title="Mess Manager Page"/>}

        </div>

      </div>
    </div>
  );
}


/* SIDEBAR ITEM */

function MenuItem({title,setPage,id,current}){

 const active = current === id;

 const changePage = ()=>{
   setPage(id);
   localStorage.setItem("dashboardPage",id);
 };

 return(
  <div
    onClick={changePage}
    style={{
      padding:"14px 20px",
      borderBottom:"1px solid #ddd",
      cursor:"pointer",
      background: active ? "#d9edf7" : "white",
      color: active ? "#003A6A" : "#333",
      fontWeight: active ? "bold" : "normal",
      transition:"0.2s"
    }}
    onMouseEnter={e=>{
      if(!active) e.currentTarget.style.background="#eef6ff";
    }}
    onMouseLeave={e=>{
      if(!active) e.currentTarget.style.background="white";
    }}
  >
    {title}
  </div>
 )
}




/* PROFILE PAGE */

function Profile({student}){
 return(
  <div style={{
    background:"white",
    padding:"25px",
    borderRadius:"10px",
    boxShadow:"0 5px 15px rgba(0,0,0,0.08)"
  }}>

    <h2 style={{color:"#3c78a8",marginBottom:"20px"}}>
      Personal Details Verification
    </h2>

    <div style={{display:"flex",gap:"30px",flexWrap:"wrap"}}>

      {/* LEFT */}
      <div style={{textAlign:"center",minWidth:"200px"}}>

        <img src={profile}
          style={{
            width:"150px",
            height:"180px",
            objectFit:"cover",
            border:"1px solid #ccc"
          }}
        />

        <h3>{student.name}</h3>
        <b>{student.roll}</b>

        <div style={{marginTop:"15px"}}>
          <QRCode value={student.roll} size={120}/>
        </div>

      </div>

      {/* RIGHT */}
      <div style={{flex:1}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <tbody>

            <Row label="Roll No" value={student.roll}/>
            <Row label="Name" value={student.name}/>
            <Row label="Branch" value={student.branch}/>
            <Row label="Course" value={student.course}/>
            <Row label="Batch" value={student.batch}/>
            <Row label="Room" value={student.room}/>
            <Row label="Email" value={student.email}/>

          </tbody>
        </table>

      </div>

    </div>

  </div>
 )
}


/* REUSABLE ROW */

function Row({label,value}){
 return(
  <tr>
   <td style={cellLabel}>{label}</td>
   <td style={cellValue}>{value}</td>
  </tr>
 )
}

const cellLabel={
 border:"1px solid #ddd",
 padding:"10px",
 fontWeight:"bold",
 background:"#f7f7f7",
 width:"200px"
};

const cellValue={
 border:"1px solid #ddd",
 padding:"10px"
};


/* TEMP PAGES */

function Page({title}){
 return(
  <div style={{
    background:"white",
    padding:"40px",
    borderRadius:"10px",
    textAlign:"center",
    fontSize:"22px"
  }}>
    {title}
  </div>
 )
}


function MealHistory({month,setMonth,data}){

 const records = data[month] || [];

 return(
  <div style={{
    background:"white",
    padding:"25px",
    borderRadius:"10px",
    boxShadow:"0 5px 15px rgba(0,0,0,0.08)"
  }}>

    <h2 style={{color:"#3c78a8",marginBottom:"20px"}}>
      Monthly Meal Record
    </h2>

    {/* month selector */}
    <div style={{marginBottom:"20px"}}>
      <input
        type="month"
        value={month}
        onChange={e=>setMonth(e.target.value)}
        style={{
          padding:"8px",
          borderRadius:"6px",
          border:"1px solid #ccc"
        }}
      />
    </div>

    {/* table */}
    <table style={{width:"100%",borderCollapse:"collapse"}}>

      <thead style={{background:"#003A6A",color:"white"}}>
        <tr>
          <th style={th}>Date</th>
          <th style={th}>Breakfast</th>
          <th style={th}>Lunch</th>
          <th style={th}>Snacks</th>
          <th style={th}>Dinner</th>
        </tr>
      </thead>

      <tbody>

        {records.length===0 ? (
          <tr>
            <td colSpan="5" style={{textAlign:"center",padding:"20px"}}>
              No records found
            </td>
          </tr>
        ) : (

          records.map((day,i)=>(
            <tr key={i} style={{textAlign:"center"}}>

              <td style={td}>{day.date}</td>

              <td style={td}>{day.breakfast && "✔"}</td>
              <td style={td}>{day.lunch && "✔"}</td>
              <td style={td}>{day.snacks && "✔"}</td>
              <td style={td}>{day.dinner && "✔"}</td>

            </tr>
          ))

        )}

      </tbody>

    </table>

  </div>
 )
}


const th={
 padding:"12px",
 border:"1px solid #ddd"
};

const td={
 padding:"12px",
 border:"1px solid #ddd"
};


// -----------------------------------complaint-------------------------------------

function Complaints(){

 const student = {
  name: localStorage.getItem("name") || "ANKIT SINGLA",
  roll: localStorage.getItem("roll") || "23103015"
 };

 const [form,setForm] = useState({
  type:"",
  text:""
 });

 const [list,setList] = useState([]);


// ✅ LOAD COMPLAINTS WHEN PAGE OPENS
useEffect(()=>{
 fetchComplaints();
 const interval = setInterval(fetchComplaints,5000);
 return ()=>clearInterval(interval);
},[]);



const fetchComplaints = async ()=>{
 try{
   const res = await fetch(
     `http://localhost:5000/my-complaints/${student.roll}`
   );
   const data = await res.json();
   setList(Array.isArray(data)?data:[]);
 }
 catch{
   setList([]);
 }
};



 const handleChange = e =>
  setForm({...form,[e.target.name]:e.target.value});


 const submitComplaint = async e =>{
  e.preventDefault();

  if(!form.type || !form.text)
   return alert("Fill all fields");

  const complaintData = {
   ...form,
   studentName: student.name,
   roll: student.roll,
   status:"Pending",
   date:new Date().toISOString().slice(0,10)
  };

  // SEND TO BACKEND
  const res = await fetch("http://localhost:5000/complaint",{
   method:"POST",
   headers:{ "Content-Type":"application/json" },
   body: JSON.stringify(complaintData)
  });

  const data = await res.json();
  alert(data.message);

  fetchComplaints(); // reload list from DB
  setForm({type:"",text:""});
 };


 return(
  <div style={complaintCard}>

    <h2 style={{color:"#3c78a8",marginBottom:"20px"}}>
      Mess Complaint Portal
    </h2>


    {/* FORM */}
    <form onSubmit={submitComplaint}>

      <label>Complaint Type</label>
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        style={complaintInput}
      >
        <option value="">Select Issue</option>
        <option>Wrong Entry</option>
        <option>Food Quality</option>
        <option>Mess Worker Behaviour</option>
        <option>Cleanliness Issue</option>
        <option>Electrical Issue</option>
        <option>Furniture Issue</option>
        <option>Other</option>
      </select>


      <label>Description</label>
      <textarea
        name="text"
        value={form.text}
        onChange={handleChange}
        rows="4"
        style={complaintInput}
        placeholder="Describe your issue..."
      />

      <button style={complaintBtn}>Submit Complaint</button>
    </form>


    {/* HISTORY TABLE */}
    <h3 style={{marginTop:"40px",color:"#003A6A"}}>
      Complaint History
    </h3>

    <table style={complaintTable}>

      <thead style={{background:"#003A6A",color:"white"}}>
        <tr>
          <th style={complaintTh}>Date</th>
          <th style={complaintTh}>Type</th>
          <th style={complaintTh}>Description</th>
          <th style={complaintTh}>Status</th>
        </tr>
      </thead>

      <tbody>

        {list.length===0 ? (
          <tr>
            <td colSpan="4" style={{textAlign:"center",padding:"20px"}}>
              No complaints submitted
            </td>
          </tr>
        ) : (

          list.map((c,i)=>(
            <tr key={i}>
              <td style={complaintTd}>{c.date}</td>
              <td style={complaintTd}>{c.type}</td>
              <td style={complaintTd}>{c.text}</td>

              <td style={{
                ...complaintTd,
                color:c.status==="Resolved"?"green":"orange",
                fontWeight:"bold"
              }}>
                {c.status}
              </td>
            </tr>
          ))

        )}

      </tbody>

    </table>

  </div>
 )
}
const complaintCard = {
  background: "white",
  padding: "25px",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
};

const complaintInput = {
  width: "100%",
  padding: "10px",
  margin: "8px 0 15px 0",
  border: "1px solid #ccc",
  borderRadius: "6px"
};

const complaintBtn = {
  padding: "10px 20px",
  background: "#003A6A",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const complaintTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px"
};

const complaintTh = {
  padding: "10px",
  border: "1px solid #ddd"
};

const complaintTd = {
  padding: "10px",
  border: "1px solid #ddd"
};

// -----------------------------------complaint-------------------------------------

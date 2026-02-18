// import { useState } from "react";
// import logo from "./assets/logo.png";

// export default function Admin(){

//   // 🔐 protect page
//   const role = localStorage.getItem("role");
//   if(role !== "admin"){
//     window.location="/";
//   }

//   const [student,setStudent] = useState({
//     username:"",
//     password:""
//   });

//   const handleChange = e =>
//     setStudent({...student,[e.target.name]:e.target.value});

//   const addStudent = async e =>{
//     e.preventDefault();

//     const res = await fetch("http://localhost:5000/add-student",{
//       method:"POST",
//       headers:{ "Content-Type":"application/json"},
//       body: JSON.stringify(student)
//     });

//     const data = await res.json();
//     alert(data.message);

//     setStudent({username:"",password:""});
//   };

// const deleteStudent = async () => {

//  if(!student.username)
//    return alert("Enter roll number");

//  const confirmDelete = window.confirm("Are you sure?");
//  if(!confirmDelete) return;

//  const res = await fetch(
//   `http://localhost:5000/delete-student/${student.username}`,
//   { method:"DELETE" }
//  );

//  const data = await res.json();
//  alert(data.message);

//  setStudent({username:"",password:""});
// };

//   return (
//     <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:"#e9ecef"}}>

//       {/* top strip */}
//       <div style={{background:"#FECD0B",height:"4px"}}></div>

//       {/* header */}
//       <header style={{background:"#003A6A"}}>
//         <div style={{display:"flex",alignItems:"center",padding:"10px 30px"}}>
//           <img src={logo} style={{height:"80px"}} />

//           <div style={{color:"white",marginLeft:"20px"}}>
//             <h3 style={{margin:0,fontWeight:"normal"}}>
//                 डॉ बी आर अम्बेडकर राष्ट्रीय प्रौद्योगिकी संस्थान, जालंधर<br />
//               Dr B R Ambedkar National Institute of Technology, Jalandhar
//             </h3>
//             <p style={{margin:0,fontSize:"14px"}}>
//               Mess Administration Panel
//             </p>
//           </div>
//         </div>
//       </header>

//       {/* navbar */}
//       <nav style={{background:"#222",color:"#F7DC6F",padding:"10px 30px",fontSize:"20px"}}>
//         | ADMIN CONTROL PANEL |
//       </nav>

//       {/* main */}
//       <main style={{flex:1,display:"flex",justifyContent:"center",alignItems:"center"}}>

//         <div style={{
//           background:"white",
//           padding:"40px",
//           borderRadius:"12px",
//           boxShadow:"0 10px 20px rgba(0,0,0,0.1)",
//           width:"350px"
//         }}>

//         <h2 style={{
//         textAlign:"center",
//         color:"#003A6A",
//         fontSize:"19px",
//         fontWeight:"600",
//         marginBottom:"25px",
//         background:"#f1f6fb",
//         padding:"8px",
//         borderRadius:"6px"
//         }}>
//         New Student Registration
//         </h2>


//           <form onSubmit={addStudent}>

//             <label>Roll Number</label>
//             <input
//               name="username"
//               value={student.username}
//               onChange={handleChange}
//               required
//               style={inputStyle}
//             />

//             <label>Password</label>
//             <input
//               name="password"
//               value={student.password}
//               onChange={handleChange}
//               required
//               style={inputStyle}
//             />

//             <button style={btnStyle}>
//               Add Student
//             </button>

//           </form>
//             <hr style={{margin:"30px 0"}}/>

//             <h3 style={{textAlign:"center",color:"#990000"}}>Remove Student</h3>

//             <input
//             placeholder="Enter Roll Number"
//             value={student.username}
//             onChange={handleChange}
//             name="username"
//             style={inputStyle}
//             />

//             <button
//             onClick={deleteStudent}
//             style={{
//                 ...btnStyle,
//                 background:"#c9302c"
//             }}
//             >
//             Delete Student
//             </button>

//         </div>
//       </main>

//       {/* footer */}
//       <footer style={{background:"#003A6A",color:"white",textAlign:"center",padding:"10px"}}>
//         Copyright © 2026 NIT Jalandhar
//       </footer>
//     </div>
//   );
// }

// const inputStyle = {
//   width:"100%",
//   padding:"10px",
//   margin:"8px 0 15px 0",
//   border:"1px solid #ccc",
//   borderRadius:"5px"
// };

// const btnStyle = {
//   width:"100%",
//   padding:"10px",
//   background:"#337ab7",
//   color:"white",
//   border:"none",
//   borderRadius:"8px",
//   fontWeight:"bold",
//   cursor:"pointer"
// };



// -----------------------------------------------New code---------------------------------------------
import { useState, useEffect } from "react";
import logo from "./assets/logo.png";

export default function Admin(){

  const role = localStorage.getItem("role");
  if(role !== "admin") window.location="/";

  const [page,setPage] = useState(
  localStorage.getItem("adminPage") || "students"
);

  const [complaints,setComplaints] = useState([]);

  useEffect(()=>{
    if(page==="complaints") fetchComplaints();
  },[page]);

  const fetchComplaints = async ()=>{
    const res = await fetch("http://localhost:5000/all-complaints");
    const data = await res.json();
    setComplaints(data);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:"#e9ecef"}}>

      {/* top strip */}
      <div style={{background:"#FECD0B",height:"4px"}}></div>

      {/* header */}
      <header style={{background:"#003A6A"}}>
        <div style={{display:"flex",alignItems:"center",padding:"10px 30px"}}>
          <img src={logo} style={{height:"80px"}} />

          <div style={{color:"white",marginLeft:"20px"}}>
            <h3 style={{margin:0,fontWeight:"normal"}}>
              Dr B R Ambedkar National Institute of Technology, Jalandhar
            </h3>
            <p style={{margin:0,fontSize:"14px"}}>
              Mess Administration Panel
            </p>
          </div>
        </div>
      </header>

      {/* navbar */}
      <nav style={{background:"#222",color:"#F7DC6F",padding:"10px 30px"}}>
        | ADMIN CONTROL PANEL |
      </nav>


      {/* BODY */}
      <div style={{display:"flex",flex:1}}>

        {/* SIDEBAR */}
        <div style={{
          width:"250px",
          background:"#f4f6f9",
          borderRight:"1px solid #ddd"
        }}>

          <SideItem title="Student Manager" id="students" page={page} setPage={setPage}/>
          <SideItem title="View Complaints" id="complaints" page={page} setPage={setPage}/>

        </div>


        {/* CONTENT */}
        <div style={{flex:1,padding:"30px"}}>

          {page==="students" && <StudentManager/>}

          {page==="complaints" && 
            <ComplaintViewer list={complaints} refresh={fetchComplaints}/>
          }

        </div>

      </div>


      {/* footer */}
      <footer style={{background:"#003A6A",color:"white",textAlign:"center",padding:"10px"}}>
        Copyright © 2026 NIT Jalandhar
      </footer>
    </div>
  );
}



/* SIDEBAR ITEM */

function SideItem({title,id,page,setPage}){

 const active = page===id;

 const handleClick = ()=>{
   setPage(id);
   localStorage.setItem("adminPage",id);
 };

 return(
  <div
    onClick={handleClick}
    style={{
      padding:"15px",
      cursor:"pointer",
      borderBottom:"1px solid #ddd",
      background:active?"#d9edf7":"white",
      fontWeight:active?"bold":"normal"
    }}
  >
    {title}
  </div>
 )
}
/* STUDENT MANAGER PAGE */

function StudentManager(){

 const [student,setStudent] = useState({
  username:"",
  password:""
 });

 const handleChange = e =>
  setStudent({...student,[e.target.name]:e.target.value});

 const addStudent = async e =>{
  e.preventDefault();

  const res = await fetch("http://localhost:5000/add-student",{
   method:"POST",
   headers:{ "Content-Type":"application/json"},
   body: JSON.stringify(student)
  });

  const data = await res.json();
  alert(data.message);
  setStudent({username:"",password:""});
 };


 const deleteStudent = async ()=>{
  if(!student.username)
   return alert("Enter roll number");

  if(!window.confirm("Delete student?")) return;

  const res = await fetch(
   `http://localhost:5000/delete-student/${student.username}`,
   {method:"DELETE"}
  );

  const data = await res.json();
  alert(data.message);
  setStudent({username:"",password:""});
 };


 return(
  <div style={card}>

   <h2 style={title}>Student Manager</h2>

   <form onSubmit={addStudent}>

    <label>Roll Number</label>
    <input name="username" value={student.username} onChange={handleChange} style={input}/>

    <label>Password</label>
    <input name="password" value={student.password} onChange={handleChange} style={input}/>

    <button style={btn}>Add Student</button>

   </form>

   <hr style={{margin:"25px 0"}}/>

   <h3 style={{textAlign:"center",color:"#990000"}}>Delete Student</h3>

   <input
    placeholder="Enter Roll Number"
    name="username"
    value={student.username}
    onChange={handleChange}
    style={input}
   />

   <button onClick={deleteStudent} style={{...btn,background:"#c9302c"}}>
    Delete Student
   </button>

  </div>
 )
}



/* COMPLAINT VIEWER PAGE */

function ComplaintViewer({list,refresh}){

 const updateStatus = async (id)=>{

 const res = await fetch(
  `http://localhost:5000/update-status/${id}`,
  { method:"PUT" }
 );

 const data = await res.json();

 alert(data.message);

 refresh(); // refresh list after update
};


 return(
  <div style={card}>

   <h2 style={title}>Student Complaints</h2>

   <table style={table}>

    <thead style={{background:"#003A6A",color:"white"}}>
      <tr>
        <th style={th}>Date</th>
        <th style={th}>Roll</th>
        <th style={th}>Name</th>
        <th style={th}>Type</th>
        <th style={th}>Issue</th>
        <th style={th}>Status</th>
        <th style={th}>Action</th>
      </tr>
    </thead>

    <tbody>

     {list.map((c,i)=>(
      <tr key={i}>
        <td style={td}>{c.date}</td>
        <td style={td}>{c.roll}</td>
        <td style={td}>{c.studentName}</td>
        <td style={td}>{c.type}</td>
        <td style={td}>{c.text}</td>

        <td style={{
          ...td,
          color:c.status==="Resolved"?"green":"orange",
          fontWeight:"bold"
        }}>
          {c.status}
        </td>

        <td style={td}>
          <button
            onClick={()=>updateStatus(c._id)}
            style={{
              padding:"6px 12px",
              border:"none",
              borderRadius:"6px",
              cursor:"pointer",
              background:c.status==="Resolved"?"#f0ad4e":"#5cb85c",
              color:"white"
            }}
          >
            {c.status==="Resolved" ? "Mark Pending" : "Mark Resolved"}
          </button>
        </td>

      </tr>
     ))}

    </tbody>
   </table>

  </div>
 )
}




/* SHARED STYLES */

const card={
 background:"white",
 padding:"30px",
 borderRadius:"10px",
 boxShadow:"0 5px 15px rgba(0,0,0,0.1)"
};

const title={
 textAlign:"center",
 color:"#003A6A",
 marginBottom:"20px"
};

const input={
 width:"100%",
 padding:"10px",
 margin:"8px 0 15px 0",
 border:"1px solid #ccc",
 borderRadius:"6px"
};

const btn={
 width:"100%",
 padding:"10px",
 background:"#337ab7",
 color:"white",
 border:"none",
 borderRadius:"8px",
 fontWeight:"bold",
 cursor:"pointer"
};

const table={
 width:"100%",
 borderCollapse:"collapse"
};

const th={
 padding:"10px",
 border:"1px solid #ddd"
};

const td={
 padding:"10px",
 border:"1px solid #ddd"
};

import { useState } from "react";

export default function Register(){

 const [form,setForm] = useState({username:"",password:""});

 const handleChange = e =>
   setForm({...form,[e.target.name]:e.target.value});

 const handleSubmit = async e =>{
   e.preventDefault();

   const res = await fetch("http://localhost:5000/register",{
     method:"POST",
     headers:{ "Content-Type":"application/json"},
     body: JSON.stringify(form)
   });

   const data = await res.json();
   alert(data.message);
 };

 return(
  <form onSubmit={handleSubmit} style={{textAlign:"center",marginTop:"100px"}}>
   <h2>Create Account</h2>

   <input name="username" placeholder="Username" onChange={handleChange}/><br/><br/>
   <input name="password" placeholder="Password" onChange={handleChange}/><br/><br/>

   <button>Create Account</button>
  </form>
 )
}

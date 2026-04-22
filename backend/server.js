const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// DB connect
mongoose.connect("mongodb://127.0.0.1:27017/messDB")
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err));

// user model
// const User = mongoose.model("User", new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   }
// }));
const User = mongoose.model("User", new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "student", "worker", "dean"],
    default: "student"
  }
}));


// register user
app.post("/add-student", async (req,res)=>{
 try{
   const {username,password} = req.body;

   const exists = await User.findOne({username});
   if(exists)
     return res.status(400).json({message:"Student already exists"});

   const hash = await bcrypt.hash(password,10);

   await User.create({username,password:hash});

   res.json({message:"Student added"});
 }
 catch(err){
   res.status(500).json({message:"Server error"});
 }
});
// -------------------------------temporary------------------------------------------
// app.get("/create-admin", async (req,res)=>{
//  const hash = await bcrypt.hash("admin123",10);

//  await User.create({
//    username:"admin",
//    password:hash,
//    role:"admin"
//  });

//  res.send("Admin created");
// });
// -------------------------------temporary------------------------------------------

// login user
app.post("/login", async (req,res)=>{
 try{
  const {username,password} = req.body;

  const user = await User.findOne({username});
  if(!user)
    return res.status(400).json({message:"User not found"});

  const match = await bcrypt.compare(password,user.password);
  if(!match)
    return res.status(400).json({message:"Wrong password"});

const token = jwt.sign(
      { id: user._id, role: user.role },
      "secret123"
);

   res.json({
 token,
 role: user.role
});

 }catch(err){
  res.status(500).json({message:"Server error"});
 }
});


// app.get("/create-admin", async (req,res)=>{
//  const hash = await bcrypt.hash("admin123",10);

//  await User.create({
//    username:"admin",
//    password:hash,
//    role:"admin"
//  });

//  res.send("Admin created");
// });
app.post("/add-student", async (req,res)=>{
 try{
   const {username, password, role} = req.body;

   const exists = await User.findOne({username});
   if(exists)
     return res.json({message:"Student already exists"});

   const hash = await bcrypt.hash(password,10);

   await User.create({
  username,
  password: hash,
  role: role || "student"
});

   res.json({message:"Student added"});
 }
 catch{
   res.json({message:"Error adding student"});
 }
});

app.delete("/delete-student/:username", async (req,res)=>{
 try{
   const user = await User.findOneAndDelete({
     username:req.params.username,
     role:"student"
   });

   if(!user)
     return res.json({message:"Student not found"});

   res.json({message:"Student deleted"});
 }
 catch{
   res.json({message:"Error deleting student"});
 }
});


const Complaint = mongoose.model("Complaint",{
 roll:String,
 studentName:String,
 type:String,
 text:String,
 status:String,
 date:String
});

app.post("/complaint", async (req,res)=>{
 try{
  await Complaint.create(req.body);
  res.json({message:"Complaint submitted successfully"});
 }
 catch{
  res.json({message:"Server error"});
 }
});
app.get("/my-complaints/:roll", async (req,res)=>{
 const data = await Complaint.find({ roll:req.params.roll }).sort({date:-1});
 res.json(data);
});
app.get("/all-complaints", async (req,res)=>{
 try{
   const data = await Complaint.find().sort({ date:-1 });
   res.json(data);
 }
 catch{
   res.json([]);
 }
});

app.put("/update-status/:id", async (req,res)=>{
 try{
   const complaint = await Complaint.findById(req.params.id);

   if(!complaint)
     return res.json({message:"Complaint not found"});

   complaint.status =
     complaint.status === "Pending"
     ? "Resolved"
     : "Pending";

   await complaint.save();

   res.json({message:"Status updated successfully"});
 }
 catch(err){
   res.json({message:"Server error"});
 }
});


app.listen(5000,()=>console.log("Server running on port 5000"));


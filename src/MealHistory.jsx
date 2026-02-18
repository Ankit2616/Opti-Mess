import { useState } from "react";

export default function MealHistory(){

  // demo data (later will come from backend)
  const mealData = {
    "2026-02": [
      { date:"2026-02-01", breakfast:true, lunch:true, dinner:false },
      { date:"2026-02-02", breakfast:false, lunch:true, dinner:true },
      { date:"2026-02-03", breakfast:true, lunch:false, dinner:true },
      { date:"2026-02-04", breakfast:false, lunch:false, dinner:false },
      { date:"2026-02-05", breakfast:true, lunch:true, dinner:true }
    ],
    "2026-01": [
      { date:"2026-01-01", breakfast:true, lunch:true, dinner:true },
      { date:"2026-01-02", breakfast:false, lunch:true, dinner:false }
    ]
  };

  const [month,setMonth] = useState("2026-02");

  const records = mealData[month] || [];

  return (
    <div style={{padding:"30px"}}>

      {/* PAGE TITLE */}
      <h2 style={{
        textAlign:"center",
        color:"#003A6A",
        marginBottom:"20px"
      }}>
        Monthly Meal Consumption
      </h2>

      {/* MONTH SELECTOR */}
      <div style={{textAlign:"center",marginBottom:"20px"}}>
        <input
          type="month"
          value={month}
          onChange={e=>setMonth(e.target.value)}
          style={{
            padding:"8px 12px",
            borderRadius:"6px",
            border:"1px solid #ccc"
          }}
        />
      </div>

      {/* TABLE */}
      <div style={{overflowX:"auto"}}>
        <table style={{
          width:"100%",
          borderCollapse:"collapse",
          background:"white",
          boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
        }}>

          <thead style={{background:"#003A6A",color:"white"}}>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Breakfast</th>
              <th style={th}>Lunch</th>
              <th style={th}>Dinner</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="4" style={{textAlign:"center",padding:"20px"}}>
                  No records for this month
                </td>
              </tr>
            ) : (
              records.map((day,i)=>(
                <tr key={i} style={{textAlign:"center"}}>

                  <td style={td}>{day.date}</td>

                  <td style={td}>
                    {day.breakfast && "✔"}
                  </td>

                  <td style={td}>
                    {day.lunch && "✔"}
                  </td>

                  <td style={td}>
                    {day.dinner && "✔"}
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}

/* styles */
const th = {
  padding:"12px",
  border:"1px solid #ddd"
};

const td = {
  padding:"12px",
  border:"1px solid #ddd"
};

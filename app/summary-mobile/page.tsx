"use client";

import { useEffect, useState } from "react";
import { storage as localStorage } from "@/utils/storage";

export default function MobileSummaryPage() {

  const [data,setData] = useState<any[]>([]);
  const [exceptions,setExceptions] = useState<any[]>([]);
  const [collectedInvoices,setCollectedInvoices] = useState<string[]>([]);
  const [creditRules,setCreditRules] = useState<any[]>([]);
  const [permissions,setPermissions] = useState<any>({});


useEffect(()=>{

const load = async()=>{


const credit =
await fetch("/api/credit-data");

const creditData =
await credit.json();

setData(
 creditData.data || []
);



const ex =
await fetch("/api/exceptions");

setExceptions(
 await ex.json()
);



const col =
await fetch("/api/collection-data");

const colData =
await col.json();

setCollectedInvoices(
 colData.invoices || []
);



const user =
await localStorage.getItem(
"currentUser"
);


if(user){

const {data} =
await fetch(
`/api/credit-rules?username=${user}`
).then(r=>r.json());


setCreditRules(data || []);

}



const saved =
await localStorage.getItem(
"vanPermissions"
);

if(saved)
setPermissions(
JSON.parse(saved)
);


};


load();


},[]);



const filteredData =
data.filter((row)=>{


const normalize=(v:string)=>
String(v||"")
.replace(/^ATS\s+/i,"")
.replace(/\s+/g," ")
.trim()
.toUpperCase();



const rule =
creditRules.find(
r=>
normalize(r.payment_term)
===
normalize(row["Payment Term"])
);



const creditDays =
Number(row["Credit_Days"])||0;



return (

String(
row["Central Invoice"]
)
.trim()
.toUpperCase()
===
"NOT CENTRAL"

&&

!String(
row["Invoice status (Due/Overdue)"]
)
.toLowerCase()
.includes("legal")

&&

rule

&&

creditDays >=
rule.block_at_day

);


});



const vans =
Object.entries(

filteredData.reduce(
(acc:any,row)=>{


const van =
row["Van Code."];


if(!acc[van]){

acc[van]={
ids:new Set(),
remaining:0,
exceptions:0
};

}


acc[van].ids.add(
row["Employee ATS Code."]
);



const invoice =
String(row["Invoice #"])
.replace(/\s/g,"")
.toUpperCase();



const ex =
exceptions.some(
(e:any)=>
String(e.invoice)
.replace(/\s/g,"")
.toUpperCase()
===
invoice
);



const collected =
collectedInvoices.some(
(i)=>
String(i)
.replace(/\s/g,"")
.toUpperCase()
===
invoice
);



if(ex){

acc[van].exceptions++;

}
else if(!collected){

acc[van].remaining++;

}



return acc;


},{}

)

);



const getStatus=(r:number,e:number)=>{


if(r>0 && e>0)
return `${r} Remaining , Ex`;


if(r>0)
return `${r} Remaining`;


if(e>0)
return "Ex & All Collected";


return "All Collected";


};



return (

<div className="min-h-screen bg-slate-100 p-3">


<h1 className="
text-2xl
font-bold
mb-4
text-slate-800
">

Van Performance

</h1>


<div className="
bg-white
rounded-xl
shadow
overflow-hidden
">


<div className="
overflow-x-auto
">


<table className="
w-full
text-sm
">


<thead className="
bg-[#071d5c]
text-white
">


<tr>


<th className="p-3">
Status
</th>


<th className="p-3">
ID
</th>


<th className="p-3">
Van Code
</th>


<th className="p-3">
Permission
</th>


</tr>


</thead>



<tbody>


{
vans
.sort((a:any,b:any)=>
String(a[0])
.localeCompare(
String(b[0]),
undefined,
{
numeric:true
}
)
)
.map(([van,info]:any)=>(


<tr
key={van}
className="
border-b
"
>


<td className="p-3 text-center">


<span className={`
px-3
py-1
rounded-full
text-xs
font-bold

${
info.remaining===0
&&
info.exceptions===0
?
"bg-green-100 text-green-700"

:

info.remaining>0
?
"bg-pink-100 text-pink-700"

:

"bg-orange-100 text-orange-700"

}

`}>

{getStatus(
info.remaining,
info.exceptions
)}

</span>


</td>



<td className="p-3 text-center">

{[...info.ids].join(" / ")}

</td>



<td className="
p-3
text-center
font-bold
">

{van}

</td>



<td className="p-3 text-center">


<input

type="checkbox"

disabled

checked={
permissions[van] ?? false
}

/>


</td>


</tr>


))


}


</tbody>


</table>


</div>


</div>


</div>

);


}
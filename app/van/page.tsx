"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { storage as localStorage } from "@/utils/storage";

export default function MobileSummaryPage() {
const [searchTerm, setSearchTerm] = useState("");
const [isLoggedIn, setIsLoggedIn] = useState(false);

const [currentUser, setCurrentUser] = useState("");

const [selectedRegions, setSelectedRegions] =
  useState<string[]>([]);

const [selectedCities, setSelectedCities] =
  useState<string[]>([]);

const [selectedVans, setSelectedVans] =
  useState<string[]>([]);
  const [data,setData] = useState<any[]>([]);
  const [exceptions,setExceptions] = useState<any[]>([]);
  const [collectedInvoices,setCollectedInvoices] = useState<string[]>([]);
  const [creditRules,setCreditRules] = useState<any[]>([]);
  

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

const exceptionsData =
await ex.json();


const today = new Date();

today.setHours(0,0,0,0);


const validExceptions =
exceptionsData.filter((item:any)=>{

const tillDate =
new Date(item.till_date);

tillDate.setHours(0,0,0,0);


return (
item.permanent ||
tillDate >= today
);

});


setExceptions(validExceptions);



const col =
await fetch("/api/collection-data");

const colData =
await col.json();

setCollectedInvoices(
 colData.invoices || []
);



const currentUser =
await localStorage.getItem(
  "currentUser"
);

const { data: rules } =
await supabase
.from("credit_block_rules")
.select("*")
.eq("username", currentUser);

setCreditRules(
  rules || []
);
const savedFilters =
await localStorage.getItem(
  `savedFilters_${currentUser}`
);

if (savedFilters) {

  const filters =
    JSON.parse(savedFilters);

  setSelectedRegions(
    filters.regions || []
  );

  setSelectedCities(
    filters.cities || []
  );

  setSelectedVans(
    filters.vans || []
  );

}

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



const paymentTerm =
String(
row["Payment Term"] || ""
).trim();


const rule =
creditRules.find(
r =>
normalize(r.payment_term)
===
normalize(paymentTerm)
);


const creditDays =
Number(row["Credit_Days"])||0;


const showInvoice = rule
  ? creditDays >= rule.block_at_day
  : creditDays >= 1;

  const matchesFilters =

(
  selectedRegions.length === 0 ||
  selectedRegions.includes(
    row["Region"]
  )
)

&&

(
  selectedCities.length === 0 ||
  selectedCities.includes(
    row["City"]
  )
)

&&

(
  selectedVans.length === 0 ||
  selectedVans.includes(
    row["Van Code."]
  )
);
return (

matchesFilters

&&

String(
row["Central Invoice"]
)
.trim()
.toUpperCase()
===
"NOT CENTRAL"

&&


!String(
row["Invoice status (Due/ Overdue)"] || ""
)
.toLowerCase()
.includes("legal")


&&

showInvoice

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

const filteredVans = vans.filter(([van]) => {
  return String(van)
    .toLowerCase()
    .includes(searchTerm.toLowerCase().trim());
});
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

    <div className="mb-4">
  <input
    type="text"
    placeholder="Search Van Code..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="
      w-full
      h-10
      px-3
      text-sm
      border
      border-slate-300
      rounded-lg
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
      bg-white
    "
  />
</div>
    <div className="bg-white rounded-xl shadow overflow-hidden">

<div
  className="
overflow-x-auto
"
>

<table
  className="
w-full
text-sm
"
>

<thead
  className="
bg-[#071d5c]
text-white
"
>

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

</tr>

</thead>

<tbody>

{
filteredVans
.sort((a:any,b:any)=>
  String(a[0]).localeCompare(
    String(b[0]),
    undefined,
    { numeric:true }
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

<td
  className="
    p-3
    text-center
    font-bold
  "
>
  <Link
    href={`/van/${encodeURIComponent(String(van))}`}
    className="text-blue-600 underline"
  >
    {van}
  </Link>
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
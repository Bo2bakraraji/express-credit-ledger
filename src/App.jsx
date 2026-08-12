import {useEffect,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import './App.css';
const db=createClient('https://sddssihhredgeerpqfqw.supabase.co','sb_publishable_jpohOhZht8eDN2Pur3M9VQ_v0vfbeIf');
const money=n=>Number(n||0).toLocaleString()+' LBP';
export default function App(){
 const[session,setSession]=useState(),[me,setMe]=useState(),[customers,setCustomers]=useState([]),[type,setType]=useState(),[selected,setSelected]=useState();
 useEffect(()=>{db.auth.getSession().then(x=>setSession(x.data.session));return db.auth.onAuthStateChange((_e,s)=>setSession(s)).data.subscription.unsubscribe},[]);
 async function load(){let[p,c]=await Promise.all([db.from('profiles').select('*').eq('id',session.user.id).single(),db.from('customer_balances').select('*').order('name')]);setMe(p.data);setCustomers(c.data||[])}
 useEffect(()=>{if(session)load()},[session]);
 async function login(e){e.preventDefault();let f=new FormData(e.target),{error}=await db.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error)alert(error.message)}
 async function save(e){e.preventDefault();let f=new FormData(e.target),{error}=await db.rpc('add_ledger_transaction',{p_customer_id:selected.id,p_type:type,p_amount_lbp:Number(f.get('amount')),p_note:f.get('note')||null});if(error)alert(error.message);else{setType();load()}}
 async function add(e){e.preventDefault();let f=new FormData(e.target),{error}=await db.from('customers').insert({name:f.get('name'),credit_limit_lbp:Number(f.get('limit')),active:true,created_by:session.user.id});if(error)alert(error.message);else{e.target.reset();load()}}
 if(!session)return <main className="login"><form onSubmit={login}><small>EXPRESS</small><h1>Credit Ledger</h1><input name="email" type="email" placeholder="Email" required/><input name="password" type="password" placeholder="Password" required/><button>Sign in</button><p>Create your accounts first in Supabase Authentication.</p></form></main>;
 if(!me)return <div className="login">Loading…</div>;
 let total=customers.reduce((a,c)=>a+Number(c.balance_lbp),0);
 return <div className="app"><header><div><small>EXPRESS</small><h1>Credit Ledger</h1></div><b>{me.display_name[0]}</b></header><main><section className="total"><p>Total outstanding</p><h2>{money(total)}</h2><span>${(total/90000).toFixed(2)}</span></section><h2>Record a transaction</h2><div className="cards">{customers.filter(c=>c.active).map(c=><article key={c.id}><h3>{c.name}</h3><p>{money(c.balance_lbp)} owed</p><small>Available: {money(c.available_credit_lbp)}</small><div><button onClick={()=>{setSelected(c);setType('charge')}}>↑ Took goods</button><button onClick={()=>{setSelected(c);setType('payment')}}>↓ Paid</button></div></article>)}</div>{me.role==='owner'&&<form className="add" onSubmit={add}><h2>Add approved customer</h2><input name="name" placeholder="Customer name" required/><input name="limit" placeholder="Credit limit in LBP" inputMode="numeric" required/><button>Save customer</button></form>}</main><footer>{me.display_name} · {me.role}<button onClick={()=>db.auth.signOut()}>Sign out</button></footer>{type&&<div className="shade"><form className="modal" onSubmit={save}><button type="button" onClick={()=>setType()}>×</button><h2>{type==='charge'?'Goods taken':'Payment'}</h2><h3>{selected.name}</h3><input name="amount" placeholder="Amount in LBP" inputMode="numeric" required autoFocus/><input name="note" placeholder="Note (optional)"/><button>Confirm</button></form></div>}</div>
}

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const API = (typeof window !== 'undefined' && window.__BACKEND_URL__) || process.env.REACT_APP_BACKEND_URL || '';
const PUBLISHABLE_KEY = (typeof window !== 'undefined' && window.__STRIPE_PUBLISHABLE_KEY__) || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_replace_with_yours';
const stripePromise = loadStripe(PUBLISHABLE_KEY);

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [groups, setGroups] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/api/dashboard`);
      const data = await res.json();
      if (data.transactions && data.groups) {
        setTransactions(data.transactions);
        setGroups(data.groups);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleYocoPayment = async () => {
    const amount = parseInt(prompt('Enter amount for Yoco payment in ZAR'));
    if (!amount) return;
    const res = await fetch(`${API}/api/yoco-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (data.success) fetchData();
  };

  const handleStripePayment = async () => {
    const amount = parseInt(prompt('Enter amount for Stripe payment in ZAR'));
    if (!amount) return;
    const res = await fetch(`${API}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount * 100, description: 'Ubuntu Savings Group payment' }),
    });
    const { sessionId } = await res.json();
    const stripe = await stripePromise;
    if (!stripe) {
      alert('Stripe failed to load. Check publishable key.');
      return;
    }
    await stripe.redirectToCheckout({ sessionId });
  };

  return (
    <div style={{padding:24}}>
      <h1 style={{fontSize:24, fontWeight:700}}>Ubuntu Savings Group — Dashboard</h1>
      <div style={{marginTop:16, marginBottom:16}}>
        <h2 style={{fontSize:18, fontWeight:600}}>Groups</h2>
        <table style={{width:'100%', borderCollapse:'collapse', marginTop:8}}>
          <thead>
            <tr style={{background:'#f3f4f6'}}>
              <th style={{padding:8, border:'1px solid #e5e7eb'}}>Group</th>
              <th style={{padding:8, border:'1px solid #e5e7eb'}}>Members</th>
              <th style={{padding:8, border:'1px solid #e5e7eb'}}>Balance (ZAR)</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id} style={{textAlign:'center'}}>
                <td style={{padding:8, border:'1px solid #e5e7eb'}}>{g.name}</td>
                <td style={{padding:8, border:'1px solid #e5e7eb'}}>{g.members}</td>
                <td style={{padding:8, border:'1px solid #e5e7eb'}}>R{g.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{marginBottom:16}}>
        <button onClick={handleYocoPayment} style={{background:'#059669', color:'white', padding:'8px 12px', borderRadius:6, marginRight:8}}>Pay with Yoco</button>
        <button onClick={handleStripePayment} style={{background:'#6366f1', color:'white', padding:'8px 12px', borderRadius:6}}>Pay with Stripe</button>
      </div>

      <div>
        <h2 style={{fontSize:18, fontWeight:600}}>Transactions</h2>
        <table style={{width:'100%', borderCollapse:'collapse', marginTop:8}}>
          <thead>
            <tr style={{background:'#f3f4f6'}}>
              <th style={{padding:8, border:'1px solid #e5e7eb'}}>ID</th>
              <th style={{padding:8, border:'1px solid #e5e7eb'}}>Group</th>
              <th style={{padding:8, border:'1px solid #e5e7eb'}}>Member</th>
              <th style={{padding:8, border:'1px solid #e5e7eb'}}>Amount (ZAR)</th>
              <th style={{padding:8, border:'1px solid #e5e7eb'}}>Method</th>
              <th style={{padding:8, border:'1px solid #e5e7eb'}}>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} style={{textAlign:'center'}}>
                <td style={{padding:8, border:'1px solid #e5e7eb'}}>{tx.id}</td>
                <td style={{padding:8, border:'1px solid #e5e7eb'}}>{tx.group}</td>
                <td style={{padding:8, border:'1px solid #e5e7eb'}}>{tx.member}</td>
                <td style={{padding:8, border:'1px solid #e5e7eb'}}>R{tx.amount}</td>
                <td style={{padding:8, border:'1px solid #e5e7eb'}}>{tx.method}</td>
                <td style={{padding:8, border:'1px solid #e5e7eb'}}>{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

import './App.css';
import axios from 'axios'
import React, { useEffect, useState } from 'react';

function App() {
  const [responseId, setResponseId] = useState("");
  const [responseState, setResponseState] = useState([]);
  const [amount, setAmount] = useState(0); // Added state for amount

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = (amt) => {
    setAmount(amt); // Set amount in state
    let data = JSON.stringify({
      amount: amt * 100,
      currency: "INR"
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://localhost:5000/orders",
      headers: { 'Content-Type': 'application/json' },
      data: data
    };

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        handleRazorpayScreen(response.data.amount);
      })
      .catch((error) => {
        console.log("Error at", error);
      });
  };

  const handleRazorpayScreen = async (amt) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Some error at Razorpay screen loading");
      return;
    }

    const options = {
      key: 'rzp_test_t5oXX1D06xFAam',
      amount: amt,
      currency: 'INR',
      name: "Papaya Coders",
      description: "Payment to Papaya Coders",
      image: "https://papayacoders.com/demo.png",
      handler: function (response) {
        setResponseId(response.razorpay_payment_id);
      },
      prefill: {
        name: "Papaya Coders",
        email: "papayacoders@gmail.com"
      },
      theme: {
        color: "#F4C430"
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const paymentFetch = (e) => {
    e.preventDefault();
    const paymentId = e.target.paymentId.value;

    axios.get(`http://localhost:5000/payment/${paymentId}`)
      .then((response) => {
        console.log(response.data);
        setResponseState(response.data);
      })
      .catch((error) => {
        console.log("Error occurs", error);
      });
  };

  useEffect(() => {
    if (!responseId) return; // Prevent running when responseId is empty

    let data = JSON.stringify({
      amount: amount * 100, // Use the stored amount from state
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:5000/capture/${responseId}`,
      headers: { 'Content-Type': 'application/json' },
      data: data
    };

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log("Error at", error);
      });
  }, [responseId, amount]); // Include amount in dependency array

  return (
    <div className="App">
      <button onClick={() => createRazorpayOrder(100)}>Payment of 100Rs.</button>
      {responseId && <p>{responseId}</p>}
      <h1>This is a payment verification form</h1>
      <form onSubmit={paymentFetch}>
        <input type="text" name="paymentId" />
        <button type="submit">Fetch Payment</button>
        {responseState.length !== 0 && (
          <ul>
            <li>Amount: {responseState.amount / 100} Rs.</li>
            <li>Currency: {responseState.currency}</li>
            <li>Status: {responseState.status}</li>
            <li>Method: {responseState.method}</li>
          </ul>
        )}
      </form>
    </div>
  );
}

export default App;

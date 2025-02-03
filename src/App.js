import './App.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Success from './components/Success';
import Canceled from './components/Canceled';

function PaymentPage() {
  const [responseId, setResponseId] = useState("");
  const [responseState, setResponseState] = useState([]);
  const [amount, setAmount] = useState(0);
  const navigate = useNavigate(); // React Router navigation

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (amt) => {
    try {
      setAmount(amt);
      const response = await axios.post("http://localhost:5000/orders", {
        amount: amt * 100,
        currency: "INR",
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("Order Response:", response.data.amount);
      handleRazorpayScreen(response.data.amount);

    } catch (error) {
      console.error("Error creating Razorpay order:", error);
    }
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
      name: "Happy Coders",
      description: "Payment to Happy Coders",
      image: "https://papayacoders.com/demo.png",
      handler: function (response) {
        setResponseId(response.razorpay_payment_id);
        navigate("/success"); // Redirect to success page
      },
      prefill: {
        name: "Happu",
        email: "0000ankit0000jangid@gmail.com"
      },
      theme: {
        color: "#F2C830"
      },
      modal: {
        ondismiss: function () {
          navigate("/canceled"); // Redirect to canceled page if closed
        }
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
    if (!responseId) return;

    let data = JSON.stringify({
      amount: amount * 100,
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
  }, [responseId, amount]);

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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        <Route path="/success" element={<Success />} />
        <Route path="/canceled" element={<Canceled />} />
      </Routes>
    </Router>
  );
}

export default App;

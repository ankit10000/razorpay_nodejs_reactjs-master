import React, { useEffect, useState } from 'react';

function Canceled() {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prevCountdown => prevCountdown - 1);
        }, 1000);

        setTimeout(() => {
            window.location.href = '/';
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div>
                <h1>Payment Cancelled</h1>
                <p>Your payment has been cancelled. You will be redirected to the home page in {countdown} seconds.</p>
            <a href='/'> menu</a>
            </div>
        </>
    );
}

export default Canceled;
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/funds");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
        <div className="text-4xl mb-2">❌</div>
        <h2 className="text-xl font-semibold mb-2 text-red-600">
          Payment Failed
        </h2>
        <p className="text-gray-600">Redirecting back to your funds...</p>
      </div>
    </div>
  );
};

export default PaymentFailure;


import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useSelector } from "react-redux";

const stripePromise = loadStripe(
  "pk_test_51QUbuQBNxhTEZVvqlGJJRsFrs5tEA2Rfeec9fTp8jGo16YVz6VO8pKdCX3ORAEV5e9D9tHQlocwFfoOXQCdrvpTe00FMTnSs2d"
);

export default function PaymentForm({ amount, name,booked_id,category }) {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(true); 
  const token = useSelector((state) => state.auth.token);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
   
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Stripe failed to load.");
        return;
      }
  
      console.log("Creating checkout session...");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/booked-checkout-session/",
        { booked_id, amount, name,category },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
  
      const session = response.data;
      console.log("Session created:", session);
  
      if (session.id) {
        console.log("Redirecting to checkout...");
        const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
        if (error) throw error;
      } else {
        throw new Error("Session ID is missing.");
      }
    } catch (err) {
      console.error("Error during payment:", err.response ? err.response.data : err.message);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  // Function to handle cancel action (close the modal)
  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center ${
        modalVisible ? "fixed top-0 left-0 z-50" : ""
      }`}
    >
      {modalVisible && (
        <div className="w-full h-screen absolute bg-[#030c10] bg-opacity-70 flex justify-center items-center">
          <div className="bg-[#F6F6F6] w-96 p-8 rounded-lg shadow-2xl border border-[#287094]">
            <h2 className="text-2xl font-semibold text-center mb-4 text-[#023246]">
              Complete Your Payment
            </h2>
            <p className="text-center mb-6 text-[#023246]">
              You're about to pay <span className="font-bold text-[#287094]">₹{amount}</span>{" "}
              for <span className="font-bold text-[#287094]">{name}</span>.
            </p>
            <form onSubmit={handleSubmit} className="text-center">
              <button
                type="submit"
                disabled={loading}
                className={`w-[50%] px-4 py-2 text-white font-semibold rounded-md mb-4 transition-colors duration-300 ${
                  loading
                    ? "bg-[#D4D4CE] cursor-not-allowed text-[#023246]"
                    : "bg-[#287094] hover:bg-[#023246]"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 animate-spin mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291a7.963 7.963 0 01-2-5.291H0c0 2.387.832 4.567 2.219 6.281l1.781-1.49z"
                      ></path>
                    </svg>
                    <span className="text-[#023246]">Processing...</span>
                  </div>
                ) : (
                  `Pay ₹${amount}`
                )}
              </button>
            </form>
            <button
              onClick={handleCancel}
              className="w-[50%] px-4 py-2 text-[#023246] font-semibold rounded-md border border-[#287094] hover:bg-[#D4D4CE] mt-2 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState({ email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      if (response.ok) {
        toast.success("Feedback submitted successfully!", {
          position: "top-center",
        });
        setFeedback({ email: "", message: "" }); // Reset form
      } else {
        toast.error("Failed to submit feedback.");
      }
    } catch (error) {
      toast.error("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ marginTop: "30px" }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{ width: "400px", borderRadius: "15px" }}
      >
        <h3 className="text-center mb-4 text-primary">Feedback Form</h3>
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          {/* <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={feedback.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div> */}

          {/* Message Input */}
          <div className="mb-3">
            <label className="form-label">Your Feedback</label>
            <textarea
              name="message"
              className="form-control"
              rows="4"
              value={feedback.message}
              onChange={handleChange}
              placeholder="Share your thoughts..."
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>

      {/* Toast Notification */}
      <ToastContainer />
    </div>
  );
};

export default FeedbackForm;

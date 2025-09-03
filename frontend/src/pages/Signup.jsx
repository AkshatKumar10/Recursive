import React, { useState } from "react";
import { auth } from "../src/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(to bottom right, #bdc3c7, #2c3e50)",
      }}
    >
      <div className="max-w-md w-full bg-white bg-opacity-90 rounded-3xl p-10 shadow-xl border border-gray-200">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
          Create Account
        </h2>
        {error && (
          <p className="text-red-600 mb-6 text-center font-medium">{error}</p>
        )}
        <form onSubmit={handleSignUp} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
            required
          />
          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
            required
            minLength={6}
          />
          <button
            type="submit"
            className="w-full py-4 rounded-full bg-gradient-to-r from-indigo-700 to-blue-600 text-white font-semibold hover:from-indigo-800 hover:to-blue-700 shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-8 text-center text-gray-700 font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-700 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

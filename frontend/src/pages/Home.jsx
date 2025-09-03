import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  const signOut = async () => {
    const auth = getAuth();
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom right, #bdc3c7, #2c3e50)",
      }}
    >
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 ">
        <div className="text-2xl font-bold text-black tracking-tight">
          CONSUMER JUSTICE
        </div>
        <div className="flex space-x-8 items-center">
          <a
            href="#how-it-works"
            className="text-gray-300 hover:text-black transition-colors duration-200 font-medium"
          >
            How It Works
          </a>
          <a
            href="#about"
            className="text-gray-300 hover:text-black transition-colors duration-200 font-medium"
          >
            About
          </a>

          {!user ? (
            <Link
              to="/login"
              className="px-6 py-2 bg-blue-700 text-white rounded-full font-medium hover:bg-blue-800 transition-colors duration-200"
            >
              Sign In
            </Link>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setShowLogout(true)}
              onMouseLeave={() => setShowLogout(false)}
            >
              <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center cursor-pointer select-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 18c0-2.67 5.33-4 6-4s6 1.33 6 4v2H6v-2z" />
                </svg>
              </div>

              {showLogout && (
                <button
                  onClick={signOut}
                  className="absolute top-full right-0 px-4 py-2 bg-red-600 text-white rounded shadow-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-24 px-6 ">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-black leading-tight mb-8 tracking-tight">
            Fight for your
            <br />
            <span className="text-gray-800">consumer rights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            From Fraud to Justice — Instantly Know Your Rights, Settle Smart,
            and File Complaints Hassle-Free.
          </p>

          <a
            href="http://localhost:7000/dev-ui?app=manager_agent"
            rel="noopener noreferrer"
            className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            FILE A COMPLAINT
          </a>
        </div>
      </section>

      {/* Why Use Us Section */}
      <section id="how-it-works" className="py-24 px-6 ">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-black mb-20 tracking-tight">
            Why Use Us?
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Instant Complaint Classification */}
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 border-3 border-black rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-lg">
                <svg
                  className="w-12 h-12 mx-auto block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 18"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-6 leading-tight">
                Instant Complaint
                <br />
                Classification
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We instantly check if your issue falls under the Consumer
                Protection Act using advanced AI technology
              </p>
            </div>

            {/* Settlement Suggestions */}
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 border-3 border-black rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-lg">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-6 leading-tight">
                Settlement Suggestions
                <br />
                You Can Use Today
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our system provides clear, step-by-step settlement strategies
                that you can start applying immediately
              </p>
            </div>

            {/* Auto-Filing */}
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 border-3 border-black rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-lg">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-6 leading-tight">
                Auto-Filing with
                <br />
                Government Portal
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Once you approve, our automated system files your complaint
                directly in the official government portal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Video Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-black mb-16 tracking-tight">
            How to Use
          </h2>

          {/* Glass Morphism Video Card */}
          <div className="relative">
            {/* Main glass card */}
            <div className="relative backdrop-blur-xl bg-black/5 border border-gray-400/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:backdrop-blur-2xl hover:bg-black/10">
              {/* Video container */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black/5 backdrop-blur-sm border border-gray-300/10">
                <video
                  className="w-full h-auto max-h-96 object-cover"
                  controls
                  autoPlay={true}
                  loop={true}
                  preload="metadata"
                >
                  <source src="/dem.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Video description */}
              <div className="mt-6 text-center">
                <p className="text-lg text-gray-800 font-medium leading-relaxed">
                  Watch how our AI-powered platform simplifies consumer
                  complaint filing in just 3 easy steps
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-gray-200/30 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-tl from-black/10 to-transparent rounded-full blur-3xl"></div>
      </section>

      {/* Additional Features Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-black mb-20 tracking-tight">
            Our Services
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* AI-Powered Complaint Check */}
            <div className="text-center group p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-8 border-3 border-black rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-6 leading-tight">
                AI-Powered
                <br />
                Complaint Check
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Instantly verify if your case falls under the Consumer
                Protection Act before you invest time and effort
              </p>
            </div>

            {/* Legal Draft Generation */}
            <div className="text-center group p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-8 border-3 border-black rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-6 leading-tight">
                Legal Draft
                <br />
                Generation
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Get professionally formatted, ready-to-submit complaint letters
                written in proper legal format
              </p>
            </div>

            {/* Direct Government Filing */}
            <div className="text-center group p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-8 border-3 border-black rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-6 leading-tight">
                Direct Government
                <br />
                Filing
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                We handle the entire filing process by submitting your complaint
                directly to the official government portal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-300 text-lg mb-2">
            © {new Date().getFullYear()} Consumer Justice Platform | Empowering
            Consumer Rights Through AI
          </p>
          <p className="text-gray-400 text-sm">
            Developed by Team ModelA2 | Making Legal Justice Accessible to All
          </p>
        </div>
      </footer>
    </div>
  );
}

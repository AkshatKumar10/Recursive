import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RootLayout from "./RootLayout";
import Home from "./pages/Home";
// import { AuthProvider } from "./context/AuthContext"; // example context

export default function App() {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </RootLayout>
    </Router>
  );
}

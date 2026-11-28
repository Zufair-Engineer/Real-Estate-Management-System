
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/authContext";

import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/LogIn";
import Register from "./pages/auth/Register";
import Home from "./pages/Home/Home"


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />

        <Routes>

          {/* Guest Routes */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Add protected authentication-related pages here */}
            <Route path="/" element={<Home />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

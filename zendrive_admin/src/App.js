import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CarsList from "./pages/CarsList";
import CarForm from "./pages/CarForm";
import Brands from "./pages/Brands";
import BodyTypes from "./pages/BodyTypes";
import Inquiries from "./pages/Inquiries";
import ContactInfo from "./pages/ContactInfo";
import SocialMedia from "./pages/SocialMedia";
import { MobileProvider, useMobile } from "./context/MobileContext";

const isAuthed = () => !!localStorage.getItem("admin_token");

function Protected({ children }) {
  const loc = useLocation();
  if (!isAuthed()) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

function Shell({ children }) {
  const { isMobile } = useMobile();

  return (
    <div className="flex min-h-screen bg-zen-bg">
      <Sidebar />
      <div className={`flex-1 flex flex-col min-h-screen ${isMobile ? "ml-0" : "ml-64"}`}>
        <TopBar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MobileProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <Protected>
            <Shell>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/cars" element={<CarsList />} />
                <Route path="/cars/new" element={<CarForm />} />
                <Route path="/cars/:id" element={<CarForm />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/body-types" element={<BodyTypes />} />
                <Route path="/inquiries" element={<Inquiries />} />
                <Route path="/contact-info" element={<ContactInfo />} />
                <Route path="/social-media" element={<SocialMedia />} />
              </Routes>
            </Shell>
          </Protected>
        } />
      </Routes>
    </MobileProvider>
  );
}

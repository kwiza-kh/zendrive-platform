import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetail from "./pages/CarDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import MyInquiries from "./pages/MyInquiries";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-zen-bg relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-[-10%] h-96 w-96 rounded-full bg-accent/10 blur-3xl float-gentle" />
          <div className="absolute top-1/3 right-[-12%] h-[28rem] w-[28rem] rounded-full bg-ink-900/5 blur-3xl animate-drift" />
        </div>
        <Navbar />
        <main className="flex-1 relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:slug" element={<CarDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/my-inquiries" element={<MyInquiries />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

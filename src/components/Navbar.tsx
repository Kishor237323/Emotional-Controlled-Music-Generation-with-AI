import React, { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { Music, Library, Home, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
      ${scrolled ? "bg-black/70 backdrop-blur-xl shadow-lg" : "bg-transparent"}
    `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink
            to="/"
            aria-label="Go to homepage"
            className="flex items-center gap-2 text-white font-semibold text-lg"
          >
            <Music className="h-6 w-6 text-white" />
            <span>EmoMusic</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">

            <NavLink
              to="/"
              className="flex items-center gap-1 text-white hover:text-white/70 transition"
              activeClassName="text-white font-semibold"
            >
              <Home className="h-5 w-5 text-white" />
              Home
            </NavLink>

            <NavLink
              to="/library"
              className="flex items-center gap-1 text-white/90 hover:text-white transition"
              activeClassName="text-white font-semibold"
            >
              <Library className="h-5 w-5 text-white" />
              Library
            </NavLink>

            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5 text-white" />
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </Button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 mt-2 bg-black/60 rounded-lg backdrop-blur-xl">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-white hover:bg-white/10 rounded-md"
            >
              Home
            </NavLink>
            <NavLink
              to="/library"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-white hover:bg-white/10 rounded-md"
            >
              Library
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-purple to-primary-pink rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-bold text-text-dark">EduNet</span>
          </div>

          {/* Right side - Navigation and Social */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
            {/* Navigation links */}
            <nav className="flex flex-wrap items-center space-x-6 text-sm">
              <Link to="/about" className="text-text-gray hover:text-text-dark transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-text-gray hover:text-text-dark transition-colors">
                Contact
              </Link>
              <Link to="/faq" className="text-text-gray hover:text-text-dark transition-colors">
                FAQ
              </Link>
            </nav>

            {/* Social media icons */}
            <div className="flex items-center space-x-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-gray hover:text-text-dark"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-gray hover:text-text-dark"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-gray hover:text-text-dark"
                aria-label="Telegram"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border-light text-center">
          <p className="text-sm text-text-gray">
            © 2024 EduNet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
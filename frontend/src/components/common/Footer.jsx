/**
 * ============================================
 * Footer Component
 * Made by Hammad Naeem
 * ============================================
 */

import React from 'react';

function Footer() {
    return (
        <footer className="footer">
            <p>
                © {new Date().getFullYear()} Sales Analytics ERP System | 
                Developed by <a href="#" onClick={(e) => e.preventDefault()}>Hammad Naeem</a> | 
                Final Year Project
            </p>
        </footer>
    );
}

export default Footer;
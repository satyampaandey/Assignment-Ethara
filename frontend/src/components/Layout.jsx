import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { to: '/products', icon: <HiOutlineCube />, label: 'Products' },
    { to: '/customers', icon: <HiOutlineUsers />, label: 'Customers' },
    { to: '/orders', icon: <HiOutlineShoppingCart />, label: 'Orders' },
  ];

  return (
    <div className="app-layout">
      {/* Mobile menu toggle */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        id="mobile-menu-toggle"
      >
        {sidebarOpen ? <HiOutlineX /> : <HiOutlineMenu />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">📦</div>
            <div className="logo-text">
              <h1>InvenTrack</h1>
              <span>Management System</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 140,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

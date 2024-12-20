import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex flex-row gap-x-16 py-4 px-24 text-xl">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "text-blue-600 font-bold" : "text-gray-800"
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/about-us"
        className={({ isActive }) =>
          isActive ? "text-blue-600 font-bold" : "text-gray-800"
        }
      >
        About Us
      </NavLink>
      <NavLink
        to="/clinostat"
        className={({ isActive }) =>
          isActive ? "text-blue-600 font-bold" : "text-gray-800"
        }
      >
        Clinostat
      </NavLink>
      <NavLink
        to="/microbial-visualizations"
        className={({ isActive }) =>
          isActive ? "text-blue-600 font-bold" : "text-gray-800"
        }
      >
        Microbial Visualizations
      </NavLink>
    </nav>
  );
}
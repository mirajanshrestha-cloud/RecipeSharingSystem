export default function Navbar({ view, setView }) {
  return (
    <nav className="navbar">
      <a href="#" className="logo" onClick={() => setView("browse")}>
        <span className="logo-icon">🍳</span> CookBook
      </a>

      <div className="nav-center">
        <button
          className={`nav-pill ${view === "browse" ? "active" : ""}`}
          onClick={() => setView("browse")}
        >
          Browse Recipes
        </button>
        <button className="nav-link" onClick={() => setView("browse")}>
          My Recipes
        </button>
        <button
          className={`nav-pill ${view === "cook" ? "active" : ""}`}
          onClick={() => setView("cook")}
        >
          What Can I Cook?
        </button>
      </div>

      <div className="nav-right">
        <a href="#" className="nav-link">Log in</a>
        <a href="#" className="btn btn-solid">Sign up</a>
      </div>
    </nav>
  );
}
export default function Navbar({ view, setView, user, onLoginClick, onLogout }) {
  return (
    <nav className="navbar">
      <button className="logo" onClick={() => setView("browse")}>
        <span className="logo-icon">🍳</span> CookBook
      </button>

      <div className="nav-center">
        <button className={`nav-pill ${view === "browse" ? "active" : ""}`} onClick={() => setView("browse")}>
          Browse Recipes
        </button>
        <button className={`nav-pill ${view === "favourites" ? "active" : ""}`} onClick={() => setView("favourites")}>
          My Recipes
        </button>
        <button className={`nav-pill ${view === "add" ? "active" : ""}`} onClick={() => setView("add")}>
          Add Recipe
        </button>
        <button className={`nav-pill ${view === "cook" ? "active" : ""}`} onClick={() => setView("cook")}>
          What Can I Cook?
        </button>
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <span className="user-pill">Hi, {user.name}</span>
            <button className="nav-link" onClick={onLogout}>Log out</button>
          </>
        ) : (
          <>
            <button className="nav-link" onClick={onLoginClick}>Log in</button>
            <button className="btn btn-solid" onClick={onLoginClick}>Sign up</button>
          </>
        )}
      </div>
    </nav>
  );
}
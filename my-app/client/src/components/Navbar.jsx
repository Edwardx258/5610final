import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {createAIGame, createNewGame} from "../api/api";
import "../styles/PageLayout.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const handleNewGame = async () => {
    try {
      const newGame = await createNewGame();
      localStorage.setItem("currentGameId", newGame._id || newGame.id);
      navigate("/place-ships");
    } catch (error) {
      console.error("Failed to create new game:", error);
    }
  };

  const handleAIGame = async () => {
    const aiGame = await createAIGame();
    localStorage.setItem("currentGameId", aiGame._id || aiGame.id);
    navigate("/place-ships");
  };

  return (
    <nav className="navbar">
      <div className="navbarInner">
        <h1 className="logo">Battleship</h1>
        <ul className="navLinks">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>

          <li>
            <Link
              to="/games"
              className={location.pathname === "/games" ? "active" : ""}
            >
              Games
            </Link>
          </li>

          {isLoggedIn && (
            <li>
              <button onClick={handleNewGame}>Create New Game</button>
            </li>
          )}

          {isLoggedIn ? (
            <>
              <li>
                <Link
                  to="/high-scores"
                  className={
                    location.pathname === "/high-scores" ? "active" : ""
                  }
                >
                  High Scores
                </Link>
              </li>
              <li
                style={{
                  color: "white",
                  fontWeight: "bold",
                  padding: "0.5rem",
                }}
              >
                {user?.username}
              </li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className={location.pathname === "/login" ? "active" : ""}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={location.pathname === "/register" ? "active" : ""}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

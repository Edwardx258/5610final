// src/pages/GamesPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useGameContext } from "../contexts/GameContext";
import {
  fetchAllGames,
  fetchGamesForGuests,
  createNewGame,
  createAIGame,
  joinGame,
} from "../api/api";
import "../styles/PageLayout.css";

function GamesPage() {
  const { isLoggedIn, user } = useContext(AuthContext);
  const { resetGameState } = useGameContext();
  const [lists, setLists] = useState({
    open: [],
    myOpen: [],
    active: [],
    completed: [],
    otherGames: [],
  });
  const [guestLists, setGuestLists] = useState({ active: [], completed: [] });
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllGames()
          .then((data) => setLists(data))
          .catch((err) => console.error("Failed to fetch games:", err));
    } else {
      fetchGamesForGuests()
          .then((data) => setGuestLists(data))
          .catch((err) => console.error("Failed to fetch guest games:", err));
    }
  }, [isLoggedIn]);

  const handleNewGame = async () => {
    try {
      resetGameState();
      const newGame = await createNewGame();
      localStorage.setItem("currentGameId", newGame._id);
      navigate("/place-ships");
    } catch (err) {
      console.error("Failed to create game:", err);
    }
  };

  const handleAIGame = async () => {
    try {
      resetGameState();
      const game = await createAIGame();
      localStorage.setItem("currentGameId", game._id);
      navigate("/place-ships");
    } catch (err) {
      console.error("Failed to create AI game", err);
    }
  };

  const handleJoinGame = async (gameId) => {
    try {
      resetGameState();
      await joinGame(gameId);
      localStorage.setItem("currentGameId", gameId);
      navigate("/place-ships");
    } catch (err) {
      console.error("Join failed:", err);
    }
  };

  const renderGameList = (title, gameList, options = {}) => {
    const { showJoin = false, extraLabel = () => "" } = options;
    return (
        gameList.length > 0 && (
            <section className="mt-10">
              <h3 className="text-xl font-semibold mb-3">{title}</h3>
              <ul className="space-y-3">
                {gameList.map((game) => {
                  const host = game.players[0]?.username || "Unknown";
                  const opponent =
                      game.players[1]?.username ||
                      (game.players.length === 2 ? "Opponent" : "Waiting...");
                  const startTime = new Date(game.createdAt).toLocaleString();
                  const endTime = game.updatedAt
                      ? new Date(game.updatedAt).toLocaleString()
                      : null;

                  return (
                      <li
                          key={game._id}
                          className="flex justify-between items-center bg-white p-4 rounded shadow-md max-w-2xl mx-auto"
                      >
                        <div>
                          <p>
                            Game #{game._id.slice(-6)} | Host: <strong>{host}</strong>
                            {game.status !== "open" && (
                                <>
                                  {" "}
                                  vs <strong>{opponent}</strong>
                                </>
                            )}
                          </p >
                          <p className="text-sm text-gray-600">Start: {startTime}</p >
                          {endTime && (
                              <p className="text-sm text-gray-600">End: {endTime}</p >
                          )}
                          {extraLabel(game) && (
                              <p className="text-sm text-blue-600">
                                {extraLabel(game)}
                              </p >
                          )}
                        </div>
                        <div>
                          {showJoin && (
                              <button
                                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                  onClick={() => handleJoinGame(game._id)}
                              >
                                Join
                              </button>
                          )}
                          <button
                              className="ml-3 bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                              onClick={() => navigate(`/game/${game._id}`)}
                          >
                            View
                          </button>
                        </div>
                      </li>
                  );
                })}
              </ul>
            </section>
        )
    );
  };

  if (!isLoggedIn) {
    return (
        <div className="pageContainer">
          <h2 className="text-2xl font-bold mb-4">Browse Public Games</h2>
          {renderGameList("Active Games", guestLists.active)}
          {renderGameList("Completed Games", guestLists.completed, {
            extraLabel: (g) =>
                g.winner
                    ? `Winner: ${
                        typeof g.winner === "object" ? g.winner.username : g.winner
                    }`
                    : "Completed (no winner info)",
          })}
        </div>
    );
  }

  return (
      <div className="pageContainer">
        <header className="pageHeader">
          <h2 className="text-2xl font-bold mb-4">Game Lobby</h2>
          <p className="text-gray-600">Create or join a Battleship game.</p >
          <button className="primaryButton mt-4" onClick={handleNewGame}>
            Start New Game
          </button>
          <button
              className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleAIGame}
          >
            Challenge AI
          </button>
        </header>

        {renderGameList("Open Games", lists.open, { showJoin: true })}
        {renderGameList("My Open Games", lists.myOpen)}
        {renderGameList("My Active Games", lists.active)}
        {renderGameList("My Completed Games", lists.completed, {
          extraLabel: (g) => {
            const winnerId =
                typeof g.winner === "object" ? g.winner._id : g.winner;
            return winnerId === user.id || winnerId === user._id
                ? "You Won"
                : "You Lost";
          },
        })}
        {renderGameList("Other Games", lists.otherGames, {
          extraLabel: (g) =>
              g.status === "completed"
                  ? `Winner: ${
                      typeof g.winner === "object"
                          ? g.winner.username
                          : g.winner || "Unknown"
                  }`
                  : "In Progress",
        })}

        <footer className="pageFooter mt-10">
          <p>&copy; 2025 Battleship Game</p >
        </footer>
      </div>
  );
}

export default GamesPage;
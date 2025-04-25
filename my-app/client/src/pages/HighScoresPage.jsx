import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/PageLayout.css";

function HighScoresPage() {
  const { user } = useContext(AuthContext);
  const [scores, setScores] = useState([]);

  // Simulate fetching scores and sorting
  useEffect(() => {
    const mockScores = [
      { name: "Player1", wins: 15, losses: 5 },
      { name: "Player3", wins: 10, losses: 10 },
      { name: "Player5", wins: 6, losses: 14 },
      { name: "Player2", wins: 12, losses: 8 },
      { name: "Player4", wins: 8, losses: 12 },
    ];

    // Sort by wins descending
    const sorted = mockScores
      .sort((a, b) => b.wins - a.wins)
      .map((s, index) => ({ ...s, rank: index + 1 }));

    setScores(sorted);
  }, []);

  return (
    <div className="scoreContainer">
      <h2 className="scoreTitle">High Scores</h2>
      <div className="scoreTableWrapper">
        <table className="scoreTable">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Wins</th>
              <th>Losses</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((player) => (
              <tr
                key={player.rank}
                className={
                  user?.username === player.name ? "highlightRow" : ""
                }
              >
                <td>{player.rank}</td>
                <td>{player.name}</td>
                <td>{player.wins}</td>
                <td>{player.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="scoreFooter">&copy; 2025 Battleship Game</footer>
    </div>
  );
}

export default HighScoresPage;

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import ScoreRow from "../components/ScoreRow";
import "../styles/PageLayout.css";

function HighScoresPage() {
    const { user } = useContext(AuthContext);
    const [scores, setScores] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3001/api/scores") // ✅ 写完整URL测试
            .then((res) => res.json())
            .then((data) => {
                console.log("✅ API返回数据:", data);

                if (!Array.isArray(data)) {
                    console.warn("❗ 返回格式不是数组！");
                    return;
                }

                const filtered = data.filter(
                    (p) =>
                        typeof p.username === "string" &&
                        typeof p.wins === "number" &&
                        typeof p.losses === "number"
                );

                console.log("✅ 有效用户数量:", filtered.length);

                const sorted = filtered
                    .sort((a, b) => {
                        if (b.wins !== a.wins) return b.wins - a.wins;
                        if (a.losses !== b.losses) return a.losses - b.losses;
                        return a.username.localeCompare(b.username);
                    })
                    .map((player, index) => ({ ...player, rank: index + 1 }));

                setScores(sorted);
            })
            .catch((err) => {
                console.error("❌ 获取 high scores 失败:", err);
            });
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
                    {scores.length > 0 ? (
                        scores.map((player, index) => (
                            <ScoreRow
                                key={player._id || player.username || index}
                                player={player}
                                index={index}
                                highlight={
                                    user?.username?.toLowerCase() ===
                                    player.username?.toLowerCase()
                                }
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-400">
                                No scores to display.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <footer className="scoreFooter">&copy; 2025 Battleship Game</footer>
        </div>
    );
}

export default HighScoresPage;
// src/pages/GamePage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { fetchGame, makeMove } from "../api/api";
import GameBoard from "../components/GameBoard";
import "../styles/PageLayout.css";

export default function GamePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useContext(AuthContext);
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);

    //  ID
    const meKey = user?.id || user?._id;

    //
    const toGrid = (board, size = 10) => {
        if (!board || !Array.isArray(board)) return [];
        if (Array.isArray(board[0])) return board;
        return Array.from({ length: size }, (_, row) =>
            board.slice(row * size, row * size + size)
        );
    };

    //
    const loadGame = async () => {
        setLoading(true);
        try {
            const data = await fetchGame(id);
            console.log("Fetched game:", data);
            setGame(data);
        } catch (err) {
            console.error("Load failed.", err);
        } finally {
            setLoading(false);
        }
    };

    //
    useEffect(() => {
        if (!isLoggedIn) return;
        loadGame();
    }, [id, isLoggedIn]);

    //
    const handleCellClick = async (r, c) => {
        if (!game || game.status !== "active") return;
        //
        if (String(game.currentTurn) !== String(meKey)) {
            alert("Not your turn!");
            return;
        }

        try {
            //
            const updatedGame = await makeMove(id, { row: r, col: c });

            // ——  opponentBoard ——

            const boards = { ...game.boardState };
            const oppKey = Object.keys(boards).find((k) => k !== meKey);
            //
            const oppGrid = toGrid(boards[oppKey]).map((row) => [...row]);

            //
            const last = updatedGame.moves[updatedGame.moves.length - 1];
            if (last && String(last.by) === String(meKey)) {
                //
                oppGrid[r][c] = last.result;
            }
            boards[oppKey] = oppGrid;

            setGame({
                ...game,
                boardState: boards,
                currentTurn: updatedGame.currentTurn,
                status: updatedGame.status,
                winner: updatedGame.winner,
                moves: updatedGame.moves,
            });

            //
            loadGame();
        } catch (err) {
            console.error("Move failed", err);
        }
    };

    //
    if (!isLoggedIn) {
        return (
            <div className="pageContainer">
                <h2 className="title">Please log in to view the game.</h2>
            </div>
        );
    }
    if (loading) return <div className="pageContainer">Loading…</div>;
    if (!game) return <div className="pageContainer">Game not found</div>;

    //
    const boards = game.boardState;
    const myBoard = toGrid(boards[meKey]);
    const opponentKey = Object.keys(boards).find((k) => k !== meKey);
    const opponentBoard = toGrid(boards[opponentKey]);
    const isAI = game.isAI || opponentKey === "AI";

    return (
        <div className="pageContainer">
            <h2 className="title">
                {game.status === "completed"
                    ? `Game Over! ${
                        game.winner?.username || (isAI ? "AI" : "Opponent")
                    } Wins!`
                    : game.status === "open"
                        ? "Waiting for opponent to join and place ships…"
                        : `Current Turn: ${
                            String(game.currentTurn) === String(meKey)
                                ? "You"
                                : isAI
                                    ? "AI"
                                    : "Opponent"
                        }`}
            </h2>

            {/*  */}
            <div style={{ marginBottom: "1rem" }}>
                <button
                    onClick={loadGame}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#3182ce",
                        color: "#fff",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Refresh
                </button>
            </div>

            <div className="boards" style={{ display: "flex", gap: 40 }}>
                <div>
                    <h3>Opponent's Board</h3>
                    <GameBoard
                        boardData={opponentBoard}
                        isOwnBoard={false}
                        isInteractive={
                            game.status === "active" &&
                            String(game.currentTurn) === String(meKey)
                        }
                        onCellClick={handleCellClick}
                    />
                </div>

                <div>
                    <h3>Your Board</h3>
                    <GameBoard
                        boardData={myBoard}
                        isOwnBoard={true}
                        isInteractive={false}
                    />
                </div>
            </div>
        </div>
    );
}

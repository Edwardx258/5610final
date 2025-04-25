// src/contexts/GameContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
    fetchGame,
    makeMove as apiMakeMove,
    updateBoard as apiUpdateBoard,
} from "../api/api";
import { useNavigate } from "react-router-dom";

export const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);

const BOARD_SIZE = 10;
const SHIP_SIZES = [5, 4, 3, 3, 2];

function createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(""));
}

function toGrid(board, size = 10) {
    if (!board || !Array.isArray(board)) return createEmptyBoard();
    return Array.isArray(board[0]) ? board : Array.from({ length: size }, (_, row) => board.slice(row * size, row * size + size));
}

function canPlaceShip(board, row, col, size, horizontal) {
    for (let i = 0; i < size; i++) {
        const r = row + (horizontal ? 0 : i);
        const c = col + (horizontal ? i : 0);
        if (r < 0 || c < 0 || r >= BOARD_SIZE || c >= BOARD_SIZE || board[r][c] !== "") {
            return false;
        }
    }
    return true;
}

export const GameProvider = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userId = user?._id || user?.id;

    const [gameId, setGameId] = useState(null);
    const [isPlacing, setIsPlacing] = useState(true);
    const [shipsToPlace, setShipsToPlace] = useState(
        SHIP_SIZES.map((size, idx) => ({ id: idx, size, orientation: "horizontal" }))
    );
    const [playerBoard, setPlayerBoard] = useState(createEmptyBoard());
    const [opponentBoard, setOpponentBoard] = useState(createEmptyBoard());
    const [currentTurn, setCurrentTurn] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);

    const resetGameState = () => {
        setIsPlacing(true);
        setShipsToPlace(
            SHIP_SIZES.map((size, idx) => ({ id: idx, size, orientation: "horizontal" }))
        );
        setPlayerBoard(createEmptyBoard());
        setOpponentBoard(createEmptyBoard());
        setCurrentTurn(null);
        setGameOver(false);
        setWinner(null);
    };

    useEffect(() => {
        const id = localStorage.getItem("currentGameId");
        if (id) setGameId(id);
    }, []);

    useEffect(() => {
        if (!gameId || !userId) return;
        fetchGame(gameId)
            .then((data) => {
                const bs = data.boardState;
                const rawBoard = bs[userId];

                if (Array.isArray(rawBoard) && rawBoard.flat().some((c) => c === "S")) {
                    setIsPlacing(false);
                }

                const boardToUse = toGrid(rawBoard);
                setPlayerBoard(boardToUse);

                const oppId = Object.keys(bs).find((k) => k !== userId);
                setOpponentBoard(toGrid(bs[oppId]));
                setCurrentTurn(data.currentTurn);
                setGameOver(data.status === "completed");
                setWinner(data.winner);
                setGameId(data._id);
            })
            .catch((err) => console.error("Failed to fetch game.", err));
    }, [gameId, userId]);

    const handleShipDrop = (ship, row, col) => {
        if (!isPlacing) return false;
        const newB = playerBoard.map((r) => [...r]);
        const horizontal = ship.orientation === "horizontal";
        if (!canPlaceShip(newB, row, col, ship.size, horizontal)) return false;

        for (let i = 0; i < ship.size; i++) {
            const r = row + (horizontal ? 0 : i);
            const c = col + (horizontal ? i : 0);
            newB[r][c] = "S";
        }
        setPlayerBoard(newB);
        setShipsToPlace((prev) => prev.filter((s) => s.id !== ship.id));
        return true;
    };

    const rotateShip = (shipId) => {
        setShipsToPlace((prev) =>
            prev.map((s) =>
                s.id === shipId
                    ? {
                        ...s,
                        orientation: s.orientation === "horizontal" ? "vertical" : "horizontal",
                    }
                    : s
            )
        );
    };

    useEffect(() => {
        if (isPlacing && shipsToPlace.length === 0) {
            apiUpdateBoard(gameId, playerBoard)
                .then(() => fetchGame(gameId))
                .then((updated) => {
                    if (updated.status === "active") {
                        setIsPlacing(false);
                        setCurrentTurn(updated.currentTurn);
                        setGameOver(updated.status === "completed");
                        setWinner(updated.winner);
                        navigate(`/game/${gameId}`);
                    }
                })
                .catch((err) => console.error("Failed to push placement to server", err));
        }
    }, [shipsToPlace, playerBoard, gameId, isPlacing, navigate]);

    const handlePlayerMove = async (row, col) => {
        if (isPlacing || gameOver || currentTurn !== userId) return;
        try {
            const updated = await apiMakeMove(gameId, { row, col, userId }); // ⚡加上 userId
            const bs = updated.boardState;
            setPlayerBoard(toGrid(bs[userId]));
            const oppId = Object.keys(bs).find((k) => k !== userId);
            setOpponentBoard(toGrid(bs[oppId]));
            setCurrentTurn(updated.currentTurn);
            if (updated.status === "completed") {
                setGameOver(true);
                setWinner(updated.winner);
            }
        } catch (err) {
            console.error("Move failed.", err);
        }
    };

    return (
        <GameContext.Provider
            value={{
                gameId,
                isPlacing,
                shipsToPlace,
                playerBoard,
                opponentBoard,
                currentTurn,
                gameOver,
                winner,
                handleShipDrop,
                rotateShip,
                handlePlayerMove,
                resetGameState,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
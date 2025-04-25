// src/pages/ShipPlacement.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "../contexts/GameContext";
import GameBoard from "../components/GameBoard";
import { fetchGame, updateBoard } from "../api/api";
import "../styles/PageLayout.css";

function ShipPlacement() {
  const {
    playerBoard,
    shipsToPlace,
    handleShipDrop,
    rotateShip,
  } = useGameContext();

  const navigate = useNavigate();

  // 轮询检测游戏状态是否激活
  useEffect(() => {
    const gameId = localStorage.getItem("currentGameId");
    if (!gameId) return;

    const interval = setInterval(() => {
      fetchGame(gameId).then((data) => {
        if (data.status === "active") {
          clearInterval(interval);
          navigate(`/game/${gameId}`);
        }
      }).catch(console.error);
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  // 上传玩家放置完成后的棋盘
  useEffect(() => {
    const gameId = localStorage.getItem("currentGameId");
    if (!gameId) return;

    const hasPlaced = shipsToPlace.length === 0;
    const boardReady = playerBoard.flat().filter((cell) => cell === "S").length >= 5;

    if (hasPlaced && boardReady) {
      updateBoard(gameId, playerBoard).catch(console.error);
    }
  }, [navigate, playerBoard, shipsToPlace]);

  return (
      <div className="pageContainer">
        <h2 className="title">Place Your Ships</h2>
        <div className="shipPlacementContainer">
          <div className="shipList">
            <h3>Ships to Place</h3>
            {shipsToPlace.length > 0 ? (
                shipsToPlace.map((ship) => (
                    <div
                        key={ship.id}
                        className="shipItem"
                        style={{
                          display: "flex",
                          flexDirection:
                              ship.orientation === "horizontal" ? "row" : "column",
                        }}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("shipId", ship.id.toString());
                          e.dataTransfer.setData("shipSize", ship.size.toString());
                          e.dataTransfer.setData("shipOrientation", ship.orientation);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          rotateShip(ship.id);
                        }}
                    >
                      {Array.from({ length: ship.size }).map((_, index) => (
                          <div key={index} className="shipSquare"></div>
                      ))}
                    </div>
                ))
            ) : (
                <p>All ships placed. Waiting for opponent...</p >
            )}
          </div>

          <div className="board">
            <GameBoard
                boardData={playerBoard}
                isOwnBoard={true}
                isPlacing={true}
                onShipDrop={handleShipDrop}
            />
          </div>
        </div>
      </div>
  );
}

export default ShipPlacement;
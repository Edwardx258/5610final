import React from "react";
import clsx from "clsx";

export default function GameBoard({
                                    boardData = [],
                                    isOwnBoard = false,
                                    isInteractive = false,
                                    isPlacing = false,
                                    onCellClick,
                                    onShipDrop,
                                  }) {
  return (
      <div className="game-board-grid">
        {boardData.map((row, r) =>
            row.map((cell, c) => {
              const isHit = cell === "H";
              const isMiss = cell === "M";
              const hasShip = cell === "S";

              let cls = "tile";
              if (isHit) cls += " bg-red-500";
              else if (isMiss) cls += " bg-gray-300";
              else if (hasShip && isOwnBoard) cls += " bg-green-400";

              return (
                  <div
                      key={`${r}-${c}`}
                      className={clsx(cls, (isInteractive || isPlacing) && "cursor-pointer")}
                      onClick={() => isInteractive && onCellClick && onCellClick(r, c)}
                      onDragOver={isPlacing ? (e) => e.preventDefault() : undefined}
                      onDrop={
                        isPlacing
                            ? (e) => {
                              e.preventDefault();
                              const shipId = parseInt(e.dataTransfer.getData("shipId"), 10);
                              const shipSize = parseInt(e.dataTransfer.getData("shipSize"), 10);
                              const shipOrientation = e.dataTransfer.getData("shipOrientation");
                              const ship = { id: shipId, size: shipSize, orientation: shipOrientation };
                              if (onShipDrop) {
                                const success = onShipDrop(ship, r, c);
                                if (!success) {
                                  // messageInfo
                                  alert(
                                      "Cannot place ship here: out of bounds or overlapping!"
                                  );
                                }
                              }
                            }
                            : undefined
                      }
                  >
                    {isHit ? "💥" : isMiss ? "⚪" : ""}
                  </div>
              );
            })
        )}
      </div>
  );
}

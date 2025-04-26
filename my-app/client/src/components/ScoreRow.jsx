import React from "react";
import clsx from "clsx";

const ScoreRow = ({ player, index, highlight = false }) => {
  return (
      <tr className="text-center bg-white hover:bg-gray-100">
        <td className="border px-4 py-2">{index + 1}</td>
        <td
            className={clsx(
                "border px-4 py-2",
                highlight && "username-highlight"
            )}
        >
          {player.username}
        </td>
        <td className="border px-4 py-2">{player.wins}</td>
        <td className="border px-4 py-2">{player.losses}</td>
      </tr>
  );
};

export default ScoreRow;
import React from "react";
import clsx from "clsx";

const ScoreRow = ({ player, index, highlight = false }) => {
  return (
    <tr
      className={clsx(
        "text-center",
        highlight ? "bg-yellow-200 font-semibold" : "bg-white"
      )}
    >
      <td className="border px-4 py-2">{index + 1}</td>
      <td className="border px-4 py-2">{player.username}</td>
      <td className="border px-4 py-2">{player.wins}</td>
      <td className="border px-4 py-2">{player.losses}</td>
    </tr>
  );
};

export default ScoreRow;

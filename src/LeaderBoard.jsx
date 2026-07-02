import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function LeaderBoard({data}) 
{
     // Sort the scores from highest to lowest before rendering
  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Leaderboard</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Rank</th>
            <th style={{ padding: '8px' }}>Name</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((player, index) => (
            <tr key={player.id || index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>{index + 1}</td>
              <td style={{ padding: '8px' }}>{player.name}</td>
              <td style={{ padding: '8px', textAlign: 'right', color: '#0070f3', fontWeight: 'bold' }}>
                {player.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



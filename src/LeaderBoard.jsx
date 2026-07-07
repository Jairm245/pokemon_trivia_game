import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function LeaderBoard({data}) 
{
  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    // Box sizing adjustments to prevent margins from pushing boundaries out
    <div style={{ width: '100%', maxWidth: '340px', margin: '0 auto', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center', margin: '5px 0 10px 0', fontSize: '1.2rem' }}>Leaderboard</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: '6px 4px' }}>Rank</th>
            <th style={{ padding: '6px 4px' }}>Name</th>
            <th style={{ padding: '6px 4px', textAlign: 'right' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((player, index) => (
            <tr key={player.id || index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 4px', fontWeight: 'bold' }}>{index + 1}</td>
              <td style={{ padding: '6px 4px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {player.name}
              </td>
              <td style={{ padding: '6px 4px', textAlign: 'right', color: '#3b4cca', fontWeight: 'bold' }}>
                {player.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}




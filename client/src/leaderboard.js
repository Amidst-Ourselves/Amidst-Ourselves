import React, { useState, useEffect } from 'react';

const LeaderboardPage = ({ onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/user/leaderboard')
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        const sortedData = data.sort((a, b) => {
            const aPercentage = a.totalgames === 0 ? 0 : a.wins / a.totalgames;
            const bPercentage = b.totalgames === 0 ? 0 : b.wins / b.totalgames;
          
            if (a.totalgames === 0 && b.totalgames === 0) {
              return 0;
            } else if (a.totalgames === 0) {
              return 1;
            } else if (b.totalgames === 0) {
              return -1;
            } else {
              return bPercentage - aPercentage;
            }
          });
        setLeaderboardData(sortedData);
      })
      .catch((error) => {
        console.error('Error fetching leaderboard data:', error);
      });

  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Total Games</th>
            <th>Wins</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((player, index) => (
            <tr key={index}>
              <td>{index+1}</td>
              <td>{player.name}</td>
              <td>{player.totalgames}</td>
              <td>{player.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br></br> <p></p>
      <button onClick={onClose}>Close</button>
      <br></br> <p></p>
    </div>
  );
};

export default LeaderboardPage;

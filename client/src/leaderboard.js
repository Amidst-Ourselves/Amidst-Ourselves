import React, { useState, useEffect } from 'react';


/*
  FR10 - View.Leaderbaord
  This file manage the leaderboard page. We make an API call to 
  get scores of all the players and then sort them according
  to no. of. games won and display them on the leaderboard page. 
*/
export const LeaderboardPage = ({ onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    fetch(process.env.REACT_APP_HOST_URL + '/user/leaderboard')
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        const sortedData = data.sort((a, b) => b.wins - a.wins);
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
      <br></br> <p></p>
    </div>
  );
};


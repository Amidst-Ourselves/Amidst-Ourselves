import React from 'react';

//If user enter a wrong URL, then we show 404 page. 
function NotFound() {
  return (
    <div>
      <h1>Error 404 - Page Not Found</h1>
      <p>Please check the URL and try again, or <a href="/">Return to the homepage</a>.</p>
    </div>
  );
}

export default NotFound;

requirejs.config({
    // module name mapped to CDN URL
    paths: {
      // Require.js appends `.js` extension for you
      react: 'https://unpkg.com/react@17/umd/react.production.min',
      'react-dom': 'https://unpkg.com/react-dom@17/umd/react-dom.production.min',
    },
  });
  
  // load the modules defined above
  requirejs(['react', 'react-dom'], function (React, ReactDOM) {
    // now you can render your React elements
    ReactDOM.render(
      React.createElement('p', {}, 'Hello, AMD!'),
      document.getElementById('root')
    );
  });
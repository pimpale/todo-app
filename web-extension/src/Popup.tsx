import React  from 'react'
import ReactDOM from 'react-dom/client'

import logo from '/resources/logo.svg'

const appStyle = {
  textAlign: "center" as const,
  minWidth: "350px",
}

function App() {

  const [count_raw, setCount_raw] = React.useState<number|null>(null)

  function setCount(n:number) {
      window.localStorage.setItem("count", ""+ n);
      setCount_raw(n);
  }

  let count = count_raw === null
   ? parseInt(window.localStorage.getItem("count") ?? "0")
   : count_raw;

  return (
    <div style={appStyle}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button type="button" onClick={() => setCount(count + 1)}>
            count is: {count}
          </button>
        </p>
        <p>
          Edit <code>Popup.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

import { Link } from 'react-router-dom';

function Error404() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw"
    }}>
      <div className="my-auto mx-auto text-center">
        <h1>404 Error.</h1>
        <h5>Page Not Found</h5>
        <Link to="/">Return Home</Link>
      </div>
    </div>
  )
}

export default Error404

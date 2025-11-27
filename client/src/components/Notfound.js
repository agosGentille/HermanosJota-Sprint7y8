import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">❌</div>
        <h1>404 - Página No Encontrada</h1>
        <p>Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <Link to="/" className="home-button">
          Volver al Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
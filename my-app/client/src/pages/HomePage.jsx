import { Link } from 'react-router-dom';
import '../styles/PageLayout.css';
import battleshipImage from '../assets/Battleship.jpg';

function HomePage() {
  return (
    <div className="pageContainer">
      <header className="pageHeader">
        <h2>Welcome to Battleship!</h2>
        <p>Login or register to start playing, then choose a game mode.</p>
        <img src={battleshipImage} alt="Battleship Game" className="pageImage" />
      </header>

      <footer className="pageFooter">
        <p>&copy; 2025 Battleship Game</p>
      </footer>
    </div>
  );
}

export default HomePage;

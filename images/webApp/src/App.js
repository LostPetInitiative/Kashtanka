import logo from './catndog.png';
import AnimalCard from './AnimalCard.js';
import {GetCard} from "./CardStorage.js";
import './App.css';


/*------------------------------------------------------------------------------------------*/

function App() {
  var paramsString = window.location.search;
  var searchParams = new URLSearchParams(paramsString);
  var animal = searchParams.has("animal") ? (searchParams.get("animal")) : null;
  
  var card = GetCard(animal);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <AnimalCard card={card}/>
      </header>
    </div>
  );
}

export default App;

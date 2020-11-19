import * as React from "react";
import './DataModel'
import './App.css';
import logo from './catndog.png';
import {GetCard} from "./CardStorage.js";
import AnimalCard from "./AnimalCard";


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

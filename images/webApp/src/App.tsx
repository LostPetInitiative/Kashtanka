import * as React from "react";
import './DataModel'
import './App.css';
import logo from './catndog.png';
import {GetCard, GetPetCard} from "./CardStorage";
import AnimalCard from "./AnimalCard";
import { AnimalCard as AnimalCardDM} from "./DataModel";


/*------------------------------------------------------------------------------------------*/

function App() {
  var paramsString = window.location.search;
  var searchParams = new URLSearchParams(paramsString);

  var animalType = searchParams.has("animal") ? searchParams.get("animal") : "none";
  var animal : string = !animalType ? "none" : animalType;  

  const cardID = searchParams.has("cardID") ? searchParams.get("cardID") : "none";
  const id : string = !cardID ? "none" : cardID;
  const cardDomain = searchParams.has("cardDomain") ? searchParams.get("cardDomain") : "none";
  const domain : string = !cardDomain ? "none" : cardDomain;

  //const card : AnimalCardDM = animal != "" ? GetCard(animal)
  
  const card = GetPetCard(id, domain);

  return (
    <div className="App">
      <header className="App-header">
        <AnimalCard card={card}/>
      </header>
    </div>
  );
}

export default App;

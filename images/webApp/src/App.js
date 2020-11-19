import logo from './catndog.png';
import './App.css';

function AnimalPhotos(props) {
  const photos = props.photos;
  const photoList = photos.map((image) =>
      <li key={image.id}>
        <img src={image.src} alt={image.id} width="200"/>
      </li>
  );

  return (
      <ul>{photoList}</ul>
  );
}

function AnimalCard(props) {
  const card = props.card;
  return (
      <div class={card.animal + " животное"}>
          <div>{card.animal} {card.name}</div>
          <div>{card.eventTime.toDateString()}</div>
          <div>{card.eventPlace.join(", ")}</div>
          <div>{card.sex}</div>
          <div>{card.color}</div>
          <div>{card.size}</div>
          <div><AnimalPhotos photos={card.photos} /></div>
      </div>
  );
}

/*------------------------------------------------------------------------------------------*/

function App() {

  var paramsString = window.location.search;
  var searchParams = new URLSearchParams(paramsString);

  // service call

  // emulating animal card
  var card = {};
  if(searchParams.has("animal") && searchParams.get("animal") === "dog") {
    card.cardType = "Нашёлся"
    card.name = "Каштан";
    card.animal = "собака";
    card.eventTime = new Date(2020, 10, 7);
    card.eventPlace = [55.699061, 37.531018];
    card.sex = "male";
    card.color = "chestnut";
    card.size = "medium";
    card.photos = [
      {id: "first", src: "./img/dog/1.jpg"},
      {id: "second", src: "./img/dog/2.png"},
      {id: "third", src: "./img/dog/3.png"}];
  }
  else {
    card.cardType = "Потерялась"
    card.name = "Томасина";
    card.animal = "кошка";
    card.eventTime = new Date(2020, 5, 27);
    card.eventPlace = [59.933758, 30.348226];
    card.sex = "female";
    card.color = "ginger";
    card.size = "big";
    card.photos = [
      {id: "first", src: "./img/cat/1.jpg"},
      {id: "second", src: "./img/cat/2.jpg"}];
  }

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

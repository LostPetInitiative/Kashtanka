import * as React from "react";
import './DataModel'
import './App.scss';
import CardByCardViewer from './CardByCard'
import "./apiClients/RestApiCardStorage"
import RestCardStorage from "./apiClients/RestApiCardStorage";
import Landing from "./Landing";

/*------------------------------------------------------------------------------------------*/

enum AppState {Landing, PairCompare}

function App() {
  
  const [state,setAppState] = React.useState(AppState.Landing)

  return (
    <div className="parentDiv">
      <div id="headerCornerDiv">
        <img id="headerLogo" src="./img/cat/1.jpg"></img>
      </div>
      <div id="headerDiv">
        <div id="headerTextDiv">Каштанка</div>
      </div>
      <div id="appStateMenu">
        <div onClick={() => setAppState(AppState.Landing)}>Intro</div>
        <div onClick={() => setAppState(AppState.PairCompare)}>Сравнить 2 объявления</div>
      </div>
      <div className="AppModeViewer">
        {
          state === AppState.Landing &&
            <div>
              <Landing/>
            </div>
        }
        {
           state === AppState.PairCompare &&
           <div>
             <CardByCardViewer cardStorage={new RestCardStorage("http://10.0.4.211:3000") } />
           </div>
        }
        {/* <header className="App-header">
          <AnimalCard card={card}/>
        </header> */}
      </div>
      <div id="lowestDiv"></div>
    </div>
  );
}

export default App;

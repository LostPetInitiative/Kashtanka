import * as React from "react";
import './DataModel'
import './App.css';
import TwoCardsViewer from './TwoCards'
import "./apiClients/RestApiCardStorage"
import RestCardStorage from "./apiClients/RestApiCardStorage";

/*------------------------------------------------------------------------------------------*/

enum AppState {Landing, PairCompare}

function App() {
  
  const [state,setAppState] = React.useState(AppState.Landing)

  return (
    <div>
      <div id="appStateMenu">
        <div onClick={() => setAppState(AppState.Landing)}>Intro</div>
        <div onClick={() => setAppState(AppState.PairCompare)}>Сравнить 2 объявления</div>
      </div>
      <div className="AppModeViewer">
        {
          state === AppState.Landing &&
            <div>
              <p>Landing</p>
            </div>
        }
        {
           state === AppState.PairCompare &&
           <div>
             <TwoCardsViewer cardStorage={new RestCardStorage("http://10.0.4.211:3000") } />
           </div>
        }
        {/* <header className="App-header">
          <AnimalCard card={card}/>
        </header> */}
      </div>
    </div>
  );
}

export default App;

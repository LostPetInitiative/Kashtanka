import * as React from "react"
import './DataModel'
import './App.scss';
import CandidatesReview from './CandidatesReview'
import "./apiClients/RestApiCardStorage"
import * as RestCardStorage from "./apiClients/RestApiCardStorage";
import SolrGatewaySearcher from "./apiClients/SolrGatewaySearch"
import Landing from "./Landing";
import About from "./About";
import MatchsBoard from "./MatchsBoard"
import {
  HashRouter as Router,
  Switch,
  Route,
  NavLink,
  useParams,
  useHistory
} from "react-router-dom";


function SpecificCandidatesReview() {
  const { ns1, id1, ns2, id2} = useParams<{ ns1: string, id1: string,  ns2: string, id2: string}>();
  const fullMainID = ns1+"/"+id1
  const condFullID = ((ns2===undefined) || (id2===undefined)) ? "" : (ns2+"/"+id2)

  const history = useHistory()
  function NavigateToSpecificCandidate(candFullID:string) {
    history.push("/candidatesReview/"+ns1+"/"+id1+"/"+candFullID)
  }

  const development = true

  var cardStorageURL:string
  var solrGatewayURL:string
  if(development) {
    cardStorageURL = "http://10.0.3.211:3000"
    solrGatewayURL = "http://10.0.3.211:3001"
    // cardStorageURL = "https://kashtanka.pet/api/storage"
    // solrGatewayURL = "https://kashtanka.pet/api/search"
  } else {
    cardStorageURL = "api/storage"
    solrGatewayURL = "api/search"
  }

  return (
    <CandidatesReview
      cardStorage={new RestCardStorage.CardStorage(cardStorageURL)}
      searcher={new SolrGatewaySearcher(solrGatewayURL)}
      mainCardFullID={fullMainID}
      candCardFullID={condFullID}
      candCardFullIDChanged={(e) => NavigateToSpecificCandidate(e)}
    />
  )
}

function App() {

  return (
    <Router>
      <div className="parentDiv">
        <div id="headerCornerDiv">
        <NavLink to="/">
          <img id="headerLogo" src="./img/cat/1.jpg"></img>
        </NavLink>
        </div>
        <div id="headerDiv">
          <div id="headerTextDiv">Каштанка</div>
        </div>
        <div id="appStateMenu">
          <div>
            <NavLink to="/candidatesReview/pet911ru/rl100268">Обзор совпадений</NavLink>
          </div>
          <div>
            <NavLink to="/board">Карточки совпадений</NavLink>
          </div>
          <div>
            <NavLink to="/about">Вопросы/Ответы</NavLink>
          </div>
        </div>
        <div className="AppModeViewer">
          <Switch>
            <Route path="/candidatesReview/:ns1/:id1/:ns2/:id2" children={<SpecificCandidatesReview />} />
            <Route path="/candidatesReview/:ns1/:id1" children={<SpecificCandidatesReview />} />
            <Route path="/board">
              <MatchsBoard />
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/">
              <Landing />
            </Route>
          </Switch>
        </div>
        <div id="lowestDiv"></div>
      </div>
    </Router>
  );
}

export default App;

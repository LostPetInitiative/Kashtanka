import * as React from "react";
import './DataModel'
import './App.scss';
import TwoCardsViewer from './TwoCards'
import CandidatesReview from './CandidatesReview'
import "./apiClients/RestApiCardStorage"
import RestCardStorage from "./apiClients/RestApiCardStorage";
import SolrGatewaySearcher from "./apiClients/SolrGatewaySearch"
import Landing from "./Landing";
import MatchsBoard from "./MatchsBoard"
import {
  HashRouter as Router,
  Switch,
  Route,
  NavLink,
  useParams
} from "react-router-dom";

function SpecificPair() {
  const { ns1, id1, ns2, id2 } = useParams<{ ns1: string, id1: string, ns2: string, id2: string }>();

  return (
    <TwoCardsViewer
      cardStorage={new RestCardStorage("http://10.0.3.211:3000")}
      ns1={ns1} id1={id1} ns2={ns2} id2={id2}
    />
  )
}

function SpecificCandidatesReview() {
  const { ns, id} = useParams<{ ns: string, id: string}>();

  return (
    <CandidatesReview
      cardStorage={new RestCardStorage("http://10.0.3.211:3000")}
      ns={ns}
      localID={id}
      searcher={new SolrGatewaySearcher("http://10.0.3.211:3001")}
    />
  )
}

function App() {

  return (
    <Router>
      <div className="parentDiv">
        <div id="headerCornerDiv">
          <img id="headerLogo" src="./img/cat/1.jpg"></img>
        </div>
        <div id="headerDiv">
          <div id="headerTextDiv">Каштанка</div>
        </div>
        <div id="appStateMenu">
          <div>
            <NavLink to="/">Каштанка</NavLink>
          </div>
          <div>
            <NavLink to="/pair/pet911ru/rl100268/pet911ru/rf231126">Сравнение</NavLink>
          </div>
          <div>
            <NavLink to="/candidatesReview/pet911ru/rl100268">Обзор совпадений</NavLink>
          </div>
          <div>
            <NavLink to="/board">Карточки совпадений</NavLink>
          </div>
          <div>
            <NavLink to="/faq">Вопросы/Ответы</NavLink>
          </div>
        </div>
        <div className="AppModeViewer">
          <Switch>
            <Route path="/pair/:ns1/:id1/:ns2/:id2" children={<SpecificPair />} />
            <Route path="/candidatesReview/:ns/:id" children={<SpecificCandidatesReview />} />
            <Route path="/board">
              <MatchsBoard />
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

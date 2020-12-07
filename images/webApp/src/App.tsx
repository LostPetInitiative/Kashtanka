import * as React from "react"
import './DataModel'
import './App.scss';
import CandidatesReview from './CandidatesReview'
import "./apiClients/RestApiCardStorage"
import * as RestCardStorage from "./apiClients/RestApiCardStorage";
import SolrGatewaySearcher from "./apiClients/SolrGatewaySearch"
import Landing from "./Landing";
import About from "./About";
import MatchBoard from "./MatchesBoard"
import {
  HashRouter as Router,
  Switch,
  Route,
  NavLink,
  useParams,
  useHistory
} from "react-router-dom";
import Header from "./Header"


function SpecificCandidatesReview() {
  const { ns1, id1, ns2, id2 } = useParams<{ ns1: string, id1: string, ns2: string, id2: string }>();
  const fullMainID = ns1 + "/" + id1
  const condFullID = ((ns2 === undefined) || (id2 === undefined)) ? "" : (ns2 + "/" + id2)

  const history = useHistory()
  function NavigateToSpecificCandidate(candFullID: string) {
    history.push("/candidatesReview/" + ns1 + "/" + id1 + "/" + candFullID)
  }

  const development = true

  var cardStorageURL: string
  var solrGatewayURL: string
  if (development) {
    cardStorageURL = "http://10.0.4.174:3000"
    solrGatewayURL = "http://10.0.4.174:3001"
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

function Menu() {
  return (
    <div id="appStateMenu">
      <NavLink to="/board" activeClassName="activePage">
        <div className="menuItem">
          <img alt='Доска карточек' className="active" src='./img/menus/board_trello_logo_orange.png' />
          <img alt='Доска карточек' className="inactive" src='./img/menus/board_trello_logo_pale.png' />
        </div>
      </NavLink>
      <NavLink to="/candidatesReview/pet911ru/rl100268" activeClassName="activePage">
        <div className="menuItem">
          <img alt='Сравнение объявлений' className="active" src='./img/menus/compare_ab_orange.png' />
          <img alt='Сравнение объявлений' className="inactive" src='./img/menus/compare_ab_pale.png' />
        </div>
      </NavLink>
      <NavLink to="/faq" activeClassName="activePage">
        <div className="menuItem">
          <img alt='Вопросы и ответы' className="active" src='./img/menus/questions_orange.png' />
          <img alt='Вопросы и ответы' className="inactive" src='./img/menus/questions_pale.png' />
        </div>
      </NavLink>
    </div >
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
        <div id="headerDiv">
          <div id="headerTextDiv">Каштанка</div>
        </div>
        <Menu />
        <div className="AppModeViewer">
          <Header display={false}/>
          <Switch>
            <Route path="/candidatesReview/:ns1/:id1/:ns2/:id2" children={<SpecificCandidatesReview />} />
            <Route path="/candidatesReview/:ns1/:id1" children={<SpecificCandidatesReview />} />
            <Route path="/board">
              <MatchBoard />
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/">
              <Landing />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;

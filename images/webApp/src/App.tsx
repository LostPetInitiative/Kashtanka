import * as React from "react"
import './DataModel'
import './App.scss';
import CandidatesReview from './CandidatesReview'
import "./apiClients/RestApiCardStorage"
import * as ICardStorage from "./apiClients/ICardStorage"
import * as ISearch from "./apiClients/ISearch"
import * as RestCardStorage from "./apiClients/RestApiCardStorage";
import SolrGatewaySearcher from "./apiClients/SolrGatewaySearch"
import Landing from "./Landing";
import LatestCards from "./LatestCardsPreview"
import Faq from "./Faq"
import MatchesBoard from "./MatchesBoard"
import Tracker from "./MatomoTracker"
import {
  HashRouter as Router,
  Switch,
  Route,
  NavLink,
  useParams,
  useHistory,
  Redirect
} from "react-router-dom";

const development = window.location.hostname === "localhost"
var cardStorageURL: string
var solrGatewayURL: string
if (development) {
  // cardStorageURL = "http://10.0.4.174:3000"
  // solrGatewayURL = "http://10.0.4.174:3001"
  cardStorageURL = "https://kashtanka.pet/api/storage"
  solrGatewayURL = "https://kashtanka.pet/api/search"
} else {
  cardStorageURL = "api/storage"
  solrGatewayURL = "api/search"
}

const cardStorage: ICardStorage.ICardStorage = new RestCardStorage.CardStorage(cardStorageURL);
const searchEngine: ISearch.ISearch = new SolrGatewaySearcher(solrGatewayURL)

class LatestFoundCardCandidatesReview extends React.Component<{},
  {
    'latestFoundCardID': ([string, string] | null),
  }> {
  constructor(props: {}) {
    super(props);

    this.state = { latestFoundCardID: null }
  }

  componentDidMount() {
    searchEngine.GetLatestCards(1, ISearch.LatestCardSearchType.Found).then(cards => {
      const latestCard = cards[0]
      this.setState({ latestFoundCardID: [latestCard.namespace, latestCard.id] })
    });
  }

  render() {
    if (this.state.latestFoundCardID === null) {
      return (
        <p>Поиск самого свежего объявления о находке...</p>
      )
    } else {
      const ns1 = this.state.latestFoundCardID[0]
      const id1 = this.state.latestFoundCardID[1]
      const fullMainID = ns1 + "/" + id1
      return <Redirect to={"/candidatesReview/" + fullMainID} />
    }
  }
}

function SpecificCandidatesReview() {
  const { ns1, id1, ns2, id2 } = useParams<{ ns1: string, id1: string, ns2: string, id2: string }>();

  const fullMainID = ns1 + "/" + id1
  const condFullID = ((ns2 === undefined) || (id2 === undefined)) ? "" : (ns2 + "/" + id2)

  const history = useHistory()
  const NavigateToSpecificCandidate = (candFullID: string) => {
    history.push("/candidatesReview/" + ns1 + "/" + id1 + "/" + candFullID)
  }
  return (
    <CandidatesReview
      cardStorage={cardStorage}
      searcher={searchEngine}
      mainCardFullID={fullMainID}
      candCardFullID={condFullID}
      candCardFullIDChanged={(e) => NavigateToSpecificCandidate(e)}
    />
  )
}

function Menu() {

  return (
    <div id="appStateMenu">
      <div id="headerCornerDiv">
        <NavLink to="/">
          <img id="headerLogo" alt="Логотип Каштанки" src="./img/cat/1.jpg"></img>
        </NavLink>
      </div>
      <NavLink to="/board" activeClassName="activePage">
        <div className="menuItem">
          <img alt='Доска карточек' className="active" src='./img/menus/board_trello_logo_orange.png' />
          <img alt='Доска карточек' className="inactive" src='./img/menus/board_trello_logo_pale.png' />
        </div>
      </NavLink>
      <NavLink to="/candidatesReview/" activeClassName="activePage" title="Сравнение объявлений">
        <div className="menuItem">
          <img alt='Сравнение объявлений' className="active" src='./img/menus/compare_ab_orange.png' />
          <img alt='Сравнение объявлений' className="inactive" src='./img/menus/compare_ab_pale.png' />
        </div>
      </NavLink>
      <NavLink to="/faq" activeClassName="activePage" title="Вопросы и ответы">
        <div className="menuItem">
          <img alt='Вопросы и ответы' className="active" src='./img/menus/questions_orange.png' />
          <img alt='Вопросы и ответы' className="inactive" src='./img/menus/questions_pale.png' />
        </div>
      </NavLink>
    </div >
  )
}

function LandingWithLatestCards() {
  const history = useHistory()
  const navigateToSpecificCard = (fullID: string) => {
    history.push("/candidatesReview/" + fullID)
  }

  return (
    <div className="landing-container">
      <Landing />
      <LatestCards
        cardsToShow={5}
        cardsTypeToShow={ISearch.LatestCardSearchType.Found}
        cardStorage={cardStorage}
        searcher={searchEngine}
        previewClicked={(e) => navigateToSpecificCard(e)}
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      {(!development) &&
        <Tracker trackerHostName={"matomo.grechka.family"} />
      }
      <div className="parentDiv">
        <Menu />
        <div className="AppModeViewer">
          <Switch>
            <Route path="/candidatesReview/:ns1/:id1/:ns2/:id2" children={<SpecificCandidatesReview />} />
            <Route path="/candidatesReview/:ns1/:id1" children={<SpecificCandidatesReview />} />
            <Route path="/candidatesReview" children={<LatestFoundCardCandidatesReview />} />
            <Route path="/board">
              <MatchesBoard />
            </Route>
            <Route path="/faq">
              <Faq />
            </Route>
            <Route path="/">
              <LandingWithLatestCards />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;

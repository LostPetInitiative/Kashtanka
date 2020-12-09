import * as React from "react";
import "."
import * as DataModel from "./DataModel"
import "./MatchesBoard.scss"

function MatchBoard(props: {}) {
    React.useEffect(() => {
        document.title = "Каштанка - автоматический поиск потерянных и найденных домашних животных - Доска совпадений"
    })

    return (
        <iframe className="trello" src="https://trello.com/b/66wM5H6l.html" frameBorder="0"></iframe>
    );

    
}

export default MatchBoard;  
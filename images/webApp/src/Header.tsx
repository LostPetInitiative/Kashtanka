import * as React from "react";
import './Header.scss';

function Header(props: {display: boolean} ) {
    return (
        <div className={"headerDiv" + (!props.display ? " displayNone" : "")}>
            <div id="headerTextDiv">Каштанка</div>
        </div>
    );
}

export default Header;
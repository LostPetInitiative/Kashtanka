import * as React from "react";
import "./Landing.scss"

function Landing(props : {}) {
    React.useEffect(() => {
        document.title = "Каштанка - автоматический поиск потерянных и найденных домашних животных"
    })

    return (
        <div>
            <h1>Каштанка</h1>
            <p>Некоммерческая система искусственного интеллекта для поиска потерявшихся домашних животных.</p>
        </div>
    );
}

export default Landing;
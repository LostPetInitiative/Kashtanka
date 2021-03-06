import * as React from "react";
import Header from "./Header"
import "./Landing.scss"
import {
    NavLink,
} from "react-router-dom";


function Landing(props: {}) {
    React.useEffect(() => {
        document.title = "Каштанка - автоматический поиск потерянных и найденных домашних животных"
    })

    return (
        <div className="landing-text">
            <p>Каштанка - проект кооперации волонтеров и искусственного интеллекта в поиске потерявшихся домашних животных.</p>
            <h2>Как это работает</h2>
            <ol>
                <li>Поисковые роботы Каштанки постоянно просматривают интернет на наличие новых объявлений о пропаже или находке домашних животных.</li>
                <li>При обнаружении нового объявления модуль искусственного интеллекта сравнивает животное на фотографии с сотнями тысяч объявлений, ранее обработанных системой.</li>
                <li>Наиболее похожие пары объявлений (потерялся - нашелся) добавляются на <NavLink to="/board">доску возможных совпадений</NavLink> для волонтеров.</li>
                <li>Волонтеры проверяют действительно ли питомец в объявлении о пропаже и в объявлении о находке один и тот же.<br />В случае совпадения волонтер связывается с хозяином.</li>
            </ol>
            <p>Помогите животным вернуться домой! Проверьте возможные совпадения, нажав на карточки ниже.</p>
        </div>

    );
}

export default Landing;
import * as React from "react";
import Header from "./Header"
import "./Faq.scss"

function Faq(props : {}) {
    return (
        <div>
            <Header />
            <div className="faq-page">
                <h2>Как я могу стать волонтером?</h2>
                <p className="answer">Волонотеры имеют доступ к управлению <a href='#/board'>карточками совпадений</a>.
                Благодаря карточкам ясно, каким животным занимается какой волонтер.
                А также какие карточки уже просмтрены волонтерами, а какие ещё предстоит проверить.
                Чтобы получить доступ к управлению карточками, напишите на <a href='mailto:contact@kashtanka.pet'>contact@kashtanka.pet</a></p>
                <h2>С какими животными работает система</h2>
                <p className="answer">Сейчас поддерживаются только кошки и собаки.</p>
                <h2>Как происходит поиск схожих животных?</h2>
                <p>Каштанка использует нейронные сети для выделения визуальных признаков у животных (окрас, форма и пропорции тела, морды, и т.д.). Похожие животные определяются по схожести визуальных признаков животных.</p>
                <p>При поиске также учитывается близость места пропажи и находки в пространстве и во времени.</p>
                <h2>Каштанка считает похожими животных, которые совсем не похожи!</h2>
                <p>Нейронная сеть работает не идеально.
                    Причина этому в первую очередь в том, что она обучалась на данных, в которых содержались ошибки.
                    Мы планируем подчистить ошибки в данных для обучения нейронной сети и переобучить систему.
                    Ошибок станет меньше.
                </p>
                <h2>Я нашел баг или у меня есть пожелание.</h2>
                <p className="answer">Сообщите о проблеме на <a href='https://github.com/LostPetInitiative/Kashtanka/issues'>сайте разработки</a> системы Каштанка.</p>
                <h2>Как много данных обрабатывает система?</h2>
                <p>В данный момент Каштанка знает о сотнях тысяч объявлений о потере/находке домашних животных.</p>
                <p>Мы используем передовые технологи от ведущих интернет компаний, таких как Google, Facebook с применением искусственного Интеллекта (ИИ) и технологий обработки Больших Данных (Big Data).</p>
                <p>Используемые технологии позволяют горизонтально масштабироваться вычислительные мощности системы и обрабатывать тысячи новых объявлений в секунду.</p>
                <p>Мы используем:</p>
                <div className="logos-container">
                    <img alt='Kubernetes' src='https://kubernetes.io/images/nav_logo2.svg'/>
                    <img alt='TensorFlow' src='https://upload.wikimedia.org/wikipedia/commons/1/11/TensorFlowLogo.svg' />
                    <img alt='Apache Kafka'  src='https://kafka.apache.org/images/logo.png'/>
                    <img alt='Apache Cassandra' src='https://upload.wikimedia.org/wikipedia/commons/5/5e/Cassandra_logo.svg'/>
                    <img alt='Apache Solr'src='https://upload.wikimedia.org/wikipedia/en/b/bb/Apache_Solr_Logo.svg'/>
                </div>
                
            </div>
        </div>
    )
}

export default Faq
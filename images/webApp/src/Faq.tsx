import * as React from "react";
import Header from "./Header"
import "./Faq.scss"

const mailToElement = <a href='mailto:contact@kashtanka.pet'>contact@kashtanka.pet</a>;

function Faq(props : {}) {
    React.useEffect(() => {
        document.title = "Каштанка - автоматический поиск потерянных и найденных домашних животных - Вопросы и ответы"
    })

    return (
        <div className="faq-page">
            <Header />
            <div className="faq-text">

                <h2>Я потерял/нашёл домашнее животное. Чем мне может помочь Каштанка?</h2>
                <p className="answer">Каштанка ищет животных среди фотографий из объявлений с подключённых ресурсов.
                Опубликуйте ваше объявление о потере/находке на одном из дружественных сайтов, например,
                на <a href='https://pet911.ru' target="_BLANK" rel="external">pet911.ru</a>, и объявление будет автоматически обработано Каштанкой.</p>
                
                <h2>С какими животными работает система</h2>
                <p className="answer">Сейчас поддерживаются только кошки и собаки.</p>

                <h2>Как я могу помочь проекту?</h2>
                <p className="answer">Проект нуждается в вычислительных ресурсах и волонтёрах.
                <br/>Вы можете стать волонтёром проекта и проверять совпадения, которые предложила Каштанка, связываться с хозяевами.
                <br/>Если вы хотите поддержать проект материально -
                напишите нам на почту {mailToElement}, мы арендуем компьютеры на пожертвования.</p>
                
                <h2>Как устроена работа волонтера с сайтом?</h2>
                <p className="answer">Волонтеры имеют доступ к управлению <a href='#/board'>карточками совпадений</a>.
                Благодаря карточкам ясно, каким животным занимается какой волонтер.
                А также какие карточки уже просмотрены, а какие ещё предстоит проверить.
                Чтобы получить доступ к управлению карточками, напишите на {mailToElement}</p>
                
                <h2>Как происходит поиск схожих животных?</h2>
                <p>Каштанка использует нейронные сети для выделения визуальных признаков у животных (окрас, форма, пропорции тела, морды, и т.д.).
                Похожие животные определяются по схожести визуальных признаков животных.
                <br/>При поиске также учитывается близость места пропажи и находки в пространстве и во времени.</p>
                
                <h2>Каштанка считает похожими животных, которые совсем не похожи!</h2>
                <p>Нейронная сеть работает не идеально.
                    Причина этого в первую очередь в том, что она обучалась на данных с ошибками.
                    Мы планируем подчистить ошибки в данных для обучения нейронной сети и переобучить систему.
                    Система станет точнее.
                </p>

                <h2>У меня есть сайт (или группа в соц. сети) о пропавших и найденных животных. Как добавить эти данные в систему?</h2>
                <p className="answer">Напишите нам на почту {mailToElement}.</p>
                
                <h2>Я нашел баг или у меня есть пожелание.</h2>
                <p className="answer">Сообщите о проблеме на <a href='https://github.com/LostPetInitiative/Kashtanka/issues'>сайте разработки</a> системы Каштанка.</p>
                
                <h2>Как много данных обрабатывает система?</h2>
                <p>В данный момент Каштанка знает о сотнях тысяч объявлений о потере/находке домашних животных.
                <br/>Мы используем передовые технологи в области искусственного Интеллекта (ИИ) и обработки Больших Данных (Big Data) от ведущих интернет компаний,
                таких как Google, Facebook.
                <br/>Используемые технологии позволяют горизонтально масштабировать вычислительные мощности системы и обрабатывать тысячи новых объявлений в секунду.
                <br/>Мы используем:
                <br/><div className="logos-container">
                    <img alt='Kubernetes' src='https://kubernetes.io/images/nav_logo2.svg'/>
                    <img alt='TensorFlow' src='https://upload.wikimedia.org/wikipedia/commons/1/11/TensorFlowLogo.svg' />
                    <img alt='Apache Kafka'  src='https://kafka.apache.org/images/logo.png'/>
                    <img alt='Apache Cassandra' src='https://upload.wikimedia.org/wikipedia/commons/5/5e/Cassandra_logo.svg'/>
                    <img alt='Apache Solr'src='https://upload.wikimedia.org/wikipedia/en/b/bb/Apache_Solr_Logo.svg'/>
                </div>
                </p>
            </div>
        </div>
    )
}

export default Faq
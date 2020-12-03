import * as React from "react";
import "./About.scss"

function About(props : {}) {
    React.useEffect(() => {
        document.title = "Каштанка - автоматический поиск потерянных и найденных животных"
    })

    return (
        <div>
            <h1>Каштанка</h1>
            <p>Каштанка - автоматический волонтер, просматривающий Интернет на наличие объявлений о пропаже/находке домашних животных.</p>
            <p>Будучи способной просматривать десятки тысяч объявлений в секунду, система анализирует размещенные фотографии домашних питомцев, по фото пытается найти одно и то же животное в различных объявлениях.</p>
            
            <h1>Как это работает?</h1>            
            <p>Каштанка использует нейронные сети для выделения визуальных признаков у животных (окрас, форма и пропорции тела, морды, и т.д.). Похожие животные определяются по схожести визуальных признаков животных.</p>
            <p>При поиске также учитывается близость места пропажи и находки в пространстве и во времени.</p>
            <h1>Искусственный Интеллект и Большие Данные</h1>
            <p>Каштанка создана с применением Искусственного Интеллекта (ИИ) и технологий обработки Больших Данных (Big Data).</p>
            <p>Мы используем:</p>
            <div className="logos-container">
                <img alt='Kubernetes' src='https://kubernetes.io/images/nav_logo2.svg'/>
                <img alt='TensorFlow' src='https://upload.wikimedia.org/wikipedia/commons/1/11/TensorFlowLogo.svg' />
                <img alt='Apache Kafka'  src='https://kafka.apache.org/images/logo.png'/>
                <img alt='Apache Cassandra' src='https://upload.wikimedia.org/wikipedia/commons/5/5e/Cassandra_logo.svg'/>
                <img alt='Apache Solr'src='https://upload.wikimedia.org/wikipedia/en/b/bb/Apache_Solr_Logo.svg'/>
            </div>
        </div>
    );
}

export default About;
function GetCard(animal) {
    
    // service call

    // emulating animal card
    var card = {};
    if ((animal !== null) && (animal === "dog")) {
        card.cardType = "Нашёлся"
        card.name = "Каштан";
        card.animal = "собака";
        card.eventTime = new Date(2020, 10, 7);
        card.eventPlace = [55.699061, 37.531018];
        card.sex = "male";
        card.color = "chestnut";
        card.size = "medium";
        card.photos = [
            { id: "first", src: "./img/dog/1.jpg" },
            { id: "second", src: "./img/dog/2.png" },
            { id: "third", src: "./img/dog/3.png" }];
    }
    else {
        card.cardType = "Потерялась"
        card.name = "Томасина";
        card.animal = "кошка";
        card.eventTime = new Date(2020, 5, 27);
        card.eventPlace = [59.933758, 30.348226];
        card.sex = "female";
        card.color = "ginger";
        card.size = "big";
        card.photos = [
            { id: "first", src: "./img/cat/1.jpg" },
            { id: "second", src: "./img/cat/2.jpg" }];
    }

    return card;
}

export { GetCard };
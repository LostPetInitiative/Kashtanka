
CREATE TABLE pet_cards.features_by_card_id(
	card_global_id UUID,
    exp_3_4 list<double>,
    PRIMARY KEY(card_global_id)
);
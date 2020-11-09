CREATE TABLE pet_cards.images_by_card_id(
	card_global_id UUID,
    image_num tinyint,
	annotated_image blob,
    extracted_pet_image blob,
    detection_confidence double,
    detection_rotation tinyint,
	PRIMARY KEY(card_global_id, image_num)
);
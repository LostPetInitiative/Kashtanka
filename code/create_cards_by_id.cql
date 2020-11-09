CREATE TABLE pet_cards.cards_by_id(
	global_id UUID,
	provenance text,
	local_id text,
	provenance_url text,
	pet_type tinyint,
	card_type tinyint,
	event_time timestamp,
	location location,
	contact_info contact_info,
	PRIMARY KEY(global_id)
);
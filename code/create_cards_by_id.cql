CREATE TABLE pet_cards.cards_by_id(
	namespace text,
	local_id text,
	provenance_url text,
	pet_type tinyint,
	card_type tinyint,
	event_time timestamp,
	location location,
	contact_info contact_info,
	features_exp_3_4 list<double>
	PRIMARY KEY((namespace,local_id))
);
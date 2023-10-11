const SportsTypes = (lang) => {
    const sportsLabels = {
        en: {
            soccer: 'Soccer',
            basketball: 'Basketball',
            tennis: 'Tennis',
            baseball: 'Baseball',
            football: 'American Football',
            golf: 'Golf',
            cricket: 'Cricket',
            rugby: 'Rugby',
            volleyball: 'Volleyball',
            table_tennis: 'Table Tennis',
            badminton: 'Badminton',
            ice_hockey: 'Ice Hockey',
            field_hockey: 'Field Hockey',
            swimming: 'Swimming',
            track_and_field: 'Track and Field',
            boxing: 'Boxing',
            gymnastics: 'Gymnastics',
            martial_arts: 'Martial Arts',
            cycling: 'Cycling',
            equestrian: 'Equestrian',
            fencing: 'Fencing',
            bowling: 'Bowling',
            archery: 'Archery',
            sailing: 'Sailing',
            canoeing: 'Canoeing/Kayaking',
            wrestling: 'Wrestling',
            snowboarding: 'Snowboarding',
            skiing: 'Skiing',
            surfing: 'Surfing',
            skateboarding: 'Skateboarding',
            rock_climbing: 'Rock Climbing',
            mountain_biking: 'Mountain Biking',
            roller_skating: 'Roller Skating'
            // You can continue to add more sports as needed
        },
        // Add more languages here as needed
    };

    return Object.keys(sportsLabels[lang]).map((value) => ({
        value,
        label: sportsLabels[lang][value],
    }));
};

export default SportsTypes;
const SportsTypes = (lang) => {
    const sportsLabels = {
        en: {
            soccer: { id: 1, name: 'Soccer' },
            basketball: { id: 2, name: 'Basketball' },
            tennis: { id: 3, name: 'Tennis' },
            baseball: { id: 4, name: 'Baseball' },
            football: { id: 5, name: 'American Football' },
            golf: { id: 6, name: 'Golf' },
            cricket: { id: 7, name: 'Cricket' },
            rugby: { id: 8, name: 'Rugby' },
            volleyball: { id: 9, name: 'Volleyball' },
            table_tennis: { id: 10, name: 'Table Tennis' },
            badminton: { id: 11, name: 'Badminton' },
            ice_hockey: { id: 12, name: 'Ice Hockey' },
            field_hockey: { id: 13, name: 'Field Hockey' },
            swimming: { id: 14, name: 'Swimming' },
            track_and_field: { id: 15, name: 'Track and Field' },
            boxing: { id: 16, name: 'Boxing' },
            gymnastics: { id: 17, name: 'Gymnastics' },
            martial_arts: { id: 18, name: 'Martial Arts' },
            cycling: { id: 19, name: 'Cycling' },
            equestrian: { id: 20, name: 'Equestrian' },
            fencing: { id: 21, name: 'Fencing' },
            bowling: { id: 22, name: 'Bowling' },
            archery: { id: 23, name: 'Archery' },
            sailing: { id: 24, name: 'Sailing' },
            canoeing: { id: 25, name: 'Canoeing/Kayaking' },
            wrestling: { id: 26, name: 'Wrestling' },
            snowboarding: { id: 27, name: 'Snowboarding' },
            skiing: { id: 28, name: 'Skiing' },
            surfing: { id: 29, name: 'Surfing' },
            skateboarding: { id: 30, name: 'Skateboarding' },
            rock_climbing: { id: 31, name: 'Rock Climbing' },
            mountain_biking: { id: 32, name: 'Mountain Biking' },
            roller_skating: { id: 33, name: 'Roller Skating' }
        }
        // Add more languages here as needed
    };

    return sportsLabels[lang];
};

const SportsNames = (numbers, lang = 'en') => {
    const sportsLabels = {
        en: {
            soccer: { id: 1, name: 'Soccer' },
            basketball: { id: 2, name: 'Basketball' },
            tennis: { id: 3, name: 'Tennis' },
            baseball: { id: 4, name: 'Baseball' },
            football: { id: 5, name: 'American Football' },
            golf: { id: 6, name: 'Golf' },
            cricket: { id: 7, name: 'Cricket' },
            rugby: { id: 8, name: 'Rugby' },
            volleyball: { id: 9, name: 'Volleyball' },
            table_tennis: { id: 10, name: 'Table Tennis' },
            badminton: { id: 11, name: 'Badminton' },
            ice_hockey: { id: 12, name: 'Ice Hockey' },
            field_hockey: { id: 13, name: 'Field Hockey' },
            swimming: { id: 14, name: 'Swimming' },
            track_and_field: { id: 15, name: 'Track and Field' },
            boxing: { id: 16, name: 'Boxing' },
            gymnastics: { id: 17, name: 'Gymnastics' },
            martial_arts: { id: 18, name: 'Martial Arts' },
            cycling: { id: 19, name: 'Cycling' },
            equestrian: { id: 20, name: 'Equestrian' },
            fencing: { id: 21, name: 'Fencing' },
            bowling: { id: 22, name: 'Bowling' },
            archery: { id: 23, name: 'Archery' },
            sailing: { id: 24, name: 'Sailing' },
            canoeing: { id: 25, name: 'Canoeing/Kayaking' },
            wrestling: { id: 26, name: 'Wrestling' },
            snowboarding: { id: 27, name: 'Snowboarding' },
            skiing: { id: 28, name: 'Skiing' },
            surfing: { id: 29, name: 'Surfing' },
            skateboarding: { id: 30, name: 'Skateboarding' },
            rock_climbing: { id: 31, name: 'Rock Climbing' },
            mountain_biking: { id: 32, name: 'Mountain Biking' },
            roller_skating: { id: 33, name: 'Roller Skating' }
        }
        // Add more languages here as needed
    };

    // Use the `numbers` array to look up sport names
    const sportNames = numbers.map((number) => {
        // Find the sport object with the matching ID
        const sport = Object.values(sportsLabels[lang]).find((s) => s.id === number);

        // Return the sport name if found, or an empty string if not found
        return sport ? sport.name : '';
    });

    return sportNames;
};


export { SportsTypes, SportsNames };
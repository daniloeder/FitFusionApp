const SportsTypes = (lang) => {
    const sportsLabels = {
        en: {
            bodybuilding: { id: 1, name: 'Bodybuilding' },
            soccer: { id: 2, name: 'Soccer' },
            basketball: { id: 3, name: 'Basketball' },
            tennis: { id: 4, name: 'Tennis' },
            baseball: { id: 5, name: 'Baseball' },
            football: { id: 6, name: 'American Football' },
            golf: { id: 7, name: 'Golf' },
            cricket: { id: 8, name: 'Cricket' },
            rugby: { id: 9, name: 'Rugby' },
            volleyball: { id: 10, name: 'Volleyball' },
            table_tennis: { id: 11, name: 'Table Tennis' },
            badminton: { id: 12, name: 'Badminton' },
            ice_hockey: { id: 13, name: 'Ice Hockey' },
            field_hockey: { id: 14, name: 'Field Hockey' },
            swimming: { id: 15, name: 'Swimming' },
            track_and_field: { id: 16, name: 'Track and Field' },
            boxing: { id: 17, name: 'Boxing' },
            gymnastics: { id: 18, name: 'Gymnastics' },
            martial_arts: { id: 19, name: 'Martial Arts' },
            cycling: { id: 20, name: 'Cycling' },
            equestrian: { id: 21, name: 'Equestrian' },
            fencing: { id: 22, name: 'Fencing' },
            bowling: { id: 23, name: 'Bowling' },
            archery: { id: 24, name: 'Archery' },
            sailing: { id: 25, name: 'Sailing' },
            canoeing: { id: 26, name: 'Canoeing/Kayaking' },
            wrestling: { id: 27, name: 'Wrestling' },
            snowboarding: { id: 28, name: 'Snowboarding' },
            skiing: { id: 29, name: 'Skiing' },
            surfing: { id: 30, name: 'Surfing' },
            skateboarding: { id: 31, name: 'Skateboarding' },
            rock_climbing: { id: 32, name: 'Rock Climbing' },
            mountain_biking: { id: 33, name: 'Mountain Biking' },
            roller_skating: { id: 34, name: 'Roller Skating' },
            other: { id: 35, name: 'Other' },
        }
    };

    return sportsLabels[lang];
};

const SportsNames = (numbers, index = false, lang = 'en') => {
    const sportsLabels = {
        en: {
            bodybuilding: { id: 1, name: 'Bodybuilding' },
            soccer: { id: 2, name: 'Soccer' },
            basketball: { id: 3, name: 'Basketball' },
            tennis: { id: 4, name: 'Tennis' },
            baseball: { id: 5, name: 'Baseball' },
            football: { id: 6, name: 'American Football' },
            golf: { id: 7, name: 'Golf' },
            cricket: { id: 8, name: 'Cricket' },
            rugby: { id: 9, name: 'Rugby' },
            volleyball: { id: 10, name: 'Volleyball' },
            table_tennis: { id: 11, name: 'Table Tennis' },
            badminton: { id: 12, name: 'Badminton' },
            ice_hockey: { id: 13, name: 'Ice Hockey' },
            field_hockey: { id: 14, name: 'Field Hockey' },
            swimming: { id: 15, name: 'Swimming' },
            track_and_field: { id: 16, name: 'Track and Field' },
            boxing: { id: 17, name: 'Boxing' },
            gymnastics: { id: 18, name: 'Gymnastics' },
            martial_arts: { id: 19, name: 'Martial Arts' },
            cycling: { id: 20, name: 'Cycling' },
            equestrian: { id: 21, name: 'Equestrian' },
            fencing: { id: 22, name: 'Fencing' },
            bowling: { id: 23, name: 'Bowling' },
            archery: { id: 24, name: 'Archery' },
            sailing: { id: 25, name: 'Sailing' },
            canoeing: { id: 26, name: 'Canoeing/Kayaking' },
            wrestling: { id: 27, name: 'Wrestling' },
            snowboarding: { id: 28, name: 'Snowboarding' },
            skiing: { id: 29, name: 'Skiing' },
            surfing: { id: 30, name: 'Surfing' },
            skateboarding: { id: 31, name: 'Skateboarding' },
            rock_climbing: { id: 32, name: 'Rock Climbing' },
            mountain_biking: { id: 33, name: 'Mountain Biking' },
            roller_skating: { id: 34, name: 'Roller Skating' },
            other: { id: 35, name: 'Other' },
        }
    };

    // Use the `numbers` array to look up sport names or objects
    const sportNamesOrObjects = numbers.map((number) => {
        // Find the sport object with the matching ID
        const sport = sportsLabels[lang][Object.keys(sportsLabels[lang]).find((key) => sportsLabels[lang][key].id === number)];

        // Return the sport name or object based on the `index` parameter
        return index ? sport : (sport ? sport.name : '');
    });

    return sportNamesOrObjects;
};

export { SportsTypes, SportsNames };

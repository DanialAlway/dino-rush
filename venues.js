/* Dino Rush venues. The run moves to the next venue every ZONE_LEN points.
 * Colours: sky (day + night), far/near scenery, ground, obstacles (obs + obsAccent),
 * pterodactyls and boulders. Flags: farStyle/nearStyle ('hills' | 'peaks' | 'city' | 'sea'),
 * stars (always starry), aurora, planet, noSky (no sun, moon or clouds), noClouds. */
window.DinoVenues = [
  {
    name: 'DESERT DUNES', weather: 'dust', obsKind: 'cactus',
    skyTop: '#f7d9a0', skyBot: '#fdf1d6', nTop: '#141a3a', nBot: '#3a3060',
    far: '#e8c08a', near: '#d9a868', ground: '#ecd3a0', line: '#8a6a3e', speck: '#b8915a',
    obs: '#3f7a3a', obsAccent: '#6fb35e', ptero: '#6b5a4a', rock: '#8b6b4a',
  },
  {
    name: 'GREEN PLAINS', weather: 'leaves', obsKind: ['cactus', 'tree'],
    skyTop: '#8fd3ff', skyBot: '#e2f6ff', nTop: '#0d1630', nBot: '#24345e',
    far: '#a6cfb0', near: '#6fae6a', ground: '#86c460', line: '#3f6b2c', speck: '#4f8c3a',
    obs: '#2e6b2a', obsAccent: '#6b4a2a', ptero: '#535353', rock: '#7d7468',
  },
  {
    name: 'SUNNY BEACH', weather: 'none', obsKind: 'castle', farStyle: 'sea',
    skyTop: '#6ec6f0', skyBot: '#d8f3ff', nTop: '#0e1838', nBot: '#2a3870',
    far: '#3aa3d6', near: '#f3dca0', ground: '#f6e3b0', line: '#c9a35e', speck: '#e0c27f',
    obs: '#e2bd72', obsAccent: '#9c7434', ptero: '#7d8591', rock: '#c8a36a',
  },
  {
    name: 'CHERRY BLOSSOM', weather: 'petals', obsKind: 'bamboo', farStyle: 'peaks',
    skyTop: '#ffd6e4', skyBot: '#fff3f7', nTop: '#1d1530', nBot: '#4a2d55',
    far: '#f0b8cc', near: '#9cc58e', ground: '#b9dca0', line: '#5f8a4c', speck: '#f4a7c0',
    obs: '#4f8a34', obsAccent: '#9fd36a', ptero: '#7a5a6a', rock: '#8a7a7a',
  },
  {
    name: 'AUTUMN WOODS', weather: 'leaves', obsKind: 'tree',
    skyTop: '#f6c48f', skyBot: '#fff0d9', nTop: '#1a1424', nBot: '#3d2a3a',
    far: '#d98a4a', near: '#a8552d', ground: '#c8874a', line: '#6b3a1c', speck: '#e0a060',
    obs: '#d4622a', obsAccent: '#5a3220', ptero: '#5a4038', rock: '#7a5a44',
  },
  {
    name: 'FROZEN TUNDRA', weather: 'snow', obsKind: 'ice', farStyle: 'peaks',
    skyTop: '#a9c8e4', skyBot: '#eef6fb', nTop: '#0b1426', nBot: '#2a3d5c',
    far: '#c9dbe9', near: '#a9c4da', ground: '#f2f7fb', line: '#7d98b0', speck: '#b5cad9',
    obs: '#3d8fc4', obsAccent: '#bfe8ff', ptero: '#46607a', rock: '#8fa7bf',
  },
  {
    name: 'AURORA NIGHT', weather: 'snow', obsKind: ['ice', 'tree'], farStyle: 'peaks', stars: true, aurora: true,
    skyTop: '#07142a', skyBot: '#123a4f', nTop: '#050d1e', nBot: '#0e2c40',
    far: '#1d3a55', near: '#2c5272', ground: '#dfeaf3', line: '#6f8ea8', speck: '#b5cad9',
    obs: '#2f7a6a', obsAccent: '#4a3a2a', ptero: '#c9d6ea', rock: '#8fa7bf',
  },
  {
    name: 'CANDY LAND', weather: 'confetti', obsKind: 'candy',
    skyTop: '#ffc8e8', skyBot: '#fff0fa', nTop: '#2a1640', nBot: '#5a2d6a',
    far: '#ffa6d1', near: '#c7a2ff', ground: '#ffe0f0', line: '#e07ab8', speck: '#7fd6ff',
    obs: '#ff4f93', obsAccent: '#ffffff', ptero: '#9a5ab8', rock: '#ff8fc1',
  },
  {
    name: 'NEON CITY', weather: 'rain', obsKind: 'cone', farStyle: 'city', nearStyle: 'city', stars: true,
    skyTop: '#1a1036', skyBot: '#4a1f5e', nTop: '#0b0820', nBot: '#2a1240',
    far: '#2a1d4f', near: '#3b2766', ground: '#2a2438', line: '#ff4fd8', speck: '#47e5ff',
    obs: '#ff7a1a', obsAccent: '#ffffff', ptero: '#47e5ff', rock: '#5a4a70',
  },
  {
    name: 'MUSHROOM FOREST', weather: 'fireflies', obsKind: 'mushroom',
    skyTop: '#9fd9c4', skyBot: '#e8fff4', nTop: '#0e1f24', nBot: '#1f3d3a',
    far: '#5e9e86', near: '#3e7a5e', ground: '#5c8f4a', line: '#2f5228', speck: '#a0d070',
    obs: '#e04a3a', obsAccent: '#fff4e0', ptero: '#4a3a5a', rock: '#7a6a5a',
  },
  {
    name: 'HAUNTED HOLLOW', weather: 'wisps', obsKind: ['tomb', 'pumpkin'], stars: true,
    skyTop: '#4a3a6a', skyBot: '#a58bb5', nTop: '#0e0a18', nBot: '#2a1a3a',
    far: '#2e2440', near: '#1f1a2c', ground: '#3a3442', line: '#14101c', speck: '#6a5a7a',
    obs: '#8d8a9c', obsAccent: '#4a4658', ptero: '#1a1424', rock: '#5a5468',
  },
  {
    name: 'CORAL REEF', weather: 'bubbles', obsKind: 'coral', noSky: true,
    skyTop: '#0f6f9a', skyBot: '#46c1d8', nTop: '#06243a', nBot: '#0e4a66',
    far: '#0d5a7a', near: '#13809a', ground: '#f0d9a0', line: '#c4a35c', speck: '#ff8fa3',
    obs: '#ff6f61', obsAccent: '#ffb3a7', ptero: '#ffd23f', rock: '#7a9aa8',
  },
  {
    name: 'CRYSTAL CAVE', weather: 'sparkle', obsKind: 'crystal', farStyle: 'peaks', nearStyle: 'peaks', noSky: true,
    skyTop: '#1a1530', skyBot: '#3a2d5a', nTop: '#120e24', nBot: '#2a2048',
    far: '#2e2548', near: '#43356a', ground: '#3a3150', line: '#1c1630', speck: '#b58cff',
    obs: '#8f6bff', obsAccent: '#e2d4ff', ptero: '#a08ad0', rock: '#5a4a7a',
  },
  {
    name: 'SAVANNA SUNSET', weather: 'dust', obsKind: ['acacia', 'rock'],
    skyTop: '#ff9a5a', skyBot: '#ffd9a0', nTop: '#1c1230', nBot: '#4a2a4a',
    far: '#d97a4a', near: '#a85a3a', ground: '#d9a35a', line: '#7a4a24', speck: '#b8803a',
    obs: '#4a3424', obsAccent: '#5f7a2e', ptero: '#3a2a24', rock: '#8a6a4a',
  },
  {
    name: 'VOLCANO ZONE', weather: 'ash', obsKind: 'rock', farStyle: 'peaks',
    skyTop: '#d9694c', skyBot: '#f6c08a', nTop: '#1a0a10', nBot: '#4a1a1a',
    far: '#8a4a4a', near: '#5e2f2f', ground: '#4a3434', line: '#1f1414', speck: '#e0612a',
    obs: '#2a2222', obsAccent: '#ff7a2a', ptero: '#2b1d1d', rock: '#3a2a2a',
  },
  {
    name: 'MOON BASE', weather: 'none', obsKind: ['rock', 'crystal'], stars: true, planet: true, noClouds: true,
    skyTop: '#05060f', skyBot: '#151a2e', nTop: '#05060f', nBot: '#151a2e',
    far: '#3a3d4a', near: '#555a6a', ground: '#9a9ca8', line: '#5a5c68', speck: '#6a6c78',
    obs: '#c9ccd6', obsAccent: '#7a7d8a', ptero: '#e0e4f0', rock: '#8a8d9a',
  },
  {
    name: 'CLOUD KINGDOM', weather: 'sparkle', obsKind: 'crystal',
    skyTop: '#9fd0ff', skyBot: '#fdf6ff', nTop: '#1a1f4a', nBot: '#4a4a8a',
    far: '#ffffff', near: '#e8eefc', ground: '#ffffff', line: '#b9c8e8', speck: '#d8e2f6',
    obs: '#f2b630', obsAccent: '#fff5c8', ptero: '#8a9ad8', rock: '#d8dff0',
  },
];

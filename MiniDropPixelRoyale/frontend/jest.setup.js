// Mock Phaser
global.Phaser = {
  Game: class {
    constructor() {}
  },
  Scene: class {
    constructor() {}
  },
  Physics: {
    Arcade: {
      ArcadePhysics: class {}
    }
  },
  GameObjects: {
    Sprite: class {},
    Image: class {},
    Text: class {}
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        W: 'W',
        A: 'A',
        S: 'S',
        D: 'D'
      }
    }
  },
  Math: {
    Angle: {
      Between: () => 0
    },
    Between: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    FloatBetween: (min, max) => Math.random() * (max - min) + min,
    Linear: (a, b, t) => a + t * (b - a)
  },
  Display: {
    Color: {
      GetColor: () => 0xffffff
    }
  },
  Scale: {
    FIT: 'fit',
    CENTER_BOTH: 'center-both'
  },
  AUTO: 'auto',
  Geom: {
    Circle: class {
      constructor() {}
    }
  }
};

// Mock canvas
document.body.innerHTML = '<div id="game-container"></div>';

// Mock Audio
global.Audio = class {
  constructor() {}
  play() {}
};

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

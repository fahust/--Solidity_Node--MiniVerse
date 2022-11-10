import { Item } from "../enums/enum";

export const housing = {
  House: {
    description: "Allows to host new citizens",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
    maxPercentBuild: 100,
  },
  StoneWorks: {
    description: "Improves the quality of brick making in the refuge",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
    maxPercentBuild: 400,
  },
  Lumbermill: {
    description:
      "Improves the quality of wood board manufacturing in the refuge",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
    maxPercentBuild: 150,
  },
  Sawmill: {
    requirements: {
      [Item.BOARD]: 200,
      [Item.BRICK]: 120,
    },
    maxPercentBuild: 200,
  },
  Farm: {
    description: "Improves the quality of the farm crops in the refuge",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
    maxPercentBuild: 500,
  },
  "Water Station": {
    description: "Improves the harvest and production water in the refuge",
    requirements: {
      [Item.BOARD]: 200,
      [Item.STONE]: 120,
      [Item.BRICK]: 120,
    },
    maxPercentBuild: 2100,
  },
  "Mining Station": {
    description: "Increases the efficiency of the miners",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
    maxPercentBuild: 1400,
  },
  Store: {
    description: "increases the general storage capacity of the refuge",
    requirements: {
      [Item.BOARD]: 200,
      [Item.STONE]: 120,
      [Item.BRICK]: 120,
    },
    maxPercentBuild: 2000,
  },
  "Hunting House": {
    description: "",
    requirements: {
      [Item.BOARD]: 300,
      [Item.BRICK]: 200,
      [Item.STONE]: 150,
    },
    maxPercentBuild: 800,
  },
  Church: {
    description: "",
    requirements: { [Item.BOARD]: 250, [Item.BRICK]: 300, [Item.STONE]: 1000 },
    maxPercentBuild: 6500,
  },
  School: {
    description: "",
    requirements: { [Item.BOARD]: 400, [Item.BRICK]: 500 },
    maxPercentBuild: 4400,
  },
  Weaving: {
    description: "",
    requirements: { [Item.BOARD]: 1400, [Item.BRICK]: 1200 },
    maxPercentBuild: 2500,
  },
  Furnace: {
    description: "",
    requirements: { [Item.STONE]: 1800, [Item.BRICK]: 1600 },
    maxPercentBuild: 3500,
  },
  Bar: {
    description: "",
    requirements: {
      [Item.BOARD]: 1400,
      [Item.BRICK]: 1800,
      [Item.COPPER]: 900,
    },
    maxPercentBuild: 4000,
  },
  Restaurant: {
    description: "",
    requirements: {
      [Item.BOARD]: 1200,
      [Item.BRICK]: 2000,
      [Item.COPPER]: 600,
    },
    maxPercentBuild: 5000,
  },
  Medical: {
    description: "",
    requirements: {
      [Item.BOARD]: 2000,
      [Item.BRICK]: 1500,
      [Item.METAL]: 500,
      [Item.COPPER]: 1500,
    },
    maxPercentBuild: 8000,
  },
  Workshop: {
    description: "",
    requirements: {
      [Item.BOARD]: 6500,
      [Item.BRICK]: 5000,
      [Item.METAL]: 2500,
      [Item.COPPER]: 1700,
    },
    maxPercentBuild: 7000,
  },

  Factory: {
    description: "",
    requirements: {
      [Item.BOARD]: 4000,
      [Item.BRICK]: 3000,
      [Item.METAL]: 6000,
      [Item.COPPER]: 5000,
    },
    maxPercentBuild: 200000,
  },
  Barracks: {
    description: "",
    requirements: {
      [Item.BOARD]: 1400,
      [Item.BRICK]: 1500,
      [Item.METAL]: 3000,
      [Item.COPPER]: 1500,
    },
    maxPercentBuild: 50000,
  },
  Armory: {
    description: "",
    requirements: {
      [Item.BOARD]: 3000,
      [Item.BRICK]: 3000,
      [Item.METAL]: 3000,
      [Item.COPPER]: 3000,
    },
    maxPercentBuild: 100000,
  }, //leatherworker
};
